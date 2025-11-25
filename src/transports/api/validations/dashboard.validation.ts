import { z } from 'zod';

/**
 * Dashboard validation schema
 * All parameters are REQUIRED (no defaults)
 */
export const dashboardSchema = z.object({
    query: z.object({
        // Income type filter
        income_type: z.enum(['today', 'weekly', 'monthly']),

        // Sold product type filter  
        sold_product_type: z.enum(['today', 'weekly', 'monthly']),

        // Expense type filter
        expense_type: z.enum(['today', 'weekly', 'monthly']),

        // Profit type filter
        profit_type: z.enum(['today', 'weekly', 'monthly']),

        // Product sales outlet filter
        product_sales_outlet_id: z.string().transform((val) => parseInt(val, 10)).pipe(
            z.number().int().positive('product_sales_outlet_id must be a positive integer')
        ),

        // Product sales date range
        product_sales_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'product_sales_start_date must be in YYYY-MM-DD format'),

        product_sales_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'product_sales_end_date must be in YYYY-MM-DD format'),

        // Accounts IDs filter (comma-separated)
        accounts_ids: z.string().transform((val) => {
            const ids = val.split(',').map(id => parseInt(id.trim(), 10));
            if (ids.some(id => isNaN(id) || id <= 0)) {
                throw new Error('accounts_ids must be comma-separated positive integers');
            }
            return ids;
        }),

        // Cashflow type filter
        cashflow_type: z.enum(['yearly', 'monthly', 'weekly', 'daily']),

        // Customer growth type filter
        customer_growth_type: z.enum(['daily', 'monthly', 'weekly', 'yearly'])
    })
}).refine((data) => {
    // Validate date range: end_date >= start_date
    const startDate = new Date(data.query.product_sales_start_date);
    const endDate = new Date(data.query.product_sales_end_date);
    return endDate >= startDate;
}, {
    message: 'product_sales_end_date must be greater than or equal to product_sales_start_date',
    path: ['query', 'product_sales_end_date']
});
