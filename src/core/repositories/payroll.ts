import { TPayroll, TPayrollCreate } from "../entities/payroll/payroll";
import { TPaymentBatch, TPaymentBatchCreate } from "../entities/payroll/paymentBatch";
import { TPayrollBonus, TPayrollBonusCreate } from "../entities/payroll/payrollBonus";
import { TPayrollDeduction, TPayrollDeductionCreate } from "../entities/payroll/payrollDeduction";
import { TAttendanceWithID } from "../entities/employee/attendance";
import { TEmployee } from "../entities/employee/employee";
import Repository from "./Repository";

/**
 * Payroll Repository Interface
 * Handles payroll data access operations
 */
export interface PayrollRepository extends Repository<TPayroll> {
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  /**
   * Get attendance by ID (needed for payroll creation on checkout)
   */
  getAttendanceById(attendanceId: number): Promise<TAttendanceWithID | null>;
  
  /**
   * Get employee by ID (needed for payroll operations)
   */
  getEmployeeById(employeeId: number): Promise<TEmployee | null>;
  
  // ============================================================================
  // PAYROLL OPERATIONS
  // ============================================================================
  
  /**
   * Create a new payroll record (triggered on employee checkout)
   */
  createPayroll(data: TPayrollCreate): Promise<TPayroll>;
  
  /**
   * Get unpaid payrolls for an employee within date range
   */
  getUnpaidPayrolls(
    employeeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<TPayroll[]>;
  
  /**
   * Get payrolls by payment batch ID
   */
  getPayrollsByBatchId(batchId: number): Promise<TPayroll[]>;
  
  /**
   * Update payroll totals (after bonus/deduction changes)
   */
  updatePayrollTotals(
    payrollId: number,
    totalBonus: number,
    totalDeduction: number,
    finalSalary: number
  ): Promise<TPayroll>;
  
  /**
   * Link payrolls to a payment batch
   */
  linkPayrollsToBatch(payrollIds: number[], batchId: number): Promise<void>;
  
  // ============================================================================
  // BONUS OPERATIONS
  // ============================================================================
  
  /**
   * Create a bonus record
   */
  createBonus(data: TPayrollBonusCreate): Promise<TPayrollBonus>;
  
  /**
   * Get bonuses for a payroll
   */
  getBonusesByPayrollId(payrollId: number): Promise<TPayrollBonus[]>;
  
  /**
   * Get bonuses for multiple payrolls
   */
  getBonusesByPayrollIds(payrollIds: number[]): Promise<TPayrollBonus[]>;
  
  // ============================================================================
  // DEDUCTION OPERATIONS
  // ============================================================================
  
  /**
   * Create a deduction record
   */
  createDeduction(data: TPayrollDeductionCreate): Promise<TPayrollDeduction>;
  
  /**
   * Get deductions for a payroll
   */
  getDeductionsByPayrollId(payrollId: number): Promise<TPayrollDeduction[]>;
  
  /**
   * Get deductions for multiple payrolls
   */
  getDeductionsByPayrollIds(payrollIds: number[]): Promise<TPayrollDeduction[]>;
  
  // ============================================================================
  // PAYMENT BATCH OPERATIONS
  // ============================================================================
  
  /**
   * Create a payment batch
   */
  createPaymentBatch(data: TPaymentBatchCreate): Promise<TPaymentBatch>;
  
  /**
   * Get payment batch by ID
   */
  getPaymentBatchById(batchId: number): Promise<TPaymentBatch | null>;
  
  /**
   * Get latest payment batch for an employee
   */
  getLatestPaymentBatch(employeeId: number): Promise<TPaymentBatch | null>;
  
  /**
   * Get all payment batches for an employee
   */
  getPaymentBatchesByEmployeeId(employeeId: number): Promise<TPaymentBatch[]>;
  
  // ============================================================================
  // AGGREGATION & REPORTING
  // ============================================================================
  
  /**
   * Get aggregated payroll summary for all employees within date range
   */
  getAllEmployeePayrollSummary(
    startDate: Date,
    endDate: Date
  ): Promise<{
    employee_id: number;
    employee_name: string;
    period_start: Date;
    period_end: Date;
    total_base_salary: number;
    total_bonus: number;
    total_deduction: number;
    final_amount: number;
    status: string;
  }[]>;
  
  /**
   * Get attendance summary for employee within date range
   */
  getAttendanceSummary(
    employeeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<{
    count_present: number;
    count_not_present: number;
    count_leave: number;
    count_excused: number;
    count_sick: number;
    count_late: number;
  }>;
  
  /**
   * Get total orders amount for employee on specific date
   */
  getEmployeeOrdersTotal(
    employeeId: number,
    outletId: number,
    date: Date
  ): Promise<number>;
}
