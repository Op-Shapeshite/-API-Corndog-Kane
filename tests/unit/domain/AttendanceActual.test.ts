import { Attendance } from '../../../src/core/domain/aggregates/Attendance';
import { AttendanceId } from '../../../src/core/domain/value-objects/AttendanceId';
import { EmployeeId } from '../../../src/core/domain/value-objects/EmployeeId';
import { OutletId } from '../../../src/core/domain/value-objects/OutletId';
import { DateTime } from '../../../src/core/domain/value-objects/DateTime';
import { Minutes } from '../../../src/core/domain/value-objects/Minutes';
import { AttendanceStatus, ImageProof } from '../../../src/core/domain/value-objects/SharedTypes';
import { AlreadyCheckedOutError, NoCheckinRecordError, InvalidCheckoutTimeError, InvalidLateApprovalError } from '../../../src/core/domain/exceptions/AttendanceExceptions';

describe('Attendance Domain Model - Unit Tests', () => {
  const employeeId = EmployeeId.fromNumber(1);
  const outletId = OutletId.fromNumber(1);
  const checkinTime = DateTime.fromString('2024-12-02T09:00:00.000Z');
  const scheduledTime = DateTime.fromString('2024-12-02T08:30:00.000Z');
  const imageProof = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...';

  describe('Attendance Creation', () => {
    it('should create attendance with on-time checkin', () => {
      const attendance = Attendance.create(
        employeeId,
        outletId,
        checkinTime,
        imageProof,
        checkinTime // Same as checkinTime = on time
      );

      expect(attendance.getId()).toBeInstanceOf(AttendanceId);
      expect(attendance.getEmployeeId()).toBe(employeeId);
      expect(attendance.getOutletId()).toBe(outletId);
      expect(attendance.isLate()).toBe(false);
      expect(attendance.getLateness().getValue()).toBe(0);
      expect(attendance.isActive()).toBe(true);
      expect(attendance.hasCheckedOut()).toBe(false);
    });

    it('should create attendance with late checkin', () => {
      const lateTime = DateTime.fromString('2024-12-02T09:30:00.000Z');
      const attendance = Attendance.create(
        employeeId,
        outletId,
        lateTime,
        imageProof,
        scheduledTime, // Earlier than actual checkin
        'Traffic jam',
        'traffic_proof_image'
      );

      expect(attendance.isLate()).toBe(true);
      expect(attendance.getLateness().getValue()).toBe(30); // 30 minutes late
      expect(attendance.getLateNotes()).toBe('Traffic jam');
      expect(attendance.getLatePresentProof()).toBe('traffic_proof_image');
    });

    it('should raise AttendanceCreatedEvent on creation', () => {
      const attendance = Attendance.create(
        employeeId,
        outletId,
        checkinTime,
        imageProof,
        checkinTime
      );

      const events = attendance.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('AttendanceCreatedEvent');
    });
  });

  describe('Checkout Process', () => {
    let attendance: Attendance;

    beforeEach(() => {
      attendance = Attendance.create(
        employeeId,
        outletId,
        checkinTime,
        imageProof,
        checkinTime
      );
      // Clear creation event for testing
      attendance.markEventsAsCommitted();
    });

    it('should allow checkout after checkin', () => {
      const checkoutTime = DateTime.fromString('2024-12-02T17:00:00.000Z');
      const checkoutProof = 'data:image/jpeg;base64,checkout_image...';

      attendance.checkout(checkoutTime, checkoutProof);

      expect(attendance.hasCheckedOut()).toBe(true);
      expect(attendance.calculateWorkingHours().getValue()).toBe(480); // 8 hours = 480 minutes
    });

    it('should raise AttendanceCompletedEvent on checkout', () => {
      const checkoutTime = DateTime.fromString('2024-12-02T17:00:00.000Z');
      const checkoutProof = 'data:image/jpeg;base64,checkout_image...';

      attendance.checkout(checkoutTime, checkoutProof);

      const events = attendance.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('AttendanceCompletedEvent');
    });

    it('should prevent double checkout', () => {
      const checkoutTime = DateTime.fromString('2024-12-02T17:00:00.000Z');
      const checkoutProof = 'data:image/jpeg;base64,checkout_image...';

      attendance.checkout(checkoutTime, checkoutProof);

      expect(() => {
        attendance.checkout(checkoutTime, checkoutProof);
      }).toThrow(AlreadyCheckedOutError);
    });

    it('should prevent checkout before checkin time', () => {
      const invalidCheckoutTime = DateTime.fromString('2024-12-02T08:00:00.000Z');
      const checkoutProof = 'data:image/jpeg;base64,checkout_image...';

      expect(() => {
        attendance.checkout(invalidCheckoutTime, checkoutProof);
      }).toThrow(InvalidCheckoutTimeError);
    });
  });

  describe('Late Arrival Management', () => {
    let lateAttendance: Attendance;
    let onTimeAttendance: Attendance;

    beforeEach(() => {
      const lateTime = DateTime.fromString('2024-12-02T09:30:00.000Z');
      lateAttendance = Attendance.create(
        employeeId,
        outletId,
        lateTime,
        imageProof,
        scheduledTime,
        'Traffic jam',
        'traffic_proof'
      );

      onTimeAttendance = Attendance.create(
        employeeId,
        outletId,
        checkinTime,
        imageProof,
        checkinTime
      );

      // Clear creation events
      lateAttendance.markEventsAsCommitted();
      onTimeAttendance.markEventsAsCommitted();
    });

    it('should approve late arrival', () => {
      const approverId = EmployeeId.fromNumber(2);

      lateAttendance.approveLateArrival(approverId);

      expect(lateAttendance.getLateApprovalStatus()).toBe('APPROVED');
      expect(lateAttendance.getApproverEmployeeId()?.getValue()).toBe(2);

      const events = lateAttendance.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('LateArrivalApprovedEvent');
    });

    it('should reject late arrival', () => {
      const approverId = EmployeeId.fromNumber(2);

      lateAttendance.rejectLateArrival(approverId);

      expect(lateAttendance.getLateApprovalStatus()).toBe('REJECTED');
      expect(lateAttendance.getApproverEmployeeId()?.getValue()).toBe(2);

      const events = lateAttendance.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('LateArrivalRejectedEvent');
    });

    it('should not allow approval for on-time attendance', () => {
      const approverId = EmployeeId.fromNumber(2);

      expect(() => {
        onTimeAttendance.approveLateArrival(approverId);
      }).toThrow(InvalidLateApprovalError);
    });

    it('should not allow rejection for on-time attendance', () => {
      const approverId = EmployeeId.fromNumber(2);

      expect(() => {
        onTimeAttendance.rejectLateArrival(approverId);
      }).toThrow(InvalidLateApprovalError);
    });
  });

  describe('Business Logic', () => {
    let attendance: Attendance;

    beforeEach(() => {
      attendance = Attendance.create(
        employeeId,
        outletId,
        checkinTime,
        imageProof,
        checkinTime
      );
    });

    it('should calculate work hours correctly', () => {
      const checkoutTime = DateTime.fromString('2024-12-02T17:30:00.000Z');
      attendance.checkout(checkoutTime, 'checkout_proof');

      const workHours = attendance.calculateWorkingHours();
      expect(workHours.getValue()).toBe(510); // 8.5 hours = 510 minutes
      expect(workHours.toHours()).toBe(8.5);
    });

    it('should handle same-day check-in and check-out', () => {
      const checkoutTime = DateTime.fromString('2024-12-02T17:00:00.000Z');
      attendance.checkout(checkoutTime, 'checkout_proof');

      expect(attendance.hasCheckedOut()).toBe(true);
      expect(attendance.calculateWorkingHours().getValue()).toBe(480); // 8 hours
    });

    it('should validate work date consistency', () => {
      const workDate = attendance.getWorkDate();
      expect(workDate).toBeInstanceOf(DateTime);
      expect(workDate.getValue().getDate()).toBe(new Date('2024-12-02').getDate());
    });
  });

  describe('Domain Events', () => {
    it('should track uncommitted events', () => {
      const attendance = Attendance.create(
        employeeId,
        outletId,
        checkinTime,
        imageProof,
        checkinTime
      );

      const events = attendance.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('AttendanceCreatedEvent');
      expect(events[0].data).toHaveProperty('attendanceId');
      expect(events[0].data).toHaveProperty('employeeId');
      expect(events[0].data).toHaveProperty('checkinTime');
    });

    it('should clear events after commit', () => {
      const attendance = Attendance.create(
        employeeId,
        outletId,
        checkinTime,
        imageProof,
        checkinTime
      );

      attendance.markEventsAsCommitted();

      const events = attendance.getUncommittedEvents();
      expect(events).toHaveLength(0);
    });

    it('should handle multiple events in sequence', () => {
      const lateTime = DateTime.fromString('2024-12-02T09:30:00.000Z');
      const attendance = Attendance.create(
        employeeId,
        outletId,
        lateTime,
        imageProof,
        scheduledTime
      );

      // Clear creation event
      attendance.markEventsAsCommitted();

      // Approve late arrival
      const approverId = EmployeeId.fromNumber(2);
      attendance.approveLateArrival(approverId);

      // Check out
      const checkoutTime = DateTime.fromString('2024-12-02T17:00:00.000Z');
      attendance.checkout(checkoutTime, 'checkout_proof');

      const events = attendance.getUncommittedEvents();
      expect(events).toHaveLength(2);
      expect(events[0].eventType).toBe('LateArrivalApprovedEvent');
      expect(events[1].eventType).toBe('AttendanceCompletedEvent');
    });
  });

  describe('Value Objects', () => {
    describe('AttendanceId', () => {
      it('should generate unique IDs', () => {
        const id1 = AttendanceId.generate();
        const id2 = AttendanceId.generate();
        
        expect(id1.getValue()).not.toBe(id2.getValue());
        expect(typeof id1.getValue()).toBe('number');
      });

      it('should create from number', () => {
        const id = AttendanceId.fromNumber(123);
        expect(id.getValue()).toBe(123);
      });

      it('should validate positive numbers only', () => {
        expect(() => AttendanceId.fromNumber(-1)).toThrow('AttendanceId must be a positive number');
        expect(() => AttendanceId.fromNumber(0)).toThrow('AttendanceId must be a positive number');
      });
    });

    describe('EmployeeId', () => {
      it('should create from number', () => {
        const id = EmployeeId.fromNumber(456);
        expect(id.getValue()).toBe(456);
      });

      it('should validate positive numbers only', () => {
        expect(() => EmployeeId.fromNumber(-1)).toThrow('EmployeeId must be a positive number');
        expect(() => EmployeeId.fromNumber(0)).toThrow('EmployeeId must be a positive number');
      });
    });

    describe('OutletId', () => {
      it('should create from number', () => {
        const id = OutletId.fromNumber(789);
        expect(id.getValue()).toBe(789);
      });

      it('should validate positive numbers only', () => {
        expect(() => OutletId.fromNumber(-1)).toThrow('OutletId must be a positive number');
        expect(() => OutletId.fromNumber(0)).toThrow('OutletId must be a positive number');
      });
    });

    describe('Minutes', () => {
      it('should create from number', () => {
        const minutes = Minutes.fromNumber(120);
        expect(minutes.getValue()).toBe(120);
      });

      it('should validate non-negative numbers', () => {
        expect(() => Minutes.fromNumber(-1)).toThrow('Minutes must be non-negative');
        expect(Minutes.fromNumber(0).getValue()).toBe(0);
      });

      it('should convert to hours', () => {
        const minutes = Minutes.fromNumber(150);
        expect(minutes.toHours()).toBe(2.5);
      });

      it('should format to string', () => {
        const minutes = Minutes.fromNumber(90);
        expect(minutes.toString()).toBe('90 minutes');
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
        // Should be close to current time (within 1 second)
        expect(Math.abs(now.getValue().getTime() - Date.now())).toBeLessThan(1000);
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

      it('should handle negative differences', () => {
        const start = DateTime.fromString('2024-12-02T09:30:00.000Z');
        const end = DateTime.fromString('2024-12-02T09:00:00.000Z');
        const diff = start.diffInMinutes(end);
        expect(diff.getValue()).toBe(-30);
      });
    });
  });
});