import { Request, Response } from "express";
import UserRepository from "../../../adapters/postgres/repositories/UserRepository";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TUser, TuserDetailGetResponse, TUserGetResponse } from "../../../core/entities/user/user";
import UserService from '../../../core/services/UserService';
import { UserResponseMapper } from "../../../mappers/response-mappers";
import Controller from "./Controller";

export class UserController extends Controller<TUserGetResponse | TuserDetailGetResponse, TMetadataResponse> {
	private userService: UserService;

	constructor() {
		super();
		this.userService = new UserService(new UserRepository());
	}

  findById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);
      
      if (!user) {
        return this.getFailureResponse(
          res,
          { data: {} as TuserDetailGetResponse, metadata: {} as TMetadataResponse },
          [{ field: 'id', message: 'Pengguna tidak ditemukan', type: 'not_found' }],
          'Pengguna tidak ditemukan',
          404
        );
      }

      return this.getSuccessResponse(
        res,
        { data: UserResponseMapper.toDetailResponse(user as TUser), metadata: {} as TMetadataResponse },
        'Data pengguna berhasil diambil'
      );
    } catch (error) {
      return this.handleError(
				res,
				error,
				"Gagal mengambil data pengguna",
				500,
				{} as TuserDetailGetResponse,
				{} as TMetadataResponse
			);
    }
  }

  // The create, update, and delete methods are inherited from the parent Controller class
  // They can be called from routes as:
  // - userController.create(userService, UserResponseMapper)
  // - userController.update(userService, UserResponseMapper)
  // - userController.delete(userService)
}