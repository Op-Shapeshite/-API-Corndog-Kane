import { TMaterial, TMaterialWithID } from "../../../core/entities/material/material";
import { MaterialRepository as IMaterialRepository } from "../../../core/repositories/material";
import Repository, { SearchConfig } from "./Repository";
import { PrismaClient } from "@prisma/client";
import { EntityMapper } from "../../../mappers/EntityMapper";
import { MaterialStockInMapperEntity } from "../../../mappers/mappers/MaterialStockInMapperEntity";
import { MaterialStockOutMapperEntity } from "../../../mappers/mappers/MaterialStockOutMapperEntity";
import { MaterialWithStocksMapperEntity } from "../../../mappers/mappers/MaterialWithStocksMapperEntity";
import type {
	MaterialStockInEntity,
	MaterialStockOutEntity,
	MaterialWithStocksEntity,
	CreateStockInInput,
	CreateMaterialInput,
	CreateStockOutInput,
	PaginatedMaterialStockIn
} from "../../../core/entities/material/material";

// Re-export types for backward compatibility
export type {
	MaterialStockInEntity,
	MaterialStockOutEntity,
	MaterialWithStocksEntity,
	CreateStockInInput,
	CreateMaterialInput,
	CreateStockOutInput,
	PaginatedMaterialStockIn
};

