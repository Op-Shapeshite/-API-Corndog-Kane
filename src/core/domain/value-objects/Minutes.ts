/**
 * Minutes Value Object
 * Represents duration in minutes with business operations
 */
export class Minutes {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error('Minutes cannot be negative');
    }
  }

  static fromNumber(value: number): Minutes {
    return new Minutes(Math.max(0, value));
  }

  static zero(): Minutes {
    return new Minutes(0);
  }

  getValue(): number {
    return this.value;
  }

  isZero(): boolean {
    return this.value === 0;
  }

  isPositive(): boolean {
    return this.value > 0;
  }

  add(other: Minutes): Minutes {
    return new Minutes(this.value + other.value);
  }

  subtract(other: Minutes): Minutes {
    return new Minutes(Math.max(0, this.value - other.value));
  }

  equals(other: Minutes): boolean {
    return this.value === other.value;
  }

  toString(): string {
    if (this.value === 0) return '0 minutes';
    if (this.value === 1) return '1 minute';
    return `${this.value} minutes`;
  }

  toHoursAndMinutes(): string {
    const hours = Math.floor(this.value / 60);
    const minutes = this.value % 60;
    
    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hours`;
    return `${hours} hours ${minutes} minutes`;
  }
}