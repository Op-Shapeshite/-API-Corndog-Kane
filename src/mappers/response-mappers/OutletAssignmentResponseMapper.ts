import { TOutletAssignmentWithRelations, TOutletAssignmentGetResponse } from "../../core/entities/outlet/assignment";

export class OutletAssignmentResponseMapper {
  static toListResponse(assignment: TOutletAssignmentWithRelations): TOutletAssignmentGetResponse {
    return {
      outlet: {
        id: assignment.outlet.id,
        name: assignment.outlet.name,
        location: assignment.outlet.location,
      },
      employee: {
        id: assignment.employee.id,
        name: assignment.employee.name,
      },
      assigned_at: assignment.assigned_at.toISOString(),
    };
  }
}
