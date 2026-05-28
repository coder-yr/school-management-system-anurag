import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response.js';
import { HostelRoom } from '../models/HostelRoom.js';
import { HostelComplaint } from '../models/HostelComplaint.js';
import mongoose, { Types } from 'mongoose';

// Helper to seed rooms if database is empty
async function ensureRoomsExist(schoolId: Types.ObjectId) {
  const count = await HostelRoom.countDocuments({ schoolId });
  if (count === 0) {
    const defaultRooms = [
      { block: 'A', roomNo: '101', capacity: 4, occupied: 2, status: 'available' },
      { block: 'A', roomNo: '102', capacity: 4, occupied: 4, status: 'full' },
      { block: 'B', roomNo: '201', capacity: 3, occupied: 0, status: 'available' },
      { block: 'B', roomNo: '202', capacity: 2, occupied: 1, status: 'available' },
      { block: 'B', roomNo: '203', capacity: 4, occupied: 0, status: 'maintenance' }
    ];

    for (const r of defaultRooms) {
      await HostelRoom.create({
        schoolId,
        block: r.block,
        roomNo: r.roomNo,
        capacity: r.capacity,
        occupied: r.occupied,
        status: r.status as any,
        createdBy: new Types.ObjectId("000000000000000000000001"),
        updatedBy: new Types.ObjectId("000000000000000000000001")
      });
    }
  }
}

export class HostelController {
  static async getHostelRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const sId = new Types.ObjectId(schoolId as string);

      await ensureRoomsExist(sId);

      const rooms = await HostelRoom.find({ schoolId: sId });
      
      const formatted = rooms.map(r => ({
        id: r._id.toString(),
        block: r.block,
        room_no: r.roomNo,
        capacity: r.capacity,
        occupied: r.occupied,
        student_ids: r.studentIds.map(id => id.toString()),
        status: r.status,
        created_at: (r as any).createdAt,
        updated_at: (r as any).updatedAt
      }));

