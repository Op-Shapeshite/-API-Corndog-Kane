import { PrismaClient, ApprovalStatus, AttendanceStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedAttendances() {
  console.log('📅 Seeding attendances...');

  const outletEmployees = await prisma.outletEmployee.findMany({
    where: { is_active: true },
    include: {
      employee: true,
      outlet: true,
    },
  });

  if (outletEmployees.length === 0) {
    console.log('  ⚠ No outlet employees found. Skipping attendances seeding.');
    return;
  }

  // Generate attendance for the last 30 days
  const daysToGenerate = 30;
  let attendanceCount = 0;

  for (const outletEmployee of outletEmployees) {
    for (let i = 0; i < daysToGenerate; i++) {
      try {
        const date = faker.date.recent({ days: daysToGenerate - i });
        const checkInTime = new Date(date);
        checkInTime.setHours(8, faker.number.int({ min: 0, max: 30 }), 0);

        const isLate = faker.datatype.boolean(0.2); // 20% chance of being late
        const lateMinutes = isLate ? faker.number.int({ min: 5, max: 120 }) : 0;

        if (lateMinutes > 0) {
          checkInTime.setMinutes(checkInTime.getMinutes() + lateMinutes);
        }

        const checkOutTime = new Date(checkInTime);
        checkOutTime.setHours(17, faker.number.int({ min: 0, max: 30 }), 0);

        const attendanceStatus = faker.helpers.weightedArrayElement([
          { value: AttendanceStatus.PRESENT, weight: 0.8 },
          { value: AttendanceStatus.SICK, weight: 0.05 },
          { value: AttendanceStatus.CUTI, weight: 0.1 },
          { value: AttendanceStatus.EXCUSED, weight: 0.05 },
        ]);

        await prisma.attendance.create({
          data: {
            employee_id: outletEmployee.employee_id,
            outlet_id: outletEmployee.outlet_id,
            checkin_image_proof: `/absent/${faker.string.alphanumeric(10)}.jpg`,
            checkout_image_proof: faker.datatype.boolean(0.9) ? `/absent/${faker.string.alphanumeric(10)}.jpg` : null,
            checkin_time: checkInTime,
            checkout_time: faker.datatype.boolean(0.9) ? checkOutTime : null,
            late_minutes: lateMinutes,
            late_notes: lateMinutes > 0 ? faker.helpers.arrayElement(['Traffic', 'Personal issue', 'Transport problem']) : null,
            late_present_proof: lateMinutes > 15 ? `/absent/${faker.string.alphanumeric(10)}.jpg` : null,
            late_approval_status: lateMinutes > 0 
              ? faker.helpers.arrayElement([ApprovalStatus.PENDING, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED])
              : ApprovalStatus.APPROVED,
            attendance_status: attendanceStatus,
            notes: faker.datatype.boolean(0.1) ? faker.lorem.sentence() : null,
            is_active: true,
          },
        });
        attendanceCount++;
      } catch (error: any) {
        // Skip duplicate entries
        if (error.code !== 'P2002') {
          console.error('  ✗ Error creating attendance:', error);
        }
      }
    }
  }
  console.log(`  ✓ Created ${attendanceCount} attendance records`);
}
