import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedMaterials() {
  console.log('📦 Seeding materials...');

  const suppliers = await prisma.supplier.findMany();
  if (suppliers.length === 0) {
    console.log('  ⚠ No suppliers found. Skipping materials seeding.');
    return;
  }

  const materialTypes = [
    'Corn Dog Batter Mix',
    'Hot Dog Sausages',
    'Wooden Skewers',
    'Cooking Oil',
    'Cheese',
    'Bread Crumbs',
    'Flour',
    'Sugar',
    'Salt',
    'Mayonnaise',
    'Ketchup',
    'Mustard',
    'BBQ Sauce',
    'Chili Sauce',
    'Packaging Bags',
    'Paper Cups',
    'Disposable Forks',
    'Napkins',
  ];

  for (const materialName of materialTypes) {
    try {
      const supplier = faker.helpers.arrayElement(suppliers);
      await prisma.material.create({
        data: {
          suplier_id: supplier.id,
          name: materialName,
          is_active: faker.datatype.boolean(0.95),
        },
      });
      console.log(`  ✓ Created material: ${materialName}`);
    } catch (error) {
      console.error(`  ✗ Error creating material ${materialName}:`, error);
    }
  }
}

export async function seedMaterialIns() {
  console.log('📥 Seeding material ins...');

  const materials = await prisma.material.findMany();
  if (materials.length === 0) {
    console.log('  ⚠ No materials found. Skipping material ins seeding.');
    return;
  }

  const units = ['kg', 'pcs', 'liters', 'boxes', 'packs'];

  for (let i = 0; i < 50; i++) {
    try {
      const material = faker.helpers.arrayElement(materials);
      const unit = faker.helpers.arrayElement(units);
      
      await prisma.materialIn.create({
        data: {
          material_id: material.id,
          price: faker.number.int({ min: 10000, max: 500000 }),
          quantity_unit: unit,
          quantity: faker.number.int({ min: 10, max: 500 }),
          received_at: faker.date.past({ years: 1 }),
        },
      });
    } catch (error) {
      console.error('  ✗ Error creating material in:', error);
    }
  }
  console.log(`  ✓ Created 50 material in records`);
}

export async function seedMaterialOuts() {
  console.log('📤 Seeding material outs...');

  const materials = await prisma.material.findMany();
  if (materials.length === 0) {
    console.log('  ⚠ No materials found. Skipping material outs seeding.');
    return;
  }

  const units = ['kg', 'pcs', 'liters', 'boxes', 'packs'];

  for (let i = 0; i < 50; i++) {
    try {
      const material = faker.helpers.arrayElement(materials);
      const unit = faker.helpers.arrayElement(units);
      
      await prisma.materialOut.create({
        data: {
          material_id: material.id,
          quantity_unit: unit,
          quantity: faker.number.int({ min: 1, max: 100 }),
          used_at: faker.date.past({ years: 1 }),
        },
      });
    } catch (error) {
      console.error('  ✗ Error creating material out:', error);
    }
  }
  console.log(`  ✓ Created 50 material out records`);
}
