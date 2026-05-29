import type { Request, Response, NextFunction } from 'express';
import { SportsService } from '../services/sports.service.js';
import { sendResponse } from '../utils/response.js';

export class SportsController {
  static async getTeams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const teams = await SportsService.getTeams(schoolId);
      sendResponse(res, 200, 'Teams fetched successfully', teams);
    } catch (error) {
      next(error);
    }
  }

  static async createTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const team = await SportsService.createTeam(schoolId, req.body);
      sendResponse(res, 201, 'Team created successfully', team);
    } catch (error) {
      next(error);
    }
  }

  static async getTournaments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const tournaments = await SportsService.getTournaments(schoolId);
      sendResponse(res, 200, 'Tournaments fetched successfully', tournaments);
    } catch (error) {
      next(error);
    }
  }

  static async createTournament(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const tournament = await SportsService.createTournament(schoolId, req.body);
      sendResponse(res, 201, 'Tournament created successfully', tournament);
    } catch (error) {
      next(error);
    }
  }

  static async getActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const activities = await SportsService.getActivities(schoolId);
      sendResponse(res, 200, 'Activities fetched successfully', activities);
    } catch (error) {
      next(error);
    }
  }

  static async createActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const activity = await SportsService.createActivity(schoolId, req.body);
      sendResponse(res, 201, 'Activity created successfully', activity);
    } catch (error) {
      next(error);
    }
  }
}
