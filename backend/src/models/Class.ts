import mongoose, { Schema, Document, Types } from 'mongoose';
import { IAuditFields, auditSchemaDefinition } from './common.js';

export interface IClass extends Document, IAuditFields {
  schoolId: Types.ObjectId;
  name: string; // e.g., 'Grade 10', 'Year 1'
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    ...auditSchemaDefinition,
  },
  { timestamps: true }
);

classSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const Class = mongoose.model<IClass>('Class', classSchema);
