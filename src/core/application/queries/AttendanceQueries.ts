import { EmployeeId } from '../../domain/value-objects/EmployeeId';
import { OutletId } from '../../domain/value-objects/OutletId';
import { DateTime } from '../../domain/value-objects/DateTime';
import { AttendanceId } from '../../domain/value-objects/AttendanceId';

/**
 * Query: Get Today's Attendance
 */
export class GetTodayAttendanceQuery {
  constructor(
    public readonly employeeId: EmployeeId,
    public readonly date: DateTime
  ) {}
}

/**
 * Query: Get Attendance Details
 */
export class GetAttendanceDetailsQuery {
  constructor(
    public readonly attendanceId: AttendanceId
  ) {}
}

/**
 * Query: Get Outlet Attendances
 */
export class GetOutletAttendancesQuery {
  constructor(
    public readonly outletId: OutletId,
    public readonly startDate: DateTime,
    public readonly endDate: DateTime,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}

/**
 * Query: Get Employee Schedule
 */
export class GetEmployeeScheduleQuery {
  constructor(
    public readonly employeeId: EmployeeId,
    public readonly startDate: DateTime,
    public readonly endDate: DateTime
  ) {}
}