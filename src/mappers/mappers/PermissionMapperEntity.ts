import { MapperUtil } from "../MapperUtil";
import { EntityMapConfig } from "../../adapters/postgres/repositories/Repository";

/**
 * Permission entity mapping configuration
 */
export const PermissionMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: 'id', entityField: 'id', transform: (v) => MapperUtil.mapId(v as number) },
    { dbField: 'name', entityField: 'name' },
    { dbField: 'code', entityField: 'code' },
    { dbField: 'description', entityField: 'description', transform: (v) => MapperUtil.mapNullableString(v as string | null) },
    { dbField: 'module', entityField: 'module' },
    { dbField: 'is_active', entityField: 'isActive' },
    { dbField: 'createdAt', entityField: 'createdAt', transform: (v) => MapperUtil.mapDate(v as Date) },
    { dbField: 'updatedAt', entityField: 'updatedAt', transform: (v) => MapperUtil.mapDate(v as Date) },
  ],
};
