import { Homework } from '../models/Homework.js';
import { HomeworkSubmission } from '../models/HomeworkSubmission.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { ApiError } from '../utils/api-error.js';
import { uploadToStorage } from '../utils/cloudinary.js';

export class HomeworkService {
  static async createHomework(schoolId: string, teacherId: string, data: any) {
    const homework = await Homework.create({
      ...data,
      schoolId,
      teacherId,
      attachments: data.attachments || [],
    });
    return homework;
  }

  static async listHomework(schoolId: string, classId?: string, subjectId?: string) {
    const filter: any = { schoolId };
    if (classId) filter.classId = classId;
    if (subjectId) filter.subjectId = subjectId;
    return Homework.find(filter).sort({ dueDate: 1 });
  }

  static async submitHomework(schoolId: string, studentId: string, homeworkId: string, file: Express.Multer.File | undefined, remarks?: string) {
    const homework = await Homework.findOne({ _id: homeworkId, schoolId });
    if (!homework) throw new ApiError(404, 'Homework not found');

    const isLate = new Date() > homework.dueDate;

    const uploadResult = file ? await uploadToStorage(file, 'homework-submissions') : null;

    const submission = await HomeworkSubmission.create({
      schoolId,
      homeworkId,
      studentId,
      status: isLate ? 'LATE' : 'SUBMITTED',
      fileUrl: uploadResult?.url,
      fileName: uploadResult?.fileName || file?.originalname,
      remarks,
    });

    return { ...submission.toObject(), isLate };
  }

  static async listSubmissions(schoolId: string, homeworkId: string) {
    return HomeworkSubmission.find({ schoolId, homeworkId }).sort({ submittedAt: -1 });
  }

  static async uploadStudyMaterial(schoolId: string, teacherId: string, data: any, file: Express.Multer.File) {
    const uploadResult = await uploadToStorage(file, 'study-materials');
    return StudyMaterial.create({
      ...data,
      schoolId,
      teacherId,
      fileUrl: uploadResult.url,
      fileName: uploadResult.fileName,
      category: data.category || 'NOTES',
    });
  }

  static async listStudyMaterials(schoolId: string, classId?: string, subjectId?: string) {
    const filter: any = { schoolId };
    if (classId) filter.classId = classId;
    if (subjectId) filter.subjectId = subjectId;
    return StudyMaterial.find(filter).sort({ uploadedAt: -1 });
  }

  static async getSyllabusTracking(schoolId: string, classId?: string) {
    const filter: any = { schoolId };
    if (classId) filter.classId = classId;

    return StudyMaterial.find(filter)
      .populate('subjectId')
      .sort({ uploadedAt: -1 });
  }
}
