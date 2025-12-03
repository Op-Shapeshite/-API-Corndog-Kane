import { Inventory } from '../aggregates/Inventory';
import { MaterialId, SupplierId } from '../value-objects/InventoryValueObjects';

/**
 * Inventory Repository Port (Secondary Port)
 * Pure domain repository interface - no infrastructure dependencies
 */
export interface IInventoryRepository {
  /**
   * Save inventory aggregate
   */
  save(inventory: Inventory): Promise<void>;

  /**
   * Find inventory by material ID
   */
  findByMaterialId(materialId: MaterialId): Promise<Inventory | null>;

  /**
   * Find inventories with low stock
   */
  findLowStockItems(threshold: number): Promise<Inventory[]>;

  /**
   * Get all inventories with pagination
   */
  findAll(offset: number, limit: number): Promise<Inventory[]>;

  /**
   * Check if material exists
   */
  materialExists(materialId: MaterialId): Promise<boolean>;
}

/**
 * Material Repository Port (Secondary Port)
 * Handles material-specific operations
 */
export interface IMaterialRepository {
  /**
   * Create a new material
   */
  createMaterial(data: CreateMaterialData): Promise<MaterialData>;

  /**
   * Find material by ID
   */
  findById(materialId: MaterialId): Promise<MaterialData | null>;

  /**
   * Get material with stock information
   */
  getMaterialWithStocks(materialId: MaterialId): Promise<MaterialWithStocks | null>;

  /**
   * Get product inventories by material (for unit consistency check)
   */
  getProductInventoriesByMaterial(materialId: number): Promise<ProductInventory[]>;

  /**
   * Create stock in record
   */
  createStockIn(data: CreateStockInData): Promise<StockInData>;

  /**
   * Update stock in record
   */
  updateStockIn(id: number, data: UpdateStockInData): Promise<void>;

  /**
   * Get material purchases list with pagination
   */
  getMaterialInList(offset: number, limit: number, search?: SearchConfig[]): Promise<{ data: MaterialInData[]; total: number }>;
}

/**
 * Supplier Repository Port (Secondary Port)
 */
export interface ISupplierRepository {
  /**
   * Find supplier by ID
   */
  findById(supplierId: SupplierId): Promise<SupplierData | null>;

  /**
   * Check if supplier exists
   */
  exists(supplierId: SupplierId): Promise<boolean>;

  /**
   * Check if supplier supplies a specific material
   */
  suppliesMaterial(supplierId: SupplierId, materialId: MaterialId): Promise<boolean>;
}

/**
 * Data Transfer Types for Repository Operations
 */
export interface CreateMaterialData {
  name: string;
  isActive: boolean;
}

export interface MaterialData {
  id: number;
  name: string;
  isActive: boolean;
}

export interface MaterialWithStocks {
  id: number;
  name: string;
  isActive: boolean;
  materialIn: StockInData[];
  materialOut: StockOutData[];
}

export interface ProductInventory {
  unit_quantity: string;
}

export interface CreateStockInData {
  materialId: number;
  suplierId: number;
  quantity: number;
  price: number;
  quantityUnit: string;
}

export interface UpdateStockInData {
  materialId: number;
  suplierId: number;
  quantity: number;
  price: number;
  quantityUnit: string;
}

export interface StockInData {
  id: number;
  materialId: number;
  suplierId?: number;
  quantity: number;
  quantityUnit: string;
  price: number;
  createdAt: Date;
}

export interface StockOutData {
  id: number;
  materialId: number;
  quantity: number;
}

export interface MaterialInData {
  id: number;
  materialId: number;
  material: { name: string };
  quantity: number;
  quantityUnit: string;
  price: number;
  suplier?: { id: number; name: string } | null;
  receivedAt: Date;
}

export interface SupplierData {
  id: number;
  name: string;
}

export interface SearchConfig {
  field: string;
  value: string;
}
