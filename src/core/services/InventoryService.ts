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
import SupplierRepository from "../../adapters/postgres/repositories/SupplierRepository";
import { Service } from "./Service";
import { TMaterial, TMaterialWithID } from "../entities/material/material";
import { TSupplierWithID } from "../entities/suplier/suplier";

/**
 * Allowed units for material stock in validation
 */
const ALLOWED_UNITS = [
	// Volume
	'ml', 'mL', 'ML', 'liter', 'L', 'l', 'gallon',
	// Weight
	'g', 'gram', 'kg', 'kilogram', 'ton',
	// Count
	'pcs', 'unit', 'buah', 'biji', 'butir',
	// Other
	'pack', 'box', 'karton'
];

/**
 * Validate unit_quantity format
 */
function validateUnit(unit: string): void {
	const normalizedUnit = unit.trim().toLowerCase();
	const isValid = ALLOWED_UNITS.some(allowed => 
		allowed.toLowerCase() === normalizedUnit
	);
	
	if (!isValid) {
		throw new Error(
			`Satuan "${unit}" tidak valid. Satuan yang diizinkan: ${ALLOWED_UNITS.join(', ')}. Pastikan menggunakan satuan yang sudah terdaftar di sistem`
		);
	}
}

/**
 * Check unit consistency for a material
 */
async function checkUnitConsistency(
	materialRepository: MaterialRepository,
	materialId: number,
	newUnit: string
): Promise<void> {
	// Get product inventories that use this material
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
					error: error instanceof Error ? error.message : "Error tidak diketahui",
				});
			}
		}

		// Return batch entity (camelCase)
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
		// Validate supplier exists
		const supplierRecord = await this.supplierRepository.getById(data.supplier_id.toString());
		if (!supplierRecord) {
			throw new Error(`Supplier dengan ID ${data.supplier_id} tidak ditemukan. Pastikan supplier sudah terdaftar di sistem sebelum melakukan stock-in`);
		}
		
		// Extract supplier info (handle both TSupplier and TSupplierWithID)
		const supplier = {
			id: (supplierRecord as TSupplierWithID).id || data.supplier_id,
			name: supplierRecord.name
		};

		// Handle material stock in
		return await this.handleMaterialStockIn(data, supplier);
	}

	/**
	 * Handle Material stock in
	 */
	private async handleMaterialStockIn(
		data: TInventoryStockInItem,
		supplier: { id: number; name: string }
	): Promise<TInventoryStockInEntity> {
		// Validate unit format
		validateUnit(data.unit_quantity);
		
		let materialId: number;

		// Create new material if needed
		if (data.material && !data.material_id) {
			const newMaterial = await this.materialRepository.createMaterial({
				name: data.material.name,
				suplierId: data.supplier_id,
				isActive: data.material.is_active ?? true,
			});
			materialId = newMaterial.id;
		} else if (data.material_id) {
			materialId = data.material_id;
			
			// Check unit consistency with product_inventory
			await checkUnitConsistency(this.materialRepository, materialId, data.unit_quantity);
		} else {
			throw new Error("Material harus disediakan. Silakan sediakan material_id untuk material yang sudah ada atau data material untuk membuat material baru");
		}

		// Create stock in record
		const stockInRecord = await this.materialRepository.createStockIn({
			materialId,
			quantity: data.quantity,
			price: data.price,
			quantityUnit: data.unit_quantity,
		});

		// Get material with stocks to calculate current stock
		const material = await this.materialRepository.getMaterialWithStocks(materialId);
		if (!material) {
			throw new Error("Material tidak ditemukan setelah pembuatan stock-in. Terjadi kesalahan sistem dalam menyimpan data");
		}

		// Calculate current stock
		const totalStockIn = material.materialIn.reduce((sum, item) => sum + item.quantity, 0);
		const totalStockOut = material.materialOut.reduce((sum, item) => sum + item.quantity, 0);
		const currentStock = totalStockIn - totalStockOut;

		// Return entity with camelCase
		return {
			id: stockInRecord.id,
			itemType: ItemType.MATERIAL,
			itemName: material.name,
			quantity: data.quantity,
			unitQuantity: data.unit_quantity,
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
	async getBuyList(page = 1, limit = 10): Promise<{ data: TInventoryBuyListItemEntity[], total: number }> {
		// Fetch material purchases with pagination
		const materialData = await this.materialRepository.getMaterialInList((page - 1) * limit, limit);

		// Map to unified entity format (camelCase)
		const items: TInventoryBuyListItemEntity[] = materialData.data.map(materialIn => ({
			id: materialIn.id,
			itemType: ItemType.MATERIAL,
			itemId: materialIn.materialId,
			itemName: materialIn.material.name,
			quantity: materialIn.quantity,
			unitQuantity: materialIn.quantityUnit,
			price: materialIn.price,
			supplier: {
				id: materialIn.material.suplier?.id || 0,
				name: materialIn.material.suplier?.name || "Unknown",
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
		// Validate unit format
		validateUnit(data.unit_quantity);
		
		let materialId: number;

		// Handle material creation if needed
		if (data.material && !data.material_id) {
			const newMaterial = await this.materialRepository.createMaterial({
				name: data.material.name,
				suplierId: data.supplier_id,
				isActive: data.material.is_active ?? true,
			});
			materialId = newMaterial.id;
		} else if (data.material_id) {
			materialId = data.material_id;
			
			// Check unit consistency
			await checkUnitConsistency(this.materialRepository, materialId, data.unit_quantity);
		} else {
			throw new Error("Material harus disediakan untuk update. Silakan sediakan material_id untuk material yang sudah ada atau data material untuk membuat material baru");
		}

		// Update stock in record
		await this.materialRepository.updateStockIn(id, {
			materialId,
			quantity: data.quantity,
			price: data.price,
			quantityUnit: data.unit_quantity,
		});

		// Get supplier info
		const supplierRecord = await this.supplierRepository.getById(data.supplier_id.toString());
		if (!supplierRecord) {
			throw new Error(`Supplier dengan ID ${data.supplier_id} tidak ditemukan. Pastikan supplier sudah terdaftar di sistem`);
		}

		const supplier = {
			id: (supplierRecord as { id: number }).id || data.supplier_id,
			name: supplierRecord.name
		};

		// Get material with stocks to calculate current stock
		const material = await this.materialRepository.getMaterialWithStocks(materialId);
		if (!material) {
			throw new Error("Material tidak ditemukan setelah update stock-in. Terjadi kesalahan sistem dalam memperbarui data");
		}

		// Get the updated record
		const updatedRecord = material.materialIn.find(item => item.id === id);
		if (!updatedRecord) {
			throw new Error("Data stock-in yang telah diperbarui tidak ditemukan. Terjadi kesalahan dalam proses update");
		}

		// Calculate current stock
		const totalStockIn = material.materialIn.reduce((sum, item) => sum + item.quantity, 0);
		const totalStockOut = material.materialOut.reduce((sum, item) => sum + item.quantity, 0);
		const currentStock = totalStockIn - totalStockOut;

		// Return entity (camelCase)
		return {
			id: id,
			itemType: ItemType.MATERIAL,
			itemName: material.name,
			quantity: data.quantity,
			unitQuantity: data.unit_quantity,
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
