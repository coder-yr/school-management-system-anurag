import type { Request, Response, NextFunction } from 'express';
import { FeeService } from '../services/fee.service.js';
import { sendResponse } from '../utils/response.js';

export class FeeController {
  static async createFeeStructure(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const structure = await FeeService.createFeeStructure(schoolId, req.body);
      sendResponse(res, 201, 'Fee structure created successfully', structure);
    } catch (error) {
      next(error);
    }
  }

  static async generateInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const result = await FeeService.generateInvoices(
         schoolId, 
         req.body.classId, 
         req.body.feeStructureId
      );
      sendResponse(res, 201, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async applyConcession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const feeId = req.params.feeId as string;
      const fee = await FeeService.applyConcession(schoolId, feeId, req.body);
      sendResponse(res, 200, 'Concession applied successfully', fee);
    } catch (error) {
      next(error);
    }
  }

  static async getStudentFees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const studentId = req.params.studentId as string;
      const fees = await FeeService.getStudentFees(schoolId, studentId);
      sendResponse(res, 200, 'Student fees retrieved', fees);
    } catch (error) {
      next(error);
    }
  }

  static async getStudentPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const studentId = req.params.studentId as string;
      const payments = await FeeService.getStudentPayments(schoolId, studentId);
      sendResponse(res, 200, 'Student payments retrieved', payments);
    } catch (error) {
      next(error);
    }
  }

  static async getAllFees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const fees = await FeeService.getAllFees(schoolId);
      sendResponse(res, 200, 'All fees retrieved', fees);
    } catch (error) {
      next(error);
    }
  }

  static async getAllPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const payments = await FeeService.getAllPayments(schoolId);
      sendResponse(res, 200, 'All payments retrieved', payments);
    } catch (error) {
      next(error);
    }
  }

  static async getFeeStructures(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const structures = await FeeService.getFeeStructures(schoolId);
      sendResponse(res, 200, 'Fee structures retrieved', structures);
    } catch (error) {
      next(error);
    }
  }

  static async getOverdueFees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const overdueFees = await FeeService.getOverdueFees(schoolId);
      sendResponse(res, 200, 'Overdue fees retrieved', overdueFees);
    } catch (error) {
      next(error);
    }
  }

  static async createInstallmentPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const feeId = req.params.feeId as string;
      const plan = await FeeService.createInstallmentPlan(schoolId, feeId, req.body);
      sendResponse(res, 201, 'Installment plan created', plan);
    } catch (error) {
      next(error);
    }
  }

  static async createScholarship(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const feeId = req.params.feeId as string;
      const scholarship = await FeeService.createScholarship(schoolId, feeId, req.body);
      sendResponse(res, 201, 'Scholarship or concession applied', scholarship);
    } catch (error) {
      next(error);
    }
  }

  static async generateReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const paymentId = req.params.paymentId as string;
      const receipt = await FeeService.generateReceipt(schoolId, paymentId);
      sendResponse(res, 200, 'Receipt generated', receipt);
    } catch (error) {
      next(error);
    }
  }

  static async createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const order = await FeeService.createRazorpayOrder(
         schoolId, 
         req.body.feeId, 
         req.body.amount
      );
      sendResponse(res, 201, 'Razorpay order created', order);
    } catch (error) {
      next(error);
    }
  }

  static async verifyRazorpayPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const payment = await FeeService.verifyRazorpayPayment(schoolId, req.body);
      sendResponse(res, 201, 'Payment verified and processed successfully', payment);
    } catch (error) {
      next(error);
    }
  }

  static async recordManualPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId as string;
      const payment = await FeeService.recordManualPayment(schoolId, req.body);
      sendResponse(res, 201, 'Manual payment recorded successfully', payment);
    } catch (error) {
      next(error);
    }
  }
}
