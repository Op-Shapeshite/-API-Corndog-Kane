import { TMaterial } from "../entities/material/material";
import Repository from "./Repository";

export interface MaterialRepository extends Repository<TMaterial> {
	getMaterialStockByOutlet(materialId: number, outletId: number, date: Date): Promise<number>;
}
