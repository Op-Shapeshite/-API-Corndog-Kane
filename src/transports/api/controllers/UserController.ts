import { Request, Response } from "express";
import UserRepository from "../../../adapters/postgres/repositories/UserRepository";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TuserDetailGetResponse, TUserGetResponse } from "../../../core/entities/user/user";
import UserService from '../../../core/services/UserService';
import { UserResponseMapper } from "../../../mappers/response-mappers";
import Controller from "./Controller";

export class UserController extends Controller<TUserGetResponse | TuserDetailGetResponse, TMetadataResponse> {
	private userService: UserService;

	constructor() {
		super();
		this.userService = new UserService(new UserRepository());
	}

	findAll = async (req: Request, res: Response) => {
		try {
			const { page, limit, search_key, search_value, ...filters } = req.query;
			const pageNum = page ? parseInt(page as string) : 1;
			const limitNum = limit ? parseInt(limit as string) : 10;
			const search = search_key && search_value
				? [{ field: search_key as string, value: search_value as string }]
				: undefined;
			const filterObj = Object.keys(filters).length > 0 ? filters : undefined;

			const result = await this.userService.findAll(
				pageNum,
				limitNum,
				search,
				filterObj as Record<string, unknown>
			);
			
			const { data: users, ...metadata } = result;
			const usersMapped = users.map(user => UserResponseMapper.toListResponse(user));
			
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
			return this.handleError(
				res,
				error,
				"Failed to retrieve users",
				500,
				{} as TUserGetResponse,
				{} as TMetadataResponse
			);
		}
  };
  findById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);
      
      if (!user) {
        return this.getFailureResponse(
          res,
          { data: {} as TuserDetailGetResponse, metadata: {} as TMetadataResponse },
          [{ field: 'id', message: 'User not found', type: 'not_found' }],
          'User not found',
          404
        );
      }

      return this.getSuccessResponse(
        res,
        { data: UserResponseMapper.toDetailResponse(user), metadata: {} as TMetadataResponse },
        'User retrieved successfully'
      );
    } catch (error) {
      return this.handleError(
				res,
				error,
				"Failed to retrieve user",
				500,
				{} as TuserDetailGetResponse,
				{} as TMetadataResponse
			);
    }
  }
  create = async (req: Request, res: Response) => {
    try {
      const newUser = await this.userService.create(req.body);
      return this.getSuccessResponse(
        res,
        { data: UserResponseMapper.toListResponse(newUser), metadata: {} as TMetadataResponse },
        'User created successfully'
      );
    } catch (error) {
      return this.handleError(
				res,
				error,
				"Failed to create user",
				500,
				{} as TUserGetResponse,
				{} as TMetadataResponse
			);
    }
  };
  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updatedUser = await this.userService.update(id, req.body);
      
      if (!updatedUser) {
        return this.getFailureResponse(
          res,
          { data: {} as TUserGetResponse, metadata: {} as TMetadataResponse },
          [{ field: 'id', message: 'User not found', type: 'not_found' }],
          'User not found',
          404
        );
      }

      return this.getSuccessResponse(
        res,
        { data: UserResponseMapper.toListResponse(updatedUser), metadata: {} as TMetadataResponse },
        'User updated successfully'
      );
    } catch (error) {
      return this.handleError(
				res,
				error,
				"Failed to update user",
				500,
				{} as TUserGetResponse,
				{} as TMetadataResponse
			);
    }
  };
  delete = async (req: Request, res: Response) => {
    try {
      await this.userService.delete(req.params.id);
      return this.getSuccessResponse(
        res,
        { data: {} as TUserGetResponse, metadata: {} as TMetadataResponse },
        'User deleted successfully'
      );
    } catch (error) {
      return this.handleError(
				res,
				error,
				"Failed to delete user",
				500,
				{} as TUserGetResponse,
				{} as TMetadataResponse
			);
    }
  }
}