/**
 * Value Object: Material ID
 */
export class MaterialId {
  private constructor(private readonly value: number) {
    if (value <= 0) {
      throw new Error('Material ID must be a positive number');
    }
  }

  static create(value: number): MaterialId {
    return new MaterialId(value);
  }

  static fromNumber(value: number): MaterialId {
    return new MaterialId(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: MaterialId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}

/**
 * Value Object: Supplier ID
 */
export class SupplierId {
  private constructor(private readonly value: number) {
    if (value <= 0) {
      throw new Error('Supplier ID must be a positive number');
    }
  }

  static create(value: number): SupplierId {
    return new SupplierId(value);
  }

  static fromNumber(value: number): SupplierId {
    return new SupplierId(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: SupplierId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}

/**
 * Value Object: Quantity
 */
export class Quantity {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error('Quantity cannot be negative');
    }
  }

  static create(value: number): Quantity {
    return new Quantity(value);
  }

  static zero(): Quantity {
    return new Quantity(0);
  }

  getValue(): number {
    return this.value;
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }

  subtract(other: Quantity): Quantity {
    if (other.value > this.value) {
      throw new Error('Cannot subtract: result would be negative');
    }
    return new Quantity(this.value - other.value);
  }

  isZero(): boolean {
    return this.value === 0;
  }

  isGreaterThan(other: Quantity): boolean {
    return this.value > other.value;
  }

  isLessThan(other: Quantity): boolean {
    return this.value < other.value;
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}

/**
 * Value Object: Unit Quantity (normalized unit)
 */
export class UnitQuantity {
  private static readonly SUPPORTED_UNITS = ['kg', 'gram', 'liter', 'ml', 'pcs', 'pack', 'box', 'dus'];

  private constructor(private readonly value: string) {
    if (!UnitQuantity.SUPPORTED_UNITS.includes(value.toLowerCase())) {
      throw new Error(`Unsupported unit: ${value}. Supported units: ${UnitQuantity.SUPPORTED_UNITS.join(', ')}`);
    }
  }

  static create(value: string): UnitQuantity {
    const normalized = value.trim().toLowerCase();
    return new UnitQuantity(normalized);
  }

  static isSupported(unit: string): boolean {
    return UnitQuantity.SUPPORTED_UNITS.includes(unit.trim().toLowerCase());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UnitQuantity): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Value Object: Price
 */
export class Price {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error('Price cannot be negative');
    }
  }

  static create(value: number): Price {
    return new Price(value);
  }

  static zero(): Price {
    return new Price(0);
  }

  getValue(): number {
    return this.value;
  }

  add(other: Price): Price {
    return new Price(this.value + other.value);
  }

  multiply(factor: number): Price {
    return new Price(this.value * factor);
  }

  equals(other: Price): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}

/**
 * Value Object: Stock In Item
 */
export interface StockInItemData {
  materialId?: number;
  materialName?: string;
  materialIsActive?: boolean;
  supplierId: number;
  quantity: number;
  unitQuantity: string;
  price: number;
}

export class StockInItem {
  private constructor(
    private readonly materialId: MaterialId | null,
    private readonly materialName: string | null,
    private readonly supplierId: SupplierId,
    private readonly quantity: Quantity,
    private readonly unitQuantity: UnitQuantity,
    private readonly price: Price
  ) {}

  static create(data: StockInItemData): StockInItem {
    return new StockInItem(
      data.materialId ? MaterialId.create(data.materialId) : null,
      data.materialName || null,
      SupplierId.create(data.supplierId),
      Quantity.create(data.quantity),
      UnitQuantity.create(data.unitQuantity),
      Price.create(data.price)
    );
  }

  getMaterialId(): MaterialId | null {
    return this.materialId;
  }

  getMaterialName(): string | null {
    return this.materialName;
  }

  getSupplierId(): SupplierId {
    return this.supplierId;
  }

  getQuantity(): Quantity {
    return this.quantity;
  }

  getUnitQuantity(): UnitQuantity {
    return this.unitQuantity;
  }

  getPrice(): Price {
    return this.price;
  }

  isNewMaterial(): boolean {
    return this.materialId === null && this.materialName !== null;
  }
}
