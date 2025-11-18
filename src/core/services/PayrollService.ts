import PayrollRepository from "../../adapters/postgres/repositories/PayrollRepository";
import OutletRepository from "../../adapters/postgres/repositories/OutletRepository";
import { TPayroll } from "../entities/payroll/payroll";
import { TPaymentBatch, PaymentStatus } from "../entities/payroll/paymentBatch";
import { BonusType } from "../entities/payroll/payrollBonus";
import { DeductionType } from "../entities/payroll/payrollDeduction";
import { Service } from "./Service";

export default class PayrollService extends Service<TPayroll> {
  declare repository: PayrollRepository;
  private outletRepository: OutletRepository;

  constructor(
    repository: PayrollRepository,
    outletRepository: OutletRepository
  ) {
    super(repository);
    this.outletRepository = outletRepository;
  }

  // ============================================================================
  // CORE PAYROLL OPERATIONS
  // ============================================================================

  /**
   * Create payroll on employee checkout (called from AttendanceService)
   */
  async createPayrollOnCheckout(attendanceId: number): Promise<TPayroll> {
    // Get attendance data
    const attendance = await this.repository.getAttendanceById(attendanceId);
    if (!attendance) {
      throw new Error('Attendance not found');
    }

    // Get outlet with settings for base salary
    const outlet = await this.outletRepository.findById(attendance.outletId);
    if (!outlet || !outlet.settings || outlet.settings.length === 0) {
      throw new Error('Outlet settings not found');
    }

    const baseSalary = outlet.settings[0].salary;
    const workDate = new Date(attendance.checkinTime);
    workDate.setHours(0, 0, 0, 0);

    // Calculate late deduction (default to 0 if lateMinutes is undefined)
    const lateDeduction = (attendance.lateMinutes || 0) * 1000;

    // Calculate bonus from target achievement
    const ordersTotal = await this.repository.getEmployeeOrdersTotal(
      attendance.employeeId,
      attendance.outletId,
      workDate
    );

    const incomeTarget = outlet.incomeTarget || 0;
    const exceeded = Math.max(0, ordersTotal - incomeTarget);
    const targetBonus = Math.floor(exceeded / 100000) * 5000;

    // Create payroll
    const finalSalary = baseSalary + targetBonus - lateDeduction;
    const payroll = await this.repository.createPayroll({
      employeeId: attendance.employeeId,
      outletId: attendance.outletId,
      attendanceId: attendanceId,
      baseSalary: baseSalary,
      totalBonus: targetBonus,
      totalDeduction: lateDeduction,
      finalSalary: finalSalary,
      workDate: workDate,
    });

    // Create bonus record if target bonus exists
    if (targetBonus > 0) {
      await this.repository.createBonus({
        payrollId: payroll.id,
        type: BonusType.TARGET_ACHIEVEMENT,
        amount: targetBonus,
        description: `Target exceeded by ${exceeded.toLocaleString()}`,
        reference: JSON.stringify({ totalSales: ordersTotal, target: incomeTarget, exceeded }),
      });
    }

    // Create late deduction record if late
    if (lateDeduction > 0) {
      await this.repository.createDeduction({
        payrollId: payroll.id,
        type: DeductionType.LATE,
        amount: lateDeduction,
        description: `Late ${attendance.lateMinutes} minutes`,
        reference: JSON.stringify({ lateMinutes: attendance.lateMinutes, ratePerMinute: 1000 }),
      });
    }

    return payroll;
  }

  /**
   * GET /finance/payroll - Get all employee payroll summary
   */
  async getAllEmployeePayrolls(startDate?: string, endDate?: string) {
    // Default to current week if no dates provided
    const { start, end } = this.getDateRange(startDate, endDate);

    const summaries = await this.repository.getAllEmployeePayrollSummary(start, end);

    return summaries.map((s) => ({
      employee_id: s.employee_id,
      employee_name: s.employee_name,
      period: this.formatPeriod(s.period_start, s.period_end),
      total_base_salary: s.total_base_salary,
      total_bonus: s.total_bonus,
      total_deduction: s.total_deduction,
      final_amount: s.final_amount,
      status: s.status,
    }));
  }

