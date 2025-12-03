/**
 * Employee ID Value Object
 * Strong-typed identifier for employee records
 */
export class EmployeeId {
  private constructor(private readonly value: number) {
    if (value <= 0) {
      throw new Error('EmployeeId must be a positive number');
    }
  }

  static fromNumber(value: number): EmployeeId {
    return new EmployeeId(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: EmployeeId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}