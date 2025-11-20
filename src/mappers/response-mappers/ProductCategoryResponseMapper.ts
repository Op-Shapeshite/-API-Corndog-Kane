import { TCategoryGetResponse, TCategoryWithID } from "../../core/entities/product/category";

export class ProductCategoryResponseMapper {
  static toResponse(category: TCategoryWithID): TCategoryGetResponse {
    return {
      id: category.id,
      name: category.name,
      is_active: category.isActive,
      created_at: category.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: category.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  static toListResponse(categories: TCategoryWithID[]): TCategoryGetResponse[] {
    return categories.map(category => this.toResponse(category));
  }
}
