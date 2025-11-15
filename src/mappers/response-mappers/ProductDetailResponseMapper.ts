import {  TProductDetailGetResponse } from "../../core/entities/product/product";

export class ProductDetailResponseMapper {
  static toResponse(entity: any): TProductDetailGetResponse {
    return {
		id: entity.id,
		name: entity.name,
		image_path: entity.image_path,
		description: entity.description,
      price: entity.price,
    hpp: entity.hpp,
		category_id: entity.category_id,
			category: entity.category
				? {
						id: entity.category.id,
						name: entity.category.name,
						is_active: entity.category.is_active,
					}
				: null,
		is_active: entity.is_active,
		created_at: entity.created_at.toISOString
			? entity.created_at.toISOString()
			: entity.created_at,
		updated_at: entity.updated_at.toISOString
			? entity.updated_at.toISOString()
			: entity.updated_at,
		materials: entity.materials || [],
    };
  }
}