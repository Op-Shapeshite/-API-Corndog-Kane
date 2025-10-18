import { TOutlet } from "./outlet";

export type TOutletAssignment = {
  id: string;
  outlet: TOutlet;
  employeeId: string;
  assignedAt: Date;
  removedAt: Date | null; 
}

export type TOutletAssignmentCreateRequest = {
  date: Date;
}
export type TOutletAssignmentRemoveRequest = {
  id: string;
}
export type TOutletAssignmentGetResponse = {
  id: string;
  outlet: Omit<TOutlet, 'createdAt' | 'updatedAt'>;
  employee_id: string;
  removed_at: Date | null;
}