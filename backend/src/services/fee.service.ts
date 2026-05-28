import crypto from 'crypto';
import mongoose, { Types } from 'mongoose';
import { env } from '../config/env.js';
import { FeeStructure } from '../models/FeeStructure.js';
import { Fee } from '../models/Fee.js';
import { FeeInstallmentPlan } from '../models/FeeInstallmentPlan.js';
import { FeeScholarship } from '../models/FeeScholarship.js';
import { Payment } from '../models/Payment.js';
import { Student } from '../models/Student.js';
import { ApiError } from '../utils/api-error.js';
import { runInTransaction } from '../utils/transaction.js';

export class FeeService {
  static async createFeeStructure(schoolId: string, data: any) {
    const structure = new FeeStructure({
      ...data,
      schoolId
    });
    return structure.save();
  }

  static async generateInvoices(schoolId: string, classId: string, feeStructureId: string) {
    const structure = await FeeStructure.findOne({ _id: feeStructureId, schoolId, classId });
    if (!structure) throw new ApiError(404, 'Fee structure not found for this class');

    const students = await Student.find({ schoolId, classId, isActive: true, isDeleted: false });
    if (students.length === 0) throw new ApiError(404, 'No active students found in this class');

    const feesToInsert = students.map(student => ({
      schoolId: new Types.ObjectId(schoolId),
      studentId: student._id,
      feeType: structure.feeType,
      amount: structure.amount,
      dueDate: structure.dueDate,
      description: structure.description
    }));

    // Avoid duplicates
    for (const fee of feesToInsert) {
       await Fee.updateOne(
          { schoolId: fee.schoolId, studentId: fee.studentId, feeType: fee.feeType, dueDate: fee.dueDate },
          { $setOnInsert: fee },
          { upsert: true }
       );
    }

    return { message: `Invoices generated for ${students.length} students` };
  }

  static async applyConcession(schoolId: string, feeId: string, data: any) {
    const fee = await Fee.findOne({ _id: feeId, schoolId });
    if (!fee) throw new ApiError(404, 'Fee invoice not found');

    if (fee.paidAmount > 0) {
       throw new ApiError(400, 'Cannot apply concession after payment has started');
    }

    if (data.discountAmount > fee.amount) {
       throw new ApiError(400, 'Discount cannot exceed fee amount');
    }

    fee.discountAmount = data.discountAmount;
    fee.discountReason = data.discountReason;
    
    if (fee.discountAmount === fee.amount) {
       fee.status = 'PAID'; // Full scholarship
    }

    return fee.save();
  }

  static async getStudentFees(schoolId: string, studentId: string) {
    return Fee.find({ schoolId, studentId }).sort({ dueDate: 1 });
  }

  static async getStudentPayments(schoolId: string, studentId: string) {
    return Payment.find({ schoolId, studentId }).sort({ paymentDate: -1 });
  }

  static async getAllFees(schoolId: string) {
    return Fee.find({ schoolId }).populate('studentId').sort({ dueDate: 1 });
  }

  static async getAllPayments(schoolId: string) {
    return Payment.find({ schoolId }).populate('studentId').sort({ paymentDate: -1 }).limit(100);
  }

  static async getFeeStructures(schoolId: string) {
    return FeeStructure.find({ schoolId }).sort({ createdAt: -1 });
  }

  static async getOverdueFees(schoolId: string) {
    const today = new Date();
    return Fee.find({
      schoolId,
      status: { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
      dueDate: { $lt: today },
    }).sort({ dueDate: 1 });
  }

  static async createInstallmentPlan(schoolId: string, feeId: string, data: any) {
    const fee = await Fee.findOne({ _id: feeId, schoolId });
    if (!fee) throw new ApiError(404, 'Fee invoice not found');

    const installmentCount = Number(data.installmentCount || 1);
    const totalAmount = Number(data.totalAmount || fee.amount - fee.discountAmount - fee.paidAmount);
    const amountPerInstallment = Math.round((totalAmount / installmentCount) * 100) / 100;

    const dueDates: Array<{ installmentNumber: number; dueDate: Date; amount: number; status: 'PENDING' | 'PAID'; }> = Array.from({ length: installmentCount }, (_, index) => ({
      installmentNumber: index + 1,
      dueDate: new Date(data.dueDates?.[index]?.dueDate || new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000)),
      amount: amountPerInstallment,
      status: 'PENDING' as const,
    }));

    const plan = await FeeInstallmentPlan.create({
      schoolId,
      feeId,
      studentId: fee.studentId,
      totalAmount,
      installmentCount,
      amountPerInstallment,
      dueDates,
      notes: data.notes,
    });

    fee.status = 'PARTIAL';
    await fee.save();

    return plan;
  }

