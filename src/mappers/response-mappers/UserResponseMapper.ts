import { TUser, TUserGetResponse, TuserDetailGetResponse } from "../../core/entities/user/user";
import { TRoleGetResponse } from "../../core/entities/user/role";

/**
 * User Response Mapper
 * Maps User entity from system/database format to API response format
 */
export class UserResponseMapper {
  /**
   * Map User entity to list response format (simplified)
   * Used in findAll endpoints
   */
  static toListResponse(user: TUser): TUserGetResponse {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      lastest_login: user.logins?.length > 0 ? user.logins[0].loginAt : null,
      is_active: user.isActive,
      role: user.role?.name,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  /**
   * Map User entity to detailed response format
   * Used in findById endpoints
   */
  static toDetailResponse(user: TUser): TuserDetailGetResponse {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: this.mapRoleToResponse(user.role),
      logins: user.logins,
      lastest_login: user.logins?.length > 0 ? user.logins[0].loginAt : null,
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  /**
   * Map Role entity to response format
   */
  private static mapRoleToResponse(role: TUser['role']): TRoleGetResponse {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      is_active: role.isActive,
      created_at: role.createdAt,
      updated_at: role.updatedAt,
    };
  }
}
