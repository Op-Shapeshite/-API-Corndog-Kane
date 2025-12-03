import { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import { CheckoutCommand, ApproveLateArrivalCommand, RejectLateArrivalCommand } from '../commands/AttendanceCommands';
import { AttendanceResult } from '../dtos/AttendanceResults';
import { ImageProof } from '../../domain/value-objects/SharedTypes';
import { NoCheckinRecordError, AttendanceNotFoundError } from '../../domain/exceptions/AttendanceExceptions';
import { AttendanceId } from '../../domain/value-objects/AttendanceId';

/**
 * Command Handler: Checkout
 */
export class CheckoutCommandHandler {
  constructor(private attendanceRepo: IAttendanceRepository) {}

  async handle(command: CheckoutCommand): Promise<AttendanceResult> {
    // 1. Find today's attendance for employee
    const attendance = await this.attendanceRepo.findTodayAttendance(
      command.employeeId, 
      command.checkoutTime
    );

    if (!attendance) {
      throw new NoCheckinRecordError();
    }

    // 2. Execute domain logic
    const checkoutProof = ImageProof.fromPath(command.imageProofPath);
    attendance.checkout(command.checkoutTime, checkoutProof);

    // 3. Update persistence
    await this.attendanceRepo.update(attendance);

    // 4. Return result
    return AttendanceResult.fromDomain(attendance);
  }
}

/**
 * Command Handler: Approve Late Arrival
 */
export class ApproveLateArrivalCommandHandler {
  constructor(private attendanceRepo: IAttendanceRepository) {}

  async handle(command: ApproveLateArrivalCommand): Promise<AttendanceResult> {
    // 1. Find attendance
    const attendanceId = AttendanceId.fromNumber(command.attendanceId);
    const attendance = await this.attendanceRepo.findById(attendanceId);

    if (!attendance) {
      throw new AttendanceNotFoundError(command.attendanceId);
    }

    // 2. Execute domain logic
    attendance.approveLateArrival(command.approverId);

    // 3. Update persistence
    await this.attendanceRepo.update(attendance);

    // 4. Return result
    return AttendanceResult.fromDomain(attendance);
  }
}

/**
 * Command Handler: Reject Late Arrival
 */
export class RejectLateArrivalCommandHandler {
  constructor(private attendanceRepo: IAttendanceRepository) {}

  async handle(command: RejectLateArrivalCommand): Promise<AttendanceResult> {
    // 1. Find attendance
    const attendanceId = AttendanceId.fromNumber(command.attendanceId);
    const attendance = await this.attendanceRepo.findById(attendanceId);

    if (!attendance) {
      throw new AttendanceNotFoundError(command.attendanceId);
    }

    // 2. Execute domain logic
    attendance.rejectLateArrival(command.approverId);

    // 3. Update persistence
    await this.attendanceRepo.update(attendance);

    // 4. Return result
    return AttendanceResult.fromDomain(attendance);
  }
}