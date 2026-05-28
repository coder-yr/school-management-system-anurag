import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response.js';
import { Result } from '../models/Result.js';
import { Subject } from '../models/Subject.js';
import { Exam } from '../models/Exam.js';
import { Class } from '../models/Class.js';
import { Section } from '../models/Section.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Syllabus } from '../models/Syllabus.js';
import { Timetable } from '../models/Timetable.js';
import { AdmissionLead } from '../models/AdmissionLead.js';
import { Types } from 'mongoose';

// Utility helper to get/create class and section
async function getOrCreateClassAndSection(
  schoolId: string | Types.ObjectId,
  gradeName: string,
  sectionName: string,
  userId: string | Types.ObjectId
): Promise<{ classId: Types.ObjectId; sectionId: Types.ObjectId }> {
  const actualSchoolId = schoolId ? new Types.ObjectId(schoolId as string) : new Types.ObjectId("000000000000000000000001");
  const actualUserId = userId ? new Types.ObjectId(userId as string) : new Types.ObjectId("000000000000000000000001");

  let className = gradeName;
  if (!className.toLowerCase().startsWith('grade')) {
    className = `Grade ${className}`;
  }

  let classDoc = await Class.findOne({ schoolId: actualSchoolId, name: className });
  if (!classDoc) {
    classDoc = await Class.findOne({ schoolId: actualSchoolId, name: gradeName });
  }

  if (!classDoc) {
    classDoc = new Class({
      schoolId: actualSchoolId,
      name: className,
      createdBy: actualUserId,
      updatedBy: actualUserId
    });
    await classDoc.save();
  }

  let sectionDoc = await Section.findOne({
    schoolId: actualSchoolId,
    classId: classDoc._id,
    name: sectionName
  });

  if (!sectionDoc) {
    sectionDoc = new Section({
      schoolId: actualSchoolId,
      classId: classDoc._id,
      name: sectionName,
      createdBy: actualUserId,
      updatedBy: actualUserId
    });
    await sectionDoc.save();
  }

  return {
    classId: classDoc._id as Types.ObjectId,
    sectionId: sectionDoc._id as Types.ObjectId
  };
}

async function getOrCreateSubject(
  schoolId: Types.ObjectId,
  subjectName: string,
  userId: Types.ObjectId
) {
  let subjectDoc = await Subject.findOne({ schoolId, name: subjectName });
  if (!subjectDoc) {
    subjectDoc = new Subject({
      schoolId,
      name: subjectName,
      code: subjectName.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 10),
      type: 'CORE',
      createdBy: userId,
      updatedBy: userId
    });
    await subjectDoc.save();
  }
  return subjectDoc;
}

async function getOrCreateExam(
  schoolId: Types.ObjectId,
  termName: string,
  classId: Types.ObjectId,
  userId: Types.ObjectId
) {
  let examDoc = await Exam.findOne({ schoolId, name: termName, classId });
  if (!examDoc) {
    examDoc = new Exam({
      schoolId,
      name: termName,
      classId,
      startDate: new Date(),
      endDate: new Date(),
      status: 'PUBLISHED',
      createdBy: userId,
      updatedBy: userId
    });
    await examDoc.save();
  }
  return examDoc;
}

