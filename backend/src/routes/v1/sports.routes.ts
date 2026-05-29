import { Router } from 'express';
import { SportsController } from '../../controllers/sports.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';

export const sportsRouter = Router();

sportsRouter.use(authenticateToken);
sportsRouter.use(requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'));

sportsRouter.get('/teams', SportsController.getTeams);
sportsRouter.post('/teams', SportsController.createTeam);

sportsRouter.get('/tournaments', SportsController.getTournaments);
sportsRouter.post('/tournaments', SportsController.createTournament);

sportsRouter.get('/activities', SportsController.getActivities);
sportsRouter.post('/activities', SportsController.createActivity);
