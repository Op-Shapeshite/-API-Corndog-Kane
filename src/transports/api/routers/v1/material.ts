import express from 'express';
import { MaterialController } from '../../controllers';
import { validate } from '../../validations/validate.middleware';
import { stockInSchema, stockOutSchema } from '../../validations/material.validation';
import MaterialService from '../../../../core/services/MaterialService';
import MaterialRepository from '../../../../adapters/postgres/repositories/MaterialRepository';
import { MaterialResponseMapper } from "../../../../mappers/response-mappers";
import { getPaginationSchema } from '../../validations/pagination.validation';
import { validateUnit } from '../../middlewares/unitValidation';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();

const materialController = new MaterialController();
const materialService = new MaterialService(new MaterialRepository());

/**
 * @route GET /api/v1/materials
 * @access ADMIN | SUPERADMIN | WAREHOUSE
 */
router.get(
	"/",
	authMiddleware,
	permissionMiddleware(['materials:read']),
	validate(getPaginationSchema),
	materialController.findAll(materialService, MaterialResponseMapper)
);

/**
 * @route POST /api/v1/materials
 * @access ADMIN | SUPERADMIN | WAREHOUSE
 */
router.post(
	"/",
	authMiddleware,
	permissionMiddleware(['materials:create']),
	materialController.create()
);

/**
 * @route POST /api/v1/materials/in
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.post(
	"/in",
	authMiddleware,
	permissionMiddleware(['materials:stock-in']),
	validate(stockInSchema),
	validateUnit,
	materialController.stockIn()
);

/**
 * @route POST /api/v1/materials/out
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.post(
	"/out",
	authMiddleware,
	permissionMiddleware(['materials:stock-out', 'warehouse:material-stocks:out']),
	validate(stockOutSchema),
	validateUnit,
	materialController.stockOut()
);

/**
 * @route GET /api/v1/materials/buy
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.get(
	"/buy",
	authMiddleware,
	permissionMiddleware(['inventory:buy:read']),
	validate(getPaginationSchema),
	materialController.getBuyList()
);

/**
 * @route GET /api/v1/materials/stocks
 * @access WAREHOUSE | ADMIN | SUPERADMIN | OUTLET
 */
router.get(
	"/stocks",
	authMiddleware,
	permissionMiddleware(['warehouse:material-stocks:read']),
	validate(getPaginationSchema),
	materialController.getStocksList()
);

/**
 * @route GET /api/v1/materials/out/:id
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.get(
	"/out/:id",
	authMiddleware,
	permissionMiddleware(['warehouse:material-stocks:read']),
	materialController.getMaterialOutById()
);

export default router;