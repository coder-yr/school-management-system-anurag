import mongoose, { Schema, Document, Types } from 'mongoose';
import { IAuditFields, auditSchemaDefinition } from './common.js';

export interface ISubject extends Document, IAuditFields {
  schoolId: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  type: 'CORE' | 'ELECTIVE' | 'LAB';
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String },
    type: { type: String, enum: ['CORE', 'ELECTIVE', 'LAB'], default: 'CORE' },
    ...auditSchemaDefinition,
  },
  { timestamps: true }
);

subjectSchema.index({ schoolId: 1, code: 1 }, { unique: true });
subjectSchema.index({ schoolId: 1, name: 1 });

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema);
