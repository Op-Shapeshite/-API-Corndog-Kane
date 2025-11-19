import { TTransaction, TTransactionWithID, TransactionType } from "../../../core/entities/finance/transaction";
import { TransactionRepository as ITransactionRepository } from "../../../core/repositories/transaction";
import { PrismaClient } from "@prisma/client";
import { TransactionMapper } from "../../../mappers/mappers/TransactionMapper";
import PostgresAdapter from "../instance";
import { AccountTypeBalance, MonthlyBalance } from "../../../core/entities/finance/report";

export class TransactionRepository implements ITransactionRepository
{
  protected prisma: PrismaClient;
  public mapper: TransactionMapper;
  
  constructor() {
    this.prisma = PostgresAdapter.client;
    this.mapper = new TransactionMapper();
  }

  async create(item: TTransaction): Promise<TTransactionWithID> {
    const created = await this.prisma.transaction.create({
      data: {
        account_id: item.accountId,
        amount: item.amount,
        transaction_type: item.transactionType,
        description: item.description,
        transaction_date: item.transactionDate,
        reference_number: item.referenceNumber,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            number: true
          }
        }
      }
    });

    return this.mapper.mapToEntity(created) as TTransactionWithID;
  }

  async update(id: string, item: Partial<TTransaction>): Promise<TTransactionWithID> {
    const numericId = parseInt(id, 10);

    const updated = await this.prisma.transaction.update({
      where: { id: numericId },
      data: {
        ...(item.accountId !== undefined && { account_id: item.accountId }),
        ...(item.amount !== undefined && { amount: item.amount }),
        ...(item.transactionType !== undefined && { transaction_type: item.transactionType }),
        ...(item.description !== undefined && { description: item.description }),
        ...(item.transactionDate !== undefined && { transaction_date: item.transactionDate }),
        ...(item.referenceNumber !== undefined && { reference_number: item.referenceNumber }),
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            number: true
          }
        }
      }
    });

    return this.mapper.mapToEntity(updated) as TTransactionWithID;
  }

  async getById(id: string): Promise<TTransactionWithID | null> {
    const numericId = parseInt(id, 10);
    
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: numericId },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            number: true
          }
        }
      }
    });

    if (!transaction) return null;
    return this.mapper.mapToEntity(transaction) as TTransactionWithID;
  }

  async getAllTransactions(): Promise<TTransactionWithID[]> {
    const transactions = await this.prisma.transaction.findMany({
      include: {
        account: {
          select: {
            id: true,
            name: true,
            number: true
          }
        }
      },
      orderBy: { transaction_date: 'desc' }
    });

    return transactions.map(t => this.mapper.mapToEntity(t) as TTransactionWithID);
  }

  async getTransactionsByDateRange(
    startDate: Date,
    endDate: Date,
    accountCategoryIds?: number[]
  ): Promise<TTransactionWithID[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        transaction_date: {
          gte: startDate,
          lte: endDate
        },
        ...(accountCategoryIds && accountCategoryIds.length > 0 && {
          account: {
            account_category_id: {
              in: accountCategoryIds
            }
          }
        })
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            number: true,
            account_category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { transaction_date: 'asc' },
        { account: { name: 'asc' } }
      ]
    });

    return transactions.map(t => this.mapper.mapToEntity(t) as TTransactionWithID);
  }

  async getAll(): Promise<{ data: TTransactionWithID[]; total: number; page: number; limit: number; totalPages: number; }> {
    const transactions = await this.getAllTransactions();
    return {
      data: transactions,
      total: transactions.length,
      page: 1,
      limit: transactions.length,
      totalPages: 1
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: { id: parseInt(id) }
    });
  }

  /**
   * Get monthly balances aggregated by account types
   * Filters transactions by date range and account types/numbers
   * Returns monthly breakdown of income, expense, and balance for each account type
   */
  async getMonthlyBalancesByAccountTypes(
    startDate: Date,
    endDate: Date,
    accountTypeCodes: string[],
    accountNumbers: string[]
  ): Promise<AccountTypeBalance[]> {
    // Build filter for accounts
    const accountFilter: any = {
      OR: []
    };

    // Add account type code filter
    if (accountTypeCodes.length > 0) {
      accountFilter.OR.push({
        account_type: {
          code: {
            in: accountTypeCodes
          }
        }
      });
    }

    // Add specific account numbers filter
    if (accountNumbers.length > 0) {
      accountFilter.OR.push({
        number: {
          in: accountNumbers
        }
      });
    }

    // If no filters, return empty
    if (accountFilter.OR.length === 0) {
      return [];
    }

    // Fetch all relevant transactions
    const transactions = await this.prisma.transaction.findMany({
      where: {
        transaction_date: {
          gte: startDate,
          lte: endDate
        },
        account: accountFilter
      },
      include: {
        account: {
          include: {
            account_type: {
              select: {
                code: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { transaction_date: 'asc' }
      ]
    });

    // Group by account type code and month
    const groupedData = new Map<string, { 
      name: string; 
      monthly: Map<string, { income: number; expense: number }> 
    }>();

    transactions.forEach(txn => {
      const typeCode = txn.account.account_type?.code || 'UNKNOWN';
      const typeName = txn.account.account_type?.name || 'Unknown Type';
      const monthKey = this.formatMonthKey(txn.transaction_date);

      // Initialize type group if needed
      if (!groupedData.has(typeCode)) {
        groupedData.set(typeCode, {
          name: typeName,
          monthly: new Map()
        });
      }

      const typeGroup = groupedData.get(typeCode)!;

      // Initialize month if needed
      if (!typeGroup.monthly.has(monthKey)) {
        typeGroup.monthly.set(monthKey, { income: 0, expense: 0 });
      }

      const monthData = typeGroup.monthly.get(monthKey)!;

      // Aggregate amounts
      if (txn.transaction_type === 'INCOME') {
        monthData.income += txn.amount;
      } else if (txn.transaction_type === 'EXPENSE') {
        monthData.expense += txn.amount;
      }
    });

    // Generate month range
    const months = this.generateMonthRange(startDate, endDate);

    // Build result
    const result: AccountTypeBalance[] = [];

    groupedData.forEach((typeData, typeCode) => {
      const monthly: MonthlyBalance[] = months.map(month => {
        const data = typeData.monthly.get(month) || { income: 0, expense: 0 };
        return {
          month,
          income: data.income,
          expense: data.expense,
          balance: data.income - data.expense
        };
      });

      result.push({
        account_type_code: typeCode,
        account_type_name: typeData.name,
        monthly
      });
    });

    return result;
  }

  /**
   * Format date to month key (YYYY-MM)
   */
  private formatMonthKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Generate array of month keys from start to end date
   */
  private generateMonthRange(startDate: Date, endDate: Date): string[] {
    const months: string[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (current <= end) {
      months.push(this.formatMonthKey(current));
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }
}
