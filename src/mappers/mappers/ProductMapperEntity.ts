import { MapperUtil } from "../MapperUtil";
import { EntityMapConfig } from "../../adapters/postgres/repositories/Repository";

/**
 * Product entity mapping configuration
 */
export const ProductMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: 'id', entityField: 'id', transform: (v) => MapperUtil.mapId(v as number) },
    { dbField: 'name', entityField: 'name' },
    { dbField: 'description', entityField: 'description', transform: (v) => MapperUtil.mapNullableString(v as string | null) },
    { dbField: 'price', entityField: 'price' },
    { dbField: 'stock', entityField: 'stock' },
    { dbField: 'is_active', entityField: 'isActive' },
    { dbField: 'createdAt', entityField: 'createdAt' },
    { dbField: 'updatedAt', entityField: 'updatedAt' },
  ],
};
