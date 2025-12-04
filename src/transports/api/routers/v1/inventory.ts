import express from 'express';
import { InventoryController } from '../../controllers/InventoryController';
import { validate } from '../../validations/validate.middleware';
import { inventoryStockInSchema, inventoryStockInUpdateSchema } from '../../validations/inventory.validation';
import { getPaginationSchema } from '../../validations/pagination.validation';
import InventoryService from '../../../../core/services/InventoryService';
import MaterialRepository from '../../../../adapters/postgres/repositories/MaterialRepository';
import SupplierRepository from '../../../../adapters/postgres/repositories/SupplierRepository';
import { validateUnit } from '../../middlewares/unitValidation';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies';

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
const inventoryController = new InventoryController();
router.post(
	"/in",
	authMiddleware,
	permissionMiddleware(['inventory:stock-in:create']),
	validate(inventoryStockInSchema),
	validateUnit,
	inventoryController.stockIn(inventoryService)
);
router.put(
	"/in/:id",
	authMiddleware,
	permissionMiddleware(['inventory:stock-in:update']),
	validate(inventoryStockInUpdateSchema),
	validateUnit,
	inventoryController.updateStockIn(inventoryService)
);
router.get(
	"/buy",
	authMiddleware,
	permissionMiddleware(['inventory:buy:read']),
	validate(getPaginationSchema),
	inventoryController.getBuyList(inventoryService)
);

export default router;
