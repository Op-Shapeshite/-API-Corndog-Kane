import { MapperUtil } from "../MapperUtil";
import { EntityMapConfig } from "../../adapters/postgres/repositories/Repository";

/**
 * Login entity mapping configuration
 */
export const LoginMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: 'id', entityField: 'id', transform: (v) => MapperUtil.mapId(v as number) },
    { dbField: 'user_id', entityField: 'userId', transform: (v) => MapperUtil.mapId(v as number) },
    { dbField: "ip_address", entityField: "ipAddress" },
    { dbField: "user_agent", entityField: "userAgent" },
    { dbField: 'login_at', entityField: 'loginAt' },
    { dbField: 'createdAt', entityField: 'createdAt' },
    { dbField: 'updatedAt', entityField: 'updatedAt' },
  ],
};
