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
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();
const accountController = new AccountController();

// GET all accounts (with optional category filter)
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:accounts:read']),
  validate(getPaginationSchema),
  accountController.getAll()
);

// GET account by ID
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:accounts:read:detail']),
  validate(getAccountByIdSchema),
  accountController.getById()
);

// POST create account
router.post(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:accounts:create']),
  validate(createAccountSchema),
  accountController.create()
);

// PUT update account
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:accounts:update']),
  validate(updateAccountSchema),
  accountController.update()
);

// DELETE account
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:accounts:delete']),
  validate(deleteAccountSchema),
  accountController.delete()
);

export default router;
