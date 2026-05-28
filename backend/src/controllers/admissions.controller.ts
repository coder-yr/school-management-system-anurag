import { Request, Response } from 'express';
import { AdmissionsService } from '../services/admissions.service.js';
import { sendResponse } from '../utils/response.js';

const admissionsService = new AdmissionsService();

export async function getApplications(req: Request, res: Response) {
  const applications = await admissionsService.getApplications(req.user || req);
  return sendResponse(res, 200, 'Applications retrieved', applications);
}

export async function getMyApplications(req: Request, res: Response) {
  const applications = await admissionsService.getMyApplications(req.user || req);
  return sendResponse(res, 200, 'My Applications retrieved', applications);
}

export async function createApplication(req: Request, res: Response) {
  const application = await admissionsService.createApplication(req.user || req, req.body);
  return sendResponse(res, 201, 'Application created successfully', application);
}

export async function updateApplicationStatus(req: Request, res: Response) {
  const application = await admissionsService.updateApplicationStatus(req.user || req, req.params.id as string, req.body.status);
  return sendResponse(res, 200, 'Application status updated', application);
}
