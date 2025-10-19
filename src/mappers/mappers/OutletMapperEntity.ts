import { MapperUtil } from "../MapperUtil";
import { EntityMapConfig } from "../../adapters/postgres/repositories/Repository";

/**
 * Outlet entity mapping configuration
 */
export const OutletMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: 'id', entityField: 'id', transform: (v) => MapperUtil.mapId(v as number) },
    { dbField: 'name', entityField: 'name' },
    { dbField: 'address', entityField: 'address', transform: (v) => MapperUtil.mapNullableString(v as string | null) },
    { dbField: 'phone', entityField: 'phone', transform: (v) => MapperUtil.mapNullableString(v as string | null) },
    { dbField: 'is_active', entityField: 'isActive' },
    { dbField: 'createdAt', entityField: 'createdAt' },
    { dbField: 'updatedAt', entityField: 'updatedAt' },
  ],
};
