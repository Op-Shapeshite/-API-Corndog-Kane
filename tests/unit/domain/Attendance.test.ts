import { Attendance } from '../../../src/core/domain/aggregates/Attendance';
import { AttendanceId } from '../../../src/core/domain/value-objects/AttendanceId';
import { EmployeeId } from '../../../src/core/domain/value-objects/EmployeeId';
import { OutletId } from '../../../src/core/domain/value-objects/OutletId';
import { DateTime } from '../../../src/core/domain/value-objects/DateTime';
import { Minutes } from '../../../src/core/domain/value-objects/Minutes';
import { ImageProof } from '../../../src/core/domain/value-objects/ImageProof';
import { AttendanceStatus, ApprovalStatus } from '../../../src/core/domain/enums/AttendanceEnums';
import { InvalidOperationError } from '../../../src/core/domain/exceptions/AttendanceExceptions';

describe('Attendance Domain Model', () => {
  let attendance: Attendance;
  const attendanceId = AttendanceId.generate();
  const employeeId = EmployeeId.fromNumber(1);
  const outletId = OutletId.fromNumber(1);
  const checkinTime = DateTime.fromString('2024-12-02T09:00:00.000Z');
  const imageProof = ImageProof.fromString('data:image/jpeg;base64,/9j/4AAQ...');

  describe('Attendance Creation', () => {
    it('should create attendance with valid data', () => {
      attendance = new Attendance(
        attendanceId,
        employeeId,
        outletId,
        checkinTime,
        imageProof,
        AttendanceStatus.PRESENT,
        Minutes.fromNumber(0)
      );

      expect(attendance.getId().getValue()).toBe(attendanceId.getValue());
      expect(attendance.getEmployeeId().getValue()).toBe(employeeId.getValue());
      expect(attendance.getOutletId().getValue()).toBe(outletId.getValue());
      expect(attendance.getCheckinTime().getValue()).toBe(checkinTime.getValue());
      expect(attendance.getImageProof().getValue()).toBe(imageProof.getValue());
      expect(attendance.getStatus()).toBe(AttendanceStatus.PRESENT);
      expect(attendance.getLateMinutes().getValue()).toBe(0);
      expect(attendance.isCheckedOut()).toBe(false);
    });

    it('should throw error for invalid data', () => {
      expect(() => {
        new Attendance(
          null as any,
          employeeId,
          outletId,
          checkinTime,
          imageProof,
          AttendanceStatus.PRESENT,
          Minutes.fromNumber(0)
        );
      }).toThrow();
    });
  });

  describe('Business Rules', () => {
    beforeEach(() => {
      attendance = new Attendance(
        attendanceId,
        employeeId,
        outletId,
        checkinTime,
        imageProof,
        AttendanceStatus.PRESENT,
        Minutes.fromNumber(0)
      );
    });

    describe('Checkout Process', () => {
      it('should allow checkout after checkin', () => {
        const checkoutTime = DateTime.fromString('2024-12-02T17:00:00.000Z');
        const checkoutImage = ImageProof.fromString('data:image/jpeg;base64,checkout...');

        attendance.checkout(checkoutTime, checkoutImage);

        expect(attendance.isCheckedOut()).toBe(true);
        expect(attendance.getCheckoutTime()?.getValue()).toBe(checkoutTime.getValue());
        expect(attendance.getCheckoutImageProof()?.getValue()).toBe(checkoutImage.getValue());
      });

      it('should calculate work hours correctly', () => {
        const checkoutTime = DateTime.fromString('2024-12-02T17:30:00.000Z');
        const checkoutImage = ImageProof.fromString('data:image/jpeg;base64,checkout...');

        attendance.checkout(checkoutTime, checkoutImage);

        const workHours = attendance.calculateWorkHours();
        expect(workHours?.getValue()).toBe(510); // 8.5 hours = 510 minutes
      });

      it('should prevent double checkout', () => {
        const checkoutTime = DateTime.fromString('2024-12-02T17:00:00.000Z');
        const checkoutImage = ImageProof.fromString('data:image/jpeg;base64,checkout...');

        attendance.checkout(checkoutTime, checkoutImage);

        expect(() => {
          attendance.checkout(checkoutTime, checkoutImage);
        }).toThrow(InvalidOperationError);
      });

      it('should prevent checkout before checkin', () => {
        const invalidCheckoutTime = DateTime.fromString('2024-12-02T08:00:00.000Z');
        const checkoutImage = ImageProof.fromString('data:image/jpeg;base64,checkout...');

        expect(() => {
          attendance.checkout(invalidCheckoutTime, checkoutImage);
        }).toThrow(InvalidOperationError);
      });
    });

    describe('Late Arrival Management', () => {
      it('should mark attendance as late when employee arrives late', () => {
        const lateCheckinTime = DateTime.fromString('2024-12-02T09:30:00.000Z');
        const lateAttendance = new Attendance(
          AttendanceId.generate(),
          employeeId,
          outletId,
          lateCheckinTime,
          imageProof,
          AttendanceStatus.PRESENT,
          Minutes.fromNumber(30) // 30 minutes late
        );

        expect(lateAttendance.isLate()).toBe(true);
        expect(lateAttendance.getLateMinutes().getValue()).toBe(30);
        expect(lateAttendance.getLateApprovalStatus()).toBe(ApprovalStatus.PENDING);
      });

      it('should allow late notes for late attendance', () => {
        const lateAttendance = new Attendance(
          AttendanceId.generate(),
          employeeId,
          outletId,
          checkinTime,
          imageProof,
          AttendanceStatus.PRESENT,
          Minutes.fromNumber(15)
        );

        const lateNotes = 'Traffic jam on the highway';
        lateAttendance.setLateNotes(lateNotes);

        expect(lateAttendance.getLateNotes()).toBe(lateNotes);
      });

      it('should allow late present proof for late attendance', () => {
        const lateAttendance = new Attendance(
          AttendanceId.generate(),
          employeeId,
          outletId,
          checkinTime,
          imageProof,
          AttendanceStatus.PRESENT,
          Minutes.fromNumber(20)
        );

        const lateProof = ImageProof.fromString('data:image/jpeg;base64,traffic_proof...');
        lateAttendance.setLateProof(lateProof);

        expect(lateAttendance.getLateProof()?.getValue()).toBe(lateProof.getValue());
      });

      it('should approve late arrival', () => {
        const lateAttendance = new Attendance(
          AttendanceId.generate(),
          employeeId,
          outletId,
          checkinTime,
          imageProof,
          AttendanceStatus.PRESENT,
          Minutes.fromNumber(25)
        );

        const approverId = EmployeeId.fromNumber(2);
        lateAttendance.approveLateArrival(approverId);

        expect(lateAttendance.getLateApprovalStatus()).toBe(ApprovalStatus.APPROVED);
        expect(lateAttendance.getApproverEmployeeId()?.getValue()).toBe(approverId.getValue());
      });

      it('should reject late arrival', () => {
        const lateAttendance = new Attendance(
          AttendanceId.generate(),
          employeeId,
          outletId,
          checkinTime,
          imageProof,
          AttendanceStatus.PRESENT,
          Minutes.fromNumber(25)
        );

        const approverId = EmployeeId.fromNumber(2);
        lateAttendance.rejectLateArrival(approverId);

        expect(lateAttendance.getLateApprovalStatus()).toBe(ApprovalStatus.REJECTED);
        expect(lateAttendance.getApproverEmployeeId()?.getValue()).toBe(approverId.getValue());
      });

      it('should not allow approval/rejection for non-late attendance', () => {
        const approverId = EmployeeId.fromNumber(2);

        expect(() => {
          attendance.approveLateArrival(approverId);
        }).toThrow(InvalidOperationError);

        expect(() => {
          attendance.rejectLateArrival(approverId);
        }).toThrow(InvalidOperationError);
      });
    });

    describe('Status Management', () => {
      it('should allow status change to ABSENT', () => {
        attendance.markAsAbsent();
        expect(attendance.getStatus()).toBe(AttendanceStatus.ABSENT);
      });

      it('should allow status change to LEAVE', () => {
        attendance.markAsLeave();
        expect(attendance.getStatus()).toBe(AttendanceStatus.LEAVE);
      });

      it('should allow status change to SICK', () => {
        attendance.markAsSick();
        expect(attendance.getStatus()).toBe(AttendanceStatus.SICK);
      });
    });

    describe('Domain Events', () => {
      it('should raise CheckedInEvent when attendance is created', () => {
        const newAttendance = Attendance.checkin(
          employeeId,
          outletId,
          DateTime.now(),
          imageProof
        );

        const events = newAttendance.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0].eventType).toBe('CheckedInEvent');
      });

      it('should raise CheckedOutEvent when employee checks out', () => {
        const checkoutTime = DateTime.fromString('2024-12-02T17:00:00.000Z');
        const checkoutImage = ImageProof.fromString('data:image/jpeg;base64,checkout...');

        attendance.checkout(checkoutTime, checkoutImage);

        const events = attendance.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0].eventType).toBe('CheckedOutEvent');
      });

      it('should raise LateArrivalApprovedEvent when late arrival is approved', () => {
        const lateAttendance = new Attendance(
          AttendanceId.generate(),
          employeeId,
          outletId,
          checkinTime,
          imageProof,
          AttendanceStatus.PRESENT,
          Minutes.fromNumber(30)
        );

        const approverId = EmployeeId.fromNumber(2);
        lateAttendance.approveLateArrival(approverId);

        const events = lateAttendance.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0].eventType).toBe('LateArrivalApprovedEvent');
      });

      it('should clear events after commit', () => {
        const checkoutTime = DateTime.fromString('2024-12-02T17:00:00.000Z');
        const checkoutImage = ImageProof.fromString('data:image/jpeg;base64,checkout...');

        attendance.checkout(checkoutTime, checkoutImage);
        attendance.markEventsAsCommitted();

        const events = attendance.getUncommittedEvents();
        expect(events).toHaveLength(0);
      });
    });
  });

  describe('Value Objects', () => {
    describe('AttendanceId', () => {
      it('should generate unique IDs', () => {
        const id1 = AttendanceId.generate();
        const id2 = AttendanceId.generate();
        
        expect(id1.getValue()).not.toBe(id2.getValue());
      });

      it('should create from number', () => {
        const id = AttendanceId.fromNumber(123);
        expect(id.getValue()).toBe(123);
      });

      it('should validate positive numbers', () => {
        expect(() => AttendanceId.fromNumber(-1)).toThrow();
        expect(() => AttendanceId.fromNumber(0)).toThrow();
      });
    });

    describe('EmployeeId', () => {
      it('should create from number', () => {
        const id = EmployeeId.fromNumber(456);
        expect(id.getValue()).toBe(456);
      });

      it('should validate positive numbers', () => {
        expect(() => EmployeeId.fromNumber(-1)).toThrow();
        expect(() => EmployeeId.fromNumber(0)).toThrow();
      });
    });

    describe('Minutes', () => {
      it('should create from number', () => {
        const minutes = Minutes.fromNumber(120);
        expect(minutes.getValue()).toBe(120);
      });

      it('should validate non-negative numbers', () => {
        expect(() => Minutes.fromNumber(-1)).toThrow();
        expect(Minutes.fromNumber(0).getValue()).toBe(0);
      });

      it('should convert to hours', () => {
        const minutes = Minutes.fromNumber(150);
        expect(minutes.toHours()).toBe(2.5);
      });
    });

    describe('DateTime', () => {
      it('should create from string', () => {
        const dateStr = '2024-12-02T09:00:00.000Z';
        const dateTime = DateTime.fromString(dateStr);
        expect(dateTime.getValue()).toEqual(new Date(dateStr));
      });

      it('should create current time', () => {
        const now = DateTime.now();
        expect(now.getValue()).toBeInstanceOf(Date);
      });

      it('should format to ISO string', () => {
        const dateStr = '2024-12-02T09:00:00.000Z';
        const dateTime = DateTime.fromString(dateStr);
        expect(dateTime.toISOString()).toBe(dateStr);
      });

      it('should calculate difference in minutes', () => {
        const start = DateTime.fromString('2024-12-02T09:00:00.000Z');
        const end = DateTime.fromString('2024-12-02T09:30:00.000Z');
        const diff = start.diffInMinutes(end);
        expect(diff.getValue()).toBe(30);
      });
    });

    describe('ImageProof', () => {
      it('should create from base64 string', () => {
        const base64 = 'data:image/jpeg;base64,/9j/4AAQ...';
        const proof = ImageProof.fromString(base64);
        expect(proof.getValue()).toBe(base64);
      });

      it('should validate base64 format', () => {
        expect(() => ImageProof.fromString('invalid')).toThrow();
        expect(() => ImageProof.fromString('')).toThrow();
      });

      it('should extract MIME type', () => {
        const base64 = 'data:image/jpeg;base64,/9j/4AAQ...';
        const proof = ImageProof.fromString(base64);
        expect(proof.getMimeType()).toBe('image/jpeg');
      });
    });
  });
});