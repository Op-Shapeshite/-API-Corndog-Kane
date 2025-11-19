/**
 * Payroll Deduction Domain Types
 * Entity types for payroll deduction tracking
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum DeductionType {
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  LOAN = 'LOAN',
  INSURANCE = 'INSURANCE',
  TAX = 'TAX',
  OTHER = 'OTHER',
}

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * TPayrollDeduction - Deduction detail for a payroll
 */
export type TPayrollDeduction = {
  id: number;
  payrollId: number;
  type: DeductionType;
  amount: number;
  description?: string | null;
  reference?: string | null; // JSON string for calculation metadata
  createdAt: Date;
  updatedAt: Date;
};

export type TPayrollDeductionCreate = Omit<TPayrollDeduction, 'id' | 'createdAt' | 'updatedAt'>;