  static async createScholarship(schoolId: string, feeId: string, data: any) {
    const fee = await Fee.findOne({ _id: feeId, schoolId });
    if (!fee) throw new ApiError(404, 'Fee invoice not found');

    if (Number(data.amount) > fee.amount - fee.discountAmount) {
      throw new ApiError(400, 'Scholarship amount cannot exceed outstanding balance');
    }

    const scholarship = await FeeScholarship.create({
      schoolId,
      feeId,
      studentId: fee.studentId,
      type: data.type || 'SCHOLARSHIP',
      amount: Number(data.amount),
      reason: data.reason,
      status: 'APPROVED',
      approvedBy: data.approvedBy,
      approvedAt: new Date(),
    });

    fee.discountAmount += Number(data.amount);
    fee.status = fee.amount - fee.discountAmount - fee.paidAmount <= 0 ? 'PAID' : 'PARTIAL';
    await fee.save();

    return scholarship;
  }

  static async generateReceipt(schoolId: string, paymentId: string) {
    const payment = await Payment.findOne({ _id: paymentId, schoolId }).populate('feeId');
    if (!payment) throw new ApiError(404, 'Payment receipt not found');

    const fee = payment.feeId as any;

    return {
      receiptNumber: payment.receiptNumber || `REC-${payment._id.toString().slice(-6)}`,
      paymentId: payment._id,
      studentId: payment.studentId,
      feeType: fee?.feeType || 'FEE',
      amountPaid: payment.amountPaid,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      transactionId: payment.transactionId,
      remarks: payment.remarks,
    };
  }

  static async createRazorpayOrder(schoolId: string, feeId: string, amount: number) {
    const fee = await Fee.findOne({ _id: feeId, schoolId });
    if (!fee) throw new ApiError(404, 'Fee invoice not found');

    const remainingAmount = fee.amount - fee.discountAmount - fee.paidAmount;
    if (amount > remainingAmount) {
      throw new ApiError(400, `Amount exceeds remaining balance of ${remainingAmount}`);
    }

    if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: 'INR',
          receipt: `fee_${feeId}_${Date.now()}`,
          notes: { schoolId, feeId },
        }),
      });

      const data = await response.json() as { id?: string; amount?: number; currency?: string };
      if (!response.ok || !data.id) {
        throw new ApiError(502, 'Razorpay order creation failed');
      }

      return {
        orderId: data.id,
        amount: data.amount ? data.amount / 100 : amount,
        currency: data.currency || 'INR',
        key: env.RAZORPAY_KEY_ID,
      };
    }

    const orderId = `order_mock_${Date.now()}`;
    return {
      orderId,
      amount,
      currency: 'INR',
      key: env.RAZORPAY_KEY_ID || null,
    };
  }

  static async processPayment(schoolId: string, feeId: string, data: any, session?: mongoose.ClientSession) {
    const fee = await Fee.findOne({ _id: feeId, schoolId }).session(session || null);
    if (!fee) throw new ApiError(404, 'Fee invoice not found');

    const remainingAmount = fee.amount - fee.discountAmount - fee.paidAmount;
    if (data.amountPaid > remainingAmount) {
      throw new ApiError(400, `Payment amount exceeds remaining balance of ${remainingAmount}`);
    }

    // Generate receipt number
    const receiptNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const payment = new Payment({
      schoolId,
      feeId,
      studentId: fee.studentId,
      amountPaid: data.amountPaid,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      receiptNumber,
      status: 'SUCCESS',
      remarks: data.remarks
    });

    await payment.save({ session });

    fee.paidAmount += data.amountPaid;
    const newRemaining = fee.amount - fee.discountAmount - fee.paidAmount;
    
    if (newRemaining <= 0) {
      fee.status = 'PAID';
    } else {
      fee.status = 'PARTIAL';
    }

    await fee.save({ session });
    return payment;
  }

  static async verifyRazorpayPayment(schoolId: string, data: any) {
    if (env.RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== data.razorpaySignature) {
        throw new ApiError(400, 'Invalid Razorpay signature');
      }
    }

    return runInTransaction(async (session) => {
      const paymentData = {
         amountPaid: data.amountPaid,
         paymentMethod: 'ONLINE',
         transactionId: data.razorpayPaymentId,
         remarks: `Razorpay Order: ${data.razorpayOrderId}`
      };

      return this.processPayment(schoolId, data.feeId, paymentData, session);
    });
  }

  static async recordManualPayment(schoolId: string, data: any) {
    return runInTransaction(async (session) => {
      return this.processPayment(schoolId, data.feeId, data, session);
    });
  }
}
