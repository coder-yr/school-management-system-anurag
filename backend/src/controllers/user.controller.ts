import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response.js';
import { User } from '../models/User.js';
import { Types } from 'mongoose';

export class UserController {
  static async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      sendResponse(res, 200, 'User profile retrieved', {
        id: user._id.toString(),
        email: user.email,
        full_name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role.toLowerCase(),
        avatar_url: user.profilePicture || null,
        subtitle: user.role,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllProfiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { role } = req.query;

      const match: any = { schoolId: new Types.ObjectId(schoolId) };
      if (role) {
        match.role = (role as string).toUpperCase();
      }

      const users = await User.find(match);

      const formatted = users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        full_name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role.toLowerCase(),
        avatar_url: user.profilePicture || null,
        subtitle: user.role,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      }));

      sendResponse(res, 200, 'User profiles retrieved', formatted);
    } catch (error) {
      next(error);
    }
  }
}
