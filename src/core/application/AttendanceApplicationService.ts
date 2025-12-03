import { CheckinCommandHandler, DuplicateAttendanceChecker } from './handlers/CheckinCommandHandler';
import { CheckoutCommandHandler, ApproveLateArrivalCommandHandler, RejectLateArrivalCommandHandler } from './handlers/AttendanceCommandHandlers';
import { GetTodayAttendanceQueryHandler, GetAttendanceDetailsQueryHandler, GetOutletAttendancesQueryHandler } from './handlers/AttendanceQueryHandlers';
import { IAttendanceRepository } from '../domain/repositories/IAttendanceRepository';
import { IEmployeeRepository } from '../domain/repositories/IEmployeeRepository';
import { IScheduleRepository } from '../domain/repositories/IScheduleRepository';

/**
 * Application Service: Attendance Application Service
 * Coordinates between Commands, Queries and Domain Services
 */
export class AttendanceApplicationService {
  private checkinHandler: CheckinCommandHandler;
  private checkoutHandler: CheckoutCommandHandler;
  private approveLateHandler: ApproveLateArrivalCommandHandler;
  private rejectLateHandler: RejectLateArrivalCommandHandler;
  private getTodayAttendanceHandler: GetTodayAttendanceQueryHandler;
  private getAttendanceDetailsHandler: GetAttendanceDetailsQueryHandler;
  private getOutletAttendancesHandler: GetOutletAttendancesQueryHandler;

  constructor(
    attendanceRepo: IAttendanceRepository,
    employeeRepo: IEmployeeRepository,
    scheduleRepo: IScheduleRepository
  ) {
    const duplicateChecker = new DuplicateAttendanceChecker(attendanceRepo);
    
    // Initialize command handlers
    this.checkinHandler = new CheckinCommandHandler(
      attendanceRepo,
      employeeRepo,
      scheduleRepo,
      duplicateChecker
    );
    
    this.checkoutHandler = new CheckoutCommandHandler(attendanceRepo);
    this.approveLateHandler = new ApproveLateArrivalCommandHandler(attendanceRepo);
    this.rejectLateHandler = new RejectLateArrivalCommandHandler(attendanceRepo);

    // Initialize query handlers
    this.getTodayAttendanceHandler = new GetTodayAttendanceQueryHandler(attendanceRepo);
    this.getAttendanceDetailsHandler = new GetAttendanceDetailsQueryHandler(attendanceRepo);
    this.getOutletAttendancesHandler = new GetOutletAttendancesQueryHandler(attendanceRepo);
  }

  // Command methods
  get checkin() { return this.checkinHandler; }
  get checkout() { return this.checkoutHandler; }
  get approveLate() { return this.approveLateHandler; }
  get rejectLate() { return this.rejectLateHandler; }

  // Query methods
  get getTodayAttendance() { return this.getTodayAttendanceHandler; }
  get getAttendanceDetails() { return this.getAttendanceDetailsHandler; }
  get getOutletAttendances() { return this.getOutletAttendancesHandler; }
}