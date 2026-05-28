import mongoose, { Schema, Document } from 'mongoose';
import { IAuditFields, auditSchemaDefinition } from './common.js';

export interface ISchoolSettings {
  timezone: string;
  currency: string;
  gradingSystem: string;
}

export interface ISchool extends Document, IAuditFields {
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  logo?: string;
  settings?: ISchoolSettings;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    address: { type: String },
    contactEmail: { type: String, lowercase: true, trim: true },
    contactPhone: { type: String },
    logo: { type: String },
    settings: {
      timezone: { type: String, default: 'UTC' },
      currency: { type: String, default: 'USD' },
      gradingSystem: { type: String, default: 'GPA' },
    },
    isActive: { type: Boolean, default: true },
    ...auditSchemaDefinition,
  },
  { timestamps: true }
);

// Pre-save middleware to log when a school is storing in db
schoolSchema.pre('save', function() {
  console.log(`[DATABASE SAVE] Attempting to store school in database. Name: "${this.name}", Code: "${this.code}"`);
});

schoolSchema.post('save', function(doc) {
  console.log(`[DATABASE SAVE SUCCESS] Successfully stored school in database. ID: ${doc._id}, Name: "${doc.name}", Code: "${doc.code}"`);
});

// Indexes
schoolSchema.index({ name: 1 });
schoolSchema.index({ isActive: 1 });

export const School = mongoose.model<ISchool>('School', schoolSchema);
