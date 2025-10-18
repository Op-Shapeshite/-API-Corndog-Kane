export interface Repository<T> {
  create(item: T): Promise<T>;
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}