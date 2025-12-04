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
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();

const masterProductController = new MasterProductController();

router.get('/', authMiddleware, permissionMiddleware(['warehouse:master-products:read']), validate(getPaginationSchema), masterProductController.getAllMasterProducts);

router.get('/:id/inventory', authMiddleware, permissionMiddleware(['warehouse:master-products:inventory:read']), masterProductController.getProductInventory);

router.post('/inventory', authMiddleware, permissionMiddleware(['warehouse:master-products:inventory:create']), validate(productInventoryCreateSchema), validateUnit, masterProductController.createProductInventory);
router.put('/inventory/:id', authMiddleware, permissionMiddleware(['warehouse:master-products:inventory:update']), validate(productInventoryUpdateSchema), validateUnit, masterProductController.updateProductInventory);

export default router;