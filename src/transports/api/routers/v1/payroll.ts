import express from 'express';
import { PayrollController } from '../../controllers/PayrollController';
import PayrollService from '../../../../core/services/PayrollService';
import PayrollRepository from '../../../../adapters/postgres/repositories/PayrollRepository';
import OutletRepository from '../../../../adapters/postgres/repositories/OutletRepository';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();
const payrollController = new PayrollController();
const payrollRepository = new PayrollRepository();
const outletRepository = new OutletRepository();
const payrollService = new PayrollService(payrollRepository, outletRepository);

// All routes require authentication
router.use(authMiddleware);
router.post('/', permissionMiddleware(['finance:payroll:create']), (req, res) => payrollController.createInternalPayrollTemplate(req, res, payrollService));
router.get('/', permissionMiddleware(['finance:payroll:read']), (req, res) => payrollController.getAllPayrolls(req, res, payrollService));
router.get('/pay/:employee_id', permissionMiddleware(['finance:payroll:pay:read']), (req, res) => payrollController.getPaymentSlip(req, res, payrollService));
router.get('/:employee_id', permissionMiddleware(['finance:payroll:read:detail']), (req, res) => payrollController.getPayrollDetail(req, res, payrollService));
router.put('/:employee_id', permissionMiddleware(['finance:payroll:update']), (req, res) => payrollController.updatePayroll(req, res, payrollService));
router.post('/pay/:employee_id', permissionMiddleware(['finance:payroll:pay:create']), (req, res) => payrollController.createPayment(req, res, payrollService));

export default router;
