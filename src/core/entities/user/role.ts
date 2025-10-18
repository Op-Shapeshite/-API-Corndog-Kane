export type TRole = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TRoleCreateRequest = {
  name: string;
  description: string;
  is_active: boolean;
}

export type TRoleUpdateRequest = {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export type TRoleGetResponse = Omit<TRole, 'isActive'|'createdAt'|'updatedAt'> & {
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
