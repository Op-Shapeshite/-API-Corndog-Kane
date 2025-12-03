import { PrismaClient, Prisma } from '@prisma/client';
import { IUnitOfWork, TransactionContext, IUnitOfWorkManager } from '../../core/domain/ports/secondary/IUnitOfWork';

type PrismaTransactionClient = Prisma.TransactionClient;

/**
 * Prisma Unit of Work Adapter
 * Implements Unit of Work pattern for Prisma transactions
 */
export class PrismaUnitOfWork implements IUnitOfWork {
  private prisma: PrismaClient;
  private transactionId: number = 0;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async execute<T>(work: (transaction: TransactionContext) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      const context: TransactionContext = {
        id: `txn_${++this.transactionId}`,
        client: tx,
        isActive: true,
      };

      try {
        const result = await work(context);
        return result;
      } catch (error) {
        context.isActive = false;
        throw error;
      }
    });
  }

  async begin(): Promise<TransactionContext> {
    // Note: Prisma interactive transactions require different handling
    // This is a simplified version for demonstration
    const context: TransactionContext = {
      id: `txn_${++this.transactionId}`,
      client: this.prisma,
      isActive: true,
    };
    return context;
  }

  async commit(_context: TransactionContext): Promise<void> {
    // Prisma handles commit automatically in $transaction
    _context.isActive = false;
  }

  async rollback(_context: TransactionContext): Promise<void> {
    // Prisma handles rollback automatically on error in $transaction
    _context.isActive = false;
  }

  /**
   * Get the Prisma transaction client from context
   */
  static getClient(context: TransactionContext): PrismaTransactionClient {
    return context.client as PrismaTransactionClient;
  }
}

/**
 * Unit of Work Manager for managing unit of work instances
 */
export class PrismaUnitOfWorkManager implements IUnitOfWorkManager {
  private prisma: PrismaClient;
  private currentUnitOfWork: IUnitOfWork | null = null;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  getCurrent(): IUnitOfWork {
    if (!this.currentUnitOfWork) {
      this.currentUnitOfWork = this.create();
    }
    return this.currentUnitOfWork;
  }

  create(): IUnitOfWork {
    return new PrismaUnitOfWork(this.prisma);
  }
}
