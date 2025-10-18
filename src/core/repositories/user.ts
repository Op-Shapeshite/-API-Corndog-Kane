import { TUser } from "../entities/user/user";
import { Repository } from "./Repository";

export interface UserRepository  extends Repository<TUser> {
  findById(id: string): Promise<TUser | null>;
  findByUsername(username: string): Promise<TUser | null>;
  create(user: TUser): Promise<TUser>;
  update(id: string, user: Partial<TUser>): Promise<TUser>;
  delete(id: string): Promise<void>;
}