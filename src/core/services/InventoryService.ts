import { 
	TInventoryStockInRequest,
	TInventoryStockInItem,
	TInventoryStockInResponse,
	TInventoryStockInItemResponse,
	TInventoryStockInUpdateRequest,
	TInventoryBuyListResponse,
	TInventoryBuyListItem,
	ItemType
} from "../entities/inventory/inventory";
import MaterialRepository from "../../adapters/postgres/repositories/MaterialRepository";
import { ProductRepository } from "../../adapters/postgres/repositories/ProductRepository";
import SupplierRepository from "../../adapters/postgres/repositories/SupplierRepository";
import { Service } from "./Service";
import { TMaterial, TMaterialWithID } from "../entities/material/material";
import { TSupplierWithID } from "../entities/suplier/suplier";

/**
 * InventoryService
 * Handles unified stock in operations for both Material and Product
 * Routes requests to appropriate repository based on item_type
 */
export default class InventoryService extends Service<TMaterial | TMaterialWithID> {
	private materialRepository: MaterialRepository;
	private productRepository: ProductRepository;
	private supplierRepository: SupplierRepository;

	constructor(
		materialRepository: MaterialRepository,
		productRepository: ProductRepository,
		supplierRepository: SupplierRepository
	) {
		// Use material repository as base (not actually used)
		super(materialRepository);
		this.materialRepository = materialRepository;
		this.productRepository = productRepository;
		this.supplierRepository = supplierRepository;
	}

	/**
	 * Main stock in handler (batch processing)
	 * Processes multiple items and returns batch results
	 */
	async stockIn(data: TInventoryStockInRequest): Promise<TInventoryStockInResponse> {
		const results: TInventoryStockInItemResponse[] = [];
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

		// Return batch response
		return {
			success_count: results.length,
			failed_count: errors.length,
			total_count: data.items.length,
			items: results,
			...(errors.length > 0 && { errors }),
		};
	}

	/**
	 * Process single stock in item
	 */
	private async processStockInItem(data: TInventoryStockInItem): Promise<TInventoryStockInItemResponse> {
		// Validate supplier exists
		const supplierRecord = await this.supplierRepository.getById(data.supplier_id.toString());
		if (!supplierRecord) {
			throw new Error(`Supplier with ID ${data.supplier_id} not found`);
		}
		
		// Extract supplier info (handle both TSupplier and TSupplierWithID)
		const supplier = {
			id: (supplierRecord as TSupplierWithID).id || data.supplier_id,
			name: supplierRecord.name
		};

		// Route based on item type
		if (data.item_type === ItemType.MATERIAL) {
			return await this.handleMaterialStockIn(data as Extract<TInventoryStockInItem, { item_type: "MATERIAL" }>, supplier);
		} else if (data.item_type === ItemType.PRODUCT) {
			return await this.handleProductStockIn(data as Extract<TInventoryStockInItem, { item_type: "PRODUCT" }>, supplier);
		}
		
		// TypeScript exhaustiveness check
		const _exhaustiveCheck: never = data;
		throw new Error(`Invalid item_type: ${(_exhaustiveCheck as { item_type: string }).item_type}`);
	}

	/**
	 * Handle Material stock in
	 */
	private async handleMaterialStockIn(
		data: Extract<TInventoryStockInItem, { item_type: "MATERIAL" }>,
		supplier: { id: number; name: string }
	): Promise<TInventoryStockInItemResponse> {
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
		} else {
			throw new Error("Either material_id or material must be provided");
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
			throw new Error("Material not found after creation");
		}

		// Calculate current stock
		const totalStockIn = material.materialIn.reduce((sum, item) => sum + item.quantity, 0);
		const totalStockOut = material.materialOut.reduce((sum, item) => sum + item.quantity, 0);
		const currentStock = totalStockIn - totalStockOut;

