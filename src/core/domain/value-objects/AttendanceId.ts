/**
 * Attendance ID Value Object
 * Strong-typed identifier for attendance records
 */
export class AttendanceId {
  private constructor(private readonly value: number) {
    if (value <= 0) {
      throw new Error('AttendanceId must be a positive number');
    }
  }

  static fromNumber(value: number): AttendanceId {
    return new AttendanceId(value);
  }

  static generate(): AttendanceId {
    // In real implementation, this would use proper ID generation
    return new AttendanceId(Math.floor(Math.random() * 1000000));
  }

  getValue(): number {
    return this.value;
  }

  equals(other: AttendanceId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}