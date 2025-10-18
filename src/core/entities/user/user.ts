import { TRole, TRoleGetResponse } from "./role";

export type TUser = {
  id: string;
  name: string;
  username: string;
  password: string;
  role:TRole;
  lastestLogin: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TUserCreateRequest = {
  name: string;
  username: string;
  password: string;
  role_id: number;
  is_active: boolean;
}

export type TUserUpdateRequest = {
  name?: string;
  username?: string;
  password?: string;
  role_id?: number;
  is_active?: boolean;
}
export type TUserGetResponse = Omit<TUser, 'isActive' | 'createdAt' | 'updatedAt' |'password'> & {
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  role: TRoleGetResponse;
}
