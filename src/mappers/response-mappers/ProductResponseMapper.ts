import { TProductAssignedResponse, TProductGetResponse, TProductWithID, TProductWithMaterial } from "../../core/entities/product/product";

export class ProductResponseMapper {
	static toResponse(product: TProductWithID & { stock?: number; materials?: Array<{ materialId: number; materialName: string; quantity: number; unitQuantity: string }> }): TProductGetResponse {
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
			materials: product.materials?.map(material => ({
				material_id: material.materialId,
				material_name: material.materialName,
				quantity: material.quantity,
				unit_quantity: material.unitQuantity,
			})),
			created_at: product.createdAt?.toISOString() || new Date().toISOString(),
			updated_at: product.updatedAt?.toISOString() || new Date().toISOString(),
		};
	}

	static toListResponse(products: (TProductWithID & { stock?: number })[]): TProductGetResponse[] {
		return products.map(product => this.toResponse(product));
	}
	static toResponseWithMaterial(product: TProductWithMaterial): TProductAssignedResponse {
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
			materials: product.materials.map(material => ({
				id: material.id,
				name: material.name,
				suplier_id: material.suplier_id,
				quantity: material.quantity,
			})),
		};
	}
}
