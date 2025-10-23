import { TOutlet } from "./outlet";

export type TOutletAssignment = {
  id: number;
  outletId: number;
  outlet?: TOutlet;
  employeeId: number;
  assignedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TOutletAssignmentCreate = {
  outletId: number;
  employeeId: number;
  assignedAt: Date;
  isActive: boolean;
}

export type TOutletAssignmentCreateRequest = {
  date: string;
  is_for_one_week: boolean;
}

export type TOutletAssignmentRemoveRequest = {
  id: string;
}

export type TOutletAssignmentGetResponse = {
  outlet: {
    id: number;
    name: string;
    location: string;
  };
  employee: {
    id: number;
    name: string;
  };
  assigned_at: string;
}

export type TOutletAssignmentWithRelations = {
  id: number;
  outlet_id: number;
  employee_id: number;
  assigned_at: Date;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
  outlet: {
    id: number;
    name: string;
    location: string;
  };
  employee: {
    id: number;
    name: string;
  };
}