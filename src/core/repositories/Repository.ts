// Search configuration for LIKE queries
export interface SearchConfig {
  field: string;
  value: string;
}

// Pagination result type
export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default interface Repository<T> {
  create(item: T): Promise<T>;
  getById(id: string): Promise<T | null>;
  getAll(
    page?: number, 
    limit?: number, 
    search?: SearchConfig[],
    filters?: Record<string, unknown>,
    orderBy?: Record<string, 'asc' | 'desc'>
  ): Promise<PaginationResult<T>>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}