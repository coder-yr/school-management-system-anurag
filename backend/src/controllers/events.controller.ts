import { Request, Response } from 'express';
import { EventsService } from '../services/events.service.js';
import { sendResponse } from '../utils/response.js';

const eventsService = new EventsService();

export async function getEvents(req: Request, res: Response) {
  const events = await eventsService.getEvents(req.user || req);
  return sendResponse(res, 200, 'Events retrieved', events);
}

export async function createEvent(req: Request, res: Response) {
  const event = await eventsService.createEvent(req.user || req, req.body);
  return sendResponse(res, 201, 'Event created successfully', event);
}
