import { Service, TEntity } from "../services/Service";
import UserService from "../services/UserService";
import OutletService from "../services/OutletService";
import RoleService from "../services/RoleService";
import EmployeeService from "../services/EmployeeService";
import { AuthService } from "../services/AuthService";
import { RepositoryFactory } from "./RepositoryFactory";

/**
 * Factory Pattern: ServiceFactory
 * Centralizes service creation with automatic dependency injection
 * Benefits: Single point of service creation, automatic dependency wiring, easier testing
 */
export class ServiceFactory {
  private static instances = new Map<string, Service<TEntity>>();

  static getUserService(): UserService {
    if (!this.instances.has('user')) {
      this.instances.set('user', new UserService(
        RepositoryFactory.getUserRepository()
      ));
    }
    return this.instances.get('user') as UserService;
  }

  static getOutletService(): OutletService {
    if (!this.instances.has('outlet')) {
      this.instances.set('outlet', new OutletService(
        RepositoryFactory.getOutletRepository()
      ));
    }
    return this.instances.get('outlet') as OutletService;
  }

  static getRoleService(): RoleService {
    if (!this.instances.has('role')) {
      this.instances.set('role', new RoleService(
        RepositoryFactory.getRoleRepository()
      ));
    }
    return this.instances.get('role') as RoleService;
  }

  static getEmployeeService(): EmployeeService {
    if (!this.instances.has('employee')) {
      this.instances.set('employee', new EmployeeService(
        RepositoryFactory.getEmployeeRepository()
      ));
    }
    return this.instances.get('employee') as EmployeeService;
  }

  static getAuthService(): AuthService {
    if (!this.instances.has('auth')) {
      this.instances.set('auth', new AuthService(
        RepositoryFactory.getUserRepository()
      ));
    }
    return this.instances.get('auth') as AuthService;
  }

  /**
   * Clear all instances (useful for testing)
   */
  static clearInstances(): void {
    this.instances.clear();
  }

  /**
   * Set a mock service (useful for testing)
   */
  static setMockService<T extends TEntity>(key: string, service: Service<T>): void {
    this.instances.set(key, service as Service<TEntity>);
  }
}
