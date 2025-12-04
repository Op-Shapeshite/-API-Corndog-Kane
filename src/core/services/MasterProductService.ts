/* eslint-disable @typescript-eslint/no-explicit-any */
import { TMasterProduct, TMasterProductWithID } from "../entities/product/masterProduct";
import { MasterProductRepository } from "../../adapters/postgres/repositories/MasterProductRepository";
import { Service } from "./Service";
import { TProductInventory, TProductInventoryCreateRequest, TProductInventoryUpdateRequest } from "../entities/product/productInventory";
import { ProductRepository } from "../../adapters/postgres/repositories/ProductRepository";
import MaterialRepository from "../../adapters/postgres/repositories/MaterialRepository";
import QuantityUnitService from "./QuantityUnitService";
import QuantityUnitRepository from "../../adapters/postgres/repositories/QuantityUnitRepository";
import { normalizeUnit } from "../utils/unitNormalizer";

export default class MasterProductService extends Service<TMasterProduct | TMasterProductWithID> {
  declare repository: MasterProductRepository;
  private productRepository: ProductRepository;
  private materialRepository: MaterialRepository;
  private quantityUnitService: QuantityUnitService;

  constructor(repository: MasterProductRepository) {
    super(repository);
    this.materialRepository = new MaterialRepository();
    this.productRepository = new ProductRepository();
    this.quantityUnitService = new QuantityUnitService(new QuantityUnitRepository());
  }

  async getAll({ category_id }: { category_id?: number }): Promise<TMasterProductWithID[]> {
    const result = await this.repository.getAll(
      undefined,
      undefined,
      undefined,
      category_id ? { category_id } : undefined,
      { id: "asc" }
    );
    return result.data as TMasterProductWithID[];
  }

  async getProductInventory(masterProductId: number): Promise<any[]> {
    return await this.repository.getProductInventory(masterProductId);
  }

