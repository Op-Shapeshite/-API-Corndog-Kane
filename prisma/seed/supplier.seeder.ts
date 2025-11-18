import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedSuppliers() {
  console.log('🏭 Seeding suppliers...');

  const suppliers = [];
  for (let i = 0; i < 10; i++) {
    suppliers.push({
      name: faker.company.name(),
      phone: `+62${faker.string.numeric(10)}`,
      address: faker.location.streetAddress(true),
      is_active: faker.datatype.boolean(0.9),
    });
  }

  for (const supplier of suppliers) {
    try {
      await prisma.supplier.create({
        data: supplier,
      });
      console.log(`  ✓ Created supplier: ${supplier.name}`);
    } catch (error) {
      console.error(`  ✗ Error creating supplier ${supplier.name}:`, error);
    }
  }
}
