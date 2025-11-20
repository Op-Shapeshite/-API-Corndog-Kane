import {  TProductGetResponse, TProductWithID } from "../../core/entities/product/product";

export class ProductResponseMapper {
	static toResponse(product: TProductWithID & { stock?: number }): TProductGetResponse {
		return {
			id: product.id,
      name: product.name,
      image_path: product.imagePath,
      description: product.description,
      hpp: product.hpp,
      price: product.price,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        is_active: product.category.isActive,
      } : null,
			is_active: product.isActive,
			stock: product.stock,
			created_at: product.createdAt?.toISOString() || new Date().toISOString(),
			updated_at: product.updatedAt?.toISOString() || new Date().toISOString(),
		};
	}

	static toListResponse(products: (TProductWithID & { stock?: number })[]): TProductGetResponse[] {
		return products.map(product => this.toResponse(product));
	}
}
