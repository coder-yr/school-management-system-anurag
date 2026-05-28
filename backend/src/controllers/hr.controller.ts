import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Employee } from '../models/Employee.js';
import { User } from '../models/User.js';
import { Types } from 'mongoose';

async function getOrCreateEmployee(schoolId: Types.ObjectId, userId: Types.ObjectId) {
  let emp = await Employee.findOne({ schoolId, userId });
  if (!emp) {
    emp = new Employee({
      schoolId,
      userId,
      employeeId: `EMP_${userId.toString().slice(-6).toUpperCase()}`,
      employeeType: 'TEACHING',
      designation: 'Faculty',
      joiningDate: new Date(),
      createdBy: userId,
      updatedBy: userId
    });
    await emp.save();
  }
  return emp;
}

export class HRController {
  static async createLeaveRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const userId = req.user?.id || "000000000000000000000001";
      const { staff_id, staff_name, leave_type, start_date, end_date, reason } = req.body;

      const sId = new Types.ObjectId(schoolId as string);
      const targetUserId = staff_id ? new Types.ObjectId(staff_id) : new Types.ObjectId(userId as string);

      const employee = await getOrCreateEmployee(sId, targetUserId);

      let backendType: any = leave_type.toUpperCase();
      if (backendType === 'UNPAID') backendType = 'OTHER';

      const leave = new LeaveRequest({
        schoolId: sId,
        employeeId: employee._id,
        leaveType: backendType,
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        reason,
        status: 'PENDING',
        createdBy: new Types.ObjectId(userId as string),
        updatedBy: new Types.ObjectId(userId as string)
      });

      await leave.save();

      sendResponse(res, 201, 'Leave request created successfully', {
        id: leave._id.toString(),
        staff_id: targetUserId.toString(),
        staff_name: staff_name || req.user?.fullName || "Staff",
        leave_type: leave_type.toLowerCase(),
        start_date,
        end_date,
        reason: leave.reason,
        status: leave.status.toLowerCase(),
        approved_by: null,
        created_at: leave.createdAt,
        updated_at: leave.updatedAt
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLeaveRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { staffId, status } = req.query;

      const sId = new Types.ObjectId(schoolId as string);
      const match: any = { schoolId: sId };

      if (status && typeof status === 'string') {
        match.status = status.toUpperCase();
      }

      if (staffId && typeof staffId === 'string') {
        const employee = await Employee.findOne({ schoolId: sId, userId: new Types.ObjectId(staffId) });
        if (employee) {
          match.employeeId = employee._id;
        } else {
          sendResponse(res, 200, 'Leave requests retrieved', []);
          return;
        }
      }

      const leaves = await LeaveRequest.find(match).sort({ createdAt: -1 });

      const formatted = [];
      for (const leave of leaves) {
        const emp = await Employee.findById(leave.employeeId);
        const userDoc = emp ? await User.findById(emp.userId) : null;
        const approverDoc = leave.approvedBy ? await User.findById(leave.approvedBy) : null;

        formatted.push({
          id: leave._id.toString(),
          staff_id: emp ? emp.userId.toString() : "",
          staff_name: userDoc ? `${userDoc.firstName} ${userDoc.lastName}`.trim() : "Unknown Staff",
          leave_type: leave.leaveType.toLowerCase(),
          start_date: leave.startDate.toISOString().split('T')[0],
          end_date: leave.endDate.toISOString().split('T')[0],
          reason: leave.reason,
          status: leave.status.toLowerCase(),
          approved_by: approverDoc ? `${approverDoc.firstName} ${approverDoc.lastName}`.trim() : null,
          created_at: leave.createdAt,
          updated_at: leave.updatedAt
        });
      }

      sendResponse(res, 200, 'Leave requests retrieved', formatted);
    } catch (error) {
      next(error);
    }
  }

  static async approveLeaveRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const userId = req.user?.id || "000000000000000000000001";
      const { id } = req.params;
      const { approvedBy } = req.body;

      const sId = new Types.ObjectId(schoolId as string);
      const leave = await LeaveRequest.findOne({ schoolId: sId, _id: new Types.ObjectId(id as string) });

      if (!leave) {
        res.status(404).json({ success: false, message: 'Leave request not found' });
        return;
      }

      leave.status = 'APPROVED';
      leave.approvedBy = new Types.ObjectId(userId as string);
      await leave.save();

      const emp = await Employee.findById(leave.employeeId);
      const userDoc = emp ? await User.findById(emp.userId) : null;
      const approverDoc = await User.findById(leave.approvedBy);

      sendResponse(res, 200, 'Leave request approved successfully', {
        id: leave._id.toString(),
        staff_id: emp ? emp.userId.toString() : "",
        staff_name: userDoc ? `${userDoc.firstName} ${userDoc.lastName}`.trim() : "Unknown Staff",
        leave_type: leave.leaveType.toLowerCase(),
        start_date: leave.startDate.toISOString().split('T')[0],
        end_date: leave.endDate.toISOString().split('T')[0],
        reason: leave.reason,
        status: leave.status.toLowerCase(),
        approved_by: approverDoc ? `${approverDoc.firstName} ${approverDoc.lastName}`.trim() : approvedBy || "Admin",
        created_at: leave.createdAt,
        updated_at: leave.updatedAt
      });
    } catch (error) {
      next(error);
    }
  }
}
