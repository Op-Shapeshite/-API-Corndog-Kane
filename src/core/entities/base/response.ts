import { TLoginResponse } from "../user/auth";
import { TRoleGetResponse } from "../user/role";
import { TUserGetResponse } from "../user/user";

export type TResponse = {
  code: number;
  status: "success" | "failed";
  message: string;
  data?: TLoginResponse| TUserGetResponse|TRoleGetResponse ;
  errors?: TErrorResponse[];
  metadata?: TMetadataResponse;
}
export type TErrorResponse = {
  field: string;
  message: string;
  type: "not_found" | "invalid" | "required" | "conflict" | "internal_error";
}
export type TMetadataResponse = {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
}

export type TMetadataResponseResponseToken = {
  token: string;
}