  async createProductInventory(data: TProductInventoryCreateRequest): Promise<TProductInventory> {
    // Normalize units first
    const normalizedProductUnit = normalizeUnit(data.unit);
    const materialsWithNormalizedUnits = data.materials.map(material => ({
      ...material,
      unit: normalizeUnit(material.unit)
    }));
    
    // STEP 1: VALIDATION - Do all validation BEFORE any database writes
    // VALIDATION: Check material stock availability before creating inventory
    for (const material of materialsWithNormalizedUnits) {
      const requiredQuantity = material.quantity * data.quantity;
      const materialWithStocks = await this.materialRepository.getMaterialWithStocks(material.material_id);

      if (!materialWithStocks) {
        throw new Error(`Material dengan ID ${material.material_id} tidak ditemukan di database. Pastikan material sudah terdaftar sebelum digunakan dalam produk master`);
      }
      let totalStockIn = 0;
      for (const item of materialWithStocks.materialIn) {
        totalStockIn += await this.quantityUnitService.convertQuantity(item.quantityUnit, material.unit, item.quantity);
      }

      let totalStockOut = 0;
      for (const item of materialWithStocks.materialOut) {
        totalStockOut += await this.quantityUnitService.convertQuantity(item.quantityUnit, material.unit, item.quantity);
      }

      const availableStock = totalStockIn - totalStockOut;
      if (availableStock < requiredQuantity) {
        throw new Error(
          `Stok material "${materialWithStocks.name}" tidak mencukupi. ` +
          `Stok tersedia: ${availableStock} ${material.unit}, Dibutuhkan: ${requiredQuantity} ${material.unit}. ` +
          `Silakan lakukan stock-in material terlebih dahulu`
        );
      }
    }

    // STEP 2: DATABASE OPERATIONS - All validation passed, now create everything in transaction
    let masterProduct: TMasterProduct | undefined;
    
    // Prepare master product creation data if needed
    if (data.product_id === undefined) {
      masterProduct = {
        name: data.product_name || "Unnamed Product",
        categoryId: data.category_id,
        isActive: true,
      };
    }

    try {
      const result = await this.repository.createProductInventoryWithTransaction({
        masterProduct,
        productId: data.product_id,
        inventoryItems: materialsWithNormalizedUnits.map(material => ({
          material_id: material.material_id,
          quantity: material.quantity,
          unit_quantity: material.unit,
        })),
        productionStockIn: {
          quantity: data.quantity,
          unit_quantity: normalizedProductUnit,
        },
        materialStockOuts: materialsWithNormalizedUnits.map(material => ({
          material_id: material.material_id,
          quantity: material.quantity * data.quantity,
          unit_quantity: material.unit,
        })),
      });

      return {
        id: result.productId,
        quantity: data.quantity,
        unit_quantity: normalizedProductUnit,
        material: result.inventoryItems.map((m: any) => m.materials) as any[],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
    } catch (error) {
      // Transaction ensures no partial data is created, so no manual cleanup needed
      throw error;
    }
  }

  async updateProductInventory(
    masterProductId: number,
    data: TProductInventoryUpdateRequest
  ): Promise<any> {

    const masterProduct = await this.repository.getById(masterProductId);
    if (!masterProduct) {
      throw new Error(`Produk master dengan ID ${masterProductId} tidak ditemukan. Pastikan ID produk master yang digunakan sudah benar`);
    }
    const existingInventory = await this.repository.getProductInventory(masterProductId);
    if (existingInventory.length === 0) {
      throw new Error(`Inventori produk untuk produk master dengan ID ${masterProductId} tidak ditemukan`);
    }

    // Normalize unit if provided
    const productUnit = data.unit ? normalizeUnit(data.unit) : existingInventory[0]?.unit_quantity;
    if (!productUnit) {
      throw new Error(`Unit produk tidak ditemukan. Harap sediakan unit dalam permintaan atau pastikan inventori produk memiliki unit yang valid`);
    }

    let materialsUpdated: any[] = existingInventory.map(item =>
      ({ material_id: item.materialId, quantity: item.quantity, unit: item.unit_quantity })
    );
    const materials: any[] = data.materials 
      ? data.materials.map(material => ({
          ...material,
          unit: normalizeUnit(material.unit)
        }))
      : materialsUpdated;

    // VALIDATION: Check material stock availability before updating inventory
    if (materials && materials.length > 0) {
      for (const material of materials) {
        const requiredQuantity = material.quantity * data.quantity;
        const materialWithStocks = await this.materialRepository.getMaterialWithStocks(material.material_id);

        if (!materialWithStocks) {
          throw new Error(`Material dengan ID ${material.material_id} tidak ditemukan di database. Pastikan material sudah terdaftar sebelum digunakan`);
        }
        let totalStockIn = 0;
        for (const item of materialWithStocks.materialIn) {
          totalStockIn += await this.quantityUnitService.convertQuantity(item.quantityUnit, material.unit, item.quantity);
        }

        let totalStockOut = 0;
        for (const item of materialWithStocks.materialOut) {
          totalStockOut += await this.quantityUnitService.convertQuantity(item.quantityUnit, material.unit, item.quantity);
        }

        const availableStock = totalStockIn - totalStockOut;
        if (availableStock < requiredQuantity) {
          throw new Error(
            `Stok material "${materialWithStocks.name}" tidak mencukupi untuk update produk inventori. ` +
            `Stok tersedia: ${availableStock} ${material.unit}, Dibutuhkan: ${requiredQuantity} ${material.unit}. ` +
            `Silakan lakukan stock-in material terlebih dahulu`
          );
        }
      }
    }

    // Only proceed with stock operations if all validations pass
    try {
      await this.productRepository.createStockInProduction(masterProductId, data.quantity, productUnit);
      if (materials && materials.length > 0) {
        materialsUpdated = materials.map(async (material: any) => new Promise((resolve) => {
          const inventoryData: any = {
            material_id: material.material_id,
            quantity: material.quantity,
            unit_quantity: material.unit,
          };
          resolve(this.repository.updateProductInventory(masterProductId, material.material_id, inventoryData));
        }));
        await Promise.all(
          materials.map(async (material) => {
            return this.materialRepository.createStockOut({
              materialId: material.material_id,
              quantityUnit: material.unit,
              quantity: material.quantity * data.quantity,
            });
          })
        );
      }
      
      return await Promise.all([...materialsUpdated]);
    } catch (error) {
      throw error;
    }

    // return await this.repository.updateProductInventory(masterProductId, materialId, data);
  }
}