import { TOutlet } from "../entities/outlet/outlet";
import { Repository } from "./Repository";

export interface OutletRepository extends Repository<TOutlet> {
  findById(id: string): Promise<TOutlet | null>;
  create(outlet: TOutlet): Promise<TOutlet>;
  update(id: string, outlet: Partial<TOutlet>): Promise<TOutlet>;
  delete(id: string): Promise<void>;
}