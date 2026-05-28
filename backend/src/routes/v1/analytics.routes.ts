import { Router } from 'express';
import { AnalyticsController } from '../../controllers/analytics.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

export const analyticsRouter = Router();

// Ensure all routes require authentication
analyticsRouter.use(authenticateToken);

analyticsRouter.get('/dashboard', AnalyticsController.getDashboardStats);
analyticsRouter.get('/teacher-dashboard', AnalyticsController.getTeacherDashboardStats);
