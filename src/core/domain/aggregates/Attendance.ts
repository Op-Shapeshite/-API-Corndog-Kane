import { AggregateRoot } from '../base/AggregateRoot';
import { AttendanceId } from '../value-objects/AttendanceId';
import { EmployeeId } from '../value-objects/EmployeeId';
import { OutletId } from '../value-objects/OutletId';
import { DateTime } from '../value-objects/DateTime';
import { Minutes } from '../value-objects/Minutes';
import { ImageProof, AttendanceStatus } from '../value-objects/SharedTypes';
import { CheckinDetails, CheckoutDetails } from '../value-objects/AttendanceDetails';
import { 
  AttendanceCreatedEvent, 
  AttendanceCompletedEvent, 
  LateArrivalApprovedEvent,
  LateArrivalRejectedEvent
} from '../events/AttendanceEvents';
import {
  AlreadyCheckedOutError,
  NoCheckinRecordError,
  InvalidCheckoutTimeError,
  InvalidLateApprovalError
} from '../exceptions/AttendanceExceptions';

/**
 * Attendance Aggregate Root
 * Rich domain model with business behavior for employee attendance
 */
export class Attendance extends AggregateRoot {
  private constructor(
    private readonly id: AttendanceId,
    private readonly employeeId: EmployeeId,
    private readonly outletId: OutletId,
    private readonly checkinDetails: CheckinDetails,
    private checkoutDetails?: CheckoutDetails,
    private readonly workDate: DateTime = DateTime.now(),
    private isActive: boolean = true
  ) {
    super();
  }

  /**
   * Factory method to create new attendance (checkin)
   */
  static create(
    employeeId: EmployeeId,
    outletId: OutletId,
    checkinTime: DateTime,
    checkinProof: ImageProof,
    scheduledTime: DateTime,
    lateNotes?: string,
    latePresentProof?: string
  ): Attendance {
    const attendanceId = AttendanceId.generate();
    
    const checkinDetails = CheckinDetails.create(
      checkinTime,
      checkinProof,
      scheduledTime,
      lateNotes,
      latePresentProof
    );

    const attendance = new Attendance(
      attendanceId,
      employeeId,
      outletId,
      checkinDetails,
      undefined,
      checkinTime.startOfDay()
    );

    // Raise domain event
    attendance.raiseEvent(new AttendanceCreatedEvent(
      attendanceId,
      employeeId,
      outletId,
      checkinTime,
      checkinDetails.isLate()
    ));

    return attendance;
  }

  /**
   * Factory method to reconstruct from persistence
   */
  static fromPersistence(
    id: AttendanceId,
    employeeId: EmployeeId,
    outletId: OutletId,
    checkinDetails: CheckinDetails,
    checkoutDetails?: CheckoutDetails,
    workDate?: DateTime,
    isActive: boolean = true
  ): Attendance {
    return new Attendance(
      id,
      employeeId,
      outletId,
      checkinDetails,
      checkoutDetails,
      workDate || DateTime.now(),
      isActive
    );
  }

  /**
   * Business method: Checkout
   */
  checkout(checkoutTime: DateTime, checkoutProof: ImageProof): void {
    this.validateCheckout(checkoutTime);

    this.checkoutDetails = CheckoutDetails.create(checkoutTime, checkoutProof);

    // Raise domain event
    this.raiseEvent(new AttendanceCompletedEvent(
      this.id,
      this.employeeId,
      this.outletId,
      this.checkinDetails.getCheckinTime(),
      checkoutTime
    ));
  }

  /**
   * Business method: Approve late arrival
   */
  approveLateArrival(approver: EmployeeId): void {
    try {
      this.checkinDetails.approveLateArrival(approver);

      this.raiseEvent(new LateArrivalApprovedEvent(
        this.id,
        this.employeeId,
        approver
      ));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InvalidLateApprovalError(message);
    }
  }

  /**
   * Business method: Reject late arrival
   */
  rejectLateArrival(approver: EmployeeId): void {
    try {
      this.checkinDetails.rejectLateArrival(approver);

      this.raiseEvent(new LateArrivalRejectedEvent(
        this.id,
        this.employeeId,
        approver
      ));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InvalidLateApprovalError(message);
    }
  }

  /**
   * Business method: Calculate working hours
   */
  calculateWorkingHours(): Minutes {
    if (!this.checkoutDetails) {
      throw new NoCheckinRecordError();
    }

    return this.checkoutDetails.calculateWorkingHours(this.checkinDetails);
  }

  /**
   * Business queries
   */
  getId(): AttendanceId {
    return this.id;
  }

  getEmployeeId(): EmployeeId {
    return this.employeeId;
  }

  getOutletId(): OutletId {
    return this.outletId;
  }

  getCheckinDetails(): CheckinDetails {
    return this.checkinDetails;
  }

  getCheckoutDetails(): CheckoutDetails | undefined {
    return this.checkoutDetails;
  }

  getWorkDate(): DateTime {
    return this.workDate;
  }

  isCheckedOut(): boolean {
    return this.checkoutDetails !== undefined;
  }

  isLate(): boolean {
    return this.checkinDetails.isLate();
  }

  isPendingLateApproval(): boolean {
    return this.checkinDetails.isPendingLateApproval();
  }

  isLateApproved(): boolean {
    return this.checkinDetails.isLateApproved();
  }

  getAttendanceStatus(): AttendanceStatus {
    if (!this.isActive) {
      return AttendanceStatus.ABSENT;
    }

    if (this.isLate() && !this.isLateApproved()) {
      return AttendanceStatus.LATE;
    }

    return AttendanceStatus.PRESENT;
  }

  getLateness(): Minutes {
    return this.checkinDetails.getLateness();
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Private validation methods
   */
  private validateCheckout(checkoutTime: DateTime): void {
    if (this.isCheckedOut()) {
      throw new AlreadyCheckedOutError();
    }

    const checkinTime = this.checkinDetails.getCheckinTime();

    if (!checkoutTime.isSameDay(checkinTime)) {
      throw new InvalidCheckoutTimeError(
        'Checkout must be on the same day as checkin'
      );
    }

    if (checkoutTime.isBefore(checkinTime)) {
      throw new InvalidCheckoutTimeError(
        'Checkout time cannot be before checkin time'
      );
    }
  }

  /**
   * Mark as inactive (soft delete)
   */
  markInactive(): void {
    this.isActive = false;
  }

  /**
   * Equality comparison
   */
  equals(other: Attendance): boolean {
    return this.id.equals(other.id);
  }
}