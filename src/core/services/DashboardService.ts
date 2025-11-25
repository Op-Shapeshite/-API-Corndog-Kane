import {
    TDashboardResponse,
    TDashboardQueryParams,
    TMetricWithPercentage,
    TProductStatistic,
    TCashflowItem,
    TCustomerGrowth
} from '../entities/dashboard/dashboard';
import { DashboardRepository } from '../../adapters/postgres/repositories/DashboardRepository';

export class DashboardService {
    private repository: DashboardRepository;

    constructor(repository?: DashboardRepository) {
        this.repository = repository || new DashboardRepository();
    }

    /**
     * Get complete dashboard data with all metrics
     */
    async getDashboardData(params: TDashboardQueryParams): Promise<TDashboardResponse> {
        const [
            income,
            soldProducts,
            expenses,
            profits,
            productsStatistics,
            cashflow,
            customerGrowth
        ] = await Promise.all([
            this.getIncomeWithPercentage(params.income_type, params.accounts_ids),
            this.getSoldProductsWithPercentage(params.sold_product_type),
            this.getExpensesWithPercentage(params.expense_type, params.accounts_ids),
            this.getProfitsWithPercentage(params.profit_type, params.accounts_ids),
            this.getProductsStatistics(
                params.product_sales_outlet_id,
                params.product_sales_start_date,
                params.product_sales_end_date
            ),
            this.getCashflow(params.cashflow_type, params.accounts_ids),
            this.getCustomerGrowth(params.customer_growth_type)
        ]);

        return {
            income,
            sold_products: soldProducts,
            expenses,
            profits,
            products_statistics: productsStatistics,
            cashflow,
            customer_growth: customerGrowth
        };
    }

    /**
     * Get income with increase percentage
     */
    private async getIncomeWithPercentage(
        type: 'today' | 'weekly' | 'monthly',
        accountIds: number[]
    ): Promise<TMetricWithPercentage> {
        const { startDate, endDate } = this.getDateRange(type);
        const { startDate: prevStartDate, endDate: prevEndDate } = this.getPreviousDateRange(type);

        const [current, previous] = await Promise.all([
            this.repository.getTransactionSum('INCOME', startDate, endDate, accountIds),
            this.repository.getTransactionSum('INCOME', prevStartDate, prevEndDate, accountIds)
        ]);

        return {
            value: current,
            increase_percentage: this.calculateIncreasePercentage(current, previous)
        };
    }

    /**
     * Get sold products with increase percentage
     */
    private async getSoldProductsWithPercentage(
        type: 'today' | 'weekly' | 'monthly'
    ): Promise<TMetricWithPercentage> {
        const { startDate, endDate } = this.getDateRange(type);
        const { startDate: prevStartDate, endDate: prevEndDate } = this.getPreviousDateRange(type);

        const [current, previous] = await Promise.all([
            this.repository.getSoldProductsCount(startDate, endDate),
            this.repository.getSoldProductsCount(prevStartDate, prevEndDate)
        ]);

        return {
            value: current,
            increase_percentage: this.calculateIncreasePercentage(current, previous)
        };
    }

    /**
     * Get expenses with increase percentage
     */
    private async getExpensesWithPercentage(
        type: 'today' | 'weekly' | 'monthly',
        accountIds: number[]
    ): Promise<TMetricWithPercentage> {
        const { startDate, endDate } = this.getDateRange(type);
        const { startDate: prevStartDate, endDate: prevEndDate } = this.getPreviousDateRange(type);

        const [current, previous] = await Promise.all([
            this.repository.getTransactionSum('EXPENSE', startDate, endDate, accountIds),
            this.repository.getTransactionSum('EXPENSE', prevStartDate, prevEndDate, accountIds)
        ]);

        return {
            value: current,
            increase_percentage: this.calculateIncreasePercentage(current, previous)
        };
    }

    /**
     * Get profits with increase percentage
     */
    private async getProfitsWithPercentage(
        type: 'today' | 'weekly' | 'monthly',
        accountIds: number[]
    ): Promise<TMetricWithPercentage> {
        const { startDate, endDate } = this.getDateRange(type);
        const { startDate: prevStartDate, endDate: prevEndDate } = this.getPreviousDateRange(type);

        const [currentIncome, currentExpense, prevIncome, prevExpense] = await Promise.all([
            this.repository.getTransactionSum('INCOME', startDate, endDate, accountIds),
            this.repository.getTransactionSum('EXPENSE', startDate, endDate, accountIds),
            this.repository.getTransactionSum('INCOME', prevStartDate, prevEndDate, accountIds),
            this.repository.getTransactionSum('EXPENSE', prevStartDate, prevEndDate, accountIds)
        ]);

        const current = currentIncome - currentExpense;
        const previous = prevIncome - prevExpense;

        return {
            value: current,
            increase_percentage: this.calculateIncreasePercentage(current, previous)
        };
    }

    /**
     * Get products statistics with increase percentage
     */
    private async getProductsStatistics(
        outletId: number,
        startDate: string,
        endDate: string
    ): Promise<TProductStatistic[]> {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Calculate previous period
        const diff = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - diff);

        // Get current and previous period stats
        const [currentStats, previousStats] = await Promise.all([
            this.repository.getProductStatistics(outletId, start, end),
            this.repository.getProductStatistics(outletId, prevStart, prevEnd)
        ]);

        // Create a map for previous stats
        const prevStatsMap = new Map<number, number>(
            previousStats.map((stat: any) => [stat.product_id, stat._sum.quantity || 0])
        );

