import express from 'express';
import { validate } from '../../validations/validate.middleware';
import { 
  createAccountSchema,
  updateAccountSchema,
  deleteAccountSchema,
  getAccountByIdSchema
} from '../../validations/account.validation';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { AccountController } from '../../controllers/AccountController';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();
const accountController = new AccountController();

/**
 * @route GET /api/v1/finance/accounts
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:accounts:read']),
  validate(getPaginationSchema),
  accountController.getAll()
);

/**
 * @route GET /api/v1/finance/accounts/:id
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:accounts:read']),
  validate(getAccountByIdSchema),
  accountController.getById()
);

/**
 * @route POST /api/v1/finance/accounts
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.post(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:accounts:create']),
  validate(createAccountSchema),
  accountController.create()
);

/**
 * @route PUT /api/v1/finance/accounts/:id
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:accounts:update']),
  validate(updateAccountSchema),
  accountController.update()
);

/**
 * @route DELETE /api/v1/finance/accounts/:id
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:accounts:delete']),
  validate(deleteAccountSchema),
  accountController.delete()
);

export default router;
