import { OutletId } from '../value-objects/OutletId';
import { DateTime, WeekDay } from '../value-objects/DateTime';
import { Minutes } from '../value-objects/Minutes';

/**
 * WorkSchedule Value Object
 * Represents outlet working schedule for a specific day
 */
export class WorkSchedule {
  constructor(
    private readonly day: WeekDay,
    private readonly checkinTime: DateTime,
    private readonly checkoutTime: DateTime,
    private readonly outletId: OutletId
  ) {}

  getDay(): WeekDay {
    return this.day;
  }

  getCheckinTime(): DateTime {
    return this.checkinTime;
  }

  getCheckoutTime(): DateTime {
    return this.checkoutTime;
  }

  getOutletId(): OutletId {
    return this.outletId;
  }

  calculateLateness(actualCheckinTime: DateTime): Minutes {
    const scheduledMinutes = this.checkinTime.getTimeInMinutes();
    const actualMinutes = actualCheckinTime.getTimeInMinutes();
    
    const lateMinutes = Math.max(0, actualMinutes - scheduledMinutes);
    return Minutes.fromNumber(lateMinutes);
  }

  allowsCheckinAt(time: DateTime): boolean {
    // Business rule: Allow checkin from 30 minutes before to 2 hours after scheduled time
    const earlyThreshold = this.checkinTime.subtractMinutes(30);
    const lateThreshold = this.checkinTime.addMinutes(120);
    
    return !time.isBefore(earlyThreshold) && !time.isAfter(lateThreshold);
  }

  isWorkingDay(): boolean {
    return true; // All scheduled days are working days
  }
}

/**
 * Pure Domain Repository Interface for Schedule
 */
export interface IScheduleRepository {
  /**
   * Find schedule for outlet on specific day
   */
  findByOutletAndDay(outletId: OutletId, day: WeekDay): Promise<WorkSchedule[]>;

  /**
   * Find active schedule for outlet on specific date
   */
  findActiveScheduleForOutlet(outletId: OutletId, date: DateTime): Promise<WorkSchedule | null>;
}