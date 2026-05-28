import { Router } from 'express';
import { LibraryController } from '../../controllers/library.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

export const libraryRouter = Router();

// Ensure all routes require authentication
libraryRouter.use(authenticateToken);

libraryRouter.get('/books', LibraryController.getLibraryBooks);
libraryRouter.post('/books', LibraryController.addLibraryBook);
libraryRouter.post('/circulations/issue', LibraryController.issueBook);
libraryRouter.post('/circulations/:id/return', LibraryController.returnBook);
libraryRouter.get('/circulations', LibraryController.getAllCirculations);
libraryRouter.get('/circulations/student/:studentId', LibraryController.getStudentCirculations);
