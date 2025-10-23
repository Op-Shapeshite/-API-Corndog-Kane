import { TOutletAssignmentWithRelations } from "../entities/outlet/assignment";
import { TOutlet, TOutletWithSettings } from "../entities/outlet/outlet";
import  Repository  from "./Repository";

export interface OutletRepository extends Repository<TOutlet> {
	findById(id: number): Promise<TOutletWithSettings | null>;
	assignEmployeeToOutlet(
		outletId: number,
		employeeId: number,
		assignedAt: Date
	): Promise<TOutletAssignmentWithRelations>;
	bulkAssignEmployeeToOutlet(
		assignments: {
			outletId: number;
			employeeId: number;
			assignedAt: Date;
		}[]
	): Promise<TOutletAssignmentWithRelations[]>;
}