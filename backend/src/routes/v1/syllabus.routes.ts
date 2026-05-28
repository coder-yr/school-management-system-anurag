import { Router } from 'express';
import { SyllabusController } from '../../controllers/syllabus.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

export const syllabusRouter = Router();

// Ensure all routes require authentication
syllabusRouter.use(authenticateToken);

syllabusRouter.get('/', SyllabusController.listSyllabus);
syllabusRouter.post('/', SyllabusController.createSyllabus);
syllabusRouter.patch('/:id', SyllabusController.updateSyllabus);
