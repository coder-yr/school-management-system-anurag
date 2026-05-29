import { Router } from 'express';
import { ParentController } from '../../controllers/parent.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';

export const parentRouter = Router();

// Apply authentication middleware
parentRouter.use(authenticateToken);
parentRouter.use(requireRoles('PARENT', 'SUPER_ADMIN'));

// Dashboard route
parentRouter.get('/dashboard', ParentController.getDashboard);
