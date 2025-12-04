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
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();
const transactionController = new TransactionController();

// GET all transactions with pagination
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:transactions:read']),
  validate(getPaginationSchema),
  transactionController.getAll()
);

// GET transaction by ID
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:transactions:read:detail']),
  validate(getTransactionByIdSchema),
  transactionController.getById()
);

// POST create transaction
router.post(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:transactions:create']),
  validate(createTransactionSchema),
  transactionController.create()
);

// PUT update transaction
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:transactions:update']),
  validate(updateTransactionSchema),
  transactionController.update()
);

// DELETE transaction
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(['finance:transactions:delete']),
  validate(deleteTransactionSchema),
  transactionController.delete()
);

export default router;
