import { MapperUtil } from "../MapperUtil";
import { TRole } from "../../core/entities/user/role";
import { EntityMapConfig } from "../../adapters/postgres/repositories/Repository";

/**
 * User entity mapping configuration
 */
export const UserMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: 'id', entityField: 'id', transform: (v) => MapperUtil.mapId(v as number) },
    { dbField: 'username', entityField: 'username' },
    { dbField: 'name', entityField: 'name', transform: (v) => MapperUtil.mapNullableString(v as string | null) },
    { dbField: 'password', entityField: 'password' },
    { dbField: 'is_active', entityField: 'isActive' },
    { dbField: 'createdAt', entityField: 'createdAt' },
    { dbField: 'updatedAt', entityField: 'updatedAt' },
    { dbField: 'lastestLogin', entityField: 'lastestLogin', transform: () => null },
  ],
  relations: [
    {
      dbField: 'outlets',
      entityField: 'outlets',
      mapper: (rel) => {
        const outlet = rel as { id: number } | null;
        if (!outlet) return null;
        return { id: outlet.id };
      }
    },
    {
      dbField: 'role',
      entityField: 'role',
      mapper: (rel) => {
        const role = rel as {
          id: number;
          name: string;
          description: string | null;
          createdAt: Date;
          updatedAt: Date;
        };
        return {
          id: MapperUtil.mapId(role.id),
          name: role.name,
          description: role.description,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        } as TRole;
      },
    },
    {
      dbField: 'logins',
      entityField: 'logins',
      mapper: (rel) => {
        const logins = rel as Array<{
          ip_address: string;
          user_agent: string;
          login_at: Date;
        }>;
        const mappedLogins = logins.map(login => ({
          ipAddress: login.ip_address,
          userAgent: login.user_agent,
          loginAt: login.login_at,
        }));
        return mappedLogins;
      }
    }
  ],
};