export default class MaterialRepository
	extends Repository<TMaterial | TMaterialWithID>
	implements IMaterialRepository {
	private stockInMapper: EntityMapper<MaterialStockInEntity>;
	private stockOutMapper: EntityMapper<MaterialStockOutEntity>;
	private materialWithStocksMapper: EntityMapper<MaterialWithStocksEntity>;

	constructor() {
		super("material");
		this.stockInMapper = new EntityMapper<MaterialStockInEntity>(MaterialStockInMapperEntity);
		this.stockOutMapper = new EntityMapper<MaterialStockOutEntity>(MaterialStockOutMapperEntity);
		this.materialWithStocksMapper = new EntityMapper<MaterialWithStocksEntity>(MaterialWithStocksMapperEntity);
	}

	getPrismaClient(): PrismaClient {
		return this.prisma;
	}

	// Stock In Operations
	async createStockIn(data: CreateStockInInput): Promise<MaterialStockInEntity> {
		const dbRecord = await this.prisma.materialIn.create({
			data: {
				material_id: data.materialId,
				suplier_id: data.suplierId,
				price: data.price,
				quantity_unit: data.quantityUnit,
				quantity: data.quantity,
			},
			include: {
				material: true,
				suplier: true,
			},
		});

		// Map DB record to entity using EntityMapper
		return this.stockInMapper.mapToEntity(dbRecord);
	}

	async updateStockIn(id: number, data: CreateStockInInput): Promise<void> {
		await this.prisma.materialIn.update({
			where: { id },
			data: {
				material_id: data.materialId,
				suplier_id: data.suplierId,
				price: data.price,
				quantity_unit: data.quantityUnit,
				quantity: data.quantity,
			},
		});
	}

	async deleteStockIn(id: number): Promise<void> {
		await this.prisma.materialIn.delete({
			where: { id },
		});
	}

	async createMaterial(data: CreateMaterialInput): Promise<{ id: number }> {
		const material = await this.getModel().create({
			data: {
				name: data.name,
				is_active: data.isActive,
			},
		});
		return { id: (material as TMaterialWithID).id };
	}

	// Stock Out Operations
	async createStockOut(data: CreateStockOutInput & { description?: string }): Promise<void> {
		await this.prisma.materialOut.create({
			data: {
				material_id: data.materialId,
				quantity: data.quantity,
				quantity_unit: data.quantityUnit,
				description: data.description,
			},
		});
	}

	async getMaterialWithStocks(materialId: number): Promise<MaterialWithStocksEntity | null> {
		const dbRecord = await this.getModel().findUnique({
			where: { id: materialId },
			include: {
				material_in: true,
				material_out: true,
			},
		});

		if (!dbRecord) return null;

		// Map DB record to entity using EntityMapper
		return this.materialWithStocksMapper.mapToEntity(dbRecord);
	}

	// Buy List Operations
	async getMaterialInList(skip: number, take: number, search?: SearchConfig[]): Promise<PaginatedMaterialStockIn> {
		let whereClause: any = {};

		// Build search conditions
		if (search && search.length > 0) {
			const searchConditions = search.map(config => {
				const { field, value } = config;
				
				if (field === 'suplier.name') {
					return {
						suplier: {
							name: {
								contains: value,
								mode: 'insensitive'
							}
						}
					};
				}
				
				if (field === 'material.name') {
					return {
						material: {
							name: {
								contains: value,
								mode: 'insensitive'
							}
						}
					};
				}
				
				// Handle other searchable fields
				if (field === 'receivedAt') {
					return { receivedAt: { contains: value } };
				}
				
				if (field === 'materialId') {
					return { materialId: parseInt(value) || 0 };
				}

				if (field === 'suplierId') {
					return { suplierId: parseInt(value) || 0 };
				}

				if (field === 'quantity') {
					return { quantity: parseInt(value) || 0 };
				}

				if (field === 'price') {
					return { price: parseFloat(value) || 0 };
				}

				return null;
			}).filter(Boolean);

			if (searchConditions.length > 0) {
				whereClause = {
					OR: searchConditions
				};
			}
		}

		const [dbRecords, total] = await Promise.all([
			this.prisma.materialIn.findMany({
				skip,
				take,
				where: whereClause,
				include: {
					material: true,
					suplier: true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			}),
			this.prisma.materialIn.count({ where: whereClause }),
		]);

		// Map DB records to entities using EntityMapper
		const data = this.stockInMapper.mapToEntities(dbRecords);

		return { data, total };
	}

	// Stocks List Operations
	async getAllMaterialInRecords(): Promise<MaterialStockInEntity[]> {
		const dbRecords = await this.prisma.materialIn.findMany({
			include: {
				material: true,
			},
			orderBy: {
				createdAt: 'asc',
			},
		});

		// Map DB records to entities using EntityMapper
		return this.stockInMapper.mapToEntities(dbRecords);
	}

	async getAllMaterialInRecordsWithSearch(search?: SearchConfig[]): Promise<MaterialStockInEntity[]> {
		let whereClause: any = {};

		// Build search conditions
		if (search && search.length > 0) {
			const searchConditions = search.map(config => {
				const { field, value } = config;
				
				if (field === 'material.name') {
					return {
						material: {
							name: {
								contains: value,
								mode: 'insensitive'
							}
						}
					};
				}
				
				// Handle other searchable fields for material inventory  
				if (field === 'materialId') {
					return { materialId: parseInt(value) || 0 };
				}

				return null;
			}).filter(Boolean);

			if (searchConditions.length > 0) {
				whereClause = {
					OR: searchConditions
				};
			}
		}

		const dbRecords = await this.prisma.materialIn.findMany({
			where: whereClause,
			include: {
				material: true,
			},
			orderBy: {
				createdAt: 'asc',
			},
		});

		// Map DB records to entities using EntityMapper
		return this.stockInMapper.mapToEntities(dbRecords);
	}

	async getAllMaterialOutRecords(): Promise<MaterialStockOutEntity[]> {
		const dbRecords = await this.prisma.materialOut.findMany({
			orderBy: {
				createdAt: 'asc',
			},
		});

		// Map DB records to entities using EntityMapper
		return this.stockOutMapper.mapToEntities(dbRecords);
	}

	async getAllMaterialOutRecordsWithSearch(search?: SearchConfig[]): Promise<MaterialStockOutEntity[]> {
		let whereClause: any = {};

		// Build search conditions for material out
		if (search && search.length > 0) {
			const searchConditions = search.map(config => {
				const { field, value } = config;
				
				// Handle searchable fields for material out
				if (field === 'material_id') {
					return { material_id: parseInt(value) || 0 };
				}

				return null;
			}).filter(Boolean);

			if (searchConditions.length > 0) {
				whereClause = {
					OR: searchConditions
				};
			}
		}

		const dbRecords = await this.prisma.materialOut.findMany({
			where: whereClause,
			orderBy: {
				createdAt: 'asc',
			},
		});

		// Map DB records to entities using EntityMapper
		return this.stockOutMapper.mapToEntities(dbRecords);
	}

	// Get material out by ID
	async getMaterialOutById(id: number): Promise<MaterialStockOutEntity | null> {
		const dbRecord = await this.prisma.materialOut.findUnique({
			where: { id,description:{not:null} },
		});

		if (!dbRecord) return null;

		// Map DB record to entity using EntityMapper
		return this.stockOutMapper.mapToEntity(dbRecord);
	}

	// Get material out list by material ID
	async getMaterialOutsByMaterialId(materialId: number): Promise<MaterialStockOutEntity[]> {
		const dbRecords = await this.prisma.materialOut.findMany({
			where: { material_id: materialId },
			orderBy: { used_at: 'desc' },
		});

		// Map DB records to entities using EntityMapper
		return this.stockOutMapper.mapToEntities(dbRecords);
	}

	async getMaterialStockByOutlet(materialId: number, outletId: number, date: Date): Promise<number> {
		// End of day for the given date
		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		// Single query: Get ALL stock_in up to and including this date
		const totalStockInData = await this.prisma.outletMaterialRequest.aggregate({
			where: {
				outlet_id: outletId,
				material_id: +materialId,
				status: 'APPROVED',
				createdAt: {
					lte: endOfDay,
				},
			},
			_sum: {
				approval_quantity: true,
			},
		});
		const totalStockIn = totalStockInData._sum?.approval_quantity || 0;

		// Single query: Get ALL used_stock up to and including this date
		// Note: MaterialOut doesn't have outlet_id, so we calculate globally
		const totalUsedData = await this.prisma.materialOut.aggregate({
			where: {
				material_id: +materialId,
				used_at: {
					lte: endOfDay,
				},
			},
			_sum: {
				quantity: true,
			},
		});
		const totalUsed = totalUsedData._sum?.quantity || 0;

		// Calculate remaining_stock: total received - total used
		const remainingStock = totalStockIn - totalUsed;

		return remainingStock;
	}

	/**
	 * Get product inventories that use this material
	 * Used for unit consistency validation
	 */
	async getProductInventoriesByMaterial(materialId: number): Promise<Array<{
		id: number;
		product_id: number;
		quantity: number;
		unit_quantity: string;
	}>> {
		const records = await this.prisma.productInventory.findMany({
			where: {
				material_id: materialId
			},
			select: {
				id: true,
				product_id: true,
				quantity: true,
				unit_quantity: true
			}
		});

		return records;
	}
}




