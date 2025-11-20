import { PrismaClient, PaymentStatus, BonusType, DeductionType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedPayrolls() {
  console.log('💰 Seeding payrolls...');

  const attendances = await prisma.attendance.findMany({
    where: { 
      attendance_status: 'PRESENT',
      checkout_time: { not: null }
    },
    include: {
      employee: true,
      outlet: true,
    },
    take: 100,
  });

  if (attendances.length === 0) {
    console.log('  ⚠ No completed attendances found. Skipping payrolls seeding.');
    return;
  }

  for (const attendance of attendances) {
    try {
      const baseSalary = faker.number.int({ min: 100000, max: 300000 });
      const totalBonus = faker.number.int({ min: 0, max: 100000 });
      const totalDeduction = faker.number.int({ min: 0, max: 50000 });
      const finalSalary = baseSalary + totalBonus - totalDeduction;

      const payroll = await prisma.payroll.create({
        data: {
          employee_id: attendance.employee_id,
          outlet_id: attendance.outlet_id,
          attendance_id: attendance.id,
          base_salary: baseSalary,
          total_bonus: totalBonus,
          total_deduction: totalDeduction,
          final_salary: finalSalary,
          work_date: attendance.checkin_time,
          is_active: true,
        },
      });

      // Add bonuses if any
      if (totalBonus > 0) {
        const bonusCount = faker.number.int({ min: 1, max: 3 });
        const bonusPerItem = totalBonus / bonusCount;

        for (let i = 0; i < bonusCount; i++) {
          await prisma.payrollBonus.create({
            data: {
              payroll_id: payroll.id,
              type: faker.helpers.arrayElement([
                BonusType.TARGET_ACHIEVEMENT,
                BonusType.PERFORMANCE,
                BonusType.ATTENDANCE,
                BonusType.OTHER,
              ]),
              amount: bonusPerItem,
              description: faker.lorem.sentence(),
            },
          });
        }
      }

      // Add deductions if any
      if (totalDeduction > 0) {
        const deductionCount = faker.number.int({ min: 1, max: 2 });
        const deductionPerItem = totalDeduction / deductionCount;

        for (let i = 0; i < deductionCount; i++) {
          await prisma.payrollDeduction.create({
            data: {
              payroll_id: payroll.id,
              type: faker.helpers.arrayElement([
                DeductionType.LATE,
                DeductionType.ABSENT,
                DeductionType.LOAN,
                DeductionType.OTHER,
              ]),
              amount: deductionPerItem,
              description: faker.lorem.sentence(),
            },
          });
        }
      }
    } catch (error) {
      console.error('  ✗ Error creating payroll:', error);
    }
  }
  console.log(`  ✓ Created payrolls with bonuses and deductions`);
}

export async function seedPaymentBatches() {
  console.log('💵 Seeding payment batches...');

  const employees = await prisma.employee.findMany({
    where: { is_active: true },
    take: 20,
  });

  if (employees.length === 0) {
    console.log('  ⚠ No employees found. Skipping payment batches seeding.');
    return;
  }

  for (const employee of employees) {
    try {
      // Get payrolls for this employee
      const payrolls = await prisma.payroll.findMany({
        where: { 
          employee_id: employee.id,
          payment_batch_id: null,
        },
        take: 30, // One month
      });

      if (payrolls.length === 0) continue;

      const totalBaseSalary = payrolls.reduce((sum, p) => sum + p.base_salary, 0);
      const totalBonus = payrolls.reduce((sum, p) => sum + p.total_bonus, 0);
      const totalDeduction = payrolls.reduce((sum, p) => sum + p.total_deduction, 0);
      const finalAmount = totalBaseSalary + totalBonus - totalDeduction;

      const periodStart = new Date(Math.min(...payrolls.map(p => p.work_date.getTime())));
      const periodEnd = new Date(Math.max(...payrolls.map(p => p.work_date.getTime())));

      const status = faker.helpers.weightedArrayElement([
        { value: PaymentStatus.PAID, weight: 0.7 },
        { value: PaymentStatus.PENDING, weight: 0.2 },
        { value: PaymentStatus.PROCESSING, weight: 0.1 },
      ]);

      const batch = await prisma.paymentBatch.create({
        data: {
          employee_id: employee.id,
          period_start: periodStart,
          period_end: periodEnd,
          total_base_salary: totalBaseSalary,
          total_bonus: totalBonus,
          total_deduction: totalDeduction,
          final_amount: finalAmount,
          status: status,
          paid_at: status === PaymentStatus.PAID ? faker.date.recent({ days: 7 }) : null,
          payment_method: status === PaymentStatus.PAID ? faker.helpers.arrayElement(['BANK_TRANSFER', 'CASH', 'CHECK']) : null,
          payment_reference: status === PaymentStatus.PAID ? `PAY-${faker.string.alphanumeric(10).toUpperCase()}` : null,
          notes: faker.datatype.boolean(0.2) ? faker.lorem.sentence() : null,
        },
      });

      // Link payrolls to batch
      await prisma.payroll.updateMany({
        where: { id: { in: payrolls.map(p => p.id) } },
        data: { payment_batch_id: batch.id },
      });

      console.log(`  ✓ Created payment batch for: ${employee.name}`);
    } catch (error) {
      console.error(`  ✗ Error creating payment batch for ${employee.name}:`, error);
    }
  }
}