        // Get product details
        const productIds = currentStats.map((stat: any) => stat.product_id);
        const products = await this.repository.getProductDetails(productIds);

        const productMap = new Map<number, string>(
            products.map((p: any) => [p.id, p.product_master.name])
        );

        return currentStats.map((stat: any) => {
            const currentCount = stat._sum.quantity || 0;
            const previousCount = prevStatsMap.get(stat.product_id) || 0;

            return {
                product_name: productMap.get(stat.product_id) || 'Unknown Product',
                count: currentCount,
                increase_percentage: this.calculateIncreasePercentage(currentCount, previousCount)
            };
        });
    }

    /**
     * Get cashflow data grouped by period
     */
    private async getCashflow(
        type: 'yearly' | 'monthly' | 'weekly' | 'daily',
        accountIds: number[]
    ): Promise<TCashflowItem[]> {
        const { startDate, endDate } = this.getCashflowDateRange(type);

        const transactions = await this.repository.getCashflowTransactions(
            startDate,
            endDate,
            accountIds
        );

        // Group by period
        const grouped = new Map<string, { income: number; expenses: number }>();

        transactions.forEach((t: any) => {
            const period = this.formatPeriod(t.transaction_date, type);

            if (!grouped.has(period)) {
                grouped.set(period, { income: 0, expenses: 0 });
            }

            const data = grouped.get(period)!;
            if (t.transaction_type === 'INCOME') {
                data.income += Number(t.amount);
            } else {
                data.expenses += Number(t.amount);
            }
        });

        return Array.from(grouped.entries()).map(([period, data]) => ({
            period,
            income: data.income,
            expenses: data.expenses
        }));
    }

    /**
     * Get customer growth per outlet
     */
    private async getCustomerGrowth(
        type: 'daily' | 'monthly' | 'weekly' | 'yearly'
    ): Promise<TCustomerGrowth[]> {
        const { startDate, endDate } = this.getCustomerGrowthDateRange(type);

        const orderCounts = await this.repository.getOrderCountsByOutlet(startDate, endDate);

        const outletIds = orderCounts.map((oc: any) => oc.outlet_id);
        const outlets = await this.repository.getOutletDetails(outletIds);

        const outletMap = new Map<number, string>(outlets.map((o: any) => [o.id, o.name]));

        return orderCounts.map((oc: any) => ({
            outlet_name: outletMap.get(oc.outlet_id) || 'Unknown Outlet',
            count: oc._count.id
        }));
    }

    /**
     * Helper: Calculate increase percentage
     */
    private calculateIncreasePercentage(current: number, previous: number): number {
        if (previous === 0) {
            return current > 0 ? 100 : 0;
        }
        return Number((((current - previous) / previous) * 100).toFixed(2));
    }

    /**
     * Helper: Get date range based on type
     */
    private getDateRange(type: 'today' | 'weekly' | 'monthly'): { startDate: Date; endDate: Date } {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);

        let startDate = new Date(now);

        switch (type) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                startDate.setDate(now.getDate() - 6);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
        }

        return { startDate, endDate };
    }

    /**
     * Helper: Get previous period date range
     */
    private getPreviousDateRange(type: 'today' | 'weekly' | 'monthly'): { startDate: Date; endDate: Date } {
        const now = new Date();
        let endDate = new Date(now);
        let startDate = new Date(now);

        switch (type) {
            case 'today':
                endDate.setDate(now.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);
                startDate.setDate(now.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                endDate.setDate(now.getDate() - 7);
                endDate.setHours(23, 59, 59, 999);
                startDate.setDate(now.getDate() - 13);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                endDate.setHours(23, 59, 59, 999);
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                startDate.setHours(0, 0, 0, 0);
                break;
        }

        return { startDate, endDate };
    }

    /**
     * Helper: Get customer growth date range
     */
    private getCustomerGrowthDateRange(type: 'daily' | 'monthly' | 'weekly' | 'yearly'): { startDate: Date; endDate: Date } {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);

        let startDate = new Date(now);

        switch (type) {
            case 'daily':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                startDate.setDate(now.getDate() - 6);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'yearly':
                startDate.setFullYear(now.getFullYear(), 0, 1);
                startDate.setHours(0, 0, 0, 0);
                break;
        }

        return { startDate, endDate };
    }

    /**
     * Helper: Get cashflow date range
     */
    private getCashflowDateRange(type: 'yearly' | 'monthly' | 'weekly' | 'daily'): { startDate: Date; endDate: Date } {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);

        let startDate = new Date(now);

        switch (type) {
            case 'daily':
                startDate.setDate(now.getDate() - 29); // Last 30 days
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                startDate.setDate(now.getDate() - (7 * 11)); // Last 12 weeks
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                startDate.setMonth(now.getMonth() - 11); // Last 12 months
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'yearly':
                startDate.setFullYear(now.getFullYear() - 4); // Last 5 years
                startDate.setMonth(0);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
        }

        return { startDate, endDate };
    }

    /**
     * Helper: Format period based on type
     */
    private formatPeriod(date: Date, type: 'yearly' | 'monthly' | 'weekly' | 'daily'): string {
        const d = new Date(date);

        switch (type) {
            case 'daily':
                return d.toISOString().split('T')[0]; // YYYY-MM-DD
            case 'weekly':
                const weekNum = this.getWeekNumber(d);
                return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
            case 'monthly':
                return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            case 'yearly':
                return d.getFullYear().toString();
        }
    }

    /**
     * Helper: Get week number
     */
    private getWeekNumber(date: Date): number {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }
}
