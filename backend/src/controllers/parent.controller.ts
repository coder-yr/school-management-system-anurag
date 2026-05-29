import { Request, Response, NextFunction } from 'express';
import { ParentService } from '../services/parent.service.js';

export class ParentController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = await ParentService.getDashboardData(userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
