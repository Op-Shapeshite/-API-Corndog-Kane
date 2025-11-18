/**
 * Payroll Bonus Domain Types
 * Entity types for payroll bonus tracking
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum BonusType {
  TARGET_ACHIEVEMENT = 'TARGET_ACHIEVEMENT',
  MANUAL = 'MANUAL',
  PERFORMANCE = 'PERFORMANCE',
  ATTENDANCE = 'ATTENDANCE',
  OTHER = 'OTHER',
}

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * TPayrollBonus - Bonus detail for a payroll
 */
export type TPayrollBonus = {
  id: number;
  payrollId: number;
  type: BonusType;
  amount: number;
  description?: string | null;
  reference?: string | null; // JSON string for calculation metadata
  createdAt: Date;
  updatedAt: Date;
};

export type TPayrollBonusCreate = Omit<TPayrollBonus, 'id' | 'createdAt' | 'updatedAt'>;
