import { Response } from "express";
import { TErrorResponse, TResponse } from "../../../core/entities/base/response";
import { PrismaErrorHandler } from "../../../adapters/postgres/repositories/PrismaErrorHandler";

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

	/**
	 * Handle service errors with consistent response format
	 * Automatically handles Prisma errors with proper status codes and error types
	 * @param res - Express Response object
	 * @param error - The error object thrown
	 * @param message - User-friendly error message
	 * @param statusCode - HTTP status code (default: 500, overridden by Prisma errors)
	 * @param emptyData - Empty data object matching the expected type
	 * @param emptyMetadata - Empty metadata object matching the expected type
	 */
	protected handleError(
		res: Response,
		error: unknown,
		message: string,
		statusCode: number = 500,
		emptyData: T | T[],
		emptyMetadata: M
	) {
		console.error(`${message}:`, error);
		
		// Check if it's a Prisma error and handle it specifically
		const prismaError = PrismaErrorHandler.handlePrismaError(error);
		if (prismaError) {
			return this.getFailureResponse(
				res,
				{ data: emptyData, metadata: emptyMetadata },
				prismaError.errors,
				message,
				prismaError.statusCode
			);
		}
		
		// Default error handling for non-Prisma errors
		return this.getFailureResponse(
			res,
			{ data: emptyData, metadata: emptyMetadata },
			[{ field: 'server', message, type: 'internal_error' }],
			message,
			statusCode
		);
	}
}