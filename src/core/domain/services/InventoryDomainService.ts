import { IMaterialRepository, ISupplierRepository } from '../repositories/IInventoryRepository';
import { MaterialId, SupplierId, Quantity, UnitQuantity } from '../value-objects/InventoryValueObjects';

/**
 * Validation Result
 */
export class ValidationResult {
  private constructor(
    private readonly success: boolean,
    private readonly errorMessage: string | null
  ) {}

  static success(): ValidationResult {
    return new ValidationResult(true, null);
  }

  static failure(message: string): ValidationResult {
    return new ValidationResult(false, message);
  }

  isSuccess(): boolean {
    return this.success;
  }

  isFailure(): boolean {
    return !this.success;
  }

  getError(): string | null {
    return this.errorMessage;
  }
}

/**
 * Inventory Domain Service
 * Handles complex domain logic that spans multiple aggregates
 */
export class InventoryDomainService {
  constructor(
    private readonly materialRepository: IMaterialRepository,
    private readonly supplierRepository: ISupplierRepository
  ) {}

  /**
   * Validate stock in business rules
   * Ensures material exists or can be created, supplier is valid, and units are consistent
   */
  async validateStockInBusiness(
    materialId: MaterialId | null,
    materialName: string | null,
    supplierId: SupplierId,
    quantity: Quantity,
    unitQuantity: UnitQuantity
  ): Promise<ValidationResult> {
    // Validate quantity is positive
    if (quantity.isZero()) {
      return ValidationResult.failure('Quantity harus lebih dari 0');
    }

    // Validate supplier exists
    const supplier = await this.supplierRepository.findById(supplierId);
    if (!supplier) {
      return ValidationResult.failure(
        `Supplier dengan ID ${supplierId.getValue()} tidak ditemukan. Pastikan supplier sudah terdaftar di sistem sebelum melakukan stock-in`
      );
    }

    // If material ID is provided, validate material exists and check unit consistency
    if (materialId) {
      const material = await this.materialRepository.findById(materialId);
      if (!material) {
        return ValidationResult.failure(
          `Material dengan ID ${materialId.getValue()} tidak ditemukan`
        );
      }

      // Check unit consistency
      const productInventories = await this.materialRepository.getProductInventoriesByMaterial(
        materialId.getValue()
      );

      if (productInventories.length > 0) {
        const existingUnit = productInventories[0].unit_quantity.trim().toLowerCase();
        const newUnit = unitQuantity.getValue();

        if (existingUnit !== newUnit) {
          return ValidationResult.failure(
            `Unit tidak konsisten. Product inventory menggunakan "${existingUnit}" tapi stock in menggunakan "${newUnit}"`
          );
        }
      }
    } else if (!materialName) {
      // If no material ID, material name must be provided for new material
      return ValidationResult.failure(
        'Material harus disediakan. Silakan sediakan material_id untuk material yang sudah ada atau data material untuk membuat material baru'
      );
    }

    return ValidationResult.success();
  }

  /**
   * Check unit consistency for existing materials
   */
  async checkUnitConsistency(
    materialId: MaterialId,
    newUnit: UnitQuantity
  ): Promise<{ isConsistent: boolean; existingUnit: string | null }> {
    const productInventories = await this.materialRepository.getProductInventoriesByMaterial(
      materialId.getValue()
    );

    if (productInventories.length === 0) {
      return { isConsistent: true, existingUnit: null };
    }

    const existingUnit = productInventories[0].unit_quantity.trim().toLowerCase();
    const isConsistent = existingUnit === newUnit.getValue();

    return { isConsistent, existingUnit };
  }

  /**
   * Calculate total stock for a material
   */
  async calculateMaterialStock(materialId: MaterialId): Promise<{
    totalStockIn: number;
    totalStockOut: number;
    currentStock: number;
  }> {
    const material = await this.materialRepository.getMaterialWithStocks(materialId);
    
    if (!material) {
      throw new Error(`Material dengan ID ${materialId.getValue()} tidak ditemukan`);
    }

    const totalStockIn = material.materialIn.reduce((sum, item) => sum + item.quantity, 0);
    const totalStockOut = material.materialOut.reduce((sum, item) => sum + item.quantity, 0);
    const currentStock = totalStockIn - totalStockOut;

    return { totalStockIn, totalStockOut, currentStock };
  }
}
