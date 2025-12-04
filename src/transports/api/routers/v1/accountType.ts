import express from 'express';
import { AccountTypeController } from '../../controllers/AccountTypeController';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { validate } from '../../validations/validate.middleware';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();
const accountTypeController = new AccountTypeController();

// GET all account types with pagination
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:account-types:read']),
  validate(getPaginationSchema),
  accountTypeController.getAll()
);

// GET account type by ID
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:account-types:read:detail']),
  accountTypeController.getById()
);

export default router;