export class AcademicsController {
  static async recordGrade(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const userId = req.user?.id || "000000000000000000000001";
      const { student_id, student_name, subject, grade, section, score, max_score, term } = req.body;

      const sId = new Types.ObjectId(schoolId as string);
      const uId = new Types.ObjectId(userId as string);

      const { classId, sectionId } = await getOrCreateClassAndSection(sId, grade, section, uId);
      const subjectDoc = await getOrCreateSubject(sId, subject, uId);
      const examDoc = await getOrCreateExam(sId, term, classId, uId);

      const scoreValue = typeof score === 'string' ? Number(score) : score;
      const maxScoreValue = typeof max_score === 'string' ? Number(max_score) : (max_score || 100);

      // Determine letter grade
      let letterGrade = 'B';
      if (maxScoreValue > 0) {
        const pct = (scoreValue / maxScoreValue) * 100;
        if (pct >= 90) letterGrade = 'A';
        else if (pct >= 80) letterGrade = 'B';
        else if (pct >= 70) letterGrade = 'C';
        else if (pct >= 60) letterGrade = 'D';
        else letterGrade = 'F';
      }

      const resultRecord = await Result.findOneAndUpdate(
        {
          schoolId: sId,
          examId: examDoc._id,
          studentId: new Types.ObjectId(student_id as string),
          subjectId: subjectDoc._id
        },
        {
          $set: {
            marksObtained: scoreValue,
            maxMarks: maxScoreValue,
            grade: letterGrade,
            remarks: "",
            createdBy: uId,
            updatedBy: uId
          }
        },
        { new: true, upsert: true }
      );

      sendResponse(res, 201, 'Grade recorded successfully', {
        id: resultRecord._id,
        student_id,
        student_name,
        subject,
        grade,
        section,
        score: scoreValue,
        max_score: maxScoreValue,
        term,
        created_at: resultRecord.createdAt,
        updated_at: resultRecord.updatedAt
      });
    } catch (error) {
      next(error);
    }
  }

  static async recordGradeBulk(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const userId = req.user?.id || "000000000000000000000001";
      const grades = req.body;

      if (!Array.isArray(grades)) {
        res.status(400).json({ success: false, message: 'Invalid payload: expected an array' });
        return;
      }

      const sId = new Types.ObjectId(schoolId as string);
      const uId = new Types.ObjectId(userId as string);
      const results = [];

      for (const item of grades) {
        const { student_id, student_name, subject, grade, section, score, max_score, term } = item;

        const { classId } = await getOrCreateClassAndSection(sId, grade, section, uId);
        const subjectDoc = await getOrCreateSubject(sId, subject, uId);
        const examDoc = await getOrCreateExam(sId, term, classId, uId);

        const scoreValue = typeof score === 'string' ? Number(score) : score;
        const maxScoreValue = typeof max_score === 'string' ? Number(max_score) : (max_score || 100);

        let letterGrade = 'B';
        if (maxScoreValue > 0) {
          const pct = (scoreValue / maxScoreValue) * 100;
          if (pct >= 90) letterGrade = 'A';
          else if (pct >= 80) letterGrade = 'B';
          else if (pct >= 70) letterGrade = 'C';
          else if (pct >= 60) letterGrade = 'D';
          else letterGrade = 'F';
        }

        const resultRecord = await Result.findOneAndUpdate(
          {
            schoolId: sId,
            examId: examDoc._id,
            studentId: new Types.ObjectId(student_id as string),
            subjectId: subjectDoc._id
          },
          {
            $set: {
              marksObtained: scoreValue,
              maxMarks: maxScoreValue,
              grade: letterGrade,
              remarks: "",
              createdBy: uId,
              updatedBy: uId
            }
          },
          { new: true, upsert: true }
        );

        results.push({
          id: resultRecord._id,
          student_id,
          student_name,
          subject,
          grade,
          section,
          score: scoreValue,
          max_score: maxScoreValue,
          term,
          created_at: resultRecord.createdAt,
          updated_at: resultRecord.updatedAt
        });
      }

      sendResponse(res, 201, 'Bulk grades recorded successfully', results);
    } catch (error) {
      next(error);
    }
  }

  static async getStudentGrades(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const studentId = req.params.studentId;

      const records = await Result.find({
        schoolId: new Types.ObjectId(schoolId as string),
        studentId: new Types.ObjectId(studentId as string)
      });

      const formatted = [];
      for (const rec of records) {
        const student = await Student.findOne({ userId: rec.studentId });
        const studentUser = student ? await User.findById(student.userId) : await User.findById(rec.studentId);
        const subjectDoc = await Subject.findById(rec.subjectId);
        const examDoc = await Exam.findById(rec.examId);

        let className = "10";
        let secName = "A";
        if (examDoc) {
          const classDoc = await Class.findById(examDoc.classId);
          if (classDoc) {
            className = classDoc.name.replace('Grade ', '');
            // Find a section under this class for secName
            const sectionDoc = await Section.findOne({ schoolId: rec.schoolId, classId: classDoc._id });
            if (sectionDoc) {
              secName = sectionDoc.name;
            }
          }
        }

        formatted.push({
          id: rec._id,
          student_id: rec.studentId.toString(),
          student_name: studentUser ? `${studentUser.firstName} ${studentUser.lastName}`.trim() : "Unknown Student",
          subject: subjectDoc ? subjectDoc.name : "Unknown Subject",
          grade: className,
          section: secName,
          score: rec.marksObtained,
          max_score: rec.maxMarks,
          term: examDoc ? examDoc.name : "Term 1",
          created_at: rec.createdAt,
          updated_at: rec.updatedAt
        });
      }

      sendResponse(res, 200, 'Student grades retrieved', formatted);
    } catch (error) {
      next(error);
    }
  }

  static async getGradesByTerm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { term, grade } = req.query;

      const match: any = { schoolId: new Types.ObjectId(schoolId as string) };

      if (term) {
        const examDocs = await Exam.find({ schoolId: match.schoolId, name: term as string });
        if (examDocs.length > 0) {
          match.examId = { $in: examDocs.map(e => e._id) };
        }
      }

      const records = await Result.find(match);

      const formatted = [];
      for (const rec of records) {
        const student = await Student.findOne({ userId: rec.studentId });
        const studentUser = student ? await User.findById(student.userId) : await User.findById(rec.studentId);
        const subjectDoc = await Subject.findById(rec.subjectId);
        const examDoc = await Exam.findById(rec.examId);

        let className = "10";
        let secName = "A";
        if (examDoc) {
          const classDoc = await Class.findById(examDoc.classId);
          if (classDoc) {
            className = classDoc.name.replace('Grade ', '');
            const sectionDoc = await Section.findOne({ schoolId: rec.schoolId, classId: classDoc._id });
            if (sectionDoc) {
              secName = sectionDoc.name;
            }
          }
        }

        // Filter by grade string if passed
        if (grade && className !== (grade as string)) {
          continue;
        }

        formatted.push({
          id: rec._id,
          student_id: rec.studentId.toString(),
          student_name: studentUser ? `${studentUser.firstName} ${studentUser.lastName}`.trim() : "Unknown Student",
          subject: subjectDoc ? subjectDoc.name : "Unknown Subject",
          grade: className,
          section: secName,
          score: rec.marksObtained,
          max_score: rec.maxMarks,
          term: examDoc ? examDoc.name : (term as string || "Term 1"),
          created_at: rec.createdAt,
          updated_at: rec.updatedAt
        });
      }

      sendResponse(res, 200, 'Grades by term retrieved', formatted);
    } catch (error) {
      next(error);
    }
  }

  static async listSubjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const subjects = await Subject.find({ schoolId });
      sendResponse(res, 200, 'Subjects retrieved', subjects);
    } catch (error) {
      next(error);
    }
  }

  static async listSyllabus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const syllabus = await Syllabus.find({ schoolId }).populate('subjectId classId');
      sendResponse(res, 200, 'Syllabus retrieved', syllabus);
    } catch (error) {
      next(error);
    }
  }

  static async listLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const leads = await AdmissionLead.find({ schoolId });
      sendResponse(res, 200, 'Leads retrieved', leads);
    } catch (error) {
      next(error);
    }
  }

  static async createLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const lead = new AdmissionLead({ ...req.body, schoolId });
      await lead.save();
      sendResponse(res, 201, 'Lead created', lead);
    } catch (error) {
      next(error);
    }
  }

  static async updateLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const lead = await AdmissionLead.findOneAndUpdate(
        { _id: req.params.id, schoolId },
        { $set: req.body },
        { new: true }
      );
      sendResponse(res, 200, 'Lead updated', lead);
    } catch (error) {
      next(error);
    }
  }

  static async listTimetable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const timetable = await Timetable.find({ schoolId })
        .populate('subjectId classId teacherId');
      sendResponse(res, 200, 'Timetable retrieved', timetable);
    } catch (error) {
      next(error);
    }
  }

  static async createTimetable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const timetable = new Timetable({ ...req.body, schoolId });
      await timetable.save();
      sendResponse(res, 201, 'Timetable scheduled', timetable);
    } catch (error) {
      next(error);
    }
  }
}
