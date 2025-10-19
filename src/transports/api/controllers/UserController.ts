import { Request, Response } from "express";
import UserRepository from "../../../adapters/postgres/repositories/UserRepository";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TUserGetResponse } from "../../../core/entities/user/user";
import UserService from '../../../core/services/UserService'
import Controller from "./Controller";

export class UserController extends Controller<TUserGetResponse, TMetadataResponse> {
	private userService: UserService;

	constructor() {
		super();
		this.userService = new UserService(new UserRepository());
	}

	findAll = async (req: Request, res: Response) => {
		try {
			const { page, limit, search_key, search_value, ...filters } =
				req.query;

			// Parse pagination parameters
			const pageNum = page ? parseInt(page as string) : 1;
			const limitNum = limit ? parseInt(limit as string) : 10;

			// Build search configuration
			const search =
				search_key && search_value
					? [
							{
								field: search_key as string,
								value: search_value as string,
							},
					  ]
					: undefined;

			// Get filtered query params as filters (exclude pagination and search params)
			const filterObj =
				Object.keys(filters).length > 0 ? filters : undefined;

			// Fetch users with pagination
			const result = await this.userService.findAll(
				pageNum,
				limitNum,
				search,
				filterObj as Record<string, unknown>
			);
			
			const { data: users, ...metadata } = result;
			// Map to response format - exclude password, role, logins and transform field names
			const usersMapped = users.map((user) => ({
				id: user.id,
				name: user.name,
				username: user.username,
				lastest_login: user.logins.length>0 ? user.logins[0].loginAt : null,
        is_active: user.isActive,
        role: user.role ? user.role.name : undefined,
				created_at: user.createdAt,
        updated_at: user.updatedAt,
        
			})) as TUserGetResponse[];
			
			
			return this.getSuccessResponse(
				res,
				{
					data: usersMapped,
					metadata: {
						page: metadata.page,
						limit: metadata.limit,
						total_records: metadata.total,
						total_pages: metadata.totalPages,
					},
				},
				"Users retrieved successfully"
			);
		} catch (error) {
			console.error("Find all users error:", error);
			return this.getFailureResponse(
				res,
				{
					data: {} as TUserGetResponse,
					metadata: {} as TMetadataResponse,
				},
				[
					{
						field: "server",
						message: "Failed to retrieve users",
						type: "internal_error",
					},
				],
				"Failed to retrieve users",
				500
			);
		}
	};
}