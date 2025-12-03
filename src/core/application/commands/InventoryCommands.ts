import { StockInItemData } from '../../domain/value-objects/InventoryValueObjects';

/**
 * Command: Stock In
 * Process batch stock in of materials
 */
export class StockInCommand {
  constructor(
    public readonly items: StockInItemData[],
    public readonly requestedBy?: number
  ) {}
}

/**
 * Command: Single Stock In Item
 * Process single stock in item
 */
export class SingleStockInCommand {
  constructor(
    public readonly materialId?: number,
    public readonly materialName?: string,
    public readonly materialIsActive?: boolean,
    public readonly supplierId: number = 0,
    public readonly quantity: number = 0,
    public readonly unitQuantity: string = '',
    public readonly price: number = 0
  ) {}
}

/**
 * Command: Update Stock In
 * Update an existing stock in record
 */
export class UpdateStockInCommand {
  constructor(
    public readonly stockInId: number,
    public readonly materialId?: number,
    public readonly materialName?: string,
    public readonly materialIsActive?: boolean,
    public readonly supplierId: number = 0,
    public readonly quantity: number = 0,
    public readonly unitQuantity: string = '',
    public readonly price: number = 0
  ) {}
}

/**
 * Query: Get Buy List
 * Query for inventory purchases
 */
export class GetBuyListQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly searchField?: string,
    public readonly searchValue?: string
  ) {}
}

/**
 * Command Result Types
 */
export interface StockInResult {
  id: number;
  itemType: string;
  itemName: string;
  quantity: number;
  unitQuantity: string;
  price: number;
  supplier: {
    id: number;
    name: string;
  };
  currentStock: number;
  createdAt: Date;
}

export interface StockInBatchResult {
  successCount: number;
  failedCount: number;
  totalCount: number;
  items: StockInResult[];
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

export interface BuyListResult {
  data: BuyListItem[];
  total: number;
}

export interface BuyListItem {
  id: number;
  itemType: string;
  itemId: number;
  itemName: string;
  quantity: number;
  unitQuantity: string;
  price: number;
  supplier: {
    id: number;
    name: string;
  };
  purchasedAt: Date;
}
