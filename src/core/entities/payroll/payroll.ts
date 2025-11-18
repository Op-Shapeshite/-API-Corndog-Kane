/**
 * Payroll Domain Types
 * Entity types for employee payroll management
 */

// ============================================================================
// BASE TYPES - Foundation for payroll domain
// ============================================================================

/**
 * TPayroll - Base type for payroll record (per work day)
 */
export type TPayroll = {
  id: number;
  employeeId: number;
  outletId: number;
  attendanceId?: number | null;
  baseSalary: number;
  totalBonus: number;
  totalDeduction: number;
  finalSalary: number;
  workDate: Date;
  paymentBatchId?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TPayrollCreate = Omit<TPayroll, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'paymentBatchId'>;

// ============================================================================
// API RESPONSE TYPES (snake_case for API contract)
// ============================================================================

/**
 * Response type for GET /finance/payroll - List all employee payrolls
 */
export type TPayrollListResponse = {
  employee_id: number;
  employee_name: string;
  period: string; // "6 Oct - 11 Oct 2025"
  total_base_salary: number;
  total_bonus: number;
  total_deduction: number;
  final_amount: number;
  status: string; // "PENDING" | "PAID"
};

/**
 * Response type for GET /finance/payroll/:employee_id - Detail for editing
 */
export type TPayrollDetailResponse = {
  employee_id: number;
  employee_name: string;
  period: string;
  start_period: string; // "2025-11-06"
  end_period: string; // "2025-11-11"
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

/**
 * Request type for PUT /finance/payroll/:employee_id - Update period & adjustments
 */
export type TPayrollUpdateRequest = {
  start_period: string; // "2025-11-06"
  end_period: string; // "2025-11-11"
  bonus?: number; // Manual bonus amount
  deductions?: {
    date: string; // "2025-11-08"
    amount: number;
    description: string;
  }[];
};

/**
 * Response type for GET /finance/payroll/pay/:employee_id - Payment slip
 */
export type TPayrollSlipResponse = {
  employee: {
    name: string;
    nik: string;
    position: string;
  };
  period: string;
  payment_batch_id: number | null;
  status: string; // "PAID" | "PREVIEW"
  paid_at: Date | null;
  total_base_salary: number;
  total_bonus: number;
  total_salary_and_bonus: number;
  total_deduction_loan: number;
  total_absent_deduction: number;
  total_late_deduction: number;
  total_deduction: number;
  total_amount: number;
  attendance_summary: {
    count_present: number;
    count_not_present: number;
    count_leave: number;
    count_excused: number;
    count_sick: number;
    count_late: number;
  };
  payroll_details?: {
    date: Date;
    base_salary: number;
    bonus: number;
    deduction: number;
  }[];
};
