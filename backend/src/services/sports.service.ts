import { SportsTeam, Tournament, ExtracurricularActivity } from '../models/index.js';

export class SportsService {
  static async getTeams(schoolId: string) {
    return SportsTeam.find({ schoolId }).sort({ createdAt: -1 });
  }

  static async createTeam(schoolId: string, data: any) {
    return SportsTeam.create({ ...data, schoolId });
  }

  static async getTournaments(schoolId: string) {
    return Tournament.find({ schoolId }).sort({ createdAt: -1 });
  }

  static async createTournament(schoolId: string, data: any) {
    return Tournament.create({ ...data, schoolId });
  }

  static async getActivities(schoolId: string) {
    return ExtracurricularActivity.find({ schoolId }).sort({ createdAt: -1 });
  }

  static async createActivity(schoolId: string, data: any) {
    return ExtracurricularActivity.create({ ...data, schoolId });
  }
}
