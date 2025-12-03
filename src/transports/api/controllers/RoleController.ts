import RoleRepository from "../../../adapters/postgres/repositories/RoleRepository";
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TRoleGetResponse } from "../../../core/entities/user/role";
import RoleService from '../../../core/services/RoleService';
import { RoleResponseMapper } from "../../../mappers/response-mappers/RoleResponseMapper";
import Controller from "./Controller";

export class RoleController extends Controller<TRoleGetResponse, TMetadataResponse> {
  private roleService: RoleService;

  constructor() {
    super();
    this.roleService = new RoleService(new RoleRepository());
  }

  // Enhanced getAll with proper search field mapping
  getAll = () => {
    return this.findAllWithSearch(this.roleService, RoleResponseMapper, 'role');
  }
}