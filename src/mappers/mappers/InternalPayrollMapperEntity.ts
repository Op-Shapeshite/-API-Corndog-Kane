import { TInternalPayroll } from "../../../core/entities/payroll/internalPayroll";

export const InternalPayrollMapperEntity = {
  toEntity: (dbRecord: any): TInternalPayroll => ({
    id: dbRecord.id,
    employeeId: dbRecord.employee_id,
    basePayrollId: dbRecord.base_payroll_id,
    baseSalary: dbRecord.base_salary,
    totalBonus: dbRecord.total_bonus,
    totalDeduction: dbRecord.total_deduction,
    finalSalary: dbRecord.final_salary,
    periodStart: dbRecord.period_start,
    periodEnd: dbRecord.period_end,
    paymentBatchId: dbRecord.payment_batch_id,
    isActive: dbRecord.is_active,
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt,
  }),
  
  toDatabase: (entity: Partial<TInternalPayroll>): any => ({
    employee_id: entity.employeeId,
    base_payroll_id: entity.basePayrollId,
    base_salary: entity.baseSalary,
    total_bonus: entity.totalBonus,
    total_deduction: entity.totalDeduction,
    final_salary: entity.finalSalary,
    period_start: entity.periodStart,
    period_end: entity.periodEnd,
    payment_batch_id: entity.paymentBatchId,
    is_active: entity.isActive,
  }),
};
