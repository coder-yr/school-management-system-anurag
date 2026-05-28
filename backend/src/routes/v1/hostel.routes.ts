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

// Room Allotment
hostelRouter.post('/rooms/:block/:roomNo/allocate', HostelController.allocateRoom);
hostelRouter.post('/rooms/:block/:roomNo/deallocate', HostelController.deallocateRoom);

// Leaves (In/Out)
hostelRouter.post('/leaves', HostelController.createHostelLeave);
hostelRouter.get('/leaves', HostelController.getHostelLeaves);
hostelRouter.patch('/leaves/:id/status', HostelController.updateHostelLeaveStatus);

// Attendance
hostelRouter.post('/attendance', HostelController.recordHostelAttendance);
hostelRouter.get('/attendance', HostelController.getHostelAttendance);

// Notices
hostelRouter.post('/notices', HostelController.createHostelNotice);
hostelRouter.get('/notices', HostelController.getHostelNotices);
