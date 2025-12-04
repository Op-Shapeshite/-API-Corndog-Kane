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

  async createPayrollOnCheckout(attendanceId: number): Promise<TPayroll> {
    const attendance = await this.repository.getAttendanceById(attendanceId);
    if (!attendance) {
      throw new Error('Attendance not found');
    }

    const outlet = await this.outletRepository.findById(attendance.outletId);
    if (!outlet || !outlet.settings || outlet.settings.length === 0) {
      throw new Error('Outlet settings not found');
    }

    const baseSalary = outlet.settings[0].salary;
    const workDate = new Date(attendance.checkinTime);
    workDate.setHours(0, 0, 0, 0);

    const lateDeduction = (attendance.lateMinutes || 0) * 1000;

    const ordersTotal = await this.repository.getEmployeeOrdersTotal(
      attendance.employeeId,
      attendance.outletId,
      workDate
    );

    const incomeTarget = outlet.incomeTarget || 0;
    const exceeded = Math.max(0, ordersTotal - incomeTarget);
    const targetBonus = Math.floor(exceeded / 100000) * 5000;

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

    if (targetBonus > 0) {
      await this.repository.createBonus({
        payrollId: payroll.id,
        type: BonusType.TARGET_ACHIEVEMENT,
        amount: targetBonus,
        description: `Target exceeded by ${exceeded.toLocaleString()}`,
        reference: JSON.stringify({ totalSales: ordersTotal, target: incomeTarget, exceeded }),
      });
    }

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

  async getAllEmployeePayrolls(startDate?: string, endDate?: string) {
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
      source: s.source,
    }));
  }

  async getEmployeePayrollDetail(employeeId: number, startDate?: string, endDate?: string) {
    const wasDateProvided = !!(startDate && endDate);

    const employee = await this.repository.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const employeeType = await this.repository.getEmployeeType(employeeId);
    
    let { start, end } = wasDateProvided 
      ? this.getDateRange(startDate, endDate)
      : employeeType === 'internal' 
        ? this.getCurrentMonthRange()
        : this.getDateRange(startDate, endDate);
    
    if (employeeType === 'outlet' ) {
      return await this.getOutletEmployeePayrollDetail(employeeId, employee, start, end, wasDateProvided);
    } else {
      return await this.getInternalEmployeePayrollDetail(employeeId, employee, start, end, wasDateProvided);
    }
  }

  private async getOutletEmployeePayrollDetail(employeeId: number, employee: any, start: Date, end: Date, wasDateProvided: boolean) {
    let payrolls = await this.repository.getUnpaidPayrolls(employeeId, start, end);

    if (payrolls.length === 0 && !wasDateProvided) {
      const latestPeriod = await this.repository.getLatestPayrollPeriod(employeeId);
      
      if (latestPeriod) {
        start = latestPeriod.start;
        end = latestPeriod.end;
        payrolls = await this.repository.getUnpaidPayrolls(employeeId, start, end);
      }
    }

    if (payrolls.length === 0) {
      throw new Error('No unpaid payrolls found for this period');
    }

    const payrollIds = payrolls.map((p) => p.id);
    const bonuses = await this.repository.getBonusesByPayrollIds(payrollIds);
    const deductions = await this.repository.getDeductionsByPayrollIds(payrollIds);

    const totalBaseSalary = payrolls.reduce((sum, p) => sum + p.baseSalary, 0);
    const totalBonus = payrolls.reduce((sum, p) => sum + p.totalBonus, 0);
    const totalDeduction = payrolls.reduce((sum, p) => sum + p.totalDeduction, 0);
    const finalAmount = payrolls.reduce((sum, p) => sum + p.finalSalary, 0);

    const manualBonus = bonuses
      .filter((b) => b.type === BonusType.MANUAL)
      .reduce((sum, b) => sum + b.amount, 0);

    return {
      employee_id: employeeId,
      employee_name: employee.name,
      employee_type: 'outlet',
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

  private async getInternalEmployeePayrollDetail(employeeId: number, employee: any, start: Date, end: Date, wasDateProvided: boolean) {
    let internalPayrolls = await this.repository.getUnpaidInternalPayrolls(employeeId, start, end);

    if (internalPayrolls.length === 0 && !wasDateProvided) {
      const latestPeriod = await this.repository.getLatestPayrollPeriod(employeeId);
      
      if (latestPeriod) {
        start = latestPeriod.start;
        end = latestPeriod.end;
        internalPayrolls = await this.repository.getUnpaidInternalPayrolls(employeeId, start, end);
      }
    }

    if (internalPayrolls.length === 0) {
      throw new Error('No unpaid payrolls found for this period');
    }

    const internalPayroll = internalPayrolls[0];

    const bonuses = await this.repository.getBonusesByInternalPayrollIds([internalPayroll.id]);
    const deductions = await this.repository.getDeductionsByInternalPayrollIds([internalPayroll.id]);

    const manualBonus = bonuses
      .filter((b) => b.type === BonusType.MANUAL)
      .reduce((sum, b) => sum + b.amount, 0);

    return {
      employee_id: employeeId,
      employee_name: employee.name,
      employee_type: 'internal',
      period: this.formatPeriod(internalPayroll.period_start, internalPayroll.period_end),
      start_period: this.formatDate(internalPayroll.period_start),
      end_period: this.formatDate(internalPayroll.period_end),
      total_base_salary: internalPayroll.base_salary,
      total_bonus: internalPayroll.total_bonus,
      manual_bonus: manualBonus,
      total_deduction: internalPayroll.total_deduction,
      final_amount: internalPayroll.final_salary,
      bonuses: bonuses.map((b) => ({
        id: b.id,
        type: b.type,
        date: internalPayroll.period_start,
        amount: b.amount,
        description: b.description || null,
      })),
      deductions: deductions.map((d) => ({
        id: d.id,
        type: d.type,
        date: internalPayroll.period_start,
        amount: d.amount,
        description: d.description || null,
      })),
    };
  }

  async updatePayrollPeriod(
    employeeId: number,
    startPeriod?: string,
    endPeriod?: string,
    manualBonus?: number,
    manualDeductions?: { date: string; amount: number; description: string }[]
  ) {
    const employee = await this.repository.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const employeeType = await this.repository.getEmployeeType(employeeId);
    
    let start: Date;
    let end: Date;
    
    // If periods are not provided, use latest period or current period
    if (!startPeriod || !endPeriod) {
      const latestPeriod = await this.repository.getLatestPayrollPeriod(employeeId);
      
      if (latestPeriod) {
        start = latestPeriod.start;
        end = latestPeriod.end;
      } else {
        // Fallback to default period based on employee type
        const defaultPeriod = employeeType === 'internal' 
          ? this.getCurrentMonthRange()
          : this.getDateRange();
        start = defaultPeriod.start;
        end = defaultPeriod.end;
      }
    } else {
      start = new Date(startPeriod);
      end = new Date(endPeriod);
      end.setHours(23, 59, 59, 999);
    }
    
    if (employeeType === 'outlet') {
      return await this.updateOutletPayrollPeriod(employeeId, start, end, this.formatDate(start), this.formatDate(end), manualBonus, manualDeductions);
    } else {
      return await this.updateInternalPayrollPeriod(employeeId, start, end, this.formatDate(start), this.formatDate(end), manualBonus, manualDeductions);
    }
  }

  private async updateOutletPayrollPeriod(
    employeeId: number,
    start: Date,
    end: Date,
    startPeriod: string,
    endPeriod: string,
    manualBonus?: number,
    manualDeductions?: { date: string; amount: number; description: string }[]
  ) {

    let payrolls = await this.repository.getUnpaidPayrolls(employeeId, start, end);

    // If no payrolls found for the specified period, try to get the latest period
    if (payrolls.length === 0) {
      const latestPeriod = await this.repository.getLatestPayrollPeriod(employeeId);
      
      if (latestPeriod) {
        // Update the period to latest period and try again
        start = latestPeriod.start;
        end = latestPeriod.end;
        payrolls = await this.repository.getUnpaidPayrolls(employeeId, start, end);
      }

      if (payrolls.length === 0) {
        throw new Error(`No unpaid payrolls found for employee. Latest available period: ${latestPeriod ? this.formatPeriod(latestPeriod.start, latestPeriod.end) : 'None'}. Please ensure the employee has worked during the available periods.`);
      }
    }

    if (manualBonus && manualBonus > 0) {
      const lastPayroll = payrolls[payrolls.length - 1];
      await this.repository.createBonus({
        payrollId: lastPayroll.id,
        type: BonusType.MANUAL,
        amount: manualBonus,
        description: 'Manual bonus',
        reference: null,
      });

      await this.repository.updatePayrollTotals(
        lastPayroll.id,
        lastPayroll.totalBonus + manualBonus,
        lastPayroll.totalDeduction,
        lastPayroll.finalSalary + manualBonus
      );
    }

    if (manualDeductions && manualDeductions.length > 0) {
      for (const deduction of manualDeductions) {
        const deductionDate = new Date(deduction.date);

        // Match payroll by formatted date (YYYY-MM-DD) to avoid timezone/date-part issues
        const payroll = payrolls.find((p) => this.formatDate(new Date(p.workDate)) === this.formatDate(deductionDate));

        if (payroll) {
          await this.repository.createDeduction({
            payrollId: payroll.id,
            type: DeductionType.LOAN,
            amount: deduction.amount,
            description: deduction.description,
            reference: null,
          });

          await this.repository.updatePayrollTotals(
            payroll.id,
            payroll.totalBonus,
            payroll.totalDeduction + deduction.amount,
            payroll.finalSalary - deduction.amount
          );
        }
        else {
          // Helpful debug log when a deduction does not match any payroll date
          console.warn(`[PayrollService] No matching payroll found for deduction date ${deduction.date} (employee ${employeeId}). Available payroll dates: ${payrolls.map(p => this.formatDate(new Date(p.workDate))).join(', ')}`);
        }
      }
    }

    return this.getEmployeePayrollDetail(employeeId, this.formatDate(start), this.formatDate(end));
  }

  private async updateInternalPayrollPeriod(
    employeeId: number,
    start: Date,
    end: Date,
    startPeriod: string,
    endPeriod: string,
    manualBonus?: number,
    manualDeductions?: { date: string; amount: number; description: string }[]
  ) {

    let internalPayrolls = await this.repository.getUnpaidInternalPayrolls(employeeId, start, end);

    // If no payrolls found for the specified period, try to get the latest period
    if (internalPayrolls.length === 0) {
      const latestPeriod = await this.repository.getLatestPayrollPeriod(employeeId);
      
      if (latestPeriod) {
        // Update the period to latest period and try again
        start = latestPeriod.start;
        end = latestPeriod.end;
        internalPayrolls = await this.repository.getUnpaidInternalPayrolls(employeeId, start, end);
      }

      // If still no payrolls found, create one for internal employees
      if (internalPayrolls.length === 0) {
        const basePayroll = await this.repository.getBasePayrollByEmployeeId(employeeId);
        
        if (!basePayroll) {
          throw new Error(`No base payroll found for this internal employee. Latest available period: ${latestPeriod ? this.formatPeriod(latestPeriod.start, latestPeriod.end) : 'None'}. Please set up base payroll first.`);
        }

        const newInternalPayroll = await this.repository.createInternalPayroll({
          employeeId,
          basePayrollId: basePayroll.id,
          baseSalary: basePayroll.base_salary,
          totalBonus: 0,
          totalDeduction: 0,
          finalSalary: basePayroll.base_salary,
          periodStart: start,
          periodEnd: end,
        });

        internalPayrolls = [newInternalPayroll];
      }
    }

    const internalPayroll = internalPayrolls[0];

    if (manualBonus && manualBonus > 0) {
      await this.repository.createInternalBonus({
        payrollId: internalPayroll.id,
        type: BonusType.MANUAL,
        amount: manualBonus,
        description: 'Manual bonus',
        reference: null,
      });

      await this.repository.updateInternalPayrollTotals(
        internalPayroll.id,
        internalPayroll.total_bonus + manualBonus,
        internalPayroll.total_deduction,
        internalPayroll.final_salary + manualBonus
      );
    }

    if (manualDeductions && manualDeductions.length > 0) {
      for (const deduction of manualDeductions) {
        await this.repository.createInternalDeduction({
          payrollId: internalPayroll.id,
          type: DeductionType.LOAN,
          amount: deduction.amount,
          description: deduction.description,
          reference: null,
        });
      }

      const totalNewDeductions = manualDeductions.reduce((sum, d) => sum + d.amount, 0);

      await this.repository.updateInternalPayrollTotals(
        internalPayroll.id,
        internalPayroll.total_bonus,
        internalPayroll.total_deduction + totalNewDeductions,
        internalPayroll.final_salary - totalNewDeductions
      );
    }

    return this.getEmployeePayrollDetail(employeeId, this.formatDate(start), this.formatDate(end));
  }
  async createPayment(employeeId: number) {

    const employee = await this.repository.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const employeeType = await this.repository.getEmployeeType(employeeId);
    
    if (employeeType === 'outlet') {
      return await this.createOutletPayment(employeeId, employee);
    } else {
      return await this.createInternalPayment(employeeId, employee);
    }
  }

  private async createOutletPayment(employeeId: number, employee: any) {

    let { start, end } = this.getDateRange();
    let payrolls = await this.repository.getUnpaidPayrolls(employeeId, start, end);

    if (payrolls.length === 0) {
      const latestPeriod = await this.repository.getLatestPayrollPeriod(employeeId);
      
      if (latestPeriod) {

        start = latestPeriod.start;
        end = latestPeriod.end;
        payrolls = await this.repository.getUnpaidPayrolls(employeeId, start, end);
      }
    }

    if (payrolls.length === 0) {
      throw new Error('No unpaid payrolls found');
    }

    const totalBaseSalary = payrolls.reduce((sum, p) => sum + p.baseSalary, 0);
    const totalBonus = payrolls.reduce((sum, p) => sum + p.totalBonus, 0);
    const totalDeduction = payrolls.reduce((sum, p) => sum + p.totalDeduction, 0);
    const finalAmount = payrolls.reduce((sum, p) => sum + p.finalSalary, 0);

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
    console.log(`🔗 Linking ${payrollIds.length} payrolls (IDs: ${payrollIds.join(', ')}) to batch ${batch.id}`);
    await this.repository.linkPayrollsToBatch(payrollIds, batch.id);

    return this.getPaymentSlip(employeeId);
  }

  private async createInternalPayment(employeeId: number, employee: any) {

    let { start, end } = this.getCurrentMonthRange();
    let internalPayrolls = await this.repository.getUnpaidInternalPayrolls(employeeId, start, end);

    if (internalPayrolls.length === 0) {
      const latestPeriod = await this.repository.getLatestPayrollPeriod(employeeId);
      
      if (latestPeriod) {

        start = latestPeriod.start;
        end = latestPeriod.end;
        internalPayrolls = await this.repository.getUnpaidInternalPayrolls(employeeId, start, end);
      }
    }

    if (internalPayrolls.length === 0) {
      throw new Error('No unpaid payrolls found');
    }

    const internalPayroll = internalPayrolls[0];

    const batch = await this.repository.createPaymentBatch({
      employeeId: employeeId,
      periodStart: internalPayroll.period_start,
      periodEnd: internalPayroll.period_end,
      totalBaseSalary: internalPayroll.base_salary,
      totalBonus: internalPayroll.total_bonus,
      totalDeduction: internalPayroll.total_deduction,
      finalAmount: internalPayroll.final_salary,
      status: PaymentStatus.PAID,
      paidAt: new Date(),
      paymentMethod: null,
      paymentReference: null,
      notes: `Internal payroll payment - ID: ${internalPayroll.id}`,
    });

    // Link internal payroll to batch - THIS WAS MISSING!
    await this.repository.linkInternalPayrollsToBatch([internalPayroll.id], batch.id);

    return this.getPaymentSlip(employeeId);
  }
  async getPaymentSlip(employeeId: number, startDate?: string, endDate?: string) {
    const wasDateProvided = !!(startDate && endDate);

    const employee = await this.repository.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const employeeType = await this.repository.getEmployeeType(employeeId);

    let { start, end } = wasDateProvided 
      ? this.getDateRange(startDate, endDate)
      : employeeType === 'internal' 
        ? this.getCurrentMonthRange()
        : this.getDateRange(startDate, endDate);
    
    if (employeeType === 'outlet') {
      return await this.getOutletPaymentSlip(employeeId, employee, start, end, wasDateProvided);
    } else {
      return await this.getInternalPaymentSlip(employeeId, employee, start, end, wasDateProvided);
    }
  }

  private async getOutletPaymentSlip(employeeId: number, employee: any, start: Date, end: Date, wasDateProvided: boolean) {
    let payrolls: TPayroll[];
    let status = 'PREVIEW';
    let paymentBatchId: number | null = null;
    let paidAt: Date | null = null;

    // Try to get unpaid payrolls first
    payrolls = await this.repository.getUnpaidPayrolls(employeeId, start, end);

    if (payrolls.length === 0 && !wasDateProvided) {
      const latestPeriod = await this.repository.getLatestPayrollPeriod(employeeId);
      
      if (latestPeriod) {

        start = latestPeriod.start;
        end = latestPeriod.end;
        payrolls = await this.repository.getUnpaidPayrolls(employeeId, start, end);
      }
    }

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

    const payrollIds = payrolls.map((p) => p.id);
    const bonuses = await this.repository.getBonusesByPayrollIds(payrollIds);
    const deductions = await this.repository.getDeductionsByPayrollIds(payrollIds);

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
      employee_type: 'outlet',
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

  private async getInternalPaymentSlip(employeeId: number, employee: any, start: Date, end: Date, wasDateProvided: boolean) {
    let internalPayrolls: any[];
    let status = 'PREVIEW';
    let paymentBatchId: number | null = null;
    let paidAt: Date | null = null;

    // Try to get unpaid internal payrolls first
    internalPayrolls = await this.repository.getUnpaidInternalPayrolls(employeeId, start, end);

    if (internalPayrolls.length === 0 && !wasDateProvided) {
      const latestPeriod = await this.repository.getLatestPayrollPeriod(employeeId);
      
      if (latestPeriod) {

        start = latestPeriod.start;
        end = latestPeriod.end;
        internalPayrolls = await this.repository.getUnpaidInternalPayrolls(employeeId, start, end);
      }
    }

    if (internalPayrolls.length === 0) {
      const latestBatch = await this.repository.getLatestPaymentBatch(employeeId);
      if (!latestBatch) {
        throw new Error('No payroll data found');
      }

      internalPayrolls = await this.repository.getInternalPayrollsByBatchId(latestBatch.id);
      status = latestBatch.status;
      paymentBatchId = latestBatch.id;
      paidAt = latestBatch.paidAt || null;
    }

    if (internalPayrolls.length === 0) {
      throw new Error('No payroll data found');
    }

    const internalPayroll = internalPayrolls[0];

    const bonuses = await this.repository.getBonusesByInternalPayrollIds([internalPayroll.id]);
    const deductions = await this.repository.getDeductionsByInternalPayrollIds([internalPayroll.id]);

    const totalBaseSalary = internalPayroll.base_salary;
    const totalBonus = internalPayroll.total_bonus;
    const totalDeductionLoan = deductions
      .filter((d) => d.type === DeductionType.LOAN)
      .reduce((sum, d) => sum + d.amount, 0);
    const totalAbsentDeduction = deductions
      .filter((d) => d.type === DeductionType.ABSENT)
      .reduce((sum, d) => sum + d.amount, 0);
    const totalLateDeduction = deductions
      .filter((d) => d.type === DeductionType.LATE)
      .reduce((sum, d) => sum + d.amount, 0);
    const totalDeduction = internalPayroll.total_deduction;

    const attendanceSummary = {
      count_present: 0,
      count_not_present: 0,
      count_leave: 0,
      count_excused: 0,
      count_sick: 0,
      count_late: 0
    };

    return {
      employee: {
        name: employee.name,
        nik: employee.nik,
        position: employee.position,
      },
      employee_type: 'internal',
      period: this.formatPeriod(internalPayroll.period_start, internalPayroll.period_end),
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
      payroll_details: [{
        date: internalPayroll.period_start,
        base_salary: totalBaseSalary,
        bonus: totalBonus,
        deduction: totalDeduction,
      }],
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

  // ==========================================================================
  // INTERNAL PAYROLL METHODS
  // ==========================================================================

  async createInternalPayrollTemplate(employeeId: number, salary: number) {
    const employeeType = await this.repository.getEmployeeType(employeeId);
    if (employeeType === 'outlet') {
      throw new Error('Karyawan ini sudah di-assign ke outlet, gunakan sistem payroll outlet');
    }

    const employee = await this.repository.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const basePayroll = await this.repository.createOrUpdateBasePayroll(employeeId, salary);
    const { start, end } = this.getCurrentMonthRange();
    const existingPayrolls = await this.repository.getUnpaidInternalPayrolls(employeeId, start, end);
    
    let internalPayroll;
    if (existingPayrolls.length === 0) {
      internalPayroll = await this.repository.createInternalPayroll({
        employeeId,
        basePayrollId: basePayroll.id,
        baseSalary: salary,
        totalBonus: 0,
        totalDeduction: 0,
        finalSalary: salary,
        periodStart: start,
        periodEnd: end,
      });
    } else {
      internalPayroll = existingPayrolls[0];
    }

    return {
      id: basePayroll.id,
      employee_id: employeeId,
      employee_name: employee.name,
      base_salary: salary,
      is_active: basePayroll.is_active,
      created_at: basePayroll.createdAt,
      updated_at: basePayroll.updatedAt,
    };
  }

  private getCurrentMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  /**
   * Get latest payroll period for an employee
   * Used for defaulting to latest period when period not specified in update
   */
  async getLatestPayrollPeriodForEmployee(employeeId: number): Promise<{ start: Date; end: Date } | null> {
    try {
      return await this.repository.getLatestPayrollPeriod(employeeId);
    } catch (error) {
      console.error('Error getting latest payroll period:', error);
      return null;
    }
  }
}
