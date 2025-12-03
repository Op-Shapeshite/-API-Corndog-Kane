/**
 * Domain Exceptions
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  
  constructor(message: string, public readonly details?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AttendanceAlreadyExistsError extends DomainError {
  readonly code = 'ATTENDANCE_ALREADY_EXISTS';
  
  constructor(employeeId: number, date: Date) {
    super(`Attendance already exists for employee ${employeeId} on ${date.toDateString()}`);
  }
}

export class AttendanceNotFoundError extends DomainError {
  readonly code = 'ATTENDANCE_NOT_FOUND';
  
  constructor(attendanceId: number) {
    super(`Attendance with ID ${attendanceId} not found`);
  }
}

export class AlreadyCheckedOutError extends DomainError {
  readonly code = 'ALREADY_CHECKED_OUT';
  
  constructor() {
    super('Employee has already checked out today');
  }
}

export class NoCheckinRecordError extends DomainError {
  readonly code = 'NO_CHECKIN_RECORD';
  
  constructor() {
    super('No check-in record found for today. Please check in first.');
  }
}

export class InvalidCheckoutTimeError extends DomainError {
  readonly code = 'INVALID_CHECKOUT_TIME';
  
  constructor(message: string) {
    super(message);
  }
}

export class NoScheduleFoundError extends DomainError {
  readonly code = 'NO_SCHEDULE_FOUND';
  
  constructor(outletId: number, day: string) {
    super(`No schedule found for ${day} at outlet ${outletId}. Please contact your manager to set up outlet schedules.`);
  }
}

export class InvalidLateApprovalError extends DomainError {
  readonly code = 'INVALID_LATE_APPROVAL';
  
  constructor(message: string) {
    super(message);
  }
}