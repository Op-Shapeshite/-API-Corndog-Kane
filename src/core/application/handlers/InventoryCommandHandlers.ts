import { IMaterialRepository, ISupplierRepository } from '../../domain/repositories/IInventoryRepository';
import { IEventBus } from '../../domain/ports/secondary/IEventBus';
import { InventoryFactory } from '../../domain/factories/InventoryFactory';
import { InventoryDomainService } from '../../domain/services/InventoryDomainService';
import { 
  StockInCommand, 
  SingleStockInCommand,
  UpdateStockInCommand,
  GetBuyListQuery,
  StockInResult,
  StockInBatchResult,
  BuyListResult
} from '../commands/InventoryCommands';
import { MaterialId, UnitQuantity } from '../../domain/value-objects/InventoryValueObjects';

/**
 * Normalize unit quantity for consistency
 */
function normalizeUnit(unit: string): string {
  const normalized = unit.trim().toLowerCase();
  const unitMap: Record<string, string> = {
    'kilogram': 'kg',
    'kilo': 'kg',
    'gram': 'gram',
    'g': 'gram',
    'liter': 'liter',
    'l': 'liter',
    'mililiter': 'ml',
    'milliliter': 'ml',
    'pieces': 'pcs',
    'piece': 'pcs',
    'package': 'pack',
    'carton': 'dus',
  };
  return unitMap[normalized] || normalized;
}

/**
 * Stock In Command Handler
 * Handles batch stock in processing
 */
export class StockInCommandHandler {
  constructor(
    private readonly materialRepository: IMaterialRepository,
    private readonly supplierRepository: ISupplierRepository,
    private readonly eventBus: IEventBus,
    private readonly factory: InventoryFactory,
    private readonly domainService: InventoryDomainService
  ) {}

  async handle(command: StockInCommand): Promise<StockInBatchResult> {
    const results: StockInResult[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < command.items.length; i++) {
      const item = command.items[i];
      
      try {
        const singleCommand = new SingleStockInCommand(
          item.materialId,
          item.materialName,
          item.materialIsActive,
          item.supplierId,
          item.quantity,
          item.unitQuantity,
          item.price
        );

        const singleHandler = new SingleStockInCommandHandler(
          this.materialRepository,
          this.supplierRepository,
          this.eventBus,
          this.factory,
          this.domainService
        );

        const result = await singleHandler.handle(singleCommand);
        results.push(result);
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      successCount: results.length,
      failedCount: errors.length,
      totalCount: command.items.length,
      items: results,
      ...(errors.length > 0 && { errors }),
    };
  }
}

/**
 * Single Stock In Command Handler
 * Handles individual stock in item processing
 */
export class SingleStockInCommandHandler {
  constructor(
    private readonly materialRepository: IMaterialRepository,
    private readonly supplierRepository: ISupplierRepository,
    private readonly eventBus: IEventBus,
    private readonly factory: InventoryFactory,
    private readonly domainService: InventoryDomainService
  ) {}

