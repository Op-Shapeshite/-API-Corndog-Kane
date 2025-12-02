
import express from 'express';
import { SupplierController } from '../../controllers';
import { validate } from '../../validations/validate.middleware';
import { createSupplierSchema,updateSupplierSchema,deleteSupplierSchema } from '../../validations/supplier.validation';
import SupplierService from '../../../../core/services/SupplierService';
import SupplierRepository from '../../../../adapters/postgres/repositories/SupplierRepository';
import { SupplierResponseMapper } from "../../../../mappers/response-mappers";
import { getPaginationSchema } from '../../validations/pagination.validation';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();

const supplierController = new SupplierController();
const supplierService = new SupplierService(new SupplierRepository());

/**
 * @route GET /api/v1/suppliers
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.get(
	"/",
	authMiddleware,
	permissionMiddleware(['warehouse:suppliers:read']),
	validate(getPaginationSchema),
	supplierController.findAll(supplierService, SupplierResponseMapper)
);

/**
 * @route POST /api/v1/suppliers
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.post(
	"/",
	authMiddleware,
	permissionMiddleware(['warehouse:suppliers:create']),
	validate(createSupplierSchema),
	supplierController.create(
		supplierService,
		SupplierResponseMapper,
		"Supplier berhasil dibuat"
	)
);

/**
 * @route PUT /api/v1/suppliers/:id
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.put(
	"/:id",
	authMiddleware,
	permissionMiddleware(['warehouse:suppliers:update']),
	validate(updateSupplierSchema),
	supplierController.update(
		supplierService,
		SupplierResponseMapper,
		"Supplier berhasil diperbarui"
	)
);

/**
 * @route DELETE /api/v1/suppliers/:id
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.delete(
	"/:id",
	authMiddleware,
	permissionMiddleware(['warehouse:suppliers:delete']),
	validate(deleteSupplierSchema),
	supplierController.delete(supplierService, "Supplier berhasil dihapus")
);

export default router;