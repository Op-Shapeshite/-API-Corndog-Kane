/**
 * Outlet ID Value Object
 * Strong-typed identifier for outlet records
 */
export class OutletId {
  private constructor(private readonly value: number) {
    if (value <= 0) {
      throw new Error('OutletId must be a positive number');
    }
  }

  static fromNumber(value: number): OutletId {
    return new OutletId(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: OutletId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}