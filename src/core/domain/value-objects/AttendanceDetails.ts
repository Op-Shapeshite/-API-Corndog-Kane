import { DateTime } from '../value-objects/DateTime';
import { Minutes } from '../value-objects/Minutes';
import { ImageProof, LateApprovalStatus } from '../value-objects/SharedTypes';
import { EmployeeId } from '../value-objects/EmployeeId';

/**
 * CheckinDetails Value Object
 * Encapsulates all information related to employee check-in
 */
export class CheckinDetails {
  private constructor(
    private readonly checkinTime: DateTime,
    private readonly imageProof: ImageProof,
    private readonly lateness: Minutes,
    private lateApprovalStatus: LateApprovalStatus,
    private readonly lateNotes?: string,
    private readonly latePresentProof?: ImageProof
  ) {}

  static create(
    checkinTime: DateTime,
    imageProof: ImageProof,
    scheduledTime: DateTime,
    lateNotes?: string,
    latePresentProof?: string
  ): CheckinDetails {
    const lateness = CheckinDetails.calculateLateness(checkinTime, scheduledTime);
    
    return new CheckinDetails(
      checkinTime,
      imageProof,
      lateness,
      LateApprovalStatus.PENDING,
      lateNotes,
      latePresentProof ? ImageProof.fromPath(latePresentProof) : undefined
    );
  }

  static fromExisting(
    checkinTime: DateTime,
    imageProof: ImageProof,
    lateness: Minutes,
    lateApprovalStatus: LateApprovalStatus,
    lateNotes?: string,
    latePresentProof?: ImageProof
  ): CheckinDetails {
    return new CheckinDetails(
      checkinTime,
      imageProof,
      lateness,
      lateApprovalStatus,
      lateNotes,
      latePresentProof
    );
  }

  private static calculateLateness(checkinTime: DateTime, scheduledTime: DateTime): Minutes {
    const checkinMinutes = checkinTime.getTimeInMinutes();
    const scheduledMinutes = scheduledTime.getTimeInMinutes();
    
    const lateMinutes = Math.max(0, checkinMinutes - scheduledMinutes);
    return Minutes.fromNumber(lateMinutes);
  }

  getCheckinTime(): DateTime {
    return this.checkinTime;
  }

  getImageProof(): ImageProof {
    return this.imageProof;
  }

  getLateness(): Minutes {
    return this.lateness;
  }

  getLateApprovalStatus(): LateApprovalStatus {
    return this.lateApprovalStatus;
  }

  getLateNotes(): string | undefined {
    return this.lateNotes;
  }

  getLatePresentProof(): ImageProof | undefined {
    return this.latePresentProof;
  }

  isLate(): boolean {
    return this.lateness.isPositive();
  }

  isPendingLateApproval(): boolean {
    return this.isLate() && this.lateApprovalStatus === LateApprovalStatus.PENDING;
  }

  isLateApproved(): boolean {
    return this.isLate() && this.lateApprovalStatus === LateApprovalStatus.APPROVED;
  }

  approveLateArrival(approver: EmployeeId): void {
    if (!this.isLate()) {
      throw new Error('Cannot approve late arrival for on-time checkin');
    }

    if (this.lateApprovalStatus === LateApprovalStatus.APPROVED) {
      throw new Error('Late arrival already approved');
    }

    this.lateApprovalStatus = LateApprovalStatus.APPROVED;
  }

  rejectLateArrival(approver: EmployeeId): void {
    if (!this.isLate()) {
      throw new Error('Cannot reject late arrival for on-time checkin');
    }

    if (this.lateApprovalStatus === LateApprovalStatus.REJECTED) {
      throw new Error('Late arrival already rejected');
    }

    this.lateApprovalStatus = LateApprovalStatus.REJECTED;
  }
}

/**
 * CheckoutDetails Value Object
 * Encapsulates all information related to employee check-out
 */
export class CheckoutDetails {
  private constructor(
    private readonly checkoutTime: DateTime,
    private readonly imageProof: ImageProof
  ) {}

  static create(checkoutTime: DateTime, imageProof: ImageProof): CheckoutDetails {
    return new CheckoutDetails(checkoutTime, imageProof);
  }

  getCheckoutTime(): DateTime {
    return this.checkoutTime;
  }

  getImageProof(): ImageProof {
    return this.imageProof;
  }

  calculateWorkingHours(checkinDetails: CheckinDetails): Minutes {
    const checkinTime = checkinDetails.getCheckinTime();
    
    if (!this.checkoutTime.isSameDay(checkinTime)) {
      throw new Error('Checkout and checkin must be on the same day');
    }

    if (this.checkoutTime.isBefore(checkinTime)) {
      throw new Error('Checkout time cannot be before checkin time');
    }

    const checkinMinutes = checkinTime.getTimeInMinutes();
    const checkoutMinutes = this.checkoutTime.getTimeInMinutes();
    
    return Minutes.fromNumber(checkoutMinutes - checkinMinutes);
  }
}