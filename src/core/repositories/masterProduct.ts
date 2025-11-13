import { TMasterProduct, TMasterProductWithID, TProductInventory, TProductInventoryWithMaterial } from "../entities/product/masterProduct";
import { Repository } from "./Repository";

export interface MasterProductRepository extends Repository<TMasterProduct | TMasterProductWithID> {
  /**
   * Get all master products without pagination
   */
  getAllMasterProducts(): Promise<TMasterProductWithID[]>;
  
  /**
   * Get master product by ID with category
   */
  getMasterProductById(id: number): Promise<TMasterProductWithID | null>;
  
  /**
   * Create product inventory
   */
  createProductInventory(productId: number, materialId: number, quantity: number): Promise<TProductInventory>;
  
  /**
   * Update product inventory
   */
  updateProductInventory(productId: number, materialId: number, quantity: number): Promise<TProductInventory>;
  
  /**
   * Get product inventories by product ID
   */
  getProductInventories(productId: number): Promise<TProductInventoryWithMaterial[]>;
  
  /**
   * Delete product inventory
   */
  deleteProductInventory(productId: number, materialId: number): Promise<void>;
}
