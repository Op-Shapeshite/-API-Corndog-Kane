import OutletRepository from "../../adapters/postgres/repositories/OutletRepository";
import UserRepository from "../../adapters/postgres/repositories/UserRepository";
import { TOutlet, TOutletCreate, TOutletUpdate, TOutletWithSettings } from "../entities/outlet/outlet";
import { TUser, TUserCreate } from "../entities/user/user";
import { Service } from "./Service";

export default class OutletService extends Service<TOutlet|TOutletCreate|TOutletWithSettings> {
	declare repository: OutletRepository;
	declare userRepository: UserRepository;

	constructor(repository: OutletRepository) {
		super(repository);
		this.userRepository = new UserRepository();
	}
	async createOutlet(item: TOutletCreate ): Promise<TOutlet | TOutletWithSettings> {
		const {
			name,
			isActive,
			picName,
			picPhone,
			location,
			salary,
			userId,
			user,
			description,
			checkinTime,
			checkoutTime,
		} = item as TOutletCreate;
    let userIdToUse: number = userId ? userId : 0;
    if (user && userId == 0) {
      
      const userData = {
        name: user.name,
        username: user.username,
        password: user.password,
        role_id: user.role_id,
      } as TUserCreate;
			const newUser = await this.userRepository.create(userData as TUser) as TUser;
			userIdToUse = +newUser.id;
		}

		const newOutlet =  this.repository.create({
			name,
			isActive,
			picName,
			picPhone,
			location,
			description,
			checkinTime: checkinTime,
			checkoutTime: checkoutTime,
			salary,
			userId: userIdToUse || 1,
    } as TOutletWithSettings & { userId: number });
    return newOutlet;
  }
  async updateOutlet(id: number, item: Partial<TOutletUpdate>): Promise<TOutlet | TOutletWithSettings | null> {
	// Remove null values so the payload matches Partial<TOutletWithSettings> (which doesn't allow null for some fields)
	const sanitized = Object.fromEntries(
	  Object.entries(item).filter(([, v]) => v !== null)
	) as Partial<TOutletWithSettings>;

	const updatedOutlet = await this.repository.update(id.toString(), sanitized);
	return updatedOutlet;
  }
}