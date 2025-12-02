import express from 'express';
import { validate } from '../../validations/validate.middleware';
import { generateReportSchema } from '../../validations/transaction.validation';
import { TransactionController } from '../../controllers/TransactionController';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies/permissionMiddleware';

const router = express.Router();
const transactionController = new TransactionController();

/**
 * @route GET /api/v1/finance/reports
 * @access FINANCE | ADMIN | SUPERADMIN
 */
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:reports:read']),
  validate(generateReportSchema),
  transactionController.generateReport()
);

export default router;
