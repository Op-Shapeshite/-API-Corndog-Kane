import { EmployeeId } from '../value-objects/EmployeeId';
import { OutletId } from '../value-objects/OutletId';
import { DateTime, WeekDay } from '../value-objects/DateTime';

/**
 * Employee Domain Entity (simplified for attendance context)
 */
export interface Employee {
  id: EmployeeId;
  name: string;
  isActive: boolean;
  isAssignedToOutlet(outletId: OutletId, date: DateTime): boolean;
}

/**
 * Pure Domain Repository Interface for Employee
 */
export interface IEmployeeRepository {
  /**
   * Find employee by ID
   */
  findById(id: EmployeeId): Promise<Employee | null>;

  /**
   * Find scheduled employee for outlet by user ID
   */
  findScheduledEmployeeByUserId(userId: number, date: DateTime): Promise<EmployeeId | null>;

  /**
   * Check if employee is assigned to outlet on specific date
   */
  isEmployeeAssignedToOutlet(employeeId: EmployeeId, outletId: OutletId, date: DateTime): Promise<boolean>;

  /**
   * Find all employees assigned to outlet
   */
  findEmployeesAssignedToOutlet(outletId: OutletId, date: DateTime): Promise<Employee[]>;
}