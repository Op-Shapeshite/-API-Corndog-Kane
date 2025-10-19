import UserRepository from "../../adapters/postgres/repositories/UserRepository";
import { TUser } from "../entities/user/user";
import { Service } from "./Service";

export default class UserService extends Service<TUser> {
  declare repository: UserRepository;

  constructor(repository: UserRepository) {
    super(repository);
  }
  
}