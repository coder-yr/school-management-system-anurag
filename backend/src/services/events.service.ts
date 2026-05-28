import { Event } from '../models/Event.js';
import { ApiError } from '../utils/api-error.js';
import { resolveSchoolId } from '../utils/school.js';

export class EventsService {
  async getEvents(context: any) {
    const schoolId = await resolveSchoolId(context);
    return Event.find({ schoolId }).sort({ date: 1 });
  }

  async createEvent(context: any, input: any) {
    const schoolId = await resolveSchoolId(context);
    const event = new Event({ ...input, schoolId });
    await event.save();
    return event;
  }
}
