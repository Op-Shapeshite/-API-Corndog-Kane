import { PrismaClient, MeritalStatus, BLOODTYPE, Gender } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedEmployees() {
  console.log('👤 Seeding employees...');

  const positions = ['Cashier', 'Cook', 'Server', 'Manager', 'Assistant Manager', 'Kitchen Staff'];
  const workTypes = ['Full Time', 'Part Time', 'Contract', 'Temporary'];
  const religions = ['Islam', 'Christian', 'Catholic', 'Hindu', 'Buddhist', 'Other'];

  for (let i = 0; i < 30; i++) {
    try {
      const gender = faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]);
      const firstName = faker.person.firstName(gender === Gender.MALE ? 'male' : 'female');
      const lastName = faker.person.lastName();
      
      await prisma.employee.create({
        data: {
          nik: faker.string.numeric(16),
          name: `${firstName} ${lastName}`,
          phone: `+62${faker.string.numeric(10)}`,
          address: faker.location.streetAddress(true),
          province_id: BigInt(faker.number.int({ min: 1, max: 34 })),
          city_id: BigInt(faker.number.int({ min: 1, max: 514 })),
          district_id: BigInt(faker.number.int({ min: 1, max: 7000 })),
          subdistrict_id: BigInt(faker.number.int({ min: 1, max: 83000 })),
          merital_status: faker.helpers.arrayElement([
            MeritalStatus.SINGLE,
            MeritalStatus.MARRIED,
            MeritalStatus.DIVORCED,
            MeritalStatus.WIDOWED,
          ]),
          religion: faker.helpers.arrayElement(religions),
          birth_date: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }),
          birth_place: faker.location.city(),
          blood_type: faker.helpers.arrayElement([BLOODTYPE.A, BLOODTYPE.B, BLOODTYPE.AB, BLOODTYPE.O]),
          rt: faker.string.numeric({ length: 3 }),
          rw: faker.string.numeric({ length: 3 }),
          work_type: faker.helpers.arrayElement(workTypes),
          position: faker.helpers.arrayElement(positions),
          notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
          image_path: `/employee/${faker.string.alphanumeric(10)}.jpg`,
          gender: gender,
          hire_date: faker.date.past({ years: 5 }),
          is_active: faker.datatype.boolean(0.9),
        },
      });
    } catch (error) {
      console.error('  ✗ Error creating employee:', error);
    }
  }
  console.log(`  ✓ Created 30 employees`);
}
