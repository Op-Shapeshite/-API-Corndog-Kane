import { PrismaClient, DAY } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedOutlets() {
  console.log('🏪 Seeding outlets...');

  const users = await prisma.user.findMany({
    where: {
      role: {
        name: { in: ['Outlet', 'Admin'] }
      }
    }
  });

  if (users.length === 0) {
    console.log('  ⚠ No outlet/admin users found. Skipping outlets seeding.');
    return;
  }

  const cities = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Makassar', 'Semarang'];
  
  for (let i = 0; i < Math.min(5, users.length); i++) {
    try {
      const city = faker.helpers.arrayElement(cities);
      await prisma.outlet.create({
        data: {
          name: `Corndog Kane ${city} ${i + 1}`,
          location: faker.location.streetAddress(true),
          description: faker.company.catchPhrase(),
          income_target: faker.number.int({ min: 10000000, max: 50000000 }),
          is_active: true,
          user_id: users[i].id,
        },
      });
      console.log(`  ✓ Created outlet: Corndog Kane ${city} ${i + 1}`);
    } catch (error) {
      console.error('  ✗ Error creating outlet:', error);
    }
  }
}

export async function seedOutletSettings() {
  console.log('⚙️ Seeding outlet settings...');

  const outlets = await prisma.outlet.findMany();
  if (outlets.length === 0) {
    console.log('  ⚠ No outlets found. Skipping outlet settings seeding.');
    return;
  }

  for (const outlet of outlets) {
    try {
      const days = faker.helpers.arrayElements(
        [DAY.MONDAY, DAY.TUESDAY, DAY.WEDNESDAY, DAY.THURSDAY, DAY.FRIDAY, DAY.SATURDAY, DAY.SUNDAY],
        faker.number.int({ min: 5, max: 7 })
      );

      await prisma.outletSetting.create({
        data: {
          outlet_id: outlet.id,
          check_in_time: '08:00',
          check_out_time: '17:00',
          salary: faker.number.int({ min: 3000000, max: 6000000 }),
          day: days,
        },
      });
      console.log(`  ✓ Created outlet setting for: ${outlet.name}`);
    } catch (error) {
      console.error(`  ✗ Error creating outlet setting for ${outlet.name}:`, error);
    }
  }
}

export async function seedOutletEmployees() {
  console.log('👥 Seeding outlet employees...');

  const outlets = await prisma.outlet.findMany();
  const employees = await prisma.employee.findMany({ where: { is_active: true } });

  if (outlets.length === 0 || employees.length === 0) {
    console.log('  ⚠ No outlets or employees found. Skipping outlet employees seeding.');
    return;
  }

  // Assign 3-7 employees to each outlet
  for (const outlet of outlets) {
    try {
      const employeeCount = faker.number.int({ min: 3, max: 7 });
      const selectedEmployees = faker.helpers.arrayElements(employees, employeeCount);

      for (const employee of selectedEmployees) {
        await prisma.outletEmployee.create({
          data: {
            outlet_id: outlet.id,
            employee_id: employee.id,
            assigned_at: faker.date.past({ years: 2 }),
            is_active: true,
          },
        });
      }
      console.log(`  ✓ Assigned ${employeeCount} employees to: ${outlet.name}`);
    } catch (error) {
      console.error(`  ✗ Error assigning employees to ${outlet.name}:`, error);
    }
  }
}
