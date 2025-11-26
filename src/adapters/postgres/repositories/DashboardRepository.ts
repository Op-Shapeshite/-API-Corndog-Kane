import { PrismaClient } from '@prisma/client';
import PostgresAdapter from '../instance';

export interface IDashboardRepository {
    getTransactionSum(
        type: 'INCOME' | 'EXPENSE',
        startDate: Date,
        endDate: Date,
        accountIds: number[]
    ): Promise<number>;

    getSoldProductsCount(startDate: Date, endDate: Date): Promise<number>;

    getProductStatistics(
        outletId: number | null,
        startDate: Date,
        endDate: Date
    ): Promise<any[]>;

    getProductDetails(productIds: number[]): Promise<any[]>;

    getCashflowTransactions(
        startDate: Date,
        endDate: Date,
        accountIds: number[]
    ): Promise<any[]>;

    getOrderCountsByOutlet(startDate: Date, endDate: Date): Promise<any[]>;

    getOutletDetails(outletIds: number[]): Promise<any[]>;

    getAllAccountIds(): Promise<number[]>;
}

export class DashboardRepository implements IDashboardRepository {
    protected prisma: PrismaClient;

    constructor() {
        this.prisma = PostgresAdapter.client as PrismaClient;
    }

    /**
     * Get transaction sum by type and date range
     */
    async getTransactionSum(
        type: 'INCOME' | 'EXPENSE',
        startDate: Date,
        endDate: Date,
        accountIds: number[]
    ): Promise<number> {
        const result = await this.prisma.transaction.aggregate({
            where: {
                transaction_type: type,
                account_id: {
                    in: accountIds
                },
                transaction_date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            _sum: {
                amount: true
            }
        });

        return Number(result._sum.amount || 0);
    }

    /**
     * Get sold products count
     */
    async getSoldProductsCount(startDate: Date, endDate: Date): Promise<number> {
        const result = await this.prisma.orderItem.aggregate({
            where: {
                order: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            },
            _sum: {
                quantity: true
            }
        });

        return result._sum.quantity || 0;
    }

    /**
     * Get product statistics grouped by product_id
     * If outletId is null, aggregate across all outlets
     */
    async getProductStatistics(
        outletId: number | null,
        startDate: Date,
        endDate: Date
    ): Promise<any[]> {
        const whereClause: any = {
            order: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }
        };

        // Only filter by outlet if outletId is provided (not null = not 'all')
        if (outletId !== null) {
            whereClause.order.outlet_id = outletId;
        }

        const stats = await this.prisma.orderItem.groupBy({
            by: ['product_id'],
            where: whereClause,
            _sum: {
                quantity: true
            }
        });

        return stats;
    }

    /**
     * Get product details with master data
     */
    async getProductDetails(productIds: number[]): Promise<any[]> {
        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: productIds
                }
            },
            include: {
                product_master: true
            }
        });

        return products;
    }

    /**
     * Get cashflow transactions
     */
    async getCashflowTransactions(
        startDate: Date,
        endDate: Date,
        accountIds: number[]
    ): Promise<any[]> {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                account_id: {
                    in: accountIds
                },
                transaction_date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                transaction_date: 'asc'
            }
        });

        return transactions;
    }

    /**
     * Get order counts grouped by outlet
     */
    async getOrderCountsByOutlet(startDate: Date, endDate: Date): Promise<any[]> {
        const orderCounts = await this.prisma.order.groupBy({
            by: ['outlet_id'],
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            _count: {
                id: true
            }
        });

        return orderCounts;
    }

    /**
     * Get outlet details
     */
    async getOutletDetails(outletIds: number[]): Promise<any[]> {
        const outlets = await this.prisma.outlet.findMany({
            where: {
                id: {
                    in: outletIds
                }
            },
            select: {
                id: true,
                name: true
            }
        });

        return outlets;
    }

    /**
     * Get all account IDs
     */
    async getAllAccountIds(): Promise<number[]> {
        const accounts = await this.prisma.account.findMany({
            select: {
                id: true
            }
        });

        return accounts.map((account: any) => account.id);
    }
}
