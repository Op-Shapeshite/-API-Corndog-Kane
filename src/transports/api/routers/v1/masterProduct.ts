import express from 'express';
import { MasterProductController } from '../../controllers/MasterProductController';
import { validate } from '../../validations/validate.middleware';
import {
  productInventoryCreateSchema,
  productInventoryUpdateSchema
} from '../../validations/productInventory.validation';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { validateUnit } from '../../middlewares/unitValidation';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();

const masterProductController = new MasterProductController();

/**
 * @route GET /api/v1/master-products
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.get('/', 
  authMiddleware,
  permissionMiddleware(['warehouse:master-products:read']),
  validate(getPaginationSchema), 
  masterProductController.getAllMasterProducts
);

/**
 * @route GET /api/v1/master-products/:id/inventory
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.get('/:id/inventory', 
  authMiddleware,
  permissionMiddleware(['warehouse:master-products:inventory:read']),
  masterProductController.getProductInventory
);

/**
 * @route POST /api/v1/master-products/inventory
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.post('/inventory', 
  authMiddleware,
  permissionMiddleware(['warehouse:master-products:inventory:create']),
  validate(productInventoryCreateSchema), 
  validateUnit, 
  masterProductController.createProductInventory
);

/**
 * @route PUT /api/v1/master-products/inventory/:id
 * @access WAREHOUSE | ADMIN | SUPERADMIN
 */
router.put('/inventory/:id', 
  authMiddleware,
  permissionMiddleware(['warehouse:master-products:inventory:update']),
  validate(productInventoryUpdateSchema), 
  validateUnit, 
  masterProductController.updateProductInventory
);

export default router;