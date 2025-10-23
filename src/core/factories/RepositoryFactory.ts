import Repository from "../../adapters/postgres/repositories/Repository";
import UserRepository from "../../adapters/postgres/repositories/UserRepository";
import OutletRepository from "../../adapters/postgres/repositories/OutletRepository";
import RoleRepository from "../../adapters/postgres/repositories/RoleRepository";
import EmployeeRepository from "../../adapters/postgres/repositories/EmployeeRepository";
import { TEntity } from "../services/Service";

/**
 * Factory Pattern: RepositoryFactory
 * Centralizes repository creation and manages singleton instances
 * Benefits: Prevents multiple instances, easier testing, centralized dependency management
 */
export class RepositoryFactory {
  private static instances = new Map<string, Repository<TEntity>>();

  static getUserRepository(): UserRepository {
    if (!this.instances.has('user')) {
      this.instances.set('user', new UserRepository());
    }
    return this.instances.get('user') as UserRepository;
  }

  static getOutletRepository(): OutletRepository {
    if (!this.instances.has('outlet')) {
      this.instances.set('outlet', new OutletRepository());
    }
    return this.instances.get('outlet') as OutletRepository;
  }

  static getRoleRepository(): RoleRepository {
    if (!this.instances.has('role')) {
      this.instances.set('role', new RoleRepository());
    }
    return this.instances.get('role') as RoleRepository;
  }

  static getEmployeeRepository(): EmployeeRepository {
    if (!this.instances.has('employee')) {
      this.instances.set('employee', new EmployeeRepository());
    }
    return this.instances.get('employee') as EmployeeRepository;
  }

  /**
   * Clear all instances (useful for testing)
   */
  static clearInstances(): void {
    this.instances.clear();
  }

  /**
   * Set a mock repository (useful for testing)
   */
  static setMockRepository<T extends TEntity>(key: string, repository: Repository<T>): void {
    this.instances.set(key, repository as Repository<TEntity>);
  }
}
