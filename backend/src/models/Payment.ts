import mongoose, { Schema, Types } from 'mongoose';
import type { Document } from 'mongoose';
import type { IAuditFields } from './common.js';
import { auditSchemaDefinition } from './common.js';

export interface IPayment extends Document, IAuditFields {
  schoolId: Types.ObjectId;
  feeId: Types.ObjectId;
  studentId: Types.ObjectId;
  amountPaid: number;
  paymentDate: Date;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE';
  transactionId?: string;
  receiptNumber?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    feeId: { type: Schema.Types.ObjectId, ref: 'Fee', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    amountPaid: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE'], required: true },
    transactionId: { type: String },
    receiptNumber: { type: String },
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'SUCCESS' },
    remarks: { type: String },
    ...auditSchemaDefinition,
  },
  { timestamps: true }
);

paymentSchema.index({ schoolId: 1, feeId: 1 });
paymentSchema.index({ schoolId: 1, studentId: 1 });
paymentSchema.index({ schoolId: 1, transactionId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
