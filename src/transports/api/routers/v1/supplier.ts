
import express from 'express';
import { SupplierController } from '../../controllers';
import { validate } from '../../validations/validate.middleware';
import { createSupplierSchema,updateSupplierSchema,deleteSupplierSchema } from '../../validations/supplier.validation';
import SupplierService from '../../../../core/services/SupplierService';
import SupplierRepository from '../../../../adapters/postgres/repositories/SupplierRepository';
import { SupplierResponseMapper } from "../../../../mappers/response-mappers";
import { getPaginationSchema } from '../../validations/pagination.validation';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();

const supplierController = new SupplierController();
const supplierService = new SupplierService(new SupplierRepository());

router.get(
	"/",
	authMiddleware,
	permissionMiddleware(['warehouse:suppliers:read']),
	validate(getPaginationSchema),
	supplierController.findAll(supplierService, SupplierResponseMapper)
);
router.post(
	"/",
	authMiddleware,
	permissionMiddleware(['warehouse:suppliers:create']),
	validate(createSupplierSchema),
	supplierController.create(
		supplierService,
		SupplierResponseMapper,
		"Supplier created successfully"
	)
);
router.put(
	"/:id",
	authMiddleware,
	permissionMiddleware(['warehouse:suppliers:update']),
	validate(updateSupplierSchema),
	supplierController.update(
		supplierService,
		SupplierResponseMapper,
		"Supplier updated successfully"
	)
);
router.delete(
	"/:id",
	authMiddleware,
	permissionMiddleware(['warehouse:suppliers:delete']),
	validate(deleteSupplierSchema),
	supplierController.delete(supplierService, "Supplier deleted successfully")
);

export default router;