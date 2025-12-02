import express from 'express';
import { AccountTypeController } from '../../controllers/AccountTypeController';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { validate } from '../../validations/validate.middleware';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();
const accountTypeController = new AccountTypeController();

/**
 * @route GET /api/v1/finance/account-types
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:account-types:read']),
  validate(getPaginationSchema),
  accountTypeController.getAll()
);

/**
 * @route GET /api/v1/finance/account-types/:id
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:account-types:read']),
  accountTypeController.getById()
);

export default router;
