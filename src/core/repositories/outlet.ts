import { TOutlet, TOutletWithSettings } from "../entities/outlet/outlet";
import  Repository  from "./Repository";

export interface OutletRepository extends Repository<TOutlet|TOutletWithSettings> {
  findById(id: number): Promise<TOutletWithSettings | null>;
}