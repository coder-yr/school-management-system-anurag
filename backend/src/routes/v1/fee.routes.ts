import { Router } from 'express';
import { FeeController } from '../../controllers/fee.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { requireParentChildAccess } from '../../middleware/resource-isolation.js';
import {
  createFeeStructureSchema,
  generateInvoicesSchema,
  applyConcessionSchema,
  createInstallmentPlanSchema,
  createScholarshipSchema,
  receiptSchema,
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
  recordManualPaymentSchema
} from '../../validations/fee.validation.js';

export const feeRouter = Router();

// Ensure all routes require authentication
feeRouter.use(authenticateToken);

// --- Fee Structures & Invoices (Admins / Accountants) ---
feeRouter.get(
  '/structures',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'),
  FeeController.getFeeStructures
);

feeRouter.post(
  '/structures',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'),
  validateRequest(createFeeStructureSchema),
  FeeController.createFeeStructure
);

feeRouter.post(
  '/generate',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'),
  validateRequest(generateInvoicesSchema),
  FeeController.generateInvoices
);

feeRouter.patch(
  '/:feeId/concession',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), // Only admins should give scholarships
  validateRequest(applyConcessionSchema),
  FeeController.applyConcession
);

// --- Global Fee Queries ---
feeRouter.get(
  '/',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'),
  FeeController.getAllFees
);

feeRouter.get(
  '/payments',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'),
  FeeController.getAllPayments
);

// --- Student Fee Queries ---
feeRouter.get(
  '/student/:studentId',
  requireParentChildAccess, // Ensures Parent can only view their own child's fees
  FeeController.getStudentFees
);

feeRouter.get(
  '/student/:studentId/payments',
  requireParentChildAccess,
  FeeController.getStudentPayments
);

feeRouter.get(
  '/overdue',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'),
  FeeController.getOverdueFees
);

feeRouter.post(
  '/:feeId/installments',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'),
  validateRequest(createInstallmentPlanSchema),
  FeeController.createInstallmentPlan
);

feeRouter.post(
  '/:feeId/scholarships',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'),
  validateRequest(createScholarshipSchema),
  FeeController.createScholarship
);

feeRouter.get(
  '/receipts/:paymentId',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT'),
  validateRequest(receiptSchema),
  FeeController.generateReceipt
);

// --- Payments (Razorpay Flow) ---
// Note: Parents and Students can initiate and verify payments
feeRouter.post(
  '/razorpay/order',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT', 'STUDENT'),
  validateRequest(createRazorpayOrderSchema),
  FeeController.createRazorpayOrder
);

feeRouter.post(
  '/razorpay/verify',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT', 'STUDENT'),
  validateRequest(verifyRazorpayPaymentSchema),
  FeeController.verifyRazorpayPayment
);

// --- Manual Payments (Accountants) ---
feeRouter.post(
  '/manual-payment',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'),
  validateRequest(recordManualPaymentSchema),
  FeeController.recordManualPayment
);
