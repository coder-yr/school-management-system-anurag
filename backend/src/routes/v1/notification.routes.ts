import { Router } from 'express';
import { NotificationController } from '../../controllers/notification.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { createNotificationSchema } from '../../validations/notification.validation.js';

export const notificationRouter = Router();

notificationRouter.use(authenticateToken);

notificationRouter.post(
  '/',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  validateRequest(createNotificationSchema),
  NotificationController.sendNotification,
);

notificationRouter.post(
  '/announce',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  validateRequest(createNotificationSchema),
  NotificationController.broadcastAnnouncement,
);

notificationRouter.get('/', NotificationController.listNotifications);
notificationRouter.patch('/:notificationId/read', NotificationController.markAsRead);

export default notificationRouter;
