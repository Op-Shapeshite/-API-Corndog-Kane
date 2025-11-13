import { TMasterProduct, TMasterProductWithID, TProductInventoryWithMaterial, TProductInventoryRequest } from "../entities/product/masterProduct";
import { MasterProductRepository } from "../../adapters/postgres/repositories/MasterProductRepository";
import { Service } from "./Service";

export default class MasterProductService extends Service<TMasterProduct | TMasterProductWithID> {
  declare repository: MasterProductRepository;

  constructor(repository: MasterProductRepository) {
    super(repository);
  }

  /**
   * Get all master products without pagination
   */
  async getAllMasterProducts(): Promise<TMasterProductWithID[]> {
    return await this.repository.getAllMasterProducts();
  }

  /**
   * Get master product by ID
   */
  async getMasterProductById(id: number): Promise<TMasterProductWithID | null> {
    return await this.repository.getMasterProductById(id);
  }

  /**
   * Create or update product inventories
   */
  async upsertProductInventories(productId: number, inventories: TProductInventoryRequest[]): Promise<TProductInventoryWithMaterial[]> {
    // Validate master product exists
    const masterProduct = await this.repository.getMasterProductById(productId);
    if (!masterProduct) {
      throw new Error(`Master product with ID ${productId} not found`);
    }

    // Process each inventory item
    for (const inv of inventories) {
      await this.repository.updateProductInventory(
        productId,
        inv.material_id,
        inv.quantity
      );
    }

    // Return updated inventories
    return await this.repository.getProductInventories(productId);
  }

  /**
   * Get product inventories
   */
  async getProductInventories(productId: number): Promise<TProductInventoryWithMaterial[]> {
    return await this.repository.getProductInventories(productId);
  }
}
