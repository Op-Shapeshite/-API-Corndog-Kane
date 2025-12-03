import { Attendance } from '../../core/domain/aggregates/Attendance';
import { AttendanceId } from '../../core/domain/value-objects/AttendanceId';
import { EmployeeId } from '../../core/domain/value-objects/EmployeeId';
import { OutletId } from '../../core/domain/value-objects/OutletId';
import { DateTime } from '../../core/domain/value-objects/DateTime';
import { Minutes } from '../../core/domain/value-objects/Minutes';
import { ImageProof, LateApprovalStatus } from '../../core/domain/value-objects/SharedTypes';
import { CheckinDetails, CheckoutDetails } from '../../core/domain/value-objects/AttendanceDetails';
import { ApprovalStatus } from '@prisma/client';

/**
 * Prisma Data Type (what comes from database)
 */
interface PrismaAttendanceData {
  id: number;
  employee_id: number;
  outlet_id: number;
  checkin_time: Date;
  checkin_image_proof: string;
  checkout_time?: Date | null;
  checkout_image_proof?: string | null;
  late_minutes: number;
  late_notes?: string | null;
  late_present_proof?: string | null;
  late_approval_status: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Prisma Create Data Type (what we send to database)
 */
interface PrismaAttendanceCreateData {
  employee_id: number;
  outlet_id: number;
  checkin_time: Date;
  checkin_image_proof: string;
  checkout_time?: Date | null;
  checkout_image_proof?: string | null;
  late_minutes: number;
  late_notes?: string | null;
  late_present_proof?: string | null;
  late_approval_status: ApprovalStatus;
  is_active: boolean;
}

/**
 * Entity Mapper: Attendance Domain ↔ Prisma Persistence
 * Converts between domain objects and database records
 */
export class AttendanceEntityMapper {
  
  /**
   * Convert domain aggregate to persistence data
   */
  toPersistence(attendance: Attendance): PrismaAttendanceCreateData {
    const checkinDetails = attendance.getCheckinDetails();
    const checkoutDetails = attendance.getCheckoutDetails();

    return {
      employee_id: attendance.getEmployeeId().getValue(),
      outlet_id: attendance.getOutletId().getValue(),
      checkin_time: checkinDetails.getCheckinTime().getValue(),
      checkin_image_proof: checkinDetails.getImageProof().getPath(),
      checkout_time: checkoutDetails?.getCheckoutTime().getValue() || null,
      checkout_image_proof: checkoutDetails?.getImageProof().getPath() || null,
      late_minutes: checkinDetails.getLateness().getValue(),
      late_notes: checkinDetails.getLateNotes() || null,
      late_present_proof: checkinDetails.getLatePresentProof()?.getPath() || null,
      late_approval_status: checkinDetails.getLateApprovalStatus() as ApprovalStatus,
      is_active: attendance.getIsActive(),
    };
  }

  /**
   * Convert persistence data to domain aggregate
   */
  toDomain(data: PrismaAttendanceData): Attendance {
    // Reconstruct checkin details
    const checkinDetails = CheckinDetails.fromExisting(
      DateTime.fromDate(data.checkin_time),
      ImageProof.fromPath(data.checkin_image_proof),
      Minutes.fromNumber(data.late_minutes),
      data.late_approval_status as LateApprovalStatus,
      data.late_notes || undefined,
      data.late_present_proof ? ImageProof.fromPath(data.late_present_proof) : undefined
    );

    // Reconstruct checkout details if exists
    let checkoutDetails: CheckoutDetails | undefined;
    if (data.checkout_time && data.checkout_image_proof) {
      checkoutDetails = CheckoutDetails.create(
        DateTime.fromDate(data.checkout_time),
        ImageProof.fromPath(data.checkout_image_proof)
      );
    }

    // Reconstruct attendance aggregate
    return Attendance.fromPersistence(
      AttendanceId.fromNumber(data.id),
      EmployeeId.fromNumber(data.employee_id),
      OutletId.fromNumber(data.outlet_id),
      checkinDetails,
      checkoutDetails,
      DateTime.fromDate(data.checkin_time).startOfDay(),
      data.is_active
    );
  }
}