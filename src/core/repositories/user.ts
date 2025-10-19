import { TUser } from "../entities/user/user";
import Repository from "./Repository";

export interface UserRepository  extends Repository<TUser> {
  findByUsername(username: string): Promise<TUser | null>;
  updatePassword(id: number, newPassword: string): Promise<void>;
  createLoginHistory(userId: number, ipAddress: string, userAgent: string): Promise<void>;
}
