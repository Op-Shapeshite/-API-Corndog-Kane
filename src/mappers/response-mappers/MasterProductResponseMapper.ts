import { TMasterProductWithID, TMasterProductGetResponse, TProductInventoryWithMaterial, TProductInventoryResponse } from "../../core/entities/product/masterProduct";

export class MasterProductResponseMapper {
  /**
   * Map master product entity to API response
   */
  static toResponse(entity: TMasterProductWithID & { category?: { id: number; name: string; is_active: boolean } | null }): TMasterProductGetResponse {
    return {
      id: entity.id,
      name: entity.name,
      category_id: entity.categoryId,
      category: entity.category || null,
      is_active: entity.isActive,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
    };
  }

  /**
   * Map array of master products to API response
   */
  static toListResponse(entities: Array<TMasterProductWithID & { category?: { id: number; name: string; is_active: boolean } | null }>): TMasterProductGetResponse[] {
    return entities.map(entity => this.toResponse(entity));
  }
}

export class ProductInventoryResponseMapper {
  /**
   * Map product inventory entity to API response
   */
  static toResponse(entity: TProductInventoryWithMaterial): TProductInventoryResponse {
    return {
      id: entity.id,
      product_id: entity.productId,
      material_id: entity.materialId,
      material_name: entity.material.name,
      quantity: entity.quantity,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
    };
  }

  /**
   * Map array of inventories to API response
   */
  static toListResponse(entities: TProductInventoryWithMaterial[]): TProductInventoryResponse[] {
    return entities.map(entity => this.toResponse(entity));
  }
}