  /**
   * GET /finance/payroll/:employee_id - Get payroll detail for editing
   */
  async getEmployeePayrollDetail(employeeId: number, startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    // Get unpaid payrolls
    const payrolls = await this.repository.getUnpaidPayrolls(employeeId, start, end);

    if (payrolls.length === 0) {
      throw new Error('No unpaid payrolls found for this period');
    }

    // Get employee info
    const employee = await this.repository.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Get all bonuses and deductions
    const payrollIds = payrolls.map((p) => p.id);
    const bonuses = await this.repository.getBonusesByPayrollIds(payrollIds);
    const deductions = await this.repository.getDeductionsByPayrollIds(payrollIds);

    // Calculate totals
    const totalBaseSalary = payrolls.reduce((sum, p) => sum + p.baseSalary, 0);
    const totalBonus = payrolls.reduce((sum, p) => sum + p.totalBonus, 0);
    const totalDeduction = payrolls.reduce((sum, p) => sum + p.totalDeduction, 0);
    const finalAmount = payrolls.reduce((sum, p) => sum + p.finalSalary, 0);

    // Get manual bonus (if any)
    const manualBonus = bonuses
      .filter((b) => b.type === BonusType.MANUAL)
      .reduce((sum, b) => sum + b.amount, 0);

    return {
      employee_id: employeeId,
      employee_name: employee.name,
      period: this.formatPeriod(payrolls[0].workDate, payrolls[payrolls.length - 1].workDate),
      start_period: this.formatDate(payrolls[0].workDate),
      end_period: this.formatDate(payrolls[payrolls.length - 1].workDate),
      total_base_salary: totalBaseSalary,
      total_bonus: totalBonus,
      manual_bonus: manualBonus,
      total_deduction: totalDeduction,
      final_amount: finalAmount,
      bonuses: bonuses.map((b) => ({
        id: b.id,
        type: b.type,
        date: payrolls.find((p) => p.id === b.payrollId)?.workDate || new Date(),
        amount: b.amount,
        description: b.description || null,
      })),
      deductions: deductions.map((d) => ({
        id: d.id,
        type: d.type,
        date: payrolls.find((p) => p.id === d.payrollId)?.workDate || new Date(),
        amount: d.amount,
        description: d.description || null,
      })),
    };
  }

  /**
   * PUT /finance/payroll/:employee_id - Update period and add manual adjustments
   */
  async updatePayrollPeriod(
    employeeId: number,
    startPeriod: string,
    endPeriod: string,
    manualBonus?: number,
    manualDeductions?: { date: string; amount: number; description: string }[]
  ) {
    const start = new Date(startPeriod);
    const end = new Date(endPeriod);
    end.setHours(23, 59, 59, 999);

    // Get payrolls in the new period
    const payrolls = await this.repository.getUnpaidPayrolls(employeeId, start, end);

    if (payrolls.length === 0) {
      throw new Error('No payrolls found for this period');
    }

    // Add manual bonus if provided
    if (manualBonus && manualBonus > 0) {
      const lastPayroll = payrolls[payrolls.length - 1];
      await this.repository.createBonus({
        payrollId: lastPayroll.id,
        type: BonusType.MANUAL,
        amount: manualBonus,
        description: 'Manual bonus',
        reference: null,
      });

      // Update payroll totals
      await this.repository.updatePayrollTotals(
        lastPayroll.id,
        lastPayroll.totalBonus + manualBonus,
        lastPayroll.totalDeduction,
        lastPayroll.finalSalary + manualBonus
      );
    }

    // Add manual deductions if provided
    if (manualDeductions && manualDeductions.length > 0) {
      for (const deduction of manualDeductions) {
        const deductionDate = new Date(deduction.date);
        // Find payroll for this date
        const payroll = payrolls.find((p) => {
          const pDate = new Date(p.workDate);
          return (
            pDate.getDate() === deductionDate.getDate() &&
            pDate.getMonth() === deductionDate.getMonth() &&
            pDate.getFullYear() === deductionDate.getFullYear()
          );
        });

        if (payroll) {
          await this.repository.createDeduction({
            payrollId: payroll.id,
            type: DeductionType.LOAN,
            amount: deduction.amount,
            description: deduction.description,
            reference: null,
          });

          // Update payroll totals
          await this.repository.updatePayrollTotals(
            payroll.id,
            payroll.totalBonus,
            payroll.totalDeduction + deduction.amount,
            payroll.finalSalary - deduction.amount
          );
        }
      }
    }

    // Return updated detail
    return this.getEmployeePayrollDetail(employeeId, startPeriod, endPeriod);
  }

