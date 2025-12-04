import { 
	TInventoryStockInRequest,
	TInventoryStockInItem,
	TInventoryStockInBatchEntity,
	TInventoryStockInEntity,
	TInventoryStockInUpdateRequest,
	TInventoryBuyListItemEntity,
	ItemType
} from "../entities/inventory/inventory";
import MaterialRepository from "../../adapters/postgres/repositories/MaterialRepository";
import { SearchConfig } from "../repositories/Repository";
import SupplierRepository from "../../adapters/postgres/repositories/SupplierRepository";
import { Service } from "./Service";
import { TMaterial, TMaterialWithID } from "../entities/material/material";
import { TSupplierWithID } from "../entities/suplier/suplier";
import { normalizeUnit, isUnitSupported } from "../utils/unitNormalizer";

/**
 * Validate and normalize unit_quantity format
 */
function validateAndNormalizeUnit(unit: string): string {
	if (!isUnitSupported(unit)) {
		// This will throw an error with proper message
		normalizeUnit(unit);
	}
	return normalizeUnit(unit);
}

/**
 * Check unit consistency for a material
 */
async function checkUnitConsistency(
	materialRepository: MaterialRepository,
	materialId: number,
	newUnit: string
): Promise<void> {
	const productInventories = await materialRepository.getProductInventoriesByMaterial(materialId);
	
	if (productInventories.length > 0) {
		const existingUnit = productInventories[0].unit_quantity;
		const normalizedNew = newUnit.trim().toLowerCase();
		const normalizedExisting = existingUnit.trim().toLowerCase();
		
		if (normalizedNew !== normalizedExisting) {
			console.warn(
				`⚠️  Warning: Material ID ${materialId} unit mismatch. ` +
				`Product inventory uses "${existingUnit}" but stock in uses "${newUnit}". ` +
				`This may cause calculation issues.`
			);
		}
	}
}

/**
 * InventoryService
 * Handles stock in operations for Material only
 */
export default class InventoryService extends Service<TMaterial | TMaterialWithID> {
	private materialRepository: MaterialRepository;
	private supplierRepository: SupplierRepository;

	constructor(
		materialRepository: MaterialRepository,
		supplierRepository: SupplierRepository
	) {
		super(materialRepository);
		this.materialRepository = materialRepository;
		this.supplierRepository = supplierRepository;
	}

