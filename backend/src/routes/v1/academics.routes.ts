import { Router } from 'express';
import { AcademicsController } from '../../controllers/academics.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

export const academicsRouter = Router();

// Ensure all routes require authentication
academicsRouter.use(authenticateToken);

academicsRouter.post('/grades', AcademicsController.recordGrade);
academicsRouter.post('/grades/bulk', AcademicsController.recordGradeBulk);
academicsRouter.get('/grades/student/:studentId', AcademicsController.getStudentGrades);
academicsRouter.get('/grades', AcademicsController.getGradesByTerm);

academicsRouter.get('/subjects', AcademicsController.listSubjects);

academicsRouter.get('/syllabus', AcademicsController.listSyllabus);

academicsRouter.get('/leads', AcademicsController.listLeads);
academicsRouter.post('/leads', AcademicsController.createLead);
academicsRouter.patch('/leads/:id', AcademicsController.updateLead);

academicsRouter.get('/timetable', AcademicsController.listTimetable);
academicsRouter.post('/timetable', AcademicsController.createTimetable);
