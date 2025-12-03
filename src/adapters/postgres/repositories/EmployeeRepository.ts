import { TEmployee } from "../../../core/entities/employee/employee";
import { TAttendanceWithID } from "../../../core/entities/employee/attendance";
import { EmployeeRepository as IEmployeeRepository } from "../../../core/repositories/employee";
import Repository from "./Repository";
import { EntityMapper } from "../../../mappers/EntityMapper";
import { AttendanceMapperEntity } from "../../../mappers/mappers/AttendanceMapperEntity";
import { DAY, AttendanceStatus, ApprovalStatus } from "@prisma/client";

export default class EmployeeRepository
  extends Repository<TEmployee>
  implements IEmployeeRepository
{
  private attendanceMapper: EntityMapper<TAttendanceWithID>;

  constructor() {
    super("employee");
    this.attendanceMapper = new EntityMapper<TAttendanceWithID>(AttendanceMapperEntity);
  }

  async getSchedules(
    view?: string, 
    startDate?: string, 
    endDate?: string,
    status?: string,
    searchKey?: string,
    searchValue?: string,
    page?: number,
    limit?: number
  ) {
    const dateFilter: { checkin_time?: { gte?: Date; lte?: Date } } = {};
    if (startDate || endDate) {
      dateFilter.checkin_time = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.checkin_time.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.checkin_time.lte = end;
      }
    }
    const statusFilter: { attendance_status?: AttendanceStatus } = {};
    if (status) {
      statusFilter.attendance_status = status as AttendanceStatus;
    }
    const searchFilter: {
      employee?: { name?: { contains: string; mode: 'insensitive' } };
      outlet?: { name?: { contains: string; mode: 'insensitive' } };
      attendance_status?: AttendanceStatus;
      late_approval_status?: ApprovalStatus;
    } = {};
    if (searchKey && searchValue) {
      switch (searchKey) {
        case 'employee_name':
          searchFilter.employee = {
            name: {
              contains: searchValue,
              mode: 'insensitive',
            },
          };
          break;
        case 'outlet_name':
          searchFilter.outlet = {
            name: {
              contains: searchValue,
              mode: 'insensitive',
            },
          };
          break;
        case 'attendance_status':
          searchFilter.attendance_status = searchValue as AttendanceStatus;
          break;
        case 'late_approval_status':
          searchFilter.late_approval_status = searchValue as ApprovalStatus;
          break;
      }
    }
    if (view === 'table') {
      const currentPage = page && page > 0 ? page : 1;
      const pageSize = limit && limit > 0 ? limit : 10;
      const skip = (currentPage - 1) * pageSize;
      const total = await this.prisma.attendance.count({
        where: {
          is_active: true,
          ...dateFilter,
          ...statusFilter,
          ...searchFilter,
        },
      });

      const attendances = await this.prisma.attendance.findMany({
        where: {
          is_active: true,
          ...dateFilter,
          ...statusFilter,
          ...searchFilter,
        },
        select: {
          id: true,
          employee: {
            select: {
              name: true,
              image_path: true, // Added: employee image path
            },
          },
          outlet: {
            select: {
              name: true, // Added: outlet name
            },
          },
          checkin_time: true,
          checkin_image_proof: true,
          checkout_time: true,
          checkout_image_proof: true,
          attendance_status: true,
          late_minutes: true,
          late_present_proof: true,
          late_notes: true,
          late_approval_status: true,
        },
        orderBy: {
          checkin_time: 'desc',
        },
        skip,
        take: pageSize,
      });

      return {
        data: attendances,
        pagination: {
          total,
          page: currentPage,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }
    // Note: Date filtering only applies to attendance (table view)
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
   * Automatically calculates late_minutes by comparing checkin_time with outlet check_in_time
   */
  async checkin(
    employeeId: number, 
    outletId: number, 
    imagePath: string,
    lateNotes?: string,
    latePresentProof?: string
  ): Promise<TAttendanceWithID> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
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
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const day = days[now.getDay()];
    // Allow check-in at any time (early or late) - just need a schedule for the day
    const settings = await this.prisma.outletSetting.findMany({
      where: {
        outlet_id: outletId,
        day: { has: day as DAY },
      },
      orderBy: {
        check_in_time: 'asc', // Get earliest check-in time for the day
      },
    });

    if (settings.length === 0) {
      throw new Error(`No schedule found for ${day} at this outlet. Please contact your manager to set up outlet schedules.`);
    }
    // This represents the scheduled check-in time to calculate lateness
    const setting = settings[0];
    const [outletHour, outletMinute] = setting.check_in_time.split(':').map(Number);
    
    // Convert to minutes for comparison
    const outletTimeInMinutes = outletHour * 60 + outletMinute;
    const lateMinutes = Math.max(0, currentTimeInMinutes - outletTimeInMinutes);
    const attendance = await this.prisma.attendance.create({
      data: {
        employee_id: employeeId,
        outlet_id: outletId,
        checkin_image_proof: imagePath,
        checkin_time: new Date(),
        late_minutes: lateMinutes,
        late_notes: lateNotes || null,
        late_present_proof: latePresentProof || null,
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
      late_minutes: number;
      late_notes: string | null;
      late_present_proof: string | null;
      is_active: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>; 
    total: number 
  }> {
    const skip = (page - 1) * limit;
    const whereClause: Record<string, unknown> = {
      outlet_id: outletId,
      is_active: true,
    };
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
    const total = await this.prisma.attendance.count({
      where: whereClause,
    });
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
    return { data: attendances, total };
  }

  /**
   * Update late approval status for an attendance record
   * PATCH /employees/:id/:status
   */
  async updateLateApprovalStatus(
    attendanceId: number,
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
  ): Promise<TAttendanceWithID> {
    const updated = await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        late_approval_status: status,
      },
    });

    return this.attendanceMapper.mapToEntity(updated) as TAttendanceWithID;
  }
}
