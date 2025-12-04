import { TPermission } from "../../../core/entities/user/permission";
import { IPermissionRepository } from "../../../core/repositories/permission";
import Repository from "./Repository";

export default class PermissionRepository extends Repository<TPermission> implements IPermissionRepository {
  constructor() {
    super("permission");
  }
}
