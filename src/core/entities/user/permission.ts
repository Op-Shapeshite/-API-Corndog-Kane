export type TPermission = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  module: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TPermissionCreateRequest = {
  name: string;
  code: string;
  description?: string;
  module: string;
  is_active?: boolean;
}

export type TPermissionUpdateRequest = {
  name?: string;
  code?: string;
  description?: string;
  module?: string;
  is_active?: boolean;
}

export type TPermissionGetResponse = Omit<TPermission, 'isActive'|'createdAt'|'updatedAt'> & {
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type TRolePermissionGetResponse = {
  id: string;
  role_id: number;
  permission_id: number;
  permission: TPermissionGetResponse;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