	/**
	 * Main stock in handler (batch processing)
	 * Processes multiple material items and returns batch entity
	 * @returns TInventoryStockInBatchEntity
	 */
	async stockIn(data: TInventoryStockInRequest): Promise<TInventoryStockInBatchEntity> {
		const results: TInventoryStockInEntity[] = [];
		const errors: Array<{ index: number; item: TInventoryStockInItem; error: string }> = [];

		// Process each item
		for (let i = 0; i < data.items.length; i++) {
			const item = data.items[i];
			
			try {
				const result = await this.processStockInItem(item);
				results.push(result);
			} catch (error) {
				// Capture error but continue processing other items
				errors.push({
					index: i,
					item,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}
		return {
			successCount: results.length,
			failedCount: errors.length,
			totalCount: data.items.length,
			items: results,
			...(errors.length > 0 && { errors }),
		};
	}

	/**
	 * Process single stock in item (Material only)
	 * @returns TInventoryStockInEntity
	 */
	private async processStockInItem(data: TInventoryStockInItem): Promise<TInventoryStockInEntity> {
		const supplierRecord = await this.supplierRepository.getById(data.supplier_id.toString());
		if (!supplierRecord) {
			throw new Error(`Supplier dengan ID ${data.supplier_id} tidak ditemukan. Pastikan supplier sudah terdaftar di sistem sebelum melakukan stock-in`);
		}
		const supplier = {
			id: (supplierRecord as TSupplierWithID).id || data.supplier_id,
			name: supplierRecord.name
		};
		return await this.handleMaterialStockIn(data, supplier);
	}

	/**
	 * Handle Material stock in
	 */
	private async handleMaterialStockIn(
		data: TInventoryStockInItem,
		supplier: { id: number; name: string }
	): Promise<TInventoryStockInEntity> {
		const normalizedUnit = validateAndNormalizeUnit(data.unit_quantity);
		
		let materialId: number;
		if (data.material && !data.material_id) {
			const newMaterial = await this.materialRepository.createMaterial({
				name: data.material.name,
				isActive: data.material.is_active ?? true,
			});
			materialId = newMaterial.id;
		} else if (data.material_id) {
			materialId = data.material_id;
			await checkUnitConsistency(this.materialRepository, materialId, normalizedUnit);
		} else {
			throw new Error("Material harus disediakan. Silakan sediakan material_id untuk material yang sudah ada atau data material untuk membuat material baru");
		}
		const stockInRecord = await this.materialRepository.createStockIn({
			materialId,
			suplierId: data.supplier_id,
			quantity: data.quantity,
			price: data.price,
			quantityUnit: normalizedUnit,
		});
		const material = await this.materialRepository.getMaterialWithStocks(materialId);
		if (!material) {
			throw new Error("Material tidak ditemukan setelah pembuatan stock-in. Terjadi kesalahan sistem dalam menyimpan data");
		}
		const totalStockIn = material.materialIn.reduce((sum, item) => sum + item.quantity, 0);
		const totalStockOut = material.materialOut.reduce((sum, item) => sum + item.quantity, 0);
		const currentStock = totalStockIn - totalStockOut;
		return {
			id: stockInRecord.id,
			itemType: ItemType.MATERIAL,
			itemName: material.name,
			quantity: data.quantity,
			unitQuantity: normalizedUnit,
			price: data.price, // Total price (not per unit)
			supplier: {
				id: supplier.id,
				name: supplier.name,
			},
			currentStock: currentStock,
			createdAt: stockInRecord.createdAt,
		};
	}

	/**
	 * Get buy list (Material purchases only)
	 * Returns data from material_ins table
	 */
	async getBuyList(page = 1, limit = 10, searchConfig?: SearchConfig[]): Promise<{ data: TInventoryBuyListItemEntity[], total: number }> {
		// Fetch material purchases with pagination and search
		const materialData = await this.materialRepository.getMaterialInList((page - 1) * limit, limit, searchConfig);
		const items: TInventoryBuyListItemEntity[] = materialData.data.map(materialIn => ({
			id: materialIn.id,
			itemType: ItemType.MATERIAL,
			itemId: materialIn.materialId,
			itemName: materialIn.material.name,
			quantity: materialIn.quantity,
			unitQuantity: materialIn.quantityUnit,
			price: materialIn.price,
			supplier: {
				id: materialIn.suplier?.id || 0,
				name: materialIn.suplier?.name || "Unknown",
			},
			purchasedAt: materialIn.receivedAt,
		}));

		return {
			data: items,
			total: materialData.total
		};
	}

	/**
	 * Update stock in record (Material only)
	 */
	async updateStockIn(
		id: number,
		data: TInventoryStockInUpdateRequest
	): Promise<TInventoryStockInEntity> {
		const normalizedUnit = validateAndNormalizeUnit(data.unit_quantity);
		
		let materialId: number;
		if (data.material && !data.material_id) {
			const newMaterial = await this.materialRepository.createMaterial({
				name: data.material.name,
				isActive: data.material.is_active ?? true,
			});
			materialId = newMaterial.id;
		} else if (data.material_id) {
			materialId = data.material_id;
			await checkUnitConsistency(this.materialRepository, materialId, normalizedUnit);
		} else {
			throw new Error("Material harus disediakan untuk update. Silakan sediakan material_id untuk material yang sudah ada atau data material untuk membuat material baru");
		}
		await this.materialRepository.updateStockIn(id, {
			materialId,
			suplierId: data.supplier_id,
			quantity: data.quantity,
			price: data.price,
			quantityUnit: normalizedUnit,
		});
		const supplierRecord = await this.supplierRepository.getById(data.supplier_id.toString());
		if (!supplierRecord) {
			throw new Error(`Supplier dengan ID ${data.supplier_id} tidak ditemukan. Pastikan supplier sudah terdaftar di sistem`);
		}

		const supplier = {
			id: (supplierRecord as { id: number }).id || data.supplier_id,
			name: supplierRecord.name
		};
		const material = await this.materialRepository.getMaterialWithStocks(materialId);
		if (!material) {
			throw new Error("Material tidak ditemukan setelah update stock-in. Terjadi kesalahan sistem dalam memperbarui data");
		}
		const updatedRecord = material.materialIn.find(item => item.id === id);
		if (!updatedRecord) {
			throw new Error("Data stock-in yang telah diperbarui tidak ditemukan. Terjadi kesalahan dalam proses update");
		}
		const totalStockIn = material.materialIn.reduce((sum, item) => sum + item.quantity, 0);
		const totalStockOut = material.materialOut.reduce((sum, item) => sum + item.quantity, 0);
		const currentStock = totalStockIn - totalStockOut;
		return {
			id: id,
			itemType: ItemType.MATERIAL,
			itemName: material.name,
			quantity: data.quantity,
			unitQuantity: normalizedUnit,
			price: data.price,
			supplier: {
				id: supplier.id,
				name: supplier.name,
			},
			currentStock: currentStock,
			createdAt: updatedRecord.createdAt,
		};
	}
}
