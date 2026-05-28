import { Router } from 'express';
import { UserController } from '../../controllers/user.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

export const userRouter = Router();

// Ensure all routes require authentication
userRouter.use(authenticateToken);

userRouter.get('/:id', UserController.getUserProfile);
userRouter.get('/', UserController.getAllProfiles);
