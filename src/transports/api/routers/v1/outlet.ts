
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
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();

const outletController = new OutletController();
const outletService = new OutletService(new OutletRepository());

router.get('/', authMiddleware, permissionMiddleware(['outlets:read']), validate(getPaginationSchema), outletController.getAllOutlets);
router.get('/:id',
authMiddleware,
permissionMiddleware(['outlets:read:detail']),
validate(getOutletByIdSchema),
outletController.findById.bind(outletController)
);
router.post(
	"/",
	authMiddleware,
	permissionMiddleware(['outlets:create']),
	validate(createOutletSchema),
	outletController.createOutlet
);
router.put(
	"/:id",
	authMiddleware,
	permissionMiddleware(['outlets:update']),
	validate(updateOutletSchema),
	outletController.updateOutlet
	)
router.delete(
	"/:id",
	authMiddleware,
	permissionMiddleware(['outlets:delete']),
	validate(deleteOutletSchema),
	outletController.delete(outletService, "User deleted successfully")
);

// Assign employee to outlet
router.post(
	"/:id/employee/:employeeid",
	authMiddleware,
	permissionMiddleware(['outlets:employee:assign']),
	validate(assignEmployeeToOutletSchema),
	outletController.assignEmployeeToOutlet
);

router.get(
	"/:id/stocks/products",
	authMiddleware,
	permissionMiddleware(['outlets:stocks:read']),
	outletController.getOutletProductStocks
);

router.get(
	"/:id/stocks/materials",
	authMiddleware,
	permissionMiddleware(['outlets:stocks:read']),
	outletController.getOutletMaterialStocks
);

// Dynamic stocks route - supports :category parameter (products, materials, summarize)
router.get(
	"/:id/stocks/:category",
	authMiddleware,
	permissionMiddleware(['outlets:stocks:read']),
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

router.get(
	"/:id/stocks/summarize",
	authMiddleware,
	permissionMiddleware(['outlets:stocks:read']),
	validate(outletSummarizeSchema),
	outletController.getSummarize
);

export default router;
