import express from 'express';
import { PayrollController } from '../../controllers/PayrollController';
import PayrollService from '../../../../core/services/PayrollService';
import PayrollRepository from '../../../../adapters/postgres/repositories/PayrollRepository';
import OutletRepository from '../../../../adapters/postgres/repositories/OutletRepository';
import { authMiddleware } from '../../../../policies/authMiddleware';

const router = express.Router();
const payrollController = new PayrollController();
const payrollRepository = new PayrollRepository();
const outletRepository = new OutletRepository();
const payrollService = new PayrollService(payrollRepository, outletRepository);

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/v1/finance/payroll
 * Create payroll template for internal employees (HR, Finance, Warehouse, etc.)
 * Body: { employee_id: number, salary: number }
 */
router.post('/', (req, res) => payrollController.createInternalPayrollTemplate(req, res, payrollService));

/**
 * GET /api/v1/finance/payroll
 * Get all employee payroll summary
 * Query params: start_date, end_date
 */
router.get('/', (req, res) => payrollController.getAllPayrolls(req, res, payrollService));

/**
 * GET /api/v1/finance/payroll/pay/:employee_id
 * Get payment slip (preview or paid)
 * Query params: start_date, end_date
 */
router.get('/pay/:employee_id', (req, res) => payrollController.getPaymentSlip(req, res, payrollService));

/**
 * GET /api/v1/finance/payroll/:employee_id
 * Get payroll detail for editing
 * Query params: start_date, end_date
 */
router.get('/:employee_id', (req, res) => payrollController.getPayrollDetail(req, res, payrollService));

/**
 * PUT /api/v1/finance/payroll/:employee_id
 * Update period and add manual adjustments
 * Body: { start_period, end_period, bonus?, deductions? }
 */
router.put('/:employee_id', (req, res) => payrollController.updatePayroll(req, res, payrollService));

/**
 * POST /api/v1/finance/payroll/:employee_id
 * Create payment batch (pay salary)
 * No request body required
 */
router.post('/pay/:employee_id', (req, res) => payrollController.createPayment(req, res, payrollService));

export default router;
