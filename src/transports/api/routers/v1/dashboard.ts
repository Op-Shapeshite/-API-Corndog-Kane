import express from 'express';
import { validate } from '../../validations/validate.middleware';
import { dashboardSchema } from '../../validations/dashboard.validation';
import { DashboardController } from '../../controllers/DashboardController';

const router = express.Router();
const dashboardController = new DashboardController();router.get(
    '/',
    validate(dashboardSchema),
    dashboardController.getDashboard()
);

export default router;
