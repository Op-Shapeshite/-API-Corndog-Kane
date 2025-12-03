import { IAttendanceRepository } from '../../../core/domain/repositories/IAttendanceRepository';
import { Attendance } from '../../../core/domain/aggregates/Attendance';
import { AttendanceId } from '../../../core/domain/value-objects/AttendanceId';
import { EmployeeId } from '../../../core/domain/value-objects/EmployeeId';
import { OutletId } from '../../../core/domain/value-objects/OutletId';
import { DateTime } from '../../../core/domain/value-objects/DateTime';
import { PrismaClient } from '@prisma/client';
import { AttendanceEntityMapper } from '../../../mappers/attendance/AttendanceEntityMapper';

/**
 * Prisma Attendance Repository Adapter
 * Slim repository implementing domain contract - only data access
 */
export class PrismaAttendanceRepository implements IAttendanceRepository {
  private prisma: PrismaClient;
  private mapper: AttendanceEntityMapper;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
    this.mapper = new AttendanceEntityMapper();
  }

  async save(attendance: Attendance): Promise<void> {
    try {
      const prismaData = this.mapper.toPersistence(attendance);
      await this.prisma.attendance.create({ data: prismaData });
    } catch (error) {
      throw new Error(`Failed to save attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: AttendanceId): Promise<Attendance | null> {
    try {
      const prismaAttendance = await this.prisma.attendance.findUnique({
        where: { id: id.getValue() },
      });

      return prismaAttendance ? this.mapper.toDomain(prismaAttendance) : null;
    } catch (error) {
      throw new Error(`Failed to find attendance by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findTodayAttendance(employeeId: EmployeeId, date: DateTime): Promise<Attendance | null> {
    try {
      const startOfDay = date.startOfDay().getValue();
      const endOfDay = date.endOfDay().getValue();

      const prismaAttendance = await this.prisma.attendance.findFirst({
        where: {
          employee_id: employeeId.getValue(),
          checkin_time: {
            gte: startOfDay,
            lte: endOfDay,
          },
          is_active: true,
        },
      });

      return prismaAttendance ? this.mapper.toDomain(prismaAttendance) : null;
    } catch (error) {
      throw new Error(`Failed to find today attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async existsForEmployeeOnDate(employeeId: EmployeeId, date: DateTime): Promise<boolean> {
    try {
      const startOfDay = date.startOfDay().getValue();
      const endOfDay = date.endOfDay().getValue();

      const count = await this.prisma.attendance.count({
        where: {
          employee_id: employeeId.getValue(),
          checkin_time: {
            gte: startOfDay,
            lte: endOfDay,
          },
          is_active: true,
        },
      });

      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check attendance existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByOutletAndDateRange(
    outletId: OutletId,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<Attendance[]> {
    try {
      const prismaAttendances = await this.prisma.attendance.findMany({
        where: {
          outlet_id: outletId.getValue(),
          checkin_time: {
            gte: startDate.getValue(),
            lte: endDate.getValue(),
          },
          is_active: true,
        },
        orderBy: {
          checkin_time: 'desc',
        },
      });

      return prismaAttendances.map(attendance => this.mapper.toDomain(attendance));
    } catch (error) {
      throw new Error(`Failed to find attendances by outlet and date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByEmployeeAndDateRange(
    employeeId: EmployeeId,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<Attendance[]> {
    try {
      const prismaAttendances = await this.prisma.attendance.findMany({
        where: {
          employee_id: employeeId.getValue(),
          checkin_time: {
            gte: startDate.getValue(),
            lte: endDate.getValue(),
          },
          is_active: true,
        },
        orderBy: {
          checkin_time: 'desc',
        },
      });

      return prismaAttendances.map(attendance => this.mapper.toDomain(attendance));
    } catch (error) {
      throw new Error(`Failed to find attendances by employee and date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(attendance: Attendance): Promise<void> {
    try {
      const prismaData = this.mapper.toPersistence(attendance);
      await this.prisma.attendance.update({
        where: { id: attendance.getId().getValue() },
        data: prismaData,
      });
    } catch (error) {
      throw new Error(`Failed to update attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async remove(id: AttendanceId): Promise<void> {
    try {
      await this.prisma.attendance.update({
        where: { id: id.getValue() },
        data: { is_active: false },
      });
    } catch (error) {
      throw new Error(`Failed to remove attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}