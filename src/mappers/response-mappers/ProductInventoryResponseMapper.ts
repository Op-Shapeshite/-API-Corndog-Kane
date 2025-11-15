import { TProductInventory, TProductInventoryGetResponse } from "../../core/entities/product/productInventory";

export class ProductInventoryResponseMapper {
  static toResponse(entity: TProductInventory): TProductInventoryGetResponse {
    console.log(entity);
    return {
      id: entity.id,
      quantity: entity.quantity,
      material: entity.materials ? entity.materials : [],
    };
  }
}