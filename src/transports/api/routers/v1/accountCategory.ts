import express from 'express';
import { AccountCategoryController } from '../../controllers/AccountCategoryController';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { validate } from '../../validations/validate.middleware';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();
const accountCategoryController = new AccountCategoryController();

/**
 * @route GET /api/v1/finance/account-categories
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:account-categories:read']),
  validate(getPaginationSchema),
  accountCategoryController.getAll()
);

export default router;
