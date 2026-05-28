import type { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service.js';
import { sendResponse } from '../utils/response.js';
import { resolveSchoolId } from '../utils/school.js';

export class StudentController {
  static async admitStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = (await resolveSchoolId(req.body.schoolId || req.user?.schoolId)).toString();
      const student = await StudentService.admitStudent(schoolId, req.body);
      sendResponse(res, 201, 'Student admitted successfully', student);
    } catch (error) {
      next(error);
    }
  }

  static async getStudentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = (await resolveSchoolId((req.query.schoolId as string) || req.user?.schoolId)).toString();
      const id = req.params.id as string;
      const student = await StudentService.getStudentProfile(schoolId, id);
      sendResponse(res, 200, 'Student profile retrieved successfully', student);
    } catch (error) {
      next(error);
    }
  }

  static async listStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = (await resolveSchoolId((req.query.schoolId as string) || req.user?.schoolId)).toString();
      const { page, limit, search, isActive, classId, sectionId, tcStatus } = req.query as any;
      const isActiveBool = isActive !== undefined ? isActive === 'true' : undefined;
      const result = await StudentService.listStudents(schoolId, {
         page: Number(page) || 1,
         limit: Number(limit) || 10,
         search: search as string,
         isActive: isActiveBool,
         classId: classId as string,
         sectionId: sectionId as string,
         tcStatus: tcStatus as string
      });
      sendResponse(res, 200, 'Students retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async updateStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = (await resolveSchoolId(req.body.schoolId || (req.query.schoolId as string) || req.user?.schoolId)).toString();
      const id = req.params.id as string;
      const student = await StudentService.updateStudent(schoolId, id, req.body);
      sendResponse(res, 200, 'Student updated successfully', student);
    } catch (error) {
      next(error);
    }
  }

  static async assignClassAndSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = (await resolveSchoolId(req.body.schoolId || req.user?.schoolId)).toString();
      const id = req.params.id as string;
      const student = await StudentService.assignClassAndSection(schoolId, id, req.body.classId, req.body.sectionId);
      sendResponse(res, 200, 'Student class/section updated successfully', student);
    } catch (error) {
      next(error);
    }
  }

  static async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        sendResponse(res, 400, 'No file uploaded');
        return;
      }
      const schoolId = (await resolveSchoolId(req.body.schoolId || req.user?.schoolId)).toString();
      const id = req.params.id as string;
      const documentType = req.body.documentType || 'OTHER';
      const doc = await StudentService.uploadDocument(schoolId, id, documentType, req.file);
      sendResponse(res, 201, 'Document uploaded successfully', doc);
    } catch (error) {
      next(error);
    }
  }

  static async listDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
       const schoolId = (await resolveSchoolId((req.query.schoolId as string) || req.user?.schoolId)).toString();
       const id = req.params.id as string;
       const docs = await StudentService.listDocuments(schoolId, id);
       sendResponse(res, 200, 'Documents retrieved successfully', docs);
    } catch (error) {
       next(error);
    }
  }

  static async requestTransferCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = (await resolveSchoolId(req.body.schoolId || req.user?.schoolId)).toString();
      const id = req.params.id as string;
      const student = await StudentService.updateStudent(schoolId, id, { tcStatus: 'REQUESTED' });
      sendResponse(res, 200, 'Transfer certificate requested successfully', student);
    } catch (error) {
      next(error);
    }
  }

  static async issueTransferCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = (await resolveSchoolId(req.body.schoolId || req.user?.schoolId)).toString();
      const id = req.params.id as string;
      const student = await StudentService.issueTransferCertificate(schoolId, id, req.body);
      sendResponse(res, 200, 'Transfer certificate issued successfully', student);
    } catch (error) {
      next(error);
    }
  }
}
