import { Response } from "express";
import { TErrorResponse, TResponse } from "../../../core/entities/base/response";
type TDataMetadataResponse<T, M> = {
  data: T |T[];
  metadata: M;
};
export default class Controller<T, M> {
	protected getSuccessResponse(
		res: Response,
		{ data, metadata }: TDataMetadataResponse<T, M>,
		message?: string
	): Response<TResponse<T, M>> {
		return res.status(200).json({
			status: "success",
			message: message || "Request was successful",
			data,
			metadata,
		} as TResponse<T | T[], M>);
	}
	protected getFailureResponse(
		res: Response,
    { data, metadata }: TDataMetadataResponse<T, M>,
    errors: TErrorResponse[] | null,
    message?: string,
    code?: number
  ): Response<TResponse<T, M>> {
    return res.status(code || 400).json({
      status: "failed",
      message: message || "Request failed",
      data,
      errors: errors || undefined,
      metadata,
    } as TResponse<T, M>);
  }
}