import { TPayroll, TPayrollCreate } from "../../../core/entities/payroll/payroll";
import { TPaymentBatch, TPaymentBatchCreate, PaymentStatus } from "../../../core/entities/payroll/paymentBatch";
import { TPayrollBonus, TPayrollBonusCreate, BonusType } from "../../../core/entities/payroll/payrollBonus";
import { TPayrollDeduction, TPayrollDeductionCreate, DeductionType } from "../../../core/entities/payroll/payrollDeduction";
import { TAttendanceWithID } from "../../../core/entities/employee/attendance";
import { TEmployee } from "../../../core/entities/employee/employee";
import { PayrollRepository as IPayrollRepository } from "../../../core/repositories/payroll";
import Repository from "./Repository";
import { EntityMapper } from "../../../mappers/EntityMapper";
import { 
  PayrollMapperEntity, 
  PaymentBatchMapperEntity,
  PayrollBonusMapperEntity,
  PayrollDeductionMapperEntity 
} from "../../../mappers/mappers/PayrollMapperEntity";
import { AttendanceMapperEntity } from "../../../mappers/mappers/AttendanceMapperEntity";
import { EmployeeMapperEntity } from "../../../mappers/mappers/EmployeeMapperEntity";

export default class PayrollRepository
  extends Repository<TPayroll>
  implements IPayrollRepository
{
  private paymentBatchMapper: EntityMapper<TPaymentBatch>;
  private bonusMapper: EntityMapper<TPayrollBonus>;
  private deductionMapper: EntityMapper<TPayrollDeduction>;
  private attendanceMapper: EntityMapper<TAttendanceWithID>;
  private employeeMapper: EntityMapper<TEmployee>;

  constructor() {
    super("payroll");
    this.paymentBatchMapper = new EntityMapper<TPaymentBatch>(PaymentBatchMapperEntity);
    this.bonusMapper = new EntityMapper<TPayrollBonus>(PayrollBonusMapperEntity);
    this.deductionMapper = new EntityMapper<TPayrollDeduction>(PayrollDeductionMapperEntity);
    this.attendanceMapper = new EntityMapper<TAttendanceWithID>(AttendanceMapperEntity);
    this.employeeMapper = new EntityMapper<TEmployee>(EmployeeMapperEntity);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  async getAttendanceById(attendanceId: number): Promise<TAttendanceWithID | null> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });
    
    if (!attendance) return null;
    return this.attendanceMapper.mapToEntity(attendance) as TAttendanceWithID;
  }

  async getEmployeeById(employeeId: number): Promise<TEmployee | null> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    
    if (!employee) return null;
    return this.employeeMapper.mapToEntity(employee) as TEmployee;
  }

  // ============================================================================
  // PAYROLL OPERATIONS
  // ============================================================================

  async createPayroll(data: TPayrollCreate): Promise<TPayroll> {
    const payroll = await this.prisma.payroll.create({
      data: {
        employee_id: data.employeeId,
        outlet_id: data.outletId,
        attendance_id: data.attendanceId || null,
        base_salary: data.baseSalary,
        total_bonus: data.totalBonus,
        total_deduction: data.totalDeduction,
        final_salary: data.finalSalary,
        work_date: data.workDate,
      },
    });

    return this.mapper.mapToEntity(payroll) as TPayroll;
  }

  async getUnpaidPayrolls(
    employeeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<TPayroll[]> {
    const payrolls = await this.prisma.payroll.findMany({
      where: {
        employee_id: employeeId,
        payment_batch_id: null,
        work_date: {
          gte: startDate,
          lte: endDate,
        },
        is_active: true,
      },
      orderBy: {
        work_date: 'asc',
      },
    });

    return payrolls.map((p) => this.mapper.mapToEntity(p) as TPayroll);
  }

  async getPayrollsByBatchId(batchId: number): Promise<TPayroll[]> {
    const payrolls = await this.prisma.payroll.findMany({
      where: {
        payment_batch_id: batchId,
        is_active: true,
      },
      orderBy: {
        work_date: 'asc',
      },
    });

    return payrolls.map((p) => this.mapper.mapToEntity(p) as TPayroll);
  }

  async updatePayrollTotals(
    payrollId: number,
    totalBonus: number,
    totalDeduction: number,
    finalSalary: number
  ): Promise<TPayroll> {
    const payroll = await this.prisma.payroll.update({
      where: { id: payrollId },
      data: {
        total_bonus: totalBonus,
        total_deduction: totalDeduction,
        final_salary: finalSalary,
      },
    });

    return this.mapper.mapToEntity(payroll) as TPayroll;
  }

  async linkPayrollsToBatch(payrollIds: number[], batchId: number): Promise<void> {
    // Fix: Use the correct Prisma model name - it's 'payroll' not 'employee_payrolls'
    // The @@map("employee_payrolls") in schema means the table name in DB is employee_payrolls
    // but the Prisma model name is still 'payroll'
    await this.prisma.payroll.updateMany({
      where: {
        id: { in: payrollIds },
      },
      data: {
        payment_batch_id: batchId,
      },
    });
    
    console.log(`✅ Linked ${payrollIds.length} payrolls to batch ${batchId}`);
  }

  async linkInternalPayrollsToBatch(internalPayrollIds: number[], batchId: number): Promise<void> {
    await this.prisma.internalPayroll.updateMany({
      where: {
        id: { in: internalPayrollIds },
      },
      data: {
        payment_batch_id: batchId,
      },
    });
    
    console.log(`✅ Linked ${internalPayrollIds.length} internal payrolls to batch ${batchId}`);
  }

  // ============================================================================
  // BONUS OPERATIONS
  // ============================================================================

  async createBonus(data: TPayrollBonusCreate): Promise<TPayrollBonus> {
    const bonus = await this.prisma.payrollBonus.create({
      data: {
        payroll_id: data.payrollId,
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        reference: data.reference || null,
      },
    });

    return this.bonusMapper.mapToEntity(bonus) as TPayrollBonus;
  }

  async getBonusesByPayrollId(payrollId: number): Promise<TPayrollBonus[]> {
    const bonuses = await this.prisma.payrollBonus.findMany({
      where: { payroll_id: payrollId },
      orderBy: { createdAt: 'asc' },
    });

    return bonuses.map((b) => this.bonusMapper.mapToEntity(b) as TPayrollBonus);
  }

  async getBonusesByPayrollIds(payrollIds: number[]): Promise<TPayrollBonus[]> {
    const bonuses = await this.prisma.payrollBonus.findMany({
      where: { payroll_id: { in: payrollIds } },
      orderBy: { createdAt: 'asc' },
    });

    return bonuses.map((b) => this.bonusMapper.mapToEntity(b) as TPayrollBonus);
  }

  // ============================================================================
  // DEDUCTION OPERATIONS
  // ============================================================================

  async createDeduction(data: TPayrollDeductionCreate): Promise<TPayrollDeduction> {
    const deduction = await this.prisma.payrollDeduction.create({
      data: {
        payroll_id: data.payrollId,
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        reference: data.reference || null,
      },
    });

    return this.deductionMapper.mapToEntity(deduction) as TPayrollDeduction;
  }

  async getDeductionsByPayrollId(payrollId: number): Promise<TPayrollDeduction[]> {
    const deductions = await this.prisma.payrollDeduction.findMany({
      where: { payroll_id: payrollId },
      orderBy: { createdAt: 'asc' },
    });

    return deductions.map((d) => this.deductionMapper.mapToEntity(d) as TPayrollDeduction);
  }

  async getDeductionsByPayrollIds(payrollIds: number[]): Promise<TPayrollDeduction[]> {
    const deductions = await this.prisma.payrollDeduction.findMany({
      where: { payroll_id: { in: payrollIds } },
      orderBy: { createdAt: 'asc' },
    });

    return deductions.map((d) => this.deductionMapper.mapToEntity(d) as TPayrollDeduction);
  }

  // ============================================================================
  // PAYMENT BATCH OPERATIONS
  // ============================================================================

  async createPaymentBatch(data: TPaymentBatchCreate): Promise<TPaymentBatch> {
    const batch = await this.prisma.paymentBatch.create({
      data: {
        employee_id: data.employeeId,
        period_start: data.periodStart,
        period_end: data.periodEnd,
        total_base_salary: data.totalBaseSalary,
        total_bonus: data.totalBonus,
        total_deduction: data.totalDeduction,
        final_amount: data.finalAmount,
        status: data.status,
        paid_at: data.paidAt || null,
        payment_method: data.paymentMethod || null,
        payment_reference: data.paymentReference || null,
        notes: data.notes || null,
      },
    });

    return this.paymentBatchMapper.mapToEntity(batch) as TPaymentBatch;
  }

  async getPaymentBatchById(batchId: number): Promise<TPaymentBatch | null> {
    const batch = await this.prisma.paymentBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) return null;
    return this.paymentBatchMapper.mapToEntity(batch) as TPaymentBatch;
  }

  async getLatestPaymentBatch(employeeId: number): Promise<TPaymentBatch | null> {
    const batch = await this.prisma.paymentBatch.findFirst({
      where: { employee_id: employeeId },
      orderBy: { createdAt: 'desc' },
    });

    if (!batch) return null;
    return this.paymentBatchMapper.mapToEntity(batch) as TPaymentBatch;
  }

  async getPaymentBatchesByEmployeeId(employeeId: number): Promise<TPaymentBatch[]> {
    const batches = await this.prisma.paymentBatch.findMany({
      where: { employee_id: employeeId },
      orderBy: { createdAt: 'desc' },
    });

    return batches.map((b) => this.paymentBatchMapper.mapToEntity(b) as TPaymentBatch);
  }

  // ============================================================================
  // AGGREGATION & REPORTING
  // ============================================================================

  async getAllEmployeePayrollSummary(
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
    source: string;
  }[]> {
    console.log('=== Payroll Debug ===');
    console.log('Date range:', startDate, 'to', endDate);

    // Add debugging for payment batches
    const existingBatches = await this.prisma.paymentBatch.findMany({
      where: {
        period_start: { gte: startDate },
        period_end: { lte: endDate }
      },
      select: {
        id: true,
        employee_id: true,
        status: true,
        period_start: true,
        period_end: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('🔍 Existing payment batches in period:', existingBatches);

    const result = await this.prisma.$queryRaw<any[]>`
      WITH LatestBatch AS (
        SELECT DISTINCT ON (employee_id)
          employee_id,
          id as batch_id,
          period_start,
          period_end,
          total_base_salary,
          total_bonus,
          total_deduction,
          final_amount,
          status,
          "createdAt",
          'PAYMENT_BATCH' as source
        FROM payment_batches
        WHERE period_start >= ${startDate}
          AND period_end <= ${endDate}
        ORDER BY employee_id, "createdAt" DESC
      ),
      UnpaidPayrolls AS (
        SELECT
          p.employee_id,
          MIN(p.work_date) as period_start,
          MAX(p.work_date) as period_end,
          SUM(p.base_salary) as total_base_salary,
          SUM(p.total_bonus) as total_bonus,
          SUM(p.total_deduction) as total_deduction,
          SUM(p.final_salary) as final_amount,
          'PENDING'::"PaymentStatus" as status,
          'EMPLOYEE_PAYROLL' as source
        FROM employee_payrolls p
        WHERE p.payment_batch_id IS NULL
          AND p.work_date >= ${startDate}
          AND p.work_date <= ${endDate}
          AND p.is_active = true
        GROUP BY p.employee_id
      ),
      InternalPayrolls AS (
        SELECT
          ip.employee_id,
          ip.period_start,
          ip.period_end,
          ip.base_salary as total_base_salary,
          ip.total_bonus,
          ip.total_deduction,
          ip.final_salary as final_amount,
          CASE 
            WHEN ip.payment_batch_id IS NULL THEN 'PENDING'::"PaymentStatus"
            ELSE pb.status
          END as status,
          'INTERNAL_PAYROLL' as source
        FROM internal_payrolls ip
        LEFT JOIN payment_batches pb ON ip.payment_batch_id = pb.id
        WHERE ip.is_active = true
          -- More lenient date filtering: include records that overlap with the period
          AND (
            ip.period_start <= ${endDate} AND ip.period_end >= ${startDate}
          )
      )
      SELECT
        COALESCE(lb.employee_id, up.employee_id, ip.employee_id) as employee_id,
        e.name as employee_name,
        COALESCE(lb.period_start, up.period_start, ip.period_start) as period_start,
        COALESCE(lb.period_end, up.period_end, ip.period_end) as period_end,
        COALESCE(lb.total_base_salary, up.total_base_salary, ip.total_base_salary, 0) as total_base_salary,
        COALESCE(lb.total_bonus, up.total_bonus, ip.total_bonus, 0) as total_bonus,
        COALESCE(lb.total_deduction, up.total_deduction, ip.total_deduction, 0) as total_deduction,
        COALESCE(lb.final_amount, up.final_amount, ip.final_amount, 0) as final_amount,
        COALESCE(lb.status, up.status, ip.status, 'PENDING'::"PaymentStatus") as status,
        COALESCE(lb.source, up.source, ip.source, 'UNKNOWN') as source
      FROM employees e
      LEFT JOIN LatestBatch lb ON e.id = lb.employee_id
      LEFT JOIN UnpaidPayrolls up ON e.id = up.employee_id
      LEFT JOIN InternalPayrolls ip ON e.id = ip.employee_id
      WHERE (lb.employee_id IS NOT NULL OR up.employee_id IS NOT NULL OR ip.employee_id IS NOT NULL)
      ORDER BY e.name, source
    `;

    console.log('PayrollRepository: Final result:', result);
    return result;
  }

  async getAttendanceSummary(
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
  }> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        COUNT(CASE WHEN attendance_status = 'PRESENT' THEN 1 END)::int as count_present,
        COUNT(CASE WHEN attendance_status = 'NOT_PRESENT' THEN 1 END)::int as count_not_present,
        COUNT(CASE WHEN attendance_status = 'CUTI' THEN 1 END)::int as count_leave,
        COUNT(CASE WHEN attendance_status = 'EXCUSED' THEN 1 END)::int as count_excused,
        COUNT(CASE WHEN attendance_status = 'SICK' THEN 1 END)::int as count_sick,
        COUNT(CASE WHEN late_minutes > 0 THEN 1 END)::int as count_late
      FROM attendances
      WHERE employee_id = ${employeeId}
        AND checkin_time >= ${startDate}
        AND checkin_time <= ${endDate}
        AND is_active = true
    `;

    return result[0] || {
      count_present: 0,
      count_not_present: 0,
      count_leave: 0,
      count_excused: 0,
      count_sick: 0,
      count_late: 0,
    };
  }

  async getEmployeeOrdersTotal(
    employeeId: number,
    outletId: number,
    date: Date
  ): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.prisma.order.aggregate({
      where: {
        employee_id: employeeId,
        outlet_id: outletId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        is_active: true,
      },
      _sum: {
        total_amount: true,
      },
    });

    return result._sum.total_amount || 0;
  }

  // ============================================================================
  // BASE PAYROLL OPERATIONS (Internal Employee Templates)
  // ============================================================================

  async createOrUpdateBasePayroll(employeeId: number, baseSalary: number): Promise<any> {
    const basePayroll = await this.prisma.basePayroll.upsert({
      where: { employee_id: employeeId },
      update: {
        base_salary: baseSalary,
      },
      create: {
        employee_id: employeeId,
        base_salary: baseSalary,
      },
    });

    return basePayroll;
  }

  async getBasePayrollByEmployeeId(employeeId: number): Promise<any | null> {
    return await this.prisma.basePayroll.findUnique({
      where: { employee_id: employeeId },
      include: {
        employee: true,
      },
    });
  }

  // ============================================================================
  // INTERNAL PAYROLL OPERATIONS (Monthly Payroll for Internal Employees)
  // ============================================================================

  async createInternalPayroll(data: any): Promise<any> {
    const internalPayroll = await this.prisma.internalPayroll.create({
      data: {
        employee_id: data.employeeId,
        base_payroll_id: data.basePayrollId,
        base_salary: data.baseSalary,
        total_bonus: data.totalBonus,
        total_deduction: data.totalDeduction,
        final_salary: data.finalSalary,
        period_start: data.periodStart,
        period_end: data.periodEnd,
      },
    });

    return internalPayroll;
  }

  async getUnpaidInternalPayrolls(
    employeeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const payrolls = await this.prisma.internalPayroll.findMany({
      where: {
        employee_id: employeeId,
        payment_batch_id: null,
        period_start: {
          gte: startDate,
        },
        period_end: {
          lte: endDate,
        },
        is_active: true,
      },
      orderBy: {
        period_start: 'asc',
      },
    });

    return payrolls;
  }

  async getInternalPayrollsByBatchId(batchId: number): Promise<any[]> {
    const payrolls = await this.prisma.internalPayroll.findMany({
      where: {
        payment_batch_id: batchId,
        is_active: true,
      },
      orderBy: {
        period_start: 'asc',
      },
    });

    return payrolls;
  }

  async updateInternalPayrollTotals(
    payrollId: number,
    totalBonus: number,
    totalDeduction: number,
    finalSalary: number
  ): Promise<any> {
    const payroll = await this.prisma.internalPayroll.update({
      where: { id: payrollId },
      data: {
        total_bonus: totalBonus,
        total_deduction: totalDeduction,
        final_salary: finalSalary,
      },
    });

    return payroll;
  }

  async createInternalBonus(data: TPayrollBonusCreate): Promise<TPayrollBonus> {
    const bonus = await this.prisma.payrollBonus.create({
      data: {
        internal_payroll_id: data.payrollId, // Note: reusing payrollId field for internal
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        reference: data.reference || null,
      },
    });

    return this.bonusMapper.mapToEntity(bonus) as TPayrollBonus;
  }

  async createInternalDeduction(data: TPayrollDeductionCreate): Promise<TPayrollDeduction> {
    const deduction = await this.prisma.payrollDeduction.create({
      data: {
        internal_payroll_id: data.payrollId, // Note: reusing payrollId field for internal
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        reference: data.reference || null,
      },
    });

    return this.deductionMapper.mapToEntity(deduction) as TPayrollDeduction;
  }

  async getBonusesByInternalPayrollIds(payrollIds: number[]): Promise<TPayrollBonus[]> {
    const bonuses = await this.prisma.payrollBonus.findMany({
      where: { internal_payroll_id: { in: payrollIds } },
      orderBy: { createdAt: 'asc' },
    });

    return bonuses.map((b) => this.bonusMapper.mapToEntity(b) as TPayrollBonus);
  }

  async getDeductionsByInternalPayrollIds(payrollIds: number[]): Promise<TPayrollDeduction[]> {
    const deductions = await this.prisma.payrollDeduction.findMany({
      where: { internal_payroll_id: { in: payrollIds } },
      orderBy: { createdAt: 'asc' },
    });

    return deductions.map((d) => this.deductionMapper.mapToEntity(d) as TPayrollDeduction);
  }

  // ============================================================================
  // HELPER METHOD - Employee Type Detection
  // ============================================================================

  async getEmployeeType(employeeId: number): Promise<'outlet' | 'internal'> {
    const outletAssignment = await this.prisma.outletEmployee.findFirst({
      where: {
        employee_id: employeeId,
        is_active: true,
      },
    });

    return outletAssignment ? 'outlet' : 'internal';
  }

  // ============================================================================
  // UNIFIED PAYROLL SUMMARY (Outlet + Internal)
  // ============================================================================

  async getAllPayrollSummaryUnified(
    startDate: Date,
    endDate: Date
  ): Promise<{
    employee_id: number;
    employee_name: string;
    employee_type: 'outlet' | 'internal';
    period_start: Date;
    period_end: Date;
    total_base_salary: number;
    total_bonus: number;
    total_deduction: number;
    final_amount: number;
    status: string;
  }[]> {

    const outletSummaries = await this.getAllEmployeePayrollSummary(startDate, endDate);

    const internalResult = await this.prisma.$queryRaw<any[]>`
      WITH LatestBatchInternal AS (
        SELECT DISTINCT ON (employee_id)
          employee_id,
          id as batch_id,
          period_start,
          period_end,
          total_base_salary,
          total_bonus,
          total_deduction,
          final_amount,
          status,
          "createdAt"
        FROM payment_batches pb
        WHERE EXISTS (
          SELECT 1 FROM internal_payrolls ip
          WHERE ip.payment_batch_id = pb.id
        )
        AND period_start >= ${startDate}
        AND period_end <= ${endDate}
        ORDER BY employee_id, "createdAt" DESC
      ),
      UnpaidInternalPayrolls AS (
        SELECT
          ip.employee_id,
          MIN(ip.period_start) as period_start,
          MAX(ip.period_end) as period_end,
          SUM(ip.base_salary) as total_base_salary,
          SUM(ip.total_bonus) as total_bonus,
          SUM(ip.total_deduction) as total_deduction,
          SUM(ip.final_salary) as final_amount,
          'PENDING'::"PaymentStatus" as status
        FROM internal_payrolls ip
        WHERE ip.payment_batch_id IS NULL
          AND ip.period_start >= ${startDate}
          AND ip.period_end <= ${endDate}
          AND ip.is_active = true
        GROUP BY ip.employee_id
      )
      SELECT
        COALESCE(lb.employee_id, up.employee_id) as employee_id,
        e.name as employee_name,
        'internal' as employee_type,
        COALESCE(lb.period_start, up.period_start) as period_start,
        COALESCE(lb.period_end, up.period_end) as period_end,
        COALESCE(lb.total_base_salary, up.total_base_salary, 0) as total_base_salary,
        COALESCE(lb.total_bonus, up.total_bonus, 0) as total_bonus,
        COALESCE(lb.total_deduction, up.total_deduction, 0) as total_deduction,
        COALESCE(lb.final_amount, up.final_amount, 0) as final_amount,
        COALESCE(lb.status, up.status, 'PENDING'::"PaymentStatus") as status
      FROM employees e
      LEFT JOIN LatestBatchInternal lb ON e.id = lb.employee_id
      LEFT JOIN UnpaidInternalPayrolls up ON e.id = up.employee_id
      WHERE (lb.employee_id IS NOT NULL OR up.employee_id IS NOT NULL)
      ORDER BY e.name
    `;

    // Combine and return
    const combined = [
      ...outletSummaries.map(s => ({ ...s, employee_type: 'outlet' as const })),
      ...internalResult,
    ];

    return combined.sort((a, b) => a.employee_name.localeCompare(b.employee_name));
  }

  async getLatestPayrollPeriod(employeeId: number): Promise<{ start: Date; end: Date } | null> {
    // First check for outlet payrolls (daily)
    const latestOutletPayroll = await this.prisma.payroll.findFirst({
      where: {
        employee_id: employeeId,
        is_active: true,
      },
      orderBy: {
        work_date: 'desc',
      },
    });

    // Also check for internal payrolls (monthly)
    const latestInternalPayroll = await this.prisma.internalPayroll.findFirst({
      where: {
        employee_id: employeeId,
        is_active: true,
      },
      orderBy: {
        period_end: 'desc',
      },
    });

    if (latestOutletPayroll) {
      const workDate = latestOutletPayroll.work_date;

      const dayOfWeek = workDate.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, Monday = 1
      const monday = new Date(workDate);
      monday.setDate(workDate.getDate() + diff);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      
      return { start: monday, end: sunday };
    }

    if (latestInternalPayroll) {
      return {
        start: latestInternalPayroll.period_start,
        end: latestInternalPayroll.period_end,
      };
    }

    // No payrolls found
    return null;
  }
}

