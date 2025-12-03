import { DomainEvent } from '../base/AggregateRoot';

/**
 * Domain Event: Stock In Created
 * Raised when materials are stocked in
 */
export class StockInCreatedEvent extends DomainEvent {
  constructor(
    public readonly stockInId: number,
    public readonly materialId: number,
    public readonly supplierId: number,
    public readonly quantity: number,
    public readonly unitQuantity: string,
    public readonly price: number
  ) {
    super();
  }
}

/**
 * Domain Event: Stock In Updated
 * Raised when a stock in record is updated
 */
export class StockInUpdatedEvent extends DomainEvent {
  constructor(
    public readonly stockInId: number,
    public readonly materialId: number,
    public readonly oldQuantity: number,
    public readonly newQuantity: number
  ) {
    super();
  }
}

/**
 * Domain Event: Material Created
 * Raised when a new material is created during stock in
 */
export class MaterialCreatedEvent extends DomainEvent {
  constructor(
    public readonly materialId: number,
    public readonly materialName: string,
    public readonly isActive: boolean
  ) {
    super();
  }
}

/**
 * Domain Event: Low Stock Alert
 * Raised when inventory falls below threshold
 */
export class LowStockAlertEvent extends DomainEvent {
  constructor(
    public readonly materialId: number,
    public readonly materialName: string,
    public readonly currentStock: number,
    public readonly threshold: number
  ) {
    super();
  }
}

/**
 * Domain Event: Stock Out Processed
 * Raised when materials are consumed/used
 */
export class StockOutProcessedEvent extends DomainEvent {
  constructor(
    public readonly stockOutId: number,
    public readonly materialId: number,
    public readonly quantity: number,
    public readonly remainingStock: number
  ) {
    super();
  }
}
