// ============================================================================
// DASHBOARD ENTITIES - Dashboard Metrics & Statistics
// ============================================================================

/**
 * Metric with increase percentage from previous period
 */
export type TMetricWithPercentage = {
    value: number;
    increase_percentage: number;
};

/**
 * Product sales statistics with increase percentage
 */
export type TProductStatistic = {
    product_name: string;
    count: number;
    increase_percentage: number;
};

/**
 * Cashflow item for a specific period
 */
export type TCashflowItem = {
    period: string; // e.g., "2025-01" for month, "2025-01-15" for day
    income: number;
    expenses: number;
};

/**
 * Customer growth per outlet
 */
export type TCustomerGrowth = {
    outlet_name: string;
    count: number;
};

/**
 * Complete dashboard response
 */
export type TDashboardResponse = {
    income: TMetricWithPercentage;
    sold_products: TMetricWithPercentage;
    expenses: TMetricWithPercentage;
    profits: TMetricWithPercentage;
    products_statistics: TProductStatistic[];
    cashflow: TCashflowItem[];
    customer_growth: TCustomerGrowth[];
};

/**
 * Dashboard query parameters
 */
export type TDashboardQueryParams = {
    income_type: 'today' | 'weekly' | 'monthly';
    sold_product_type: 'today' | 'weekly' | 'monthly';
    expense_type: 'today' | 'weekly' | 'monthly';
    profit_type: 'today' | 'weekly' | 'monthly';
    product_sales_outlet_id: number | 'all'; // Support 'all' for all outlets
    product_sales_start_date: string; // YYYY-MM-DD
    product_sales_end_date: string; // YYYY-MM-DD
    accounts_ids: number[] | 'all'; // Support 'all' for all accounts
    cashflow_type: 'yearly' | 'monthly' | 'weekly' | 'daily';
    customer_growth_type: 'daily' | 'monthly' | 'weekly' | 'yearly';
};

/**
 * Period calculation result for increase percentage
 */
export type TPeriodData<T = number> = {
    current: T;
    previous: T;
    increase_percentage: number;
};
