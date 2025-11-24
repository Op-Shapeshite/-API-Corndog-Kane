/**
 * BasePayroll Domain Types
 * Entity types for internal employee payroll template management
 */

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * TBasePayroll - Template for internal employee base salary
 */
export type TBasePayroll = {
  id: number;
  employeeId: number;
  baseSalary: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TBasePayrollCreate = Omit<TBasePayroll, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>;

// ============================================================================
// API RESPONSE TYPES (snake_case for API contract)
// ============================================================================

/**
 * Response type for POST /finance/payroll - Create internal payroll template
 */
export type TBasePayrollResponse = {
  id: number;
  employee_id: number;
  employee_name: string;
  base_salary: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};
