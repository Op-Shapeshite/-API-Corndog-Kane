import { EntityMapConfig } from "../adapters/postgres/repositories/Repository";
import { UserMapperEntity } from "./mappers/UserMapperEntity";
import { RoleMapperEntity } from "./mappers/RoleMapperEntity";
import { OutletMapperEntity } from "./mappers/OutletMapperEntity";
import { LoginMapperEntity } from "./mappers/LoginMapperEntity";
import { ProductMapperEntity } from "./mappers/ProductMapperEntity";

/**
 * Centralized registry of all entity mappers
 * Each entity mapper is defined in its own file under ./mappers/
 */
export const EntityMappers: Record<string, EntityMapConfig> = {
  user: UserMapperEntity,
  role: RoleMapperEntity,
  outlet: OutletMapperEntity,
  login: LoginMapperEntity,
  product: ProductMapperEntity,
  
  // Add more entity mappings here by importing and registering them
  // employee: EmployeeMapperEntity,
  // order: OrderMapperEntity,
  // etc.
};

/**
 * Get mapping configuration for an entity
 */
export function getEntityMapper(entityName: string): EntityMapConfig {
  const mapper = EntityMappers[entityName];
  if (!mapper) {
    throw new Error(`No mapper configuration found for entity: ${entityName}`);
  }
  return mapper;
}
