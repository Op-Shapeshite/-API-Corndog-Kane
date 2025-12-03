import { Attendance } from '../aggregates/Attendance';
import { AttendanceId } from '../value-objects/AttendanceId';
import { EmployeeId } from '../value-objects/EmployeeId';
import { OutletId } from '../value-objects/OutletId';
import { DateTime } from '../value-objects/DateTime';

/**
 * Pure Domain Repository Interface
 * No infrastructure dependencies - only domain concepts
 */
export interface IAttendanceRepository {
  /**
   * Save attendance aggregate
   */
  save(attendance: Attendance): Promise<void>;

  /**
   * Find attendance by ID
   */
  findById(id: AttendanceId): Promise<Attendance | null>;

  /**
   * Find today's attendance for an employee
   */
  findTodayAttendance(employeeId: EmployeeId, date: DateTime): Promise<Attendance | null>;

  /**
   * Check if attendance exists for employee on specific date
   */
  existsForEmployeeOnDate(employeeId: EmployeeId, date: DateTime): Promise<boolean>;

  /**
   * Find attendances by outlet and date range
   */
  findByOutletAndDateRange(
    outletId: OutletId, 
    startDate: DateTime, 
    endDate: DateTime
  ): Promise<Attendance[]>;

  /**
   * Find attendances by employee and date range
   */
  findByEmployeeAndDateRange(
    employeeId: EmployeeId, 
    startDate: DateTime, 
    endDate: DateTime
  ): Promise<Attendance[]>;

  /**
   * Update attendance (for checkout, approval status changes)
   */
  update(attendance: Attendance): Promise<void>;

  /**
   * Remove attendance (soft delete)
   */
  remove(id: AttendanceId): Promise<void>;
}