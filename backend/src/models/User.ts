import mongoose, { Schema, Document, Types } from 'mongoose';
import { IAuditFields, auditSchemaDefinition } from './common.js';

export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT' | 'DRIVER' | 'ACCOUNTANT';

export interface IUser extends Document, IAuditFields {
  schoolId?: Types.ObjectId; // Optional for super_admin
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  profilePicture?: string;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School' },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: { 
      type: String, 
      enum: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT', 'DRIVER', 'ACCOUNTANT'], 
      required: true 
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    profilePicture: { type: String },
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    ...auditSchemaDefinition,
  },
  { timestamps: true }
);

// Compound index for tenant isolation and fast lookups
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ schoolId: 1, role: 1 });
userSchema.index({ schoolId: 1, isActive: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
