import { IScheduleRepository, WorkSchedule } from '../../../core/domain/repositories/IScheduleRepository';
import { OutletId } from '../../../core/domain/value-objects/OutletId';
import { DateTime, WeekDay } from '../../../core/domain/value-objects/DateTime';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Schedule Repository Adapter
 * Slim repository implementing domain contract - only data access
 */
export class PrismaScheduleRepository implements IScheduleRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async findByOutletAndDay(outletId: OutletId, day: WeekDay): Promise<WorkSchedule[]> {
    try {
      const prismaSettings = await this.prisma.outletSetting.findMany({
        where: {
          outlet_id: outletId.getValue(),
          day: { has: day.getValue() as any },
        },
        orderBy: {
          check_in_time: 'asc',
        },
      });

      return prismaSettings.map(setting => {
        const checkinTime = this.parseTimeString(setting.check_in_time);
        const checkoutTime = this.parseTimeString(setting.check_out_time);

        return new WorkSchedule(
          day,
          checkinTime,
          checkoutTime,
          outletId
        );
      });
    } catch (error) {
      throw new Error(`Failed to find schedules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findActiveScheduleForOutlet(outletId: OutletId, date: DateTime): Promise<WorkSchedule | null> {
    try {
      const day = date.getWeekDay();
      const schedules = await this.findByOutletAndDay(outletId, day);

      // Return the first (earliest) schedule for the day
      return schedules.length > 0 ? schedules[0] : null;
    } catch (error) {
      throw new Error(`Failed to find active schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse time string (HH:MM:SS) to DateTime for today
   */
  private parseTimeString(timeString: string): DateTime {
    const [hours, minutes, seconds = 0] = timeString.split(':').map(Number);
    const today = new Date();
    today.setHours(hours, minutes, seconds || 0, 0);
    
    return DateTime.fromDate(today);
  }
}