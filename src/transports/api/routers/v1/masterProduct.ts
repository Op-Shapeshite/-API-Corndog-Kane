import express from 'express';
import { MasterProductController } from '../../controllers/MasterProductController';
import { validate } from '../../validations/validate.middleware';
import {
  productInventoryCreateSchema,
  productInventoryUpdateSchema
} from '../../validations/productInventory.validation';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { validateUnit } from '../../middlewares/unitValidation';

const router = express.Router();

const masterProductController = new MasterProductController();
router.get('/', validate(getPaginationSchema), masterProductController.getAllMasterProducts);
router.get('/:id/inventory', masterProductController.getProductInventory);
router.post('/inventory', validate(productInventoryCreateSchema), validateUnit, masterProductController.createProductInventory);
router.put('/inventory/:id', validate(productInventoryUpdateSchema), validateUnit, masterProductController.updateProductInventory);

export default router;