      sendResponse(res, 200, 'Rooms retrieved', formatted);
    } catch (error) {
      next(error);
    }
  }

  static async updateHostelRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { block, roomNo } = req.params;
      const updates = req.body;

      const sId = new Types.ObjectId(schoolId as string);

      const mappedUpdates: any = {};
      if (updates.room_no) mappedUpdates.roomNo = updates.room_no;
      if (updates.capacity !== undefined) mappedUpdates.capacity = updates.capacity;
      if (updates.occupied !== undefined) mappedUpdates.occupied = updates.occupied;
      if (updates.status) mappedUpdates.status = updates.status;
      if (updates.student_ids) mappedUpdates.studentIds = updates.student_ids.map((id: string) => new Types.ObjectId(id));

      const room = await HostelRoom.findOneAndUpdate(
        { schoolId: sId, block, roomNo },
        { $set: mappedUpdates },
        { new: true }
      );

      if (!room) {
        res.status(404).json({ success: false, message: 'Room not found' });
        return;
      }

      sendResponse(res, 200, 'Room updated', {
        id: room._id.toString(),
        block: room.block,
        room_no: room.roomNo,
        capacity: room.capacity,
        occupied: room.occupied,
        student_ids: room.studentIds.map(id => id.toString()),
        status: room.status,
        created_at: (room as any).createdAt,
        updated_at: (room as any).updatedAt
      });
    } catch (error) {
      next(error);
    }
  }

  static async createHostelComplaint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const userId = req.user?.id || "000000000000000000000001";
      const { student_name, room, category, description, status } = req.body;

      const sId = new Types.ObjectId(schoolId as string);
      const uId = new Types.ObjectId(userId as string);

      const complaint = new HostelComplaint({
        schoolId: sId,
        studentId: uId,
        studentName: student_name,
        room,
        category: category.toLowerCase(),
        description,
        status: status || 'open',
        reportedBy: uId,
        createdBy: uId,
        updatedBy: uId
      });

      await complaint.save();

      sendResponse(res, 201, 'Complaint created', {
        id: complaint._id.toString(),
        student_id: userId,
        student_name: complaint.studentName,
        room: complaint.room,
        category: complaint.category,
        description: complaint.description,
        status: complaint.status,
        created_at: (complaint as any).createdAt,
        updated_at: (complaint as any).updatedAt
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHostelComplaints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { status, studentName } = req.query;

      const sId = new Types.ObjectId(schoolId as string);
      const match: any = { schoolId: sId };
      if (status && typeof status === 'string') match.status = status;
      if (studentName && typeof studentName === 'string') match.studentName = { $regex: studentName, $options: 'i' };

      const complaints = await HostelComplaint.find(match).sort({ createdAt: -1 });

      const formatted = complaints.map(c => ({
        id: c._id.toString(),
        student_id: c.studentId ? c.studentId.toString() : undefined,
        student_name: c.studentName,
        room: c.room,
        category: c.category,
        description: c.description,
        status: c.status,
        created_at: (c as any).createdAt,
        updated_at: (c as any).updatedAt
      }));

      sendResponse(res, 200, 'Complaints retrieved', formatted);
    } catch (error) {
      next(error);
    }
  }

  static async updateHostelComplaint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { id } = req.params;
      const updates = req.body;

      const sId = new Types.ObjectId(schoolId as string);

      const mappedUpdates: any = {};
      if (updates.status) mappedUpdates.status = updates.status;
      if (updates.description) mappedUpdates.description = updates.description;

      const complaint = await HostelComplaint.findOneAndUpdate(
        { schoolId: sId, _id: new Types.ObjectId(id as string) },
        { $set: mappedUpdates },
        { new: true }
      );

      if (!complaint) {
        res.status(404).json({ success: false, message: 'Complaint not found' });
        return;
      }

      sendResponse(res, 200, 'Complaint updated', {
        id: complaint._id.toString(),
        student_id: complaint.studentId ? complaint.studentId.toString() : undefined,
        student_name: complaint.studentName,
        room: complaint.room,
        category: complaint.category,
        description: complaint.description,
        status: complaint.status,
        created_at: (complaint as any).createdAt,
        updated_at: (complaint as any).updatedAt
      });
    } catch (error) {
      next(error);
    }
  }

  static async createHostelVisitor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { visitorName, studentName, room, purpose, status } = req.body;
      const visitor = new (mongoose.models.HostelVisitor || require('../models/HostelVisitor.js').HostelVisitor)({
        schoolId: new Types.ObjectId(schoolId as string),
        visitorName,
        studentName,
        room,
        purpose,
        status: status || 'checked-in',
        createdBy: new Types.ObjectId(req.user?.id || "000000000000000000000001"),
        updatedBy: new Types.ObjectId(req.user?.id || "000000000000000000000001")
      });
      await visitor.save();
      sendResponse(res, 201, 'Visitor created', visitor);
    } catch (error) {
      next(error);
    }
  }

  static async getHostelVisitors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const HostelVisitor = mongoose.models.HostelVisitor || require('../models/HostelVisitor.js').HostelVisitor;
      const visitors = await HostelVisitor.find({ schoolId: new Types.ObjectId(schoolId as string) }).sort({ checkIn: -1 });
      sendResponse(res, 200, 'Visitors retrieved', visitors);
    } catch (error) {
      next(error);
    }
  }

  static async updateHostelVisitor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { id } = req.params;
      const updates = req.body;
      const HostelVisitor = mongoose.models.HostelVisitor || require('../models/HostelVisitor.js').HostelVisitor;
      const visitor = await HostelVisitor.findOneAndUpdate(
        { schoolId: new Types.ObjectId(schoolId as string), _id: new Types.ObjectId(id as string) },
        { $set: updates },
        { new: true }
      );
      if (!visitor) {
        res.status(404).json({ success: false, message: 'Visitor not found' });
        return;
      }
      sendResponse(res, 200, 'Visitor updated', visitor);
    } catch (error) {
      next(error);
    }
  }
}
