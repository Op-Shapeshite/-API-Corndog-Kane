import { Request, Response } from 'express';
import { TMetadataResponse } from '../../../core/entities/base/response';
import { TDashboardResponse } from '../../../core/entities/dashboard/dashboard';
import { DashboardService } from '../../../core/services/DashboardService';
import { DashboardRepository } from '../../../adapters/postgres/repositories/DashboardRepository';
import Controller from './Controller';

export class DashboardController extends Controller<TDashboardResponse, TMetadataResponse> {
    private dashboardService: DashboardService;

    constructor() {
        super();
        const dashboardRepository = new DashboardRepository();
        this.dashboardService = new DashboardService(dashboardRepository);
    }

    /**
     * GET /dashboard
     * Get all dashboard metrics with filters
     */
    getDashboard = () => {
        return async (req: Request, res: Response) => {
            try {
                // Extract validated query params (already validated and transformed by middleware)
                const {
                    income_type,
                    sold_product_type,
                    expense_type,
                    profit_type,
                    product_sales_outlet_id,
                    product_sales_start_date,
                    product_sales_end_date,
                    accounts_ids,
                    cashflow_type,
                    customer_growth_type
                } = req.query;

                // Get dashboard data
                const dashboardData = await this.dashboardService.getDashboardData({
                    income_type: income_type as 'today' | 'weekly' | 'monthly',
                    sold_product_type: sold_product_type as 'today' | 'weekly' | 'monthly',
                    expense_type: expense_type as 'today' | 'weekly' | 'monthly',
                    profit_type: profit_type as 'today' | 'weekly' | 'monthly',
                    product_sales_outlet_id: product_sales_outlet_id as unknown as number,
                    product_sales_start_date: product_sales_start_date as string,
                    product_sales_end_date: product_sales_end_date as string,
                    accounts_ids: accounts_ids as unknown as number[],
                    cashflow_type: cashflow_type as 'yearly' | 'monthly' | 'weekly' | 'daily',
                    customer_growth_type: customer_growth_type as 'daily' | 'monthly' | 'weekly' | 'yearly'
                });

                return this.getSuccessResponse(
                    res,
                    {
                        data: dashboardData,
                        metadata: {} as TMetadataResponse
                    },
                    'Data dashboard berhasil diambil'
                );
            } catch (error) {
                return this.handleError(
                    res,
                    error,
                    'Gagal mengambil data dashboard',
                    500,
                    {
                        income: { value: 0, increase_percentage: 0 },
                        sold_products: { value: 0, increase_percentage: 0 },
                        expenses: { value: 0, increase_percentage: 0 },
                        profits: { value: 0, increase_percentage: 0 },
                        products_statistics: [],
                        cashflow: [],
                        customer_growth: []
                    } as TDashboardResponse,
                    {} as TMetadataResponse
                );
            }
        };
    };
}
