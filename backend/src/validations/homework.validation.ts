import { z } from 'zod';

export const createHomeworkSchema = z.object({
  body: z.object({
    classId: z.string().min(24).optional(),
    className: z.string().optional(),
    sectionId: z.string().min(24).optional(),
    sectionName: z.string().optional(),
    subjectId: z.string().min(24).optional(),
    subjectName: z.string().optional(),
    title: z.string().min(3),
    description: z.string().min(3),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
    attachments: z.array(z.string()).optional(),
  })
});

export const submitHomeworkSchema = z.object({
  body: z.object({
    remarks: z.string().optional(),
  }).optional(),
});

export const uploadStudyMaterialSchema = z.object({
  body: z.object({
    classId: z.string().min(24).optional(),
    className: z.string().optional(),
    subjectId: z.string().min(24).optional(),
    subjectName: z.string().optional(),
    title: z.string().min(3),
    description: z.string().optional(),
    category: z.enum(['NOTES', 'SYLLABUS', 'REFERENCE', 'VIDEO']).optional(),
  })
});
