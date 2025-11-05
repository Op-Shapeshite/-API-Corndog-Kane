import { TEmployee } from "../../../core/entities/employee/employee";
import { TAttendanceWithID } from "../../../core/entities/employee/attendance";
import { EmployeeRepository as IEmployeeRepository } from "../../../core/repositories/employee";
import Repository from "./Repository";
import { EntityMapper } from "../../../mappers/EntityMapper";
import { AttendanceMapperEntity } from "../../../mappers/mappers/AttendanceMapperEntity";

export default class EmployeeRepository
  extends Repository<TEmployee>
  implements IEmployeeRepository
{
  private attendanceMapper: EntityMapper<TAttendanceWithID>;

  constructor() {
    super("employee");
    this.attendanceMapper = new EntityMapper<TAttendanceWithID>(AttendanceMapperEntity);
  }

  async getSchedules() {
    const schedules = await this.prisma.outletEmployee.findMany({
      where: {
        is_active: true,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            phone: true,
            nik: true,
            address: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
            location: true,
            check_in_time: true,
            check_out_time: true,
          },
        },
      },
      orderBy: {
        assigned_at: 'desc',
      },
    });

    return schedules;
  }

  /**
   * Check-in: Create a new attendance record
   */
  async checkin(employeeId: number, outletId: number, imagePath: string): Promise<TAttendanceWithID> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already checked in today
    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        employee_id: employeeId,
        checkin_time: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingAttendance) {
      throw new Error('Already checked in today');
    }

    // Create new attendance record
    const attendance = await this.prisma.attendance.create({
      data: {
        employee_id: employeeId,
        outlet_id: outletId,
        checkin_image_proof: imagePath,
        checkin_time: new Date(),
      },
    });

    return this.attendanceMapper.mapToEntity(attendance) as TAttendanceWithID;
  }

  /**
   * Checkout: Update today's attendance record with checkout info
   */
  async checkout(employeeId: number, imagePath: string): Promise<TAttendanceWithID> {
    const todayAttendance = await this.findTodayAttendance(employeeId);

    if (!todayAttendance) {
      throw new Error('No check-in record found for today');
    }

    if (todayAttendance.checkoutTime) {
      throw new Error('Already checked out today');
    }

    // Update with checkout info
    const updated = await this.prisma.attendance.update({
      where: { id: todayAttendance.id },
      data: {
        checkout_image_proof: imagePath,
        checkout_time: new Date(),
      },
    });

    return this.attendanceMapper.mapToEntity(updated) as TAttendanceWithID;
  }

  /**
   * Find today's attendance record for an employee
   */
  async findTodayAttendance(employeeId: number): Promise<TAttendanceWithID | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await this.prisma.attendance.findFirst({
      where: {
        employee_id: employeeId,
        checkin_time: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (!attendance) {
      return null;
    }

    return this.attendanceMapper.mapToEntity(attendance) as TAttendanceWithID;
  }

  /**
   * Find employee scheduled for outlet based on user_id for today
   * Returns the employee_id of the active employee assigned to the outlet today
   */
  async findScheduledEmployeeByUserId(userId: number): Promise<number | null> {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // First, find the outlet associated with this user
    const outlet = await this.prisma.outlet.findFirst({
      where: {
        user_id: userId,
      },
      include: {
        outlet_employee: {
          where: {
            is_active: true,
            assigned_at: {
              gte: today,  // Assigned on or after start of today
              lt: tomorrow, // Assigned before start of tomorrow
            },
          },
          select: {
            employee_id: true,
            assigned_at: true,
          },
          orderBy: {
            assigned_at: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!outlet || outlet.outlet_employee.length === 0) {
      return null;
    }

    return outlet.outlet_employee[0].employee_id;
  }

  /**
   * Get attendances by outlet with optional date filter and pagination
   * Returns raw Prisma data with relations - ResponseMapper should be used in Controller
   */
  async getAttendancesByOutlet(
    outletId: number,
    date?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ 
    data: Array<{
      id: number;
      employee: {
        id: number;
        name: string;
        nik: string;
        phone: string;
        address: string;
      };
      outlet: {
        id: number;
        name: string;
        code: string;
        location: string;
      };
      checkin_image_proof: string;
      checkout_image_proof: string | null;
      checkin_time: Date;
      checkout_time: Date | null;
      is_active: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>; 
    total: number 
  }> {
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: Record<string, unknown> = {
      outlet_id: outletId,
      is_active: true,
    };

    // If date is provided, filter by that date
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      whereClause.checkin_time = {
        gte: targetDate,
        lt: nextDay,
      };
    }

    // Get total count
    const total = await this.prisma.attendance.count({
      where: whereClause,
    });

    // Get paginated data with employee and outlet details
    const attendances = await this.prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            nik: true,
            phone: true,
            address: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
            location: true,
          },
        },
      },
      orderBy: {
        checkin_time: 'desc',
      },
      skip,
      take: limit,
    });

    // Return raw data - mapping to response format happens in Controller layer
    return { data: attendances, total };
  }
}
