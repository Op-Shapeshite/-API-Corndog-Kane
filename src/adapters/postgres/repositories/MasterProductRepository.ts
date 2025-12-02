/* eslint-disable @typescript-eslint/no-explicit-any */
import { TMasterProduct, TMasterProductWithID } from "../../../core/entities/product/masterProduct";
import { MasterProductRepository as IMasterProductRepository } from "../../../core/repositories/masterProduct";
import Repository from "./Repository";
import { ProductMaster, ProductCategory as Category } from "@prisma/client";
import { TProductInventoryUpdateRequest } from "../../../core/entities/product/productInventory";

export class MasterProductRepository
	extends Repository<TMasterProduct | TMasterProductWithID>
	implements IMasterProductRepository {
	constructor() {
		super("productMaster");
	}

	async create(item: TMasterProduct): Promise<TMasterProductWithID> {
		const created = await this.prisma.productMaster.create({
			data: {
				name: item.name,
				category_id: item.categoryId,
				is_active: item.isActive ?? true,
			},
		});

		return this.mapToEntity(created);
	}

	async update(id: string, item: Partial<TMasterProduct>): Promise<TMasterProductWithID> {
		const numericId = parseInt(id, 10);
		const updated = await this.prisma.productMaster.update({
			where: { id: numericId },
			data: {
				...(item.name !== undefined && { name: item.name }),
				...(item.categoryId !== undefined && { category_id: item.categoryId }),
				...(item.isActive !== undefined && { is_active: item.isActive }),
			},
		});

		return this.mapToEntity(updated);
	}

	async delete(id: string): Promise<void> {
		await this.prisma.productMaster.delete({
			where: { id: parseInt(id, 10) },
		});
	}

	async getById(id: string | number): Promise<TMasterProductWithID | null> {
		const record = await this.prisma.productMaster.findUnique({
			where: { id: typeof id === "string" ? parseInt(id, 10) : id },
			include: {
				category: true,
			},
		});

		return record ? this.mapToEntity(record) : null;
	}

	// Product Inventory methods
	async getProductInventory(masterProductId: number) {
		const inventories = await this.prisma.productInventory.findMany({
			where: {
				product_id: masterProductId,
			},
			include: {
				material: true,
			},
		});

		return inventories.map(inventory => ({
			id: inventory.id,
			productId: inventory.product_id,
			unit_quantity: inventory.unit_quantity,
			quantity: inventory.quantity,
			materialId: inventory.material_id,
			material: {
				id: inventory.material.id,
				name: inventory.material.name,
				supplier_id: inventory.material.suplier_id,
				is_active: inventory.material.is_active,
				created_at: inventory.material.createdAt,
				updated_at: inventory.material.updatedAt,
			},
			createdAt: inventory.createdAt,
			updatedAt: inventory.updatedAt,
		}));
	}

	async createProductInventory(data: any) {
		console.log(data);
		const created = await this.prisma.productInventory.create({
			data: {
				product_id: data.product_id,
				quantity: data.quantity,
				unit_quantity: data.unit_quantity,
				material_id: data.material_id,
			},
			include: {
				material: true,
			},
		});

		return {
			id: created.id,
			materials: created.material,
			createdAt: created.createdAt,
			updatedAt: created.updatedAt,
		};
	}

	async updateProductInventory(masterProductId: number, materialId: number, data: TProductInventoryUpdateRequest) {
		// Find the existing product inventory record by product_id and material_id
		const existing = await this.prisma.productInventory.findFirst({
			where: {
				product_id: masterProductId,
				material_id: materialId,
			},
		});

		if (!existing) {
			throw new Error(`Product inventory for product ${masterProductId} and material ${materialId} not found`);
		}

		const updated = await this.prisma.productInventory.update({
			where: {
				id: existing.id, // Use the primary key
			},
			data: {
				...(data.quantity !== undefined && { quantity: data.quantity }),
				...(data.unit !== undefined && { unit_quantity: data.unit }), // Update unit if provided
			},
			include: {
				material: true,
			},
		});

		return {
			id: updated.id,
			productId: updated.product_id,
			quantity: updated.quantity,
			unit: updated.unit_quantity, // Return the unit for consistency
			materialId: updated.material_id,
			material: {
				id: updated.material.id,
				name: updated.material.name,
				supplier_id: updated.material.suplier_id,
				is_active: updated.material.is_active,
				created_at: updated.material.createdAt,
				updated_at: updated.material.updatedAt,
			},
			createdAt: updated.createdAt,
			updatedAt: updated.updatedAt,
		};
	}

	// Product Inventory Transaction methods
	async createProductInventoryTransaction(data: {
		product_id: number;
		material_id: number;
		quantity: number;
		unit_quantity: string;
	}): Promise<any> {
		const created = await this.prisma.productInventoryTransaction.upsert({
			where: {
				product_id_material_id: {
					product_id: data.product_id,
					material_id: data.material_id,
				},
			},
			update: {
				quantity: data.quantity,
				unit_quantity: data.unit_quantity,
			},
			create: {
				product_id: data.product_id,
				material_id: data.material_id,
				quantity: data.quantity,
				unit_quantity: data.unit_quantity,
			},
			include: {
				material: true,
			},
		});

		return {
			id: created.id,
			product_id: created.product_id,
			material_id: created.material_id,
			quantity: created.quantity,
			unit_quantity: created.unit_quantity,
			material: created.material,
			createdAt: created.createdAt,
			updatedAt: created.updatedAt,
		};
	}

	async getProductInventoryTransactions(productId: number): Promise<any[]> {
		const transactions = await this.prisma.productInventoryTransaction.findMany({
			where: {
				product_id: productId,
			},
			include: {
				material: true,
			},
		});

		return transactions.map(transaction => ({
			id: transaction.id,
			product_id: transaction.product_id,
			material_id: transaction.material_id,
			quantity: transaction.quantity,
			unit_quantity: transaction.unit_quantity,
			material: {
				id: transaction.material.id,
				name: transaction.material.name,
				supplier_id: transaction.material.suplier_id,
				is_active: transaction.material.is_active,
				created_at: transaction.material.createdAt,
				updated_at: transaction.material.updatedAt,
			},
			createdAt: transaction.createdAt,
			updatedAt: transaction.updatedAt,
		}));
	}

	private mapToEntity(record: ProductMaster & { category?: Category | null }): TMasterProductWithID {
		return {
			id: record.id,
			name: record.name,
			categoryId: record.category_id,
			category: record.category ? {
				id: record.category.id,
				name: record.category.name,
				is_active: record.category.is_active,
				created_at: record.category.createdAt.toISOString(),
				updated_at: record.category.updatedAt.toISOString(),
			} : null,
			isActive: record.is_active,
			createdAt: record.createdAt,
			updatedAt: record.updatedAt,
		};
	}
}