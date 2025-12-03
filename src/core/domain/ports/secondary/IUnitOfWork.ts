/**
 * Unit of Work Port (Secondary Port)
 * Defines the contract for transaction management
 * Infrastructure adapters must implement this interface
 */
export interface IUnitOfWork {
  /**
   * Execute work within a transaction
   * Automatically commits on success, rolls back on error
   */
  execute<T>(work: (transaction: TransactionContext) => Promise<T>): Promise<T>;

  /**
   * Begin a new transaction
   */
  begin(): Promise<TransactionContext>;

  /**
   * Commit the current transaction
   */
  commit(context: TransactionContext): Promise<void>;

  /**
   * Rollback the current transaction
   */
  rollback(context: TransactionContext): Promise<void>;
}

/**
 * Transaction Context for managing transaction state
 */
export interface TransactionContext {
  /**
   * Transaction identifier
   */
  id: string;

  /**
   * Transaction client (infrastructure specific)
   */
  client: unknown;

  /**
   * Check if transaction is active
   */
  isActive: boolean;
}

/**
 * Unit of Work Manager for coordinating multiple units of work
 */
export interface IUnitOfWorkManager {
  /**
   * Get or create a unit of work for the current scope
   */
  getCurrent(): IUnitOfWork;

  /**
   * Create a new unit of work
   */
  create(): IUnitOfWork;
}
