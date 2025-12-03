/**
 * DateTime Value Object
 * Represents date and time with business operations
 */
export class DateTime {
  private constructor(private readonly value: Date) {}

  static fromDate(date: Date): DateTime {
    return new DateTime(new Date(date));
  }

  static now(): DateTime {
    return new DateTime(new Date());
  }

  static fromString(dateString: string): DateTime {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${dateString}`);
    }
    return new DateTime(date);
  }

  getValue(): Date {
    return new Date(this.value);
  }

  isBefore(other: DateTime): boolean {
    return this.value < other.value;
  }

  isAfter(other: DateTime): boolean {
    return this.value > other.value;
  }

  isSameDay(other: DateTime): boolean {
    return this.value.toDateString() === other.value.toDateString();
  }

  getHour(): number {
    return this.value.getHours();
  }

  getMinute(): number {
    return this.value.getMinutes();
  }

  getTimeInMinutes(): number {
    return this.value.getHours() * 60 + this.value.getMinutes();
  }

  getWeekDay(): WeekDay {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return WeekDay.fromString(days[this.value.getDay()]);
  }

  subtractMinutes(minutes: number): DateTime {
    const newDate = new Date(this.value);
    newDate.setMinutes(newDate.getMinutes() - minutes);
    return new DateTime(newDate);
  }

  addMinutes(minutes: number): DateTime {
    const newDate = new Date(this.value);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return new DateTime(newDate);
  }

  startOfDay(): DateTime {
    const date = new Date(this.value);
    date.setHours(0, 0, 0, 0);
    return new DateTime(date);
  }

  endOfDay(): DateTime {
    const date = new Date(this.value);
    date.setHours(23, 59, 59, 999);
    return new DateTime(date);
  }

  equals(other: DateTime): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  toString(): string {
    return this.value.toISOString();
  }

  toTimeString(): string {
    return this.value.toTimeString().slice(0, 8); // HH:MM:SS
  }
}

/**
 * WeekDay Value Object
 */
export class WeekDay {
  private constructor(private readonly value: string) {}

  static fromString(day: string): WeekDay {
    const validDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const upperDay = day.toUpperCase();
    
    if (!validDays.includes(upperDay)) {
      throw new Error(`Invalid week day: ${day}`);
    }
    
    return new WeekDay(upperDay);
  }

  static fromDate(date: Date): WeekDay {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return new WeekDay(days[date.getDay()]);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: WeekDay): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}