/**
 * InternalPayroll Domain Types
 * Entity types for internal employee monthly payroll management
 */

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * TInternalPayroll - Monthly payroll record for internal employees
 */
export type TInternalPayroll = {
  id: number;
  employeeId: number;
  basePayrollId: number;
  baseSalary: number;
  totalBonus: number;
  totalDeduction: number;
  finalSalary: number;
  periodStart: Date;
  periodEnd: Date;
  paymentBatchId?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TInternalPayrollCreate = Omit<
  TInternalPayroll, 
  'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'paymentBatchId'
>;

// ============================================================================
// API RESPONSE TYPES (snake_case for API contract)
// ============================================================================

/**
 * Response type for internal payroll operations - mirrors TPayrollDetailResponse
 */
export type TInternalPayrollDetailResponse = {
  employee_id: number;
  employee_name: string;
  period: string;
  start_period: string;
  end_period: string;
  total_base_salary: number;
  total_bonus: number;
  manual_bonus: number;
  total_deduction: number;
  final_amount: number;
  bonuses: {
    id: number;
    type: string;
    date: Date;
    amount: number;
    description: string | null;
  }[];
  deductions: {
    id: number;
    type: string;
    date: Date;
    amount: number;
    description: string | null;
  }[];
};
