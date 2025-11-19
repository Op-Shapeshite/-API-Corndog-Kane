import { EntityMapConfig } from "../../adapters/postgres/repositories/Repository";

export const PayrollMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: 'id', entityField: 'id' },
    { dbField: 'employee_id', entityField: 'employeeId' },
    { dbField: 'outlet_id', entityField: 'outletId' },
    { dbField: 'attendance_id', entityField: 'attendanceId' },
    { dbField: 'base_salary', entityField: 'baseSalary' },
    { dbField: 'total_bonus', entityField: 'totalBonus' },
    { dbField: 'total_deduction', entityField: 'totalDeduction' },
    { dbField: 'final_salary', entityField: 'finalSalary' },
    { dbField: 'work_date', entityField: 'workDate' },
    { dbField: 'payment_batch_id', entityField: 'paymentBatchId' },
    { dbField: 'is_active', entityField: 'isActive' },
    { dbField: 'createdAt', entityField: 'createdAt' },
    { dbField: 'updatedAt', entityField: 'updatedAt' },
  ],
  relations: [],
};

export const PaymentBatchMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: 'id', entityField: 'id' },
    { dbField: 'employee_id', entityField: 'employeeId' },
    { dbField: 'period_start', entityField: 'periodStart' },
    { dbField: 'period_end', entityField: 'periodEnd' },
    { dbField: 'total_base_salary', entityField: 'totalBaseSalary' },
    { dbField: 'total_bonus', entityField: 'totalBonus' },
    { dbField: 'total_deduction', entityField: 'totalDeduction' },
    { dbField: 'final_amount', entityField: 'finalAmount' },
    { dbField: 'status', entityField: 'status' },
    { dbField: 'paid_at', entityField: 'paidAt' },
    { dbField: 'payment_method', entityField: 'paymentMethod' },
    { dbField: 'payment_reference', entityField: 'paymentReference' },
    { dbField: 'notes', entityField: 'notes' },
    { dbField: 'createdAt', entityField: 'createdAt' },
    { dbField: 'updatedAt', entityField: 'updatedAt' },
  ],
  relations: [],
};

export const PayrollBonusMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: 'id', entityField: 'id' },
    { dbField: 'payroll_id', entityField: 'payrollId' },
    { dbField: 'type', entityField: 'type' },
    { dbField: 'amount', entityField: 'amount' },
    { dbField: 'description', entityField: 'description' },
    { dbField: 'reference', entityField: 'reference' },
    { dbField: 'createdAt', entityField: 'createdAt' },
    { dbField: 'updatedAt', entityField: 'updatedAt' },
  ],
  relations: [],
};

export const PayrollDeductionMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: 'id', entityField: 'id' },
    { dbField: 'payroll_id', entityField: 'payrollId' },
    { dbField: 'type', entityField: 'type' },
    { dbField: 'amount', entityField: 'amount' },
    { dbField: 'description', entityField: 'description' },
    { dbField: 'reference', entityField: 'reference' },
    { dbField: 'createdAt', entityField: 'createdAt' },
    { dbField: 'updatedAt', entityField: 'updatedAt' },
  ],
  relations: [],
};
