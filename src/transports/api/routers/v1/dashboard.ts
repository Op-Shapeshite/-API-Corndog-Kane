import express from 'express';
import { validate } from '../../validations/validate.middleware';
import { dashboardSchema } from '../../validations/dashboard.validation';
import { DashboardController } from '../../controllers/DashboardController';
import { authMiddleware } from '../../../../policies/authMiddleware';
import { permissionMiddleware } from '../../../../policies';

const router = express.Router();
const dashboardController = new DashboardController();
router.get(
    '/',
    authMiddleware,
    permissionMiddleware(['dashboard:stats:read']),
    validate(dashboardSchema),
    dashboardController.getDashboard()
);

export default router;
