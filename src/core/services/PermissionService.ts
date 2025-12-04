import PermissionRepository from "../../adapters/postgres/repositories/PermissionRepository";
import { TPermission } from "../entities/user/permission";
import { Service } from "./Service";

export default class PermissionService extends Service<TPermission> {
  declare repository: PermissionRepository;

  constructor(repository: PermissionRepository) {
    super(repository);
  }
}
