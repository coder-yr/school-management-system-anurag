import mongoose, { Schema, Types } from 'mongoose';
import type { Document } from 'mongoose';
import type { IAuditFields } from './common.js';
import { auditSchemaDefinition } from './common.js';

export interface IEmployee extends Document, IAuditFields {
  schoolId: Types.ObjectId;
  userId: Types.ObjectId;
  employeeId: string;
  employeeType: 'TEACHING' | 'NON_TEACHING';
  designation: string;
  qualification?: string;
  joiningDate: Date;
  basicSalary?: number;
  subjects?: Types.ObjectId[];
  department?: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: String, required: true, trim: true },
    employeeType: { type: String, enum: ['TEACHING', 'NON_TEACHING'], required: true },
    designation: { type: String, required: true },
    qualification: { type: String },
    joiningDate: { type: Date, required: true },
    basicSalary: { type: Number },
    subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    department: { type: String },
    isActive: { type: Boolean, default: true },
    ...auditSchemaDefinition,
  },
  { timestamps: true }
);

employeeSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });
employeeSchema.index({ schoolId: 1, userId: 1 }, { unique: true });
employeeSchema.index({ schoolId: 1, department: 1 });
employeeSchema.index({ schoolId: 1, employeeType: 1 });

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);
