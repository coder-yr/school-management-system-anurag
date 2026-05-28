import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/async-handler.js';
import {
  getEvents,
  createEvent
} from '../../controllers/events.controller.js';

export const eventsRoutes = Router();

eventsRoutes.use(authenticateToken);

eventsRoutes.get('/', asyncHandler(getEvents));
eventsRoutes.post('/', asyncHandler(createEvent));
