/**
 * Payment Batch Domain Types
 * Entity types for grouped payroll payments
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * TPaymentBatch - Grouping of payrolls for payment
 */
export type TPaymentBatch = {
  id: number;
  employeeId: number;
  periodStart: Date;
  periodEnd: Date;
  totalBaseSalary: number;
  totalBonus: number;
  totalDeduction: number;
  finalAmount: number;
  status: PaymentStatus;
  paidAt?: Date | null;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TPaymentBatchCreate = Omit<TPaymentBatch, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request type for POST /finance/payroll/:employee_id - No request body needed
 */
export type TPaymentBatchCreateRequest = void;
