import type { NextFunction, Request, Response } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { sendResponse } from '../utils/response.js';

export class NotificationController {
  static async sendNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        res.status(400).json({ success: false, message: 'Missing school context' });
        return;
      }

      const notifications = await NotificationService.enqueue({
        schoolId,
        title: req.body.title,
        message: req.body.message,
        type: req.body.type || 'GENERAL',
        channels: req.body.channels || ['PUSH'],
        scheduledAt: req.body.scheduledAt,
        userIds: req.body.userIds,
        link: req.body.link,
      });

      sendResponse(res, 201, 'Notification queued successfully', notifications);
    } catch (error) {
      next(error);
    }
  }

  static async broadcastAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        res.status(400).json({ success: false, message: 'Missing school context' });
        return;
      }

      const notifications = await NotificationService.broadcastAnnouncement(schoolId, {
        schoolId,
        title: req.body.title,
        message: req.body.message,
        type: req.body.type || 'ANNOUNCEMENT',
        channels: req.body.channels || ['PUSH', 'EMAIL'],
        scheduledAt: req.body.scheduledAt,
        userIds: req.body.userIds,
        link: req.body.link,
      });

      sendResponse(res, 201, 'Announcement broadcast queued', notifications);
    } catch (error) {
      next(error);
    }
  }

  static async listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId;
      const userId = req.user?.id;
      if (!schoolId || !userId) {
        res.status(400).json({ success: false, message: 'Missing user context' });
        return;
      }

      const notifications = await NotificationService.listNotifications(schoolId, userId);
      sendResponse(res, 200, 'Notifications retrieved successfully', notifications);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notificationId = req.params.notificationId as string;
      const userId = req.user?.id as string;
      const notification = await NotificationService.markAsRead(notificationId, userId);
      sendResponse(res, 200, 'Notification marked as read', notification);
    } catch (error) {
      next(error);
    }
  }
}
