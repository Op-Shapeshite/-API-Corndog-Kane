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
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();

const materialController = new MaterialController();
const materialService = new MaterialService(new MaterialRepository());

// GET inventory list
router.get(
	"/",
	authMiddleware,
	permissionMiddleware(['materials:read']),
	validate(getPaginationSchema),
	materialController.findAll(materialService, MaterialResponseMapper)
);

// POST create material
router.post(
	"/",
	authMiddleware,
	permissionMiddleware(['materials:create']),
	materialController.create()
);

// POST stock in
router.post(
	"/in",
	authMiddleware,
	permissionMiddleware(['materials:in:create']),
	validate(stockInSchema),
	validateUnit,
	materialController.stockIn()
);

// POST stock out
router.post(
	"/out",
	authMiddleware,
	permissionMiddleware(['materials:out:create']),
	validate(stockOutSchema),
	validateUnit,
	materialController.stockOut()
);

// GET buy list
router.get(
	"/buy",
	authMiddleware,
	permissionMiddleware(['materials:buy:read']),
	validate(getPaginationSchema),
	materialController.getBuyList()
);

// GET stocks inventory
router.get(
	"/stocks",
	authMiddleware,
	permissionMiddleware(['materials:stocks:read']),
	validate(getPaginationSchema),
	materialController.getStocksList()
);

// GET material out list by material ID
router.get(
	"/out/:id",
	authMiddleware,
	permissionMiddleware(['materials:out:read:detail']),
	materialController.getMaterialOutById()
);
export default router;