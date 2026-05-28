import { Router } from 'express';
import { AttendanceController } from '../../controllers/attendance.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { requireParentChildAccess, requireTeacherStudentAccess } from '../../middleware/resource-isolation.js';
import {
  dailyStatsQuerySchema,
  monthlyStatsQuerySchema
} from '../../validations/attendance.validation.js';

export const attendanceRouter = Router();

// Ensure all routes require authentication
attendanceRouter.use(authenticateToken);

// --- Frontend Compatible CRUD ---
attendanceRouter.post('/', AttendanceController.recordAttendance);
attendanceRouter.post('/bulk', AttendanceController.recordAttendanceBulk);
attendanceRouter.get('/', AttendanceController.getAttendanceRecords);
attendanceRouter.get('/student/:studentId', AttendanceController.getStudentAttendanceHistory);

// --- Student Reports ---
attendanceRouter.get(
  '/students/daily',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  validateRequest(dailyStatsQuerySchema),
  AttendanceController.getDailyStudentStats
);

attendanceRouter.get(
  '/students/monthly/:studentId',
  validateRequest(monthlyStatsQuerySchema),
  requireParentChildAccess,
  requireTeacherStudentAccess,
  AttendanceController.getMonthlyStudentStats
);

// --- Employee Reports ---
attendanceRouter.get(
  '/employees/daily',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  validateRequest(dailyStatsQuerySchema),
  AttendanceController.getDailyEmployeeStats
);

attendanceRouter.get(
  '/employees/monthly/:employeeId',
  (req, res, next) => {
    const role = req.user?.role;
    if (role && ['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(role)) {
       return next();
    }
    next();
  },
  validateRequest(monthlyStatsQuerySchema),
  AttendanceController.getMonthlyEmployeeStats
);