  /**
   * POST /finance/payroll/:employee_id - Create payment batch (pay salary)
   */
  async createPayment(employeeId: number) {
    // Get current week unpaid payrolls
    const { start, end } = this.getDateRange();
    const payrolls = await this.repository.getUnpaidPayrolls(employeeId, start, end);

    if (payrolls.length === 0) {
      throw new Error('No unpaid payrolls found');
    }

    // Calculate totals
    const totalBaseSalary = payrolls.reduce((sum, p) => sum + p.baseSalary, 0);
    const totalBonus = payrolls.reduce((sum, p) => sum + p.totalBonus, 0);
    const totalDeduction = payrolls.reduce((sum, p) => sum + p.totalDeduction, 0);
    const finalAmount = payrolls.reduce((sum, p) => sum + p.finalSalary, 0);

    // Create payment batch
    const batch = await this.repository.createPaymentBatch({
      employeeId: employeeId,
      periodStart: payrolls[0].workDate,
      periodEnd: payrolls[payrolls.length - 1].workDate,
      totalBaseSalary: totalBaseSalary,
      totalBonus: totalBonus,
      totalDeduction: totalDeduction,
      finalAmount: finalAmount,
      status: PaymentStatus.PAID,
      paidAt: new Date(),
      paymentMethod: null,
      paymentReference: null,
      notes: null,
    });

    // Link payrolls to batch
    const payrollIds = payrolls.map((p) => p.id);
    await this.repository.linkPayrollsToBatch(payrollIds, batch.id);

    // Return payment slip
    return this.getPaymentSlip(employeeId);
  }

  /**
   * GET /finance/payroll/pay/:employee_id - Get payment slip
   */
  async getPaymentSlip(employeeId: number, startDate?: string, endDate?: string) {
    let payrolls: TPayroll[];
    let status = 'PREVIEW';
    let paymentBatchId: number | null = null;
    let paidAt: Date | null = null;

    const { start, end } = this.getDateRange(startDate, endDate);

    // Try to get unpaid payrolls first
    payrolls = await this.repository.getUnpaidPayrolls(employeeId, start, end);

    // If no unpaid, get latest payment batch
    if (payrolls.length === 0) {
      const latestBatch = await this.repository.getLatestPaymentBatch(employeeId);
      if (!latestBatch) {
        throw new Error('No payroll data found');
      }

      payrolls = await this.repository.getPayrollsByBatchId(latestBatch.id);
      status = latestBatch.status;
      paymentBatchId = latestBatch.id;
      paidAt = latestBatch.paidAt || null;
    }

    // Get employee info
    const employee = await this.repository.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Get bonuses and deductions
    const payrollIds = payrolls.map((p) => p.id);
    const bonuses = await this.repository.getBonusesByPayrollIds(payrollIds);
    const deductions = await this.repository.getDeductionsByPayrollIds(payrollIds);

    // Calculate totals
    const totalBaseSalary = payrolls.reduce((sum, p) => sum + p.baseSalary, 0);
    const totalBonus = payrolls.reduce((sum, p) => sum + p.totalBonus, 0);
    const totalDeductionLoan = deductions
      .filter((d) => d.type === DeductionType.LOAN)
      .reduce((sum, d) => sum + d.amount, 0);
    const totalAbsentDeduction = deductions
      .filter((d) => d.type === DeductionType.ABSENT)
      .reduce((sum, d) => sum + d.amount, 0);
    const totalLateDeduction = deductions
      .filter((d) => d.type === DeductionType.LATE)
      .reduce((sum, d) => sum + d.amount, 0);
    const totalDeduction = payrolls.reduce((sum, p) => sum + p.totalDeduction, 0);

    // Get attendance summary
    const attendanceSummary = await this.repository.getAttendanceSummary(
      employeeId,
      payrolls[0].workDate,
      payrolls[payrolls.length - 1].workDate
    );

    return {
      employee: {
        name: employee.name,
        nik: employee.nik,
        position: employee.position,
      },
      period: this.formatPeriod(payrolls[0].workDate, payrolls[payrolls.length - 1].workDate),
      payment_batch_id: paymentBatchId,
      status: status,
      paid_at: paidAt,
      total_base_salary: totalBaseSalary,
      total_bonus: totalBonus,
      total_salary_and_bonus: totalBaseSalary + totalBonus,
      total_deduction_loan: totalDeductionLoan,
      total_absent_deduction: totalAbsentDeduction,
      total_late_deduction: totalLateDeduction,
      total_deduction: totalDeduction,
      total_amount: totalBaseSalary + totalBonus - totalDeduction,
      attendance_summary: attendanceSummary,
      payroll_details: payrolls.map((p) => ({
        date: p.workDate,
        base_salary: p.baseSalary,
        bonus: p.totalBonus,
        deduction: p.totalDeduction,
      })),
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getDateRange(startDate?: string, endDate?: string): { start: Date; end: Date } {
    if (startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    // Default to current week (Monday to Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
  }

  private formatPeriod(start: Date, end: Date): string {
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleString('en', { month: 'short' });
    const endMonth = end.toLocaleString('en', { month: 'short' });
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
