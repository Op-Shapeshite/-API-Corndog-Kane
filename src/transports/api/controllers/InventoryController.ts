import { Request, Response, NextFunction } from "express";
import InventoryService from "../../../core/services/InventoryService";
import { TInventoryStockInRequest, TInventoryStockInUpdateRequest } from "../../../core/entities/inventory/inventory";
import { TResponse, TMetadataResponse } from "../../../core/entities/base/response";
import Controller from "./Controller";

/**
 * InventoryController
 * Handles HTTP requests for unified inventory management (Material & Product)
 */
export class InventoryController extends Controller<unknown, TMetadataResponse> {
	/**
	 * POST /inventory/in
	 * Handle stock in for both Material and Product
	 */
	stockIn(inventoryService: InventoryService) {
		return async (req: Request, res: Response, next: NextFunction) => {
			try {
				const requestData: TInventoryStockInRequest = req.body;

				// Call service
				const result = await inventoryService.stockIn(requestData);

				// Determine status code and message based on results
				const statusCode = result.failed_count === 0 ? 201 : 207; // 207 Multi-Status if partial success
				const message = result.failed_count === 0
					? `All ${result.success_count} items recorded successfully`
					: `${result.success_count} items recorded, ${result.failed_count} failed`;

				// Send success response with empty metadata
				return res.status(statusCode).json({
					status: "success",
					message,
					data: result,
					metadata: {} as TMetadataResponse,
				} as TResponse<typeof result, TMetadataResponse>);
			} catch (error) {
				// Handle errors
				if (error instanceof Error) {
					// Business logic errors (e.g., supplier not found, product not found)
					if (
						error.message.includes("not found") ||
						error.message.includes("must be provided")
					) {
						return res.status(400).json({
							status: "error",
							message: error.message,
							data: null,
							metadata: {} as TMetadataResponse,
						});
					}
				}

				// Pass to error handler middleware
				next(error);
			}
		};
	}

	/**
	 * GET /inventory/buy
	 * Get unified buy list (Material purchases + Product PURCHASE)
	 */
	getBuyList(inventoryService: InventoryService) {
		return async (req: Request, res: Response, next: NextFunction) => {
			try {
				const page = parseInt(req.query.page as string) || 1;
				const limit = parseInt(req.query.limit as string) || 10;

				// Call service
				const { data, total } = await inventoryService.getBuyList(page, limit);

				// Build metadata for pagination
				const metadata: TMetadataResponse = {
					page,
					limit,
					total_records: total,
					total_pages: Math.ceil(total / limit),
				};

				// Send success response
				return this.getCustomSuccessResponse(
					res,
					data,
					metadata,
					"Buy list retrieved successfully"
				);
			} catch (error) {
				// Pass to error handler middleware
				next(error);
			}
		};
	}

	/**
	 * PUT /inventory/in/:item_type/:id
	 * Update stock in record
	 */
	updateStockIn(inventoryService: InventoryService) {
		return async (req: Request, res: Response, next: NextFunction) => {
			try {
				const { item_type, id } = req.params;
				const requestData: TInventoryStockInUpdateRequest = req.body;

				// Validate item_type
				if (item_type !== "MATERIAL" && item_type !== "PRODUCT") {
					return res.status(400).json({
						status: "error",
						message: "Invalid item_type. Must be MATERIAL or PRODUCT",
						data: null,
						metadata: {} as TMetadataResponse,
					});
				}

				// Validate id
				const recordId = parseInt(id);
				if (isNaN(recordId)) {
					return res.status(400).json({
						status: "error",
						message: "Invalid ID. Must be a number",
						data: null,
						metadata: {} as TMetadataResponse,
					});
				}

				// Call service
				const result = await inventoryService.updateStockIn(
					item_type as "MATERIAL" | "PRODUCT",
					recordId,
					requestData
				);

				// Send success response
				return res.status(200).json({
					status: "success",
					message: "Stock in record updated successfully",
					data: result,
					metadata: {} as TMetadataResponse,
				} as TResponse<typeof result, TMetadataResponse>);
			} catch (error) {
				// Handle errors
				if (error instanceof Error) {
					// Business logic errors
					if (
						error.message.includes("not found") ||
						error.message.includes("must be provided")
					) {
						return res.status(400).json({
							status: "error",
							message: error.message,
							data: null,
							metadata: {} as TMetadataResponse,
						});
					}
				}

				// Pass to error handler middleware
				next(error);
			}
		};
	}

	private getCustomSuccessResponse<T>(
		res: Response,
		data: T,
		metadata: TMetadataResponse,
		message?: string
	): Response<TResponse<T, TMetadataResponse>> {
		return res.status(200).json({
			status: "success",
			message: message || "Request was successful",
			data,
			metadata,
		} as TResponse<T, TMetadataResponse>);
	}
}
