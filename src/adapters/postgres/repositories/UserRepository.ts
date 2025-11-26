import { TUser } from "../../../core/entities/user/user";
import { UserRepository as IUserRepository } from "../../../core/repositories/user";
import Repository from "./Repository";
import bcrypt from 'bcrypt';

export default class UserRepository
	extends Repository<TUser>
	implements IUserRepository {
	constructor() {
		super("user");
	}

	async findByUsername(username: string): Promise<TUser | null> {
		const user = await this.prisma.user.findUnique({
			where: { username },
			include: { role: true, outlets: true },
		});

		if (!user) return null;
		console.log(this.mapper.mapToEntity(user));
		return this.mapper.mapToEntity(user) as TUser;
	}

	async updatePassword(id: number, newPassword: string): Promise<void> {
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await this.getModel().update({
			where: { id },
			data: { password: hashedPassword },
		});
	}

	/**
	 * Override create method to hash password before saving
	 */
	async create(item: TUser): Promise<TUser> {
		// Always hash password when creating new user
		if (item.password) {
			const hashedPassword = await bcrypt.hash(item.password, 10);
			item = { ...item, password: hashedPassword };
		}

		// Call parent create method
		return super.create(item);
	}

	/**
	 * Override update method to hash password if provided
	 */
	async update(id: string, item: Partial<TUser>): Promise<TUser> {
		// If password is being updated, hash it first
		if (item.password) {
			const hashedPassword = await bcrypt.hash(item.password, 10);
			item = { ...item, password: hashedPassword };
		}

		// Call parent update method
		return super.update(id, item);
	}

	async createLoginHistory(
		userId: number,
		ipAddress: string,
		userAgent: string
	): Promise<void> {
		await this.prisma.login.create({
			data: {
				user_id: userId,
				ip_address: ipAddress,
				user_agent: userAgent,
			},
		});
	}
}