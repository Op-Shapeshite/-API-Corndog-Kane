import { Attendance } from '../../domain/aggregates/Attendance';
import { EmployeeId } from '../../domain/value-objects/EmployeeId';
import { OutletId } from '../../domain/value-objects/OutletId';
import { DateTime } from '../../domain/value-objects/DateTime';
import { Minutes } from '../../domain/value-objects/Minutes';
import { LateApprovalStatus, AttendanceStatus } from '../../domain/value-objects/SharedTypes';

/**
 * Result: Attendance Result
 */
export class AttendanceResult {
  constructor(
    public readonly id: number,
    public readonly employeeId: number,
    public readonly outletId: number,
    public readonly checkinTime: Date,
    public readonly lateness: number,
    public readonly status: AttendanceStatus,
    public readonly isActive: boolean,
    public readonly checkoutTime?: Date,
    public readonly workingHours?: number,
    public readonly lateApprovalStatus?: LateApprovalStatus
  ) {}

  static fromDomain(attendance: Attendance): AttendanceResult {
    return new AttendanceResult(
      attendance.getId().getValue(),
      attendance.getEmployeeId().getValue(),
      attendance.getOutletId().getValue(),
      attendance.getCheckinDetails().getCheckinTime().getValue(),
      attendance.getLateness().getValue(),
      attendance.getAttendanceStatus(),
      attendance.getIsActive(),
      attendance.getCheckoutDetails()?.getCheckoutTime().getValue(),
      attendance.isCheckedOut() ? attendance.calculateWorkingHours().getValue() : undefined,
      attendance.getCheckinDetails().getLateApprovalStatus()
    );
  }
}

/**
 * View: Attendance List View
 */
export class AttendanceListView {
  constructor(
    public readonly data: AttendanceItemView[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
    public readonly totalPages: number
  ) {}

  static create(
    attendances: Attendance[],
    total: number,
    page: number,
    limit: number
  ): AttendanceListView {
    const data = attendances.map(attendance => AttendanceItemView.fromDomain(attendance));
    const totalPages = Math.ceil(total / limit);

    return new AttendanceListView(data, total, page, limit, totalPages);
  }
}

/**
 * View: Attendance Item View
 */
export class AttendanceItemView {
  constructor(
    public readonly id: number,
    public readonly employeeId: number,
    public readonly employeeName: string,
    public readonly outletId: number,
    public readonly outletName: string,
    public readonly checkinTime: Date,
    public readonly lateness: string,
    public readonly status: AttendanceStatus,
    public readonly checkoutTime?: Date,
    public readonly lateApprovalStatus?: LateApprovalStatus
  ) {}

  static fromDomain(attendance: Attendance): AttendanceItemView {
    // Note: This would need employee and outlet name from read model
    // For now using placeholder values
    return new AttendanceItemView(
      attendance.getId().getValue(),
      attendance.getEmployeeId().getValue(),
      'Employee Name', // Would come from read model
      attendance.getOutletId().getValue(),
      'Outlet Name', // Would come from read model
      attendance.getCheckinDetails().getCheckinTime().getValue(),
      attendance.getLateness().toHoursAndMinutes(),
      attendance.getAttendanceStatus(),
      attendance.getCheckoutDetails()?.getCheckoutTime().getValue(),
      attendance.getCheckinDetails().getLateApprovalStatus()
    );
  }
}