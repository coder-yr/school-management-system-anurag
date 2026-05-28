import { z } from 'zod';

export const hireEmployeeSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    employeeType: z.enum(['TEACHING', 'NON_TEACHING']),
    designation: z.string().min(1, 'Designation is required'),
    qualification: z.string().optional(),
    joiningDate: z.string().datetime(),
    basicSalary: z.coerce.number().min(0).optional(),
    subjects: z.array(z.string().min(24)).optional(),
    department: z.string().optional(),
    user: z.object({
      email: z.string().email(),
      password: z.string().min(6),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      role: z.enum(['TEACHER', 'ACCOUNTANT', 'DRIVER', 'SCHOOL_ADMIN']),
    })
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    designation: z.string().optional(),
    qualification: z.string().optional(),
    basicSalary: z.coerce.number().min(0).optional(),
    department: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const markAttendanceSchema = z.object({
  body: z.object({
    records: z.array(z.object({
      employeeId: z.string().min(24),
      status: z.enum(['PRESENT', 'ABSENT', 'ON_LEAVE', 'HALF_DAY']),
      checkInTime: z.string().datetime().optional(),
      checkOutTime: z.string().datetime().optional(),
      remarks: z.string().optional(),
    })),
    date: z.string().datetime(),
  }),
});

export const leaveRequestSchema = z.object({
  body: z.object({
    leaveType: z.enum(['SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'OTHER']),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    reason: z.string().min(5),
  }),
});

export const reviewLeaveRequestSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().optional(),
  }),
});

export const generateSalarySchema = z.object({
  body: z.object({
    employeeId: z.string().min(24),
    month: z.coerce.number().min(1).max(12),
    year: z.coerce.number().min(2000),
    allowances: z.coerce.number().min(0).optional(),
    deductions: z.coerce.number().min(0).optional(),
  }),
});

export const employeeListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
    employeeType: z.enum(['TEACHING', 'NON_TEACHING']).optional(),
    department: z.string().optional(),
  }),
});
