import { InventoryApplicationService } from '../../core/application/InventoryApplicationService';
import { StockInBatchResult, StockInResult, BuyListResult } from '../../core/application/commands/InventoryCommands';
import { SearchConfig as DomainSearchConfig } from '../../core/domain/repositories/IInventoryRepository';

/**
 * Legacy Request Types (from existing InventoryService)
 */
export interface LegacyStockInRequest {
  items: LegacyStockInItem[];
}

export interface LegacyStockInItem {
  material_id?: number;
  material?: {
    name: string;
    is_active?: boolean;
  };
  supplier_id: number;
  quantity: number;
  unit_quantity: string;
  price: number;
}

export interface LegacyStockInUpdateRequest {
  material_id?: number;
  material?: {
    name: string;
    is_active?: boolean;
  };
  supplier_id: number;
  quantity: number;
  unit_quantity: string;
  price: number;
}

export interface LegacySearchConfig {
  field: string;
  value: string;
}

/**
 * Legacy Response Types (for backward compatibility)
 */
export interface LegacyStockInEntity {
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

export interface LegacyStockInBatchEntity {
  successCount: number;
  failedCount: number;
  totalCount: number;
  items: LegacyStockInEntity[];
  errors?: Array<{
    index: number;
    item: LegacyStockInItem;
    error: string;
  }>;
}

export interface LegacyBuyListItemEntity {
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

/**
 * Legacy Inventory Service Adapter (Anti-Corruption Layer)
 * Wraps the new hexagonal InventoryApplicationService to provide
 * backward-compatible interface for existing code
 */
export class LegacyInventoryServiceAdapter {
  constructor(
    private readonly applicationService: InventoryApplicationService
  ) {}

  /**
   * Adapter: Stock In (batch processing)
   * Translates legacy request format to hexagonal commands
   */
  async stockIn(data: LegacyStockInRequest): Promise<LegacyStockInBatchEntity> {
    // Translate legacy request to domain format
    const items = data.items.map(item => ({
      materialId: item.material_id,
      materialName: item.material?.name,
      materialIsActive: item.material?.is_active,
      supplierId: item.supplier_id,
      quantity: item.quantity,
      unitQuantity: item.unit_quantity,
      price: item.price,
    }));

    // Execute via application service
    const result: StockInBatchResult = await this.applicationService.stockIn(items);

    // Translate back to legacy format
    return this.translateToLegacyBatchResult(result, data.items);
  }

  /**
   * Adapter: Get Buy List
   * Translates legacy pagination to hexagonal query
   */
  async getBuyList(
    page: number = 1,
    limit: number = 10,
    searchConfig?: LegacySearchConfig[]
  ): Promise<{ data: LegacyBuyListItemEntity[]; total: number }> {
    const domainSearchConfig: DomainSearchConfig[] | undefined = searchConfig?.map(s => ({
      field: s.field,
      value: s.value,
    }));

    const result: BuyListResult = await this.applicationService.getBuyList(
      page,
      limit,
      domainSearchConfig
    );

    return {
      data: result.data.map(item => ({
        id: item.id,
        itemType: item.itemType,
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        unitQuantity: item.unitQuantity,
        price: item.price,
        supplier: item.supplier,
        purchasedAt: item.purchasedAt,
      })),
      total: result.total,
    };
  }

  /**
   * Adapter: Update Stock In
   * Translates legacy update request to hexagonal command
   */
  async updateStockIn(
    id: number,
    data: LegacyStockInUpdateRequest
  ): Promise<LegacyStockInEntity> {
    const result: StockInResult = await this.applicationService.updateStockIn(id, {
      materialId: data.material_id,
      materialName: data.material?.name,
      materialIsActive: data.material?.is_active,
      supplierId: data.supplier_id,
      quantity: data.quantity,
      unitQuantity: data.unit_quantity,
      price: data.price,
    });

    return this.translateToLegacyResult(result);
  }

  /**
   * Private: Translate hexagonal batch result to legacy format
   */
  private translateToLegacyBatchResult(
    result: StockInBatchResult,
    originalItems: LegacyStockInItem[]
  ): LegacyStockInBatchEntity {
    return {
      successCount: result.successCount,
      failedCount: result.failedCount,
      totalCount: result.totalCount,
      items: result.items.map(item => this.translateToLegacyResult(item)),
      ...(result.errors && {
        errors: result.errors.map(error => ({
          index: error.index,
          item: originalItems[error.index],
          error: error.error,
        })),
      }),
    };
  }

  /**
   * Private: Translate hexagonal result to legacy format
   */
  private translateToLegacyResult(result: StockInResult): LegacyStockInEntity {
    return {
      id: result.id,
      itemType: result.itemType,
      itemName: result.itemName,
      quantity: result.quantity,
      unitQuantity: result.unitQuantity,
      price: result.price,
      supplier: result.supplier,
      currentStock: result.currentStock,
      createdAt: result.createdAt,
    };
  }
}
