
export type TResponse<T,M> = {
  code: number;
  status: "success" | "failed";
  message: string;
  data?: T;
  errors?: TErrorResponse[];
  metadata?: M;
}
export type TErrorResponse = {
  field: string;
  message: string;
  type: "not_found" | "invalid" | "required" | "conflict" | "internal_error" | "unique_constraint";
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