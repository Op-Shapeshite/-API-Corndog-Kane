import express from 'express';
import { InventoryController } from '../../controllers/InventoryController';
import { validate } from '../../validations/validate.middleware';
import { inventoryStockInSchema, inventoryStockInUpdateSchema } from '../../validations/inventory.validation';
import { getPaginationSchema } from '../../validations/pagination.validation';
import InventoryService from '../../../../core/services/InventoryService';
import MaterialRepository from '../../../../adapters/postgres/repositories/MaterialRepository';
import SupplierRepository from '../../../../adapters/postgres/repositories/SupplierRepository';
import { validateUnit } from '../../middlewares/unitValidation';

const router = express.Router();

// Initialize repositories
const materialRepository = new MaterialRepository();
const supplierRepository = new SupplierRepository();

// Initialize service
const inventoryService = new InventoryService(
	materialRepository,
	supplierRepository
);

// Initialize controller
const inventoryController = new InventoryController();router.post(
	"/in",
	validate(inventoryStockInSchema),
	validateUnit,
	inventoryController.stockIn(inventoryService)
);router.put(
	"/in/:id",
	validate(inventoryStockInUpdateSchema),
	validateUnit,
	inventoryController.updateStockIn(inventoryService)
);router.get(
	"/buy",
	validate(getPaginationSchema),
	inventoryController.getBuyList(inventoryService)
);

export default router;
