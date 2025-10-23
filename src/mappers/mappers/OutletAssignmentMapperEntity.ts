import { EntityMapConfig } from "../../adapters/postgres/repositories/Repository";

export const OutletAssignmentMapperEntity: EntityMapConfig = {
  fields: [
    { dbField: "id", entityField: "id" },
    { dbField: "outlet_id", entityField: "outletId" },
    { dbField: "employee_id", entityField: "employeeId" },
    { dbField: "assigned_at", entityField: "assignedAt" },
    { dbField: "is_active", entityField: "isActive" },
    { dbField: "createdAt", entityField: "createdAt" },
    { dbField: "updatedAt", entityField: "updatedAt" },
  ],
  relations: [],
};

