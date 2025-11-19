import { PrismaClient, OUTLETREQUESTSTATUS } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedOutletProductRequests() {
  console.log('📦 Seeding outlet product requests...');

  const outlets = await prisma.outlet.findMany();
  const products = await prisma.product.findMany({ where: { is_active: true } });

  if (outlets.length === 0 || products.length === 0) {
    console.log('  ⚠ No outlets or products found. Skipping outlet product requests seeding.');
    return;
  }

  for (let i = 0; i < 30; i++) {
    try {
      const outlet = faker.helpers.arrayElement(outlets);
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 10, max: 100 });
      const status = faker.helpers.weightedArrayElement([
        { value: 'PENDING', weight: 0.3 },
        { value: 'APPROVED', weight: 0.5 },
        { value: 'REJECTED', weight: 0.1 },
        { value: 'FULFILLED', weight: 0.1 },
      ]);

      await prisma.outletProductRequest.create({
        data: {
          outlet_id: outlet.id,
          product_id: product.id,
          quantity: quantity,
          approval_quantity: ['APPROVED', 'FULFILLED'].includes(status) 
            ? faker.number.int({ min: Math.floor(quantity * 0.8), max: quantity })
            : null,
          status: status,
          is_active: true,
        },
      });
    } catch (error) {
      console.error('  ✗ Error creating outlet product request:', error);
    }
  }
  console.log(`  ✓ Created 30 outlet product requests`);
}

export async function seedOutletMaterialRequests() {
  console.log('🔧 Seeding outlet material requests...');

  const outlets = await prisma.outlet.findMany();
  const materials = await prisma.material.findMany({ where: { is_active: true } });

  if (outlets.length === 0 || materials.length === 0) {
    console.log('  ⚠ No outlets or materials found. Skipping outlet material requests seeding.');
    return;
  }

  for (let i = 0; i < 30; i++) {
    try {
      const outlet = faker.helpers.arrayElement(outlets);
      const material = faker.helpers.arrayElement(materials);
      const quantity = faker.number.int({ min: 5, max: 50 });
      const status = faker.helpers.weightedArrayElement([
        { value: OUTLETREQUESTSTATUS.PENDING, weight: 0.3 },
        { value: OUTLETREQUESTSTATUS.APPROVED, weight: 0.5 },
        { value: OUTLETREQUESTSTATUS.REJECTED, weight: 0.1 },
        { value: OUTLETREQUESTSTATUS.FULFILLED, weight: 0.1 },
      ]);

      await prisma.outletMaterialRequest.create({
        data: {
          outlet_id: outlet.id,
          material_id: material.id,
          quantity: quantity,
          approval_quantity: status === OUTLETREQUESTSTATUS.APPROVED || status === OUTLETREQUESTSTATUS.FULFILLED
            ? faker.number.int({ min: Math.floor(quantity * 0.8), max: quantity })
            : null,
          status: status,
          is_active: true,
        },
      });
    } catch (error) {
      console.error('  ✗ Error creating outlet material request:', error);
    }
  }
  console.log(`  ✓ Created 30 outlet material requests`);
}
