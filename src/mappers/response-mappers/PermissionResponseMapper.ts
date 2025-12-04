import { TPermission, TPermissionGetResponse } from "../../core/entities/user/permission";

export class PermissionResponseMapper {

  static toResponse(permission: TPermission): TPermissionGetResponse {
    return {
      id: permission.id,
      name: permission.name,
      code: permission.code,
      description: permission.description,
      module: permission.module,
      is_active: permission.isActive,
      created_at: permission.createdAt,
      updated_at: permission.updatedAt,
    };
  }

  static toListResponse(permissions: TPermission[]): TPermissionGetResponse[] {
    return permissions.map(permission => this.toResponse(permission));
  }

}
