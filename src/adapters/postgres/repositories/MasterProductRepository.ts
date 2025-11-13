import { TMasterProduct, TMasterProductWithID, TProductInventory, TProductInventoryWithMaterial } from "../../../core/entities/product/masterProduct";
import { MasterProductRepository as IMasterProductRepository } from "../../../core/repositories/masterProduct";
import Repository from "./Repository";

export class MasterProductRepository
  extends Repository<TMasterProduct | TMasterProductWithID>
  implements IMasterProductRepository
{
  constructor() {
    super("productMaster");
  }

  /**
   * Get all master products without pagination
   */
  async getAllMasterProducts(): Promise<TMasterProductWithID[]> {
    const masterProducts = await this.prisma.productMaster.findMany({
      where: {
        is_active: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return masterProducts.map(mp => ({
      id: mp.id,
      name: mp.name,
      categoryId: mp.category_id,
      isActive: mp.is_active,
      createdAt: mp.createdAt,
      updatedAt: mp.updatedAt,
    }));
  }

  /**
   * Get master product by ID with category
   */
  async getMasterProductById(id: number): Promise<TMasterProductWithID | null> {
    const masterProduct = await this.prisma.productMaster.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!masterProduct) return null;

    return {
      id: masterProduct.id,
      name: masterProduct.name,
      categoryId: masterProduct.category_id,
      isActive: masterProduct.is_active,
      createdAt: masterProduct.createdAt,
      updatedAt: masterProduct.updatedAt,
    };
  }

  /**
   * Create product inventory
   */
  async createProductInventory(productId: number, materialId: number, quantity: number): Promise<TProductInventory> {
    const inventory = await this.prisma.productInventory.create({
      data: {
        product_id: productId,
        material_id: materialId,
        quantity: quantity,
      },
    });

    return {
      id: inventory.id,
      productId: inventory.product_id,
      materialId: inventory.material_id,
      quantity: inventory.quantity,
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
    };
  }

  /**
   * Update product inventory
   */
  async updateProductInventory(productId: number, materialId: number, quantity: number): Promise<TProductInventory> {
    // Check if inventory exists
    const existing = await this.prisma.productInventory.findFirst({
      where: {
        product_id: productId,
        material_id: materialId,
      },
    });

    if (!existing) {
      // Create if not exists
      return this.createProductInventory(productId, materialId, quantity);
    }

    // Update existing
    const inventory = await this.prisma.productInventory.update({
      where: {
        id: existing.id,
      },
      data: {
        quantity: quantity,
      },
    });

    return {
      id: inventory.id,
      productId: inventory.product_id,
      materialId: inventory.material_id,
      quantity: inventory.quantity,
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
    };
  }

  /**
   * Get product inventories by product ID
   */
  async getProductInventories(productId: number): Promise<TProductInventoryWithMaterial[]> {
    const inventories = await this.prisma.productInventory.findMany({
      where: {
        product_id: productId,
      },
      include: {
        material: {
          select: {
            id: true,
            name: true,
            suplier_id: true,
          },
        },
      },
    });

    return inventories.map(inv => ({
      id: inv.id,
      productId: inv.product_id,
      materialId: inv.material_id,
      quantity: inv.quantity,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
      material: {
        id: inv.material.id,
        name: inv.material.name,
        suplierId: inv.material.suplier_id,
      },
    }));
  }

  /**
   * Delete product inventory
   */
  async deleteProductInventory(productId: number, materialId: number): Promise<void> {
    await this.prisma.productInventory.deleteMany({
      where: {
        product_id: productId,
        material_id: materialId,
      },
    });
  }
}
