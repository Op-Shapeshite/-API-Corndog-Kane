import express from 'express';
import { validate } from '../../validations/validate.middleware';
import { 
  createTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
  getTransactionByIdSchema,
  generateReportSchema
} from '../../validations/transaction.validation';
import { getPaginationSchema } from '../../validations/pagination.validation';
import { TransactionController } from '../../controllers/TransactionController';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();
const transactionController = new TransactionController();

/**
 * @route GET /api/v1/finance/transactions
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:transactions:read']),
  validate(getPaginationSchema),
  transactionController.getAll()
);

/**
 * @route GET /api/v1/finance/transactions/:id
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:transactions:read']),
  validate(getTransactionByIdSchema),
  transactionController.getById()
);

/**
 * @route POST /api/v1/finance/transactions
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.post(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:transactions:create']),
  validate(createTransactionSchema),
  transactionController.create()
);

/**
 * @route PUT /api/v1/finance/transactions/:id
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:transactions:update']),
  validate(updateTransactionSchema),
  transactionController.update()
);

/**
 * @route DELETE /api/v1/finance/transactions/:id
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:transactions:delete']),
  validate(deleteTransactionSchema),
  transactionController.delete()
);

export default router;
