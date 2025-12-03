import { EmployeeId } from '../../domain/value-objects/EmployeeId';
import { OutletId } from '../../domain/value-objects/OutletId';
import { DateTime } from '../../domain/value-objects/DateTime';
import { ImageProof } from '../../domain/value-objects/SharedTypes';

/**
 * Command: Create Checkin
 */
export class CheckinCommand {
  constructor(
    public readonly employeeId: EmployeeId,
    public readonly outletId: OutletId,
    public readonly checkinTime: DateTime,
    public readonly imageProofPath: string,
    public readonly lateNotes?: string,
    public readonly latePresentProofPath?: string
  ) {}
}

/**
 * Command: Create Checkout
 */
export class CheckoutCommand {
  constructor(
    public readonly employeeId: EmployeeId,
    public readonly checkoutTime: DateTime,
    public readonly imageProofPath: string
  ) {}
}

/**
 * Command: Approve Late Arrival
 */
export class ApproveLateArrivalCommand {
  constructor(
    public readonly attendanceId: number,
    public readonly approverId: EmployeeId
  ) {}
}

/**
 * Command: Reject Late Arrival
 */
export class RejectLateArrivalCommand {
  constructor(
    public readonly attendanceId: number,
    public readonly approverId: EmployeeId
  ) {}
}