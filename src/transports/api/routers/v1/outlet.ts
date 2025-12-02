
import express from 'express';
import { validate } from '../../validations/validate.middleware';
import {
	createOutletSchema,
	deleteOutletSchema,
	getOutletByIdSchema,
	updateOutletSchema,
} from "../../validations/outlet.validation";
import { assignEmployeeToOutletSchema } from "../../validations/outlet-assignment.validation";
import { outletSummarizeSchema } from "../../validations/outlet-summarize.validation";
import { OutletController } from '../../controllers/OutletController';
import OutletService from '../../../../core/services/OutletService';
import OutletRepository from '../../../../adapters/postgres/repositories/OutletRepository';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();

const outletController = new OutletController();
const outletService = new OutletService(new OutletRepository());

/**
 * @route GET /api/v1/outlets
 * @access ADMIN | SUPERADMIN | WAREHOUSE
 */
router.get('/', 
	authMiddleware,
	permissionMiddleware(['outlets:read']),
	validate(getPaginationSchema), 
	outletController.getAllOutlets
);

/**
 * @route GET /api/v1/outlets/:id
 * @access ADMIN | SUPERADMIN | WAREHOUSE | OUTLET
 */
router.get('/:id',
	authMiddleware,
	permissionMiddleware(['outlets:read:detail']),
	validate(getOutletByIdSchema),
	outletController.findById.bind(outletController)
);

/**
 * @route POST /api/v1/outlets
 * @access ADMIN | SUPERADMIN
 */
router.post(
	"/",
	authMiddleware,
	permissionMiddleware(['outlets:create']),
	validate(createOutletSchema),
	outletController.createOutlet
);

/**
 * @route PUT /api/v1/outlets/:id
 * @access ADMIN | SUPERADMIN
 */
router.put(
	"/:id",
	authMiddleware,
	permissionMiddleware(['outlets:update']),
	validate(updateOutletSchema),
	outletController.updateOutlet
);

/**
 * @route DELETE /api/v1/outlets/:id
 * @access ADMIN | SUPERADMIN
 */
router.delete(
	"/:id",
	authMiddleware,
	permissionMiddleware(['outlets:delete']),
	validate(deleteOutletSchema),
	outletController.delete(outletService, "User deleted successfully")
);

/**
 * @route POST /api/v1/outlets/:id/employee/:employeeid
 * @access ADMIN | SUPERADMIN
 */
router.post(
	"/:id/employee/:employeeid",
	authMiddleware,
	permissionMiddleware(['outlets:update']),
	validate(assignEmployeeToOutletSchema),
	outletController.assignEmployeeToOutlet
);

/**
 * @route GET /api/v1/outlets/:id/stocks/products
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.get(
	"/:id/stocks/products",
	authMiddleware,
	permissionMiddleware(['warehouse:outlet-stocks:read']),
	outletController.getOutletProductStocks
);

/**
 * @route GET /api/v1/outlets/:id/stocks/materials
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.get(
	"/:id/stocks/materials",
	authMiddleware,
	permissionMiddleware(['warehouse:outlet-stocks:read']),
	outletController.getOutletMaterialStocks
);

/**
 * @route GET /api/v1/outlets/:id/stocks/:category
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.get(
	"/:id/stocks/:category",
	authMiddleware,
	permissionMiddleware(['warehouse:outlet-stocks:read', 'warehouse:outlet-stocks:summarize']),
	(req, res) => {
		const { category } = req.params;
		
		// Route to appropriate handler based on category
		if (category === 'products') {
			return outletController.getOutletProductStocks(req, res);
		} else if (category === 'materials') {
			return outletController.getOutletMaterialStocks(req, res);
		} else if (category === 'summarize') {
			return outletController.getSummarize(req, res);
		} else {
			return res.status(400).json({
				status: 'error',
				message: `Invalid category "${category}". Must be one of: products, materials, summarize`,
				data: null,
				metadata: {}
			});
		}
	}
);

/**
 * @route GET /api/v1/outlets/:id/stocks/summarize
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.get(
	"/:id/stocks/summarize",
	authMiddleware,
	permissionMiddleware(['warehouse:outlet-stocks:summarize']),
	validate(outletSummarizeSchema),
	outletController.getSummarize
);

export default router;
