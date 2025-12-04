import express from 'express';
import { validate } from '../../validations/validate.middleware';
import { dashboardSchema } from '../../validations/dashboard.validation';
import { DashboardController } from '../../controllers/DashboardController';

const router = express.Router();
const dashboardController = new DashboardController();

/**
 * GET /dashboard
 * Get dashboard metrics with all required filters
 * 
 * Query Parameters (ALL REQUIRED):
 * - income_type: today|weekly|monthly
 * - sold_product_type: today|weekly|monthly
 * - expense_type: today|weekly|monthly
 * - profit_type: today|weekly|monthly
 * - product_sales_outlet_id: number
 * - product_sales_start_date: YYYY-MM-DD
 * - product_sales_end_date: YYYY-MM-DD
 * - accounts_ids: comma-separated numbers (e.g., 1,2,3)
 * - cashflow_type: yearly|monthly|weekly|daily
 * - customer_growth_type: daily|monthly|weekly|yearly
 */
router.get(
    '/',
    validate(dashboardSchema),
    dashboardController.getDashboard()
);

export default router;
