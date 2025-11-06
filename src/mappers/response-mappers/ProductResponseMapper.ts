import {  TProductGetResponse, TProductWithID } from "../../core/entities/product/product";

export class ProductResponseMapper {
	static toListResponse(product: TProductWithID & { stock?: number }): TProductGetResponse {
		return {
			id: product.id,
      name: product.name,
      image_path: product.imagePath,
      description: product.description,
      price: product.price,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        is_active: product.category.isActive,
      } : null,
			is_active: product.isActive,
			stock: product.stock,
			created_at: product.createdAt.toISOString(),
			updated_at: product.updatedAt.toISOString(),
		};
	}
}
