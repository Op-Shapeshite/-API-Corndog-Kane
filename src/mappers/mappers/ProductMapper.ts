import { EntityMapper } from "../EntityMapper";
import { ProductMapperEntity } from "./ProductMapperEntity";
import { MapperUtil } from "../MapperUtil";
import { TProduct, TProductWithID } from "../../core/entities/product/product";

/**
 * Custom Product Mapper that handles product_master expansion
 * Maps product_master.name → name, product_master.category_id → categoryId, product_master.category → category
 */
export class ProductMapper extends EntityMapper<TProduct | TProductWithID> {
  constructor() {
    super(ProductMapperEntity);
  }

  /**
   * Override mapToEntity to expand product_master into name, categoryId, category, and materials
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override mapToEntity(dbRecord: any): TProduct | TProductWithID {
    // First, use parent mapper
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entity: any = super.mapToEntity(dbRecord);

    // Expand __product_master__ if it exists
    const productMaster = entity.__product_master__;

    if (productMaster) {
      entity.name = productMaster.name || '';
      entity.masterProductId = productMaster.id;
      entity.categoryId = productMaster.category_id;

      if (productMaster.category) {
        entity.category = {
          id: MapperUtil.mapId(productMaster.category.id),
          name: productMaster.category.name,
          isActive: productMaster.category.is_active,
          createdAt: MapperUtil.mapDate(productMaster.category.created_at),
          updatedAt: MapperUtil.mapDate(productMaster.category.updated_at),
        };
      } else {
        entity.category = null;
      }
      if (productMaster.productInventoryTransactions && Array.isArray(productMaster.productInventoryTransactions)) {
        entity.materials = productMaster.productInventoryTransactions.map((transaction: any) => ({
          materialId: transaction.material_id,
          materialName: transaction.material?.name || '',
          quantity: transaction.quantity,
          unitQuantity: transaction.unit_quantity,
        }));
      } else {
        entity.materials = [];
      }
      delete entity.__product_master__;
    }

    return entity as TProduct | TProductWithID;
  }
}
