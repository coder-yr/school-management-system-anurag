import mongoose, { Types } from 'mongoose';
import { Student, IStudent } from '../models/Student.js';
import { User } from '../models/User.js';
import { Parent } from '../models/Parent.js';
import { StudentDocument } from '../models/StudentDocument.js';
import { ApiError } from '../utils/api-error.js';

interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class StudentService {
  static async admitStudent(schoolId: string, data: any): Promise<IStudent> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Check existing admission number
      const existing = await Student.findOne({ schoolId, admissionNumber: data.admissionNumber, isDeleted: false }).session(session);
      if (existing) {
        throw new ApiError(409, 'Admission number already exists in this school');
      }

      // 2. Create Student User if requested
      let userId = null;
      if (data.studentUser) {
        const userExists = await User.findOne({ email: data.studentUser.email }).session(session);
        if (userExists) throw new ApiError(409, 'Student email already in use');

        const newUser = new User({
          schoolId,
          email: data.studentUser.email,
          password: data.studentUser.password, // Mongoose pre-save hooks will hash this
          firstName: data.studentUser.firstName,
          lastName: data.studentUser.lastName,
          role: 'STUDENT',
          isActive: true
        });
        await newUser.save({ session });
        userId = newUser._id;
      }

      if (!userId) {
        // Fallback: Create a dummy user or require studentUser. Assuming requiring a user mapping based on schema logic.
        throw new ApiError(400, 'Student User details are required for auth mapping.');
      }

      // 3. Process Parents
      const parentIds: Types.ObjectId[] = [];
      if (data.parentIds && data.parentIds.length > 0) {
        parentIds.push(...data.parentIds.map((id: string) => new Types.ObjectId(id)));
      }

      if (data.newParents && data.newParents.length > 0) {
        for (const p of data.newParents) {
          // Check if parent user exists
          let pUser = await User.findOne({ email: p.email }).session(session);
          if (!pUser) {
            pUser = new User({
              schoolId,
              email: p.email,
              password: 'defaultPassword123', // Send email to parent to reset
              firstName: p.firstName,
              lastName: p.lastName,
              role: 'PARENT',
              isActive: true
            });
            await pUser.save({ session });
          }
          
          let parentDoc = await Parent.findOne({ userId: pUser._id }).session(session);
          if (!parentDoc) {
             parentDoc = new Parent({
               schoolId,
               userId: pUser._id,
               relationship: p.relationship,
               occupation: p.occupation,
               phone: p.phone
             });
             await parentDoc.save({ session });
          }
          parentIds.push(parentDoc._id as Types.ObjectId);
        }
      }

      // 4. Create Student
      const student = new Student({
        schoolId,
        userId,
        admissionNumber: data.admissionNumber,
        rollNumber: data.rollNumber,
        classId: data.classId,
        sectionId: data.sectionId,
        parentIds: [...new Set(parentIds)], // Ensure unique parent IDs
        dob: data.dob,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        address: data.address,
        emergencyContact: data.emergencyContact
      });

      await student.save({ session });

      await session.commitTransaction();
      session.endSession();
      return student;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async getStudentProfile(schoolId: string, studentId: string): Promise<any> {
    const student = await Student.aggregate([
      { $match: { _id: new Types.ObjectId(studentId), schoolId: new Types.ObjectId(schoolId), isDeleted: false } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classDetails'
        }
      },
      { $unwind: { path: '$classDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'sections',
          localField: 'sectionId',
          foreignField: '_id',
          as: 'sectionDetails'
        }
      },
      { $unwind: { path: '$sectionDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'parents',
          localField: 'parentIds',
          foreignField: '_id',
          as: 'parents'
        }
      },
      // Inner lookup to get user details for parents
      {
         $lookup: {
            from: 'users',
            localField: 'parents.userId',
            foreignField: '_id',
            as: 'parentUsers'
         }
      },
      {
         $project: {
            'user.password': 0,
            'parentUsers.password': 0
         }
      }
    ]);

    if (!student || student.length === 0) {
      throw new ApiError(404, 'Student not found');
    }

    return student[0];
  }

  static async listStudents(schoolId: string, query: any): Promise<PaginationResult<any>> {
    const { page, limit, search, isActive, classId, sectionId, tcStatus } = query;
    const match: any = { schoolId: new Types.ObjectId(schoolId), isDeleted: false };

    if (isActive !== undefined) match.isActive = isActive;
    if (tcStatus) match.tcStatus = tcStatus;
    if (classId) match.classId = new Types.ObjectId(classId);
    if (sectionId) match.sectionId = new Types.ObjectId(sectionId);

    if (search) {
       // Search by admission number or roll number locally, 
       // but typically we'd need a lookup or user text index to search by user name.
       match.$or = [
          { admissionNumber: { $regex: search, $options: 'i' } },
          { rollNumber: { $regex: search, $options: 'i' } }
       ];
    }

    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classDetails'
        }
      },
      { $unwind: { path: '$classDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'sections',
          localField: 'sectionId',
          foreignField: '_id',
          as: 'sectionDetails'
        }
      },
      { $unwind: { path: '$sectionDetails', preserveNullAndEmptyArrays: true } },
      { $project: { 'user.password': 0 } },
      { $sort: { 'user.firstName': 1, 'user.lastName': 1 } }
    ];

    const totalPipeline = [{ $match: match }, { $count: 'count' }];
    const totalResult = await Student.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].count : 0;

    pipeline.push({ $skip: skip } as any);
    pipeline.push({ $limit: limit } as any);

    const data = await Student.aggregate(pipeline as any);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async updateStudent(schoolId: string, id: string, data: any): Promise<IStudent> {
    const student = await Student.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!student) throw new ApiError(404, 'Student not found');
    return student;
  }

  static async assignClassAndSection(schoolId: string, id: string, classId: string, sectionId: string): Promise<IStudent> {
    const student = await Student.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { classId, sectionId } },
      { new: true, runValidators: true }
    );
    if (!student) throw new ApiError(404, 'Student not found');
    return student;
  }

  static async uploadDocument(schoolId: string, studentId: string, documentType: string, file: Express.Multer.File) {
    const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false });
    if (!student) throw new ApiError(404, 'Student not found');

    const fileUrl = `/uploads/${file.filename}`; // Or full URL

    const document = new StudentDocument({
      schoolId,
      studentId,
      documentType,
      fileUrl,
      originalName: file.originalname
    });

    return document.save();
  }

  static async listDocuments(schoolId: string, studentId: string) {
     return StudentDocument.find({ schoolId, studentId, isDeleted: false }).sort({ uploadedAt: -1 });
  }

  static async issueTransferCertificate(schoolId: string, id: string, data: any): Promise<IStudent> {
    const student = await Student.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { 
        $set: { 
          tcStatus: 'ISSUED', 
          tcIssueDate: data.tcIssueDate || new Date(),
          isActive: false // Deactivate student upon TC issue
        } 
      },
      { new: true, runValidators: true }
    );
    if (!student) throw new ApiError(404, 'Student not found');
    return student;
  }
}
