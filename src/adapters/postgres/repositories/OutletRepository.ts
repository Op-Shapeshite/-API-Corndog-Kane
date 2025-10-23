import { TOutletWithSettings } from "../../../core/entities/outlet/outlet";
import { OutletRepository as IOutletRepository } from "../../../core/repositories/outlet";
import Repository from "./Repository";

export default class OutletRepository
  extends Repository<TOutletWithSettings>
  implements IOutletRepository {
  constructor() {
    super("outlet");
  }
  async findById(id: number): Promise<TOutletWithSettings | null> {
    const outlet = await this.getModel().findUnique({
      where: { id },
    })
    if (!outlet) return null;
    
    return this.mapper.mapToEntity(outlet);
  }
  override async create(item: TOutletWithSettings & { userId: number }): Promise<TOutletWithSettings> {
    const outlet = await this.prisma.outlet.create({
      data: {
        name: item.name as string,
        is_active: item.isActive as boolean,
        pic_name: item.picName as string,
        pic_phone: item.picPhone as string,
        location: item.location as string,
        description: item.description as string | null,
        check_in_time: item.checkinTime,
        check_out_time: item.checkoutTime,
        salary: item.salary as number,
        user_id: item.userId as number,
      },
    });
    return this.mapper.mapToEntity(outlet);
  }
}