import { DomainEvent } from '../base/AggregateRoot';
import { AttendanceId } from '../value-objects/AttendanceId';
import { EmployeeId } from '../value-objects/EmployeeId';
import { OutletId } from '../value-objects/OutletId';
import { DateTime } from '../value-objects/DateTime';

/**
 * Domain Event: AttendanceCreated
 * Raised when an employee checks in
 */
export class AttendanceCreatedEvent extends DomainEvent {
  constructor(
    public readonly attendanceId: AttendanceId,
    public readonly employeeId: EmployeeId,
    public readonly outletId: OutletId,
    public readonly checkinTime: DateTime,
    public readonly isLate: boolean
  ) {
    super();
  }
}

/**
 * Domain Event: AttendanceCompleted
 * Raised when an employee checks out
 */
export class AttendanceCompletedEvent extends DomainEvent {
  constructor(
    public readonly attendanceId: AttendanceId,
    public readonly employeeId: EmployeeId,
    public readonly outletId: OutletId,
    public readonly checkinTime: DateTime,
    public readonly checkoutTime: DateTime
  ) {
    super();
  }
}

/**
 * Domain Event: LateArrivalApproved
 * Raised when late arrival is approved by supervisor
 */
export class LateArrivalApprovedEvent extends DomainEvent {
  constructor(
    public readonly attendanceId: AttendanceId,
    public readonly employeeId: EmployeeId,
    public readonly approver: EmployeeId
  ) {
    super();
  }
}

/**
 * Domain Event: LateArrivalRejected
 * Raised when late arrival is rejected by supervisor
 */
export class LateArrivalRejectedEvent extends DomainEvent {
  constructor(
    public readonly attendanceId: AttendanceId,
    public readonly employeeId: EmployeeId,
    public readonly approver: EmployeeId
  ) {
    super();
  }
}