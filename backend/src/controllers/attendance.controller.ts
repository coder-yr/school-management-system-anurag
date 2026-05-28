import type { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service.js';
import { sendResponse } from '../utils/response.js';

export class AttendanceController {
  static async markStudentAttendanceBulk(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const userId = req.user?.id as string;
      const result = await AttendanceService.markStudentAttendanceBulk(schoolId, userId, req.body);
      sendResponse(res, 200, 'Student attendance marked successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async getDailyStudentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const stats = await AttendanceService.getDailyStudentStats(schoolId, req.query);
      sendResponse(res, 200, 'Daily student attendance stats retrieved', stats);
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyStudentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const studentId = req.params.studentId as string;
      const { month, year } = req.query as any;
      const stats = await AttendanceService.getMonthlyStudentStats(
        schoolId, 
        studentId, 
        Number(month), 
        Number(year)
      );
      sendResponse(res, 200, 'Monthly student attendance stats retrieved', stats);
    } catch (error) {
      next(error);
    }
  }

  static async getDailyEmployeeStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const stats = await AttendanceService.getDailyEmployeeStats(schoolId, req.query);
      sendResponse(res, 200, 'Daily employee attendance stats retrieved', stats);
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyEmployeeStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const employeeId = req.params.employeeId as string;
      const { month, year } = req.query as any;
      const stats = await AttendanceService.getMonthlyEmployeeStats(
        schoolId, 
        employeeId, 
        Number(month), 
        Number(year)
      );
      sendResponse(res, 200, 'Monthly employee attendance stats retrieved', stats);
    } catch (error) {
      next(error);
    }
  }
}
