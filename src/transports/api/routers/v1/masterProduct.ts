import express from 'express';
import { validate } from '../../validations/validate.middleware';
import { getMasterProductByIdSchema, upsertProductInventorySchema } from '../../validations/masterProduct.validation';
import { MasterProductController } from '../../controllers/MasterProductController';

const router = express.Router();
const masterProductController = new MasterProductController();

// Get all master products (no pagination)
router.get(
  "/",
  masterProductController.getAllMasterProducts
);

// Get product inventories
router.get(
  "/:id/inventory",
  validate(getMasterProductByIdSchema),
  masterProductController.getProductInventories
);

// Create/Update product inventories
router.post(
  "/:id/inventory",
  validate(upsertProductInventorySchema),
  masterProductController.upsertProductInventories
);

// Update product inventories (same as POST for convenience)
router.put(
  "/:id/inventory",
  validate(upsertProductInventorySchema),
  masterProductController.upsertProductInventories
);

export default router;
