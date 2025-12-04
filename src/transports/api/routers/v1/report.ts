import express from 'express';
import { validate } from '../../validations/validate.middleware';
import { generateReportSchema } from '../../validations/transaction.validation';
import { TransactionController } from '../../controllers/TransactionController';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();
const transactionController = new TransactionController();

// GET /finance/reports - Generate finance report
router.get(
  "/",
  authMiddleware,
  permissionMiddleware(['finance:reports:income-statement:read', 'finance:reports:balance-sheet:read', 'finance:reports:cash-flow:read']),
  validate(generateReportSchema),
  transactionController.generateReport()
);

export default router;
