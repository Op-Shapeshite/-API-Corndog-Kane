import { TOutlet } from "../entities/outlet/outlet";
import { TUser } from "../entities/user/user";
import { Repository } from "../repositories";

type TEntity = TUser | TOutlet;

export class Service<T extends TEntity> {
	repository: Repository<T>;
	constructor(repository: Repository<T>) {
		this.repository = repository;
	}
	async findById(id: string): Promise<T | null>  {
		return this.repository.getById(id);
	}
	async findAll(): Promise<T[]> {
		return this.repository.getAll();
  }
  async create(item: T): Promise<T> {
    return this.repository.create(item);
  }
  async update(id: string, item: Partial<T>): Promise<T> {
    return this.repository.update(id, item);
  }
  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
  
}