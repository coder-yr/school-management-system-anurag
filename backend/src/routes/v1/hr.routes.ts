import { Router } from 'express';
import { HRController } from '../../controllers/hr.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

export const hrRouter = Router();

// Ensure all routes require authentication
hrRouter.use(authenticateToken);

hrRouter.post('/leaves', HRController.createLeaveRequest);
hrRouter.get('/leaves', HRController.getLeaveRequests);
hrRouter.post('/leaves/:id/approve', HRController.approveLeaveRequest);
hrRouter.patch('/leaves/:id', HRController.updateLeaveStatus);
