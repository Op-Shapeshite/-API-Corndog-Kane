import { IMaterialRepository, ISupplierRepository } from '../repositories/IInventoryRepository';
import { InventoryDomainService, ValidationResult } from '../services/InventoryDomainService';
import { MaterialId, SupplierId, Quantity, UnitQuantity, Price, StockInItem, StockInItemData } from '../value-objects/InventoryValueObjects';
import { Inventory } from '../aggregates/Inventory';

/**
 * Stock In Command for factory
 */
export interface StockInFactoryCommand {
  materialId?: number;
  materialName?: string;
  materialIsActive?: boolean;
  supplierId: number;
  quantity: number;
  unitQuantity: string;
  price: number;
}

/**
 * Stock In Result from factory
 */
export interface StockInFactoryResult {
  stockInId: number;
  materialId: number;
  materialName: string;
  supplierId: number;
  supplierName: string;
  quantity: number;
  unitQuantity: string;
  price: number;
  currentStock: number;
  createdAt: Date;
}

/**
 * Inventory Factory
 * Handles complex object creation with domain validation
 */
export class InventoryFactory {
  constructor(
    private readonly materialRepository: IMaterialRepository,
    private readonly supplierRepository: ISupplierRepository,
    private readonly domainService: InventoryDomainService
  ) {}

  /**
   * Create stock in items from raw data
   */
  createStockInItems(items: StockInItemData[]): StockInItem[] {
    return items.map(item => StockInItem.create(item));
  }

  /**
   * Validate and prepare stock in transaction
   */
  async validateStockInCommand(command: StockInFactoryCommand): Promise<ValidationResult> {
    try {
      const materialId = command.materialId ? MaterialId.create(command.materialId) : null;
      const supplierId = SupplierId.create(command.supplierId);
      const quantity = Quantity.create(command.quantity);
      const unitQuantity = UnitQuantity.create(command.unitQuantity);

      return await this.domainService.validateStockInBusiness(
        materialId,
        command.materialName || null,
        supplierId,
        quantity,
        unitQuantity
      );
    } catch (error) {
      return ValidationResult.failure(
        error instanceof Error ? error.message : 'Validation error'
      );
    }
  }

  /**
   * Create or get material for stock in
   */
  async getOrCreateMaterial(command: StockInFactoryCommand): Promise<number> {
    if (command.materialId) {
      // Verify material exists
      const materialId = MaterialId.create(command.materialId);
      const material = await this.materialRepository.findById(materialId);
      if (!material) {
        throw new Error(`Material dengan ID ${command.materialId} tidak ditemukan`);
      }
      return command.materialId;
    }

    if (command.materialName) {
      // Create new material
      const newMaterial = await this.materialRepository.createMaterial({
        name: command.materialName,
        isActive: command.materialIsActive ?? true,
      });
      return newMaterial.id;
    }

    throw new Error('Material harus disediakan');
  }

  /**
   * Create inventory aggregate from material data
   */
  async createInventoryAggregate(materialId: number): Promise<Inventory> {
    const matId = MaterialId.create(materialId);
    const material = await this.materialRepository.getMaterialWithStocks(matId);

    if (!material) {
      throw new Error(`Material dengan ID ${materialId} tidak ditemukan`);
    }

    // Calculate current stocks
    const totalStockIn = Quantity.create(
      material.materialIn.reduce((sum, item) => sum + item.quantity, 0)
    );
    const totalStockOut = Quantity.create(
      material.materialOut.reduce((sum, item) => sum + item.quantity, 0)
    );

    // Create stock in records
    const stockInRecords = material.materialIn.map(item => ({
      id: item.id,
      materialId: MaterialId.create(item.materialId),
      supplierId: SupplierId.create(item.suplierId || 0),
      quantity: Quantity.create(item.quantity),
      unitQuantity: UnitQuantity.create(item.quantityUnit),
      price: Price.create(item.price),
      createdAt: item.createdAt,
    }));

    return Inventory.fromPersistence(
      matId,
      material.name,
      stockInRecords,
      totalStockIn,
      totalStockOut
    );
  }

  /**
   * Build stock in result from created record
   */
  async buildStockInResult(
    stockInId: number,
    materialId: number,
    supplierId: number,
    quantity: number,
    unitQuantity: string,
    price: number
  ): Promise<StockInFactoryResult> {
    const matId = MaterialId.create(materialId);
    const supId = SupplierId.create(supplierId);

    const material = await this.materialRepository.getMaterialWithStocks(matId);
    if (!material) {
      throw new Error('Material tidak ditemukan setelah pembuatan stock-in');
    }

    const supplier = await this.supplierRepository.findById(supId);

    const totalStockIn = material.materialIn.reduce((sum, item) => sum + item.quantity, 0);
    const totalStockOut = material.materialOut.reduce((sum, item) => sum + item.quantity, 0);
    const currentStock = totalStockIn - totalStockOut;

    return {
      stockInId,
      materialId,
      materialName: material.name,
      supplierId,
      supplierName: supplier?.name || 'Unknown',
      quantity,
      unitQuantity,
      price,
      currentStock,
      createdAt: new Date(),
    };
  }
}
