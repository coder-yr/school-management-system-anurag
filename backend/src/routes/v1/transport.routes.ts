import { Router } from 'express';
import { TransportController } from '../../controllers/transport.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

export const transportRouter = Router();

// Ensure all routes require authentication
transportRouter.use(authenticateToken);

transportRouter.get('/routes', TransportController.getTransportRoutes);
transportRouter.post('/routes', TransportController.createTransportRoute);
transportRouter.patch('/routes/:id/location', TransportController.updateGPSLocation);
