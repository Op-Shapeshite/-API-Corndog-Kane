import { EntityMapConfig } from "../adapters/postgres/repositories/Repository";
import { UserMapperEntity } from "./mappers/UserMapperEntity";
import { RoleMapperEntity } from "./mappers/RoleMapperEntity";
import { OutletMapperEntity } from "./mappers/OutletMapperEntity";
import { LoginMapperEntity } from "./mappers/LoginMapperEntity";
import { ProductMapperEntity } from "./mappers/ProductMapperEntity";
import { EmployeeMapperEntity } from "./mappers/EmployeeMapperEntity";
import { OutletAssignmentMapperEntity } from "./mappers/OutletAssignmentMapperEntity";

export const EntityMappers: Record<string, EntityMapConfig> = {
  user: UserMapperEntity,
  role: RoleMapperEntity,
  outlet: OutletMapperEntity,
  login: LoginMapperEntity,
  product: ProductMapperEntity,
  employee: EmployeeMapperEntity,
  outletEmployee: OutletAssignmentMapperEntity,
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
