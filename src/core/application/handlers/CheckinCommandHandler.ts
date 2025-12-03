import { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import { IScheduleRepository } from '../../domain/repositories/IScheduleRepository';
import { CheckinCommand } from '../commands/AttendanceCommands';
import { AttendanceResult } from '../dtos/AttendanceResults';
import { Attendance } from '../../domain/aggregates/Attendance';
import { ImageProof } from '../../domain/value-objects/SharedTypes';
import { AttendanceAlreadyExistsError, NoScheduleFoundError } from '../../domain/exceptions/AttendanceExceptions';

/**
 * Domain Service: Duplicate Attendance Checker
 */
export class DuplicateAttendanceChecker {
  constructor(private attendanceRepo: IAttendanceRepository) {}

  async ensureNoTodayAttendance(employeeId: number, date: Date): Promise<void> {
    const employeeIdVO = { getValue: () => employeeId } as any;
    const dateVO = { startOfDay: () => ({ getValue: () => date }) } as any;
    
    const exists = await this.attendanceRepo.existsForEmployeeOnDate(employeeIdVO, dateVO);
    
    if (exists) {
      throw new AttendanceAlreadyExistsError(employeeId, date);
    }
  }
}

/**
 * Command Handler: Checkin
 */
export class CheckinCommandHandler {
  constructor(
    private attendanceRepo: IAttendanceRepository,
    private employeeRepo: IEmployeeRepository,
    private scheduleRepo: IScheduleRepository,
    private duplicateChecker: DuplicateAttendanceChecker
  ) {}

  async handle(command: CheckinCommand): Promise<AttendanceResult> {
    // 1. Validate employee exists and is assigned to outlet
    const employee = await this.employeeRepo.findById(command.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const isAssigned = await this.employeeRepo.isEmployeeAssignedToOutlet(
      command.employeeId, 
      command.outletId, 
      command.checkinTime
    );

    if (!isAssigned) {
      throw new Error('Employee is not assigned to this outlet');
    }

    // 2. Check for duplicate attendance
    await this.duplicateChecker.ensureNoTodayAttendance(
      command.employeeId.getValue(), 
      command.checkinTime.getValue()
    );

    // 3. Get outlet schedule for the day
    const schedule = await this.scheduleRepo.findActiveScheduleForOutlet(
      command.outletId, 
      command.checkinTime
    );

    if (!schedule) {
      throw new NoScheduleFoundError(
        command.outletId.getValue(), 
        command.checkinTime.getWeekDay().getValue()
      );
    }

    // 4. Create attendance aggregate
    const imageProof = ImageProof.fromPath(command.imageProofPath);
    
    const attendance = Attendance.create(
      command.employeeId,
      command.outletId,
      command.checkinTime,
      imageProof,
      schedule.getCheckinTime(),
      command.lateNotes,
      command.latePresentProofPath
    );

    // 5. Persist aggregate
    await this.attendanceRepo.save(attendance);

    // 6. Return result
    return AttendanceResult.fromDomain(attendance);
  }
}