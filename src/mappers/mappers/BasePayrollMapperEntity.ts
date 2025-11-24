import { TBasePayroll } from "../../core/entities/payroll/basePayroll";

export const BasePayrollMapperEntity = {
  toEntity: (dbRecord: any): TBasePayroll => ({
    id: dbRecord.id,
    employeeId: dbRecord.employee_id,
    baseSalary: dbRecord.base_salary,
    isActive: dbRecord.is_active,
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt,
  }),
  
  toDatabase: (entity: Partial<TBasePayroll>): any => ({
    employee_id: entity.employeeId,
    base_salary: entity.baseSalary,
    is_active: entity.isActive,
  }),
};