		// Return response
		return {
			id: stockInRecord.id,
			item_type: ItemType.MATERIAL,
			item_name: material.name,
			quantity: data.quantity,
			unit_quantity: data.unit_quantity,
			price: data.price, // Total price (not per unit)
			supplier: {
				id: supplier.id,
				name: supplier.name,
			},
			current_stock: currentStock,
			created_at: stockInRecord.createdAt.toISOString(),
		};
	}

	/**
	 * Handle Product stock in (PURCHASE only)
	 */
	private async handleProductStockIn(
		data: Extract<TInventoryStockInItem, { item_type: "PRODUCT" }>,
		supplier: { id: number; name: string }
	): Promise<TInventoryStockInItemResponse> {
		// Validate product exists
		const product = await this.productRepository.getById(data.product_id.toString());
		if (!product) {
			throw new Error(`Product with ID ${data.product_id} not found`);
		}

		// Create product stock in with PURCHASE source
		const stockInRecord = await this.productRepository.createStockIn({
			productId: data.product_id,
			quantity: data.quantity,
			price: data.price,
			supplierId: data.supplier_id,
			sourceFrom: "PURCHASE",
		});

		// Get product with stocks to calculate current stock
		const productWithStocks = await this.productRepository.getProductWithStocks(data.product_id);
		if (!productWithStocks) {
			throw new Error("Product not found after stock in");
		}

		// Calculate current stock (only from PURCHASE source)
		type StockItem = { sourceFrom: "PURCHASE" | "PRODUCTION"; quantity: number };
		const currentStock = productWithStocks.stocks
			.filter((stock: StockItem) => stock.sourceFrom === "PURCHASE")
			.reduce((sum: number, stock: StockItem) => sum + stock.quantity, 0);

		// Return response
		return {
			id: stockInRecord.id,
			item_type: ItemType.PRODUCT,
			item_name: product.name,
			quantity: data.quantity,
			unit_quantity: data.unit_quantity,
			price: data.price, // Total price (not per unit)
			supplier: {
				id: supplier.id,
				name: supplier.name,
			},
			current_stock: currentStock,
			created_at: stockInRecord.date.toISOString(),
		};
	}

	/**
	 * Get unified buy list (Material purchases + Product PURCHASE)
	 * Combines data from material_in and product_stocs (PURCHASE only)
	 * 
	 * Strategy: Fetch ALL data, combine, sort, then paginate
	 * For very large datasets, consider using database-level UNION query
	 */
	async getBuyList(page = 1, limit = 10): Promise<TInventoryBuyListResponse> {
		// Calculate skip for final pagination
		const skip = (page - 1) * limit;

		// Fetch ALL data from both sources in parallel
		// We need all data to properly combine and sort before paginating
		const [materialData, productData] = await Promise.all([
			this.materialRepository.getMaterialInList(0, Number.MAX_SAFE_INTEGER),
			this.productRepository.getProductPurchaseList(0, Number.MAX_SAFE_INTEGER),
		]);

		// Combine and map to unified format
		const combinedItems: TInventoryBuyListItem[] = [];

		// Map Material purchases
		for (const materialIn of materialData.data) {
			combinedItems.push({
				id: materialIn.id,
				item_type: ItemType.MATERIAL,
				item_id: materialIn.materialId,
				item_name: materialIn.material.name,
				quantity: materialIn.quantity,
				unit_quantity: materialIn.quantityUnit,
				price: materialIn.price, // Total price (not per unit)
				supplier: {
					id: materialIn.material.suplier?.id || 0,
					name: materialIn.material.suplier?.name || "Unknown",
				},
				purchased_at: materialIn.receivedAt.toISOString(),
			});
		}

		// Map Product PURCHASE records
		for (const productStock of productData.data) {
			if (productStock.detail && productStock.detail.supplier) {
				combinedItems.push({
					id: productStock.id,
					item_type: ItemType.PRODUCT,
					item_id: productStock.product_id,
					item_name: productStock.products.name,
					quantity: productStock.quantity,
					unit_quantity: "pcs", // Default unit for products
					price: productStock.detail.price, // Total price (not per unit)
					supplier: {
						id: productStock.detail.supplier.id,
						name: productStock.detail.supplier.name,
					},
					purchased_at: productStock.date.toISOString(),
				});
			}
		}

		// Sort combined results by purchased_at (newest first)
		combinedItems.sort((a, b) => 
			new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime()
		);

		// Get total count
		const total = combinedItems.length;

		// Apply pagination to combined and sorted results
		const paginatedItems = combinedItems.slice(skip, skip + limit);

		return {
			data: paginatedItems,
			total,
		};
	}

	/**
	 * Update stock in record
	 * If item_type changes: delete old record + create new record
	 * If item_type same: update existing record
	 */
	async updateStockIn(
		pathItemType: "MATERIAL" | "PRODUCT",
		id: number,
		data: TInventoryStockInUpdateRequest
	): Promise<TInventoryStockInItemResponse> {
		// Case 1: item_type berubah (MATERIAL -> PRODUCT atau sebaliknya)
		if (pathItemType !== data.item_type) {
			// Delete old record
			if (pathItemType === ItemType.MATERIAL) {
				await this.materialRepository.deleteStockIn(id);
			} else {
				await this.productRepository.deleteStockIn(id);
			}

			// Create new record with new item_type
			const newRecord = await this.processStockInItem(data);
			
			// Return the new record (same format as POST)
			return newRecord;
		}

		// Case 2: item_type sama - update existing record
		if (data.item_type === ItemType.MATERIAL) {
			return await this.updateMaterialStockIn(id, data as Extract<TInventoryStockInUpdateRequest, { item_type: "MATERIAL" }>);
		} else {
			return await this.updateProductStockIn(id, data as Extract<TInventoryStockInUpdateRequest, { item_type: "PRODUCT" }>);
		}
	}

	/**
	 * Update Material stock in record
	 */
	private async updateMaterialStockIn(
		id: number,
		data: Extract<TInventoryStockInUpdateRequest, { item_type: "MATERIAL" }>
	): Promise<TInventoryStockInItemResponse> {
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
		} else {
			throw new Error("Either material_id or material must be provided");
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
			throw new Error(`Supplier with ID ${data.supplier_id} not found`);
		}

		const supplier = {
			id: (supplierRecord as { id: number }).id || data.supplier_id,
			name: supplierRecord.name
		};

		// Get material with stocks to calculate current stock
		const material = await this.materialRepository.getMaterialWithStocks(materialId);
		if (!material) {
			throw new Error("Material not found after update");
		}

		// Get the updated record
		const updatedRecord = material.materialIn.find(item => item.id === id);
		if (!updatedRecord) {
			throw new Error("Updated record not found");
		}

		// Calculate current stock
		const totalStockIn = material.materialIn.reduce((sum, item) => sum + item.quantity, 0);
		const totalStockOut = material.materialOut.reduce((sum, item) => sum + item.quantity, 0);
		const currentStock = totalStockIn - totalStockOut;

		// Return response (same format as POST)
		return {
			id: id,
			item_type: ItemType.MATERIAL,
			item_name: material.name,
			quantity: data.quantity,
			unit_quantity: data.unit_quantity,
			price: data.price,
			supplier: {
				id: supplier.id,
				name: supplier.name,
			},
			current_stock: currentStock,
			created_at: updatedRecord.createdAt.toISOString(),
		};
	}

	/**
	 * Update Product stock in record
	 */
	private async updateProductStockIn(
		id: number,
		data: Extract<TInventoryStockInUpdateRequest, { item_type: "PRODUCT" }>
	): Promise<TInventoryStockInItemResponse> {
		// Validate product exists
		const product = await this.productRepository.getById(data.product_id.toString());
		if (!product) {
			throw new Error(`Product with ID ${data.product_id} not found`);
		}

		// Update stock in record
		await this.productRepository.updateStockIn(id, {
			productId: data.product_id,
			quantity: data.quantity,
			price: data.price,
			supplierId: data.supplier_id,
		});

		// Get supplier info
		const supplierRecord = await this.supplierRepository.getById(data.supplier_id.toString());
		if (!supplierRecord) {
			throw new Error(`Supplier with ID ${data.supplier_id} not found`);
		}

		const supplier = {
			id: (supplierRecord as { id: number }).id || data.supplier_id,
			name: supplierRecord.name
		};

		// Get product with stocks to calculate current stock
		const productWithStocks = await this.productRepository.getProductWithStocks(data.product_id);
		if (!productWithStocks) {
			throw new Error("Product not found after update");
		}

		// Find the updated record
		const updatedRecord = productWithStocks.stocks.find(stock => stock.id === id);
		if (!updatedRecord) {
			throw new Error("Updated record not found");
		}

		// Calculate current stock (only from PURCHASE source)
		type StockItem = { sourceFrom: "PURCHASE" | "PRODUCTION"; quantity: number };
		const currentStock = productWithStocks.stocks
			.filter((stock: StockItem) => stock.sourceFrom === "PURCHASE")
			.reduce((sum: number, stock: StockItem) => sum + stock.quantity, 0);

		// Return response (same format as POST)
		return {
			id: id,
			item_type: ItemType.PRODUCT,
			item_name: product.name,
			quantity: data.quantity,
			unit_quantity: data.unit_quantity,
			price: data.price,
			supplier: {
				id: supplier.id,
				name: supplier.name,
			},
			current_stock: currentStock,
			created_at: updatedRecord.date.toISOString(),
		};
	}
}
