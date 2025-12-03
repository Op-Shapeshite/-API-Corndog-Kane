import { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import { GetTodayAttendanceQuery, GetAttendanceDetailsQuery, GetOutletAttendancesQuery } from '../queries/AttendanceQueries';
import { AttendanceResult, AttendanceListView } from '../dtos/AttendanceResults';
import { AttendanceNotFoundError } from '../../domain/exceptions/AttendanceExceptions';
import { AttendanceId } from '../../domain/value-objects/AttendanceId';

/**
 * Query Handler: Get Today's Attendance
 */
export class GetTodayAttendanceQueryHandler {
  constructor(private attendanceRepo: IAttendanceRepository) {}

  async handle(query: GetTodayAttendanceQuery): Promise<AttendanceResult | null> {
    const attendance = await this.attendanceRepo.findTodayAttendance(
      query.employeeId, 
      query.date
    );

    return attendance ? AttendanceResult.fromDomain(attendance) : null;
  }
}

/**
 * Query Handler: Get Attendance Details
 */
export class GetAttendanceDetailsQueryHandler {
  constructor(private attendanceRepo: IAttendanceRepository) {}

  async handle(query: GetAttendanceDetailsQuery): Promise<AttendanceResult> {
    const attendance = await this.attendanceRepo.findById(query.attendanceId);

    if (!attendance) {
      throw new AttendanceNotFoundError(query.attendanceId.getValue());
    }

    return AttendanceResult.fromDomain(attendance);
  }
}

/**
 * Query Handler: Get Outlet Attendances
 */
export class GetOutletAttendancesQueryHandler {
  constructor(private attendanceRepo: IAttendanceRepository) {}

  async handle(query: GetOutletAttendancesQuery): Promise<AttendanceListView> {
    // In a real CQRS implementation, this would use a read model
    const attendances = await this.attendanceRepo.findByOutletAndDateRange(
      query.outletId,
      query.startDate,
      query.endDate
    );

    // For pagination, we would need to modify the repository method
    // This is a simplified version
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedAttendances = attendances.slice(startIndex, endIndex);

    return AttendanceListView.create(
      paginatedAttendances,
      attendances.length,
      query.page,
      query.limit
    );
  }
}