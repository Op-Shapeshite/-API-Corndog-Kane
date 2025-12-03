import { AggregateRoot } from '../base/AggregateRoot';
import { MaterialId, SupplierId, Quantity, UnitQuantity, Price } from '../value-objects/InventoryValueObjects';
import { StockInCreatedEvent, StockInUpdatedEvent, LowStockAlertEvent } from '../events/InventoryEvents';

/**
 * Stock In Record Value Object
 */
export interface StockInRecord {
  id: number;
  materialId: MaterialId;
  supplierId: SupplierId;
  quantity: Quantity;
  unitQuantity: UnitQuantity;
  price: Price;
  createdAt: Date;
}

/**
 * Inventory Aggregate Root
 * Manages stock levels for a material
 */
export class Inventory extends AggregateRoot {
  private constructor(
    private readonly materialId: MaterialId,
    private readonly materialName: string,
    private stockIns: StockInRecord[],
    private totalStockIn: Quantity,
    private totalStockOut: Quantity,
    private readonly lowStockThreshold: number = 10
  ) {
    super();
  }

  /**
   * Factory method: Create new inventory for a material
   */
  static create(
    materialId: MaterialId,
    materialName: string,
    lowStockThreshold: number = 10
  ): Inventory {
    return new Inventory(
      materialId,
      materialName,
      [],
      Quantity.zero(),
      Quantity.zero(),
      lowStockThreshold
    );
  }

  /**
   * Factory method: Reconstruct from persistence
   */
  static fromPersistence(
    materialId: MaterialId,
    materialName: string,
    stockIns: StockInRecord[],
    totalStockIn: Quantity,
    totalStockOut: Quantity,
    lowStockThreshold: number = 10
  ): Inventory {
    return new Inventory(
      materialId,
      materialName,
      stockIns,
      totalStockIn,
      totalStockOut,
      lowStockThreshold
    );
  }

  /**
   * Business method: Add stock in
   */
  addStockIn(
    stockInId: number,
    supplierId: SupplierId,
    quantity: Quantity,
    unitQuantity: UnitQuantity,
    price: Price
  ): void {
    const record: StockInRecord = {
      id: stockInId,
      materialId: this.materialId,
      supplierId,
      quantity,
      unitQuantity,
      price,
      createdAt: new Date(),
    };

    this.stockIns.push(record);
    this.totalStockIn = this.totalStockIn.add(quantity);

    // Raise domain event
    this.raiseEvent(new StockInCreatedEvent(
      stockInId,
      this.materialId.getValue(),
      supplierId.getValue(),
      quantity.getValue(),
      unitQuantity.getValue(),
      price.getValue()
    ));
  }

  /**
   * Business method: Update stock in record
   */
  updateStockIn(
    stockInId: number,
    newQuantity: Quantity
  ): void {
    const record = this.stockIns.find(r => r.id === stockInId);
    if (!record) {
      throw new Error(`Stock in record ${stockInId} not found`);
    }

    const oldQuantity = record.quantity;
    const difference = newQuantity.getValue() - oldQuantity.getValue();

    // Update total stock in
    if (difference > 0) {
      this.totalStockIn = this.totalStockIn.add(Quantity.create(difference));
    } else if (difference < 0) {
      this.totalStockIn = this.totalStockIn.subtract(Quantity.create(Math.abs(difference)));
    }

    // Raise domain event
    this.raiseEvent(new StockInUpdatedEvent(
      stockInId,
      this.materialId.getValue(),
      oldQuantity.getValue(),
      newQuantity.getValue()
    ));
  }

  /**
   * Business method: Process stock out
   */
  processStockOut(quantity: Quantity): void {
    const currentStock = this.getCurrentStock();
    if (currentStock.isLessThan(quantity)) {
      throw new Error(`Insufficient stock. Available: ${currentStock.getValue()}, Requested: ${quantity.getValue()}`);
    }

    this.totalStockOut = this.totalStockOut.add(quantity);

    // Check for low stock alert
    const newStock = this.getCurrentStock();
    if (newStock.getValue() <= this.lowStockThreshold) {
      this.raiseEvent(new LowStockAlertEvent(
        this.materialId.getValue(),
        this.materialName,
        newStock.getValue(),
        this.lowStockThreshold
      ));
    }
  }

  /**
   * Query: Get current stock level
   */
  getCurrentStock(): Quantity {
    const stockIn = this.totalStockIn.getValue();
    const stockOut = this.totalStockOut.getValue();
    return Quantity.create(stockIn - stockOut);
  }

  /**
   * Query: Check if low stock
   */
  isLowStock(): boolean {
    return this.getCurrentStock().getValue() <= this.lowStockThreshold;
  }

  /**
   * Getters
   */
  getMaterialId(): MaterialId {
    return this.materialId;
  }

  getMaterialName(): string {
    return this.materialName;
  }

  getStockIns(): StockInRecord[] {
    return [...this.stockIns];
  }

  getTotalStockIn(): Quantity {
    return this.totalStockIn;
  }

  getTotalStockOut(): Quantity {
    return this.totalStockOut;
  }

  getLowStockThreshold(): number {
    return this.lowStockThreshold;
  }
}
