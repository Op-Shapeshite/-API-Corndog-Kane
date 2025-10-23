import { Container } from "./Container";
import UserRepository from "../../adapters/postgres/repositories/UserRepository";
import OutletRepository from "../../adapters/postgres/repositories/OutletRepository";
import RoleRepository from "../../adapters/postgres/repositories/RoleRepository";
import EmployeeRepository from "../../adapters/postgres/repositories/EmployeeRepository";
import UserService from "../services/UserService";
import OutletService from "../services/OutletService";
import RoleService from "../services/RoleService";
import EmployeeService from "../services/EmployeeService";
import { AuthService } from "../services/AuthService";

/**
 * Register all dependencies in the DI Container
 * This should be called once at application startup
 */
export function registerDependencies(): void {
  // Register repositories as singletons
  Container.singleton('UserRepository', () => new UserRepository());
  Container.singleton('OutletRepository', () => new OutletRepository());
  Container.singleton('RoleRepository', () => new RoleRepository());
  Container.singleton('EmployeeRepository', () => new EmployeeRepository());

  // Register services as singletons with dependency injection
  Container.singleton('UserService', () => {
    const repository = Container.resolve<UserRepository>('UserRepository');
    return new UserService(repository);
  });

  Container.singleton('OutletService', () => {
    const repository = Container.resolve<OutletRepository>('OutletRepository');
    return new OutletService(repository);
  });

  Container.singleton('RoleService', () => {
    const repository = Container.resolve<RoleRepository>('RoleRepository');
    return new RoleService(repository);
  });

  Container.singleton('EmployeeService', () => {
    const repository = Container.resolve<EmployeeRepository>('EmployeeRepository');
    return new EmployeeService(repository);
  });

  Container.singleton('AuthService', () => {
    const repository = Container.resolve<UserRepository>('UserRepository');
    return new AuthService(repository);
  });
}