  async handle(command: SingleStockInCommand): Promise<StockInResult> {
    // Normalize unit
    const normalizedUnit = normalizeUnit(command.unitQuantity);

    // Validate using factory
    const validation = await this.factory.validateStockInCommand({
      materialId: command.materialId,
      materialName: command.materialName,
      materialIsActive: command.materialIsActive,
      supplierId: command.supplierId,
      quantity: command.quantity,
      unitQuantity: normalizedUnit,
      price: command.price,
    });

    if (validation.isFailure()) {
      throw new Error(validation.getError() || 'Validation failed');
    }

    // Get or create material using factory
    const materialId = await this.factory.getOrCreateMaterial({
      materialId: command.materialId,
      materialName: command.materialName,
      materialIsActive: command.materialIsActive,
      supplierId: command.supplierId,
      quantity: command.quantity,
      unitQuantity: normalizedUnit,
      price: command.price,
    });

    // Check unit consistency for existing materials
    if (command.materialId) {
      const consistency = await this.domainService.checkUnitConsistency(
        MaterialId.create(materialId),
        UnitQuantity.create(normalizedUnit)
      );
      if (!consistency.isConsistent && consistency.existingUnit) {
        console.warn(
          `⚠️  Warning: Material ID ${materialId} unit mismatch. ` +
          `Product inventory uses "${consistency.existingUnit}" but stock in uses "${normalizedUnit}". `
        );
      }
    }

    // Create stock in record
    const stockInRecord = await this.materialRepository.createStockIn({
      materialId,
      suplierId: command.supplierId,
      quantity: command.quantity,
      price: command.price,
      quantityUnit: normalizedUnit,
    });

    // Build and return result using factory
    const result = await this.factory.buildStockInResult(
      stockInRecord.id,
      materialId,
      command.supplierId,
      command.quantity,
      normalizedUnit,
      command.price
    );

    // Create inventory aggregate and publish events
    const inventory = await this.factory.createInventoryAggregate(materialId);
    const events = inventory.getUncommittedEvents();
    await this.eventBus.publishAll(events);

    return {
      id: result.stockInId,
      itemType: 'MATERIAL',
      itemName: result.materialName,
      quantity: result.quantity,
      unitQuantity: result.unitQuantity,
      price: result.price,
      supplier: {
        id: result.supplierId,
        name: result.supplierName,
      },
      currentStock: result.currentStock,
      createdAt: result.createdAt,
    };
  }
}

/**
 * Update Stock In Command Handler
 */
export class UpdateStockInCommandHandler {
  constructor(
    private readonly materialRepository: IMaterialRepository,
    private readonly supplierRepository: ISupplierRepository,
    private readonly eventBus: IEventBus,
    private readonly factory: InventoryFactory,
    private readonly domainService: InventoryDomainService
  ) {}

  async handle(command: UpdateStockInCommand): Promise<StockInResult> {
    const normalizedUnit = normalizeUnit(command.unitQuantity);

    // Validate using factory
    const validation = await this.factory.validateStockInCommand({
      materialId: command.materialId,
      materialName: command.materialName,
      materialIsActive: command.materialIsActive,
      supplierId: command.supplierId,
      quantity: command.quantity,
      unitQuantity: normalizedUnit,
      price: command.price,
    });

    if (validation.isFailure()) {
      throw new Error(validation.getError() || 'Validation failed');
    }

    // Get or create material
    const materialId = await this.factory.getOrCreateMaterial({
      materialId: command.materialId,
      materialName: command.materialName,
      materialIsActive: command.materialIsActive,
      supplierId: command.supplierId,
      quantity: command.quantity,
      unitQuantity: normalizedUnit,
      price: command.price,
    });

    // Update stock in record
    await this.materialRepository.updateStockIn(command.stockInId, {
      materialId,
      suplierId: command.supplierId,
      quantity: command.quantity,
      price: command.price,
      quantityUnit: normalizedUnit,
    });

    // Build and return result
    const result = await this.factory.buildStockInResult(
      command.stockInId,
      materialId,
      command.supplierId,
      command.quantity,
      normalizedUnit,
      command.price
    );

    return {
      id: result.stockInId,
      itemType: 'MATERIAL',
      itemName: result.materialName,
      quantity: result.quantity,
      unitQuantity: result.unitQuantity,
      price: result.price,
      supplier: {
        id: result.supplierId,
        name: result.supplierName,
      },
      currentStock: result.currentStock,
      createdAt: result.createdAt,
    };
  }
}

/**
 * Get Buy List Query Handler
 */
export class GetBuyListQueryHandler {
  constructor(
    private readonly materialRepository: IMaterialRepository
  ) {}

  async handle(query: GetBuyListQuery): Promise<BuyListResult> {
    const offset = (query.page - 1) * query.limit;
    
    const searchConfig = query.searchField && query.searchValue
      ? [{ field: query.searchField, value: query.searchValue }]
      : undefined;

    const result = await this.materialRepository.getMaterialInList(
      offset,
      query.limit,
      searchConfig
    );

    const items = result.data.map(materialIn => ({
      id: materialIn.id,
      itemType: 'MATERIAL',
      itemId: materialIn.materialId,
      itemName: materialIn.material.name,
      quantity: materialIn.quantity,
      unitQuantity: materialIn.quantityUnit,
      price: materialIn.price,
      supplier: {
        id: materialIn.suplier?.id || 0,
        name: materialIn.suplier?.name || 'Unknown',
      },
      purchasedAt: materialIn.receivedAt,
    }));

    return {
      data: items,
      total: result.total,
    };
  }
}
