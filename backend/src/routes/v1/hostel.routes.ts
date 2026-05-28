import { Router } from 'express';
import { HostelController } from '../../controllers/hostel.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

export const hostelRouter = Router();

// Ensure all routes require authentication
hostelRouter.use(authenticateToken);

hostelRouter.get('/rooms', HostelController.getHostelRooms);
hostelRouter.patch('/rooms/:block/:roomNo', HostelController.updateHostelRoom);
hostelRouter.post('/complaints', HostelController.createHostelComplaint);
hostelRouter.get('/complaints', HostelController.getHostelComplaints);
hostelRouter.patch('/complaints/:id', HostelController.updateHostelComplaint);

hostelRouter.post('/visitors', HostelController.createHostelVisitor);
hostelRouter.get('/visitors', HostelController.getHostelVisitors);
hostelRouter.patch('/visitors/:id', HostelController.updateHostelVisitor);
