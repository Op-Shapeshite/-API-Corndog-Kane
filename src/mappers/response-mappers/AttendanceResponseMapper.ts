import { TAttendanceGetResponse, TAttendanceWithID } from "../../core/entities/employee/attendance";

export class AttendanceResponseMapper {
  /**
   * Map Attendance entity to API response format
   * Used in checkin/checkout endpoints
   */
  static toResponse(attendance: TAttendanceWithID): TAttendanceGetResponse {
    return {
      id: attendance.id,
      employee_id: attendance.employeeId,
      outlet_id: attendance.outletId,
      checkin_image_proof: attendance.checkinImageProof,
      checkout_image_proof: attendance.checkoutImageProof ?? null,
      checkin_time: attendance.checkinTime,
      checkout_time: attendance.checkoutTime ?? null,
      is_active: attendance.isActive ?? true,
      created_at: attendance.createdAt ?? new Date(),
      updated_at: attendance.updatedAt ?? new Date(),
    };
  }
}
