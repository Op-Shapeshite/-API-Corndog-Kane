import { PrismaClient, PRODUCTSOURCE } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedProductMasters() {
  console.log('🍱 Seeding product masters...');

  const categories = await prisma.productCategory.findMany();
  if (categories.length === 0) {
    console.log('  ⚠ No product categories found. Skipping product masters seeding.');
    return;
  }

  const products = [
    'Original Corn Dog',
    'Cheese Corn Dog',
    'Jumbo Corn Dog',
    'Mini Corn Dog',
    'Spicy Corn Dog',
    'Korean Style Corn Dog',
    'Mozarella Corn Dog',
    'Potato Corn Dog',
    'Rice Cake Corn Dog',
    'Squid Ink Corn Dog',
  ];

  for (const productName of products) {
    try {
      const category = faker.helpers.arrayElement(categories);
      await prisma.productMaster.create({
        data: {
          name: productName,
          category_id: category.id,
          is_active: true,
        },
      });
      console.log(`  ✓ Created product master: ${productName}`);
    } catch (error) {
      console.error(`  ✗ Error creating product master ${productName}:`, error);
    }
  }
}

export async function seedProducts() {
  console.log('🍽️ Seeding products (variants)...');

  const productMasters = await prisma.productMaster.findMany();
  if (productMasters.length === 0) {
    console.log('  ⚠ No product masters found. Skipping products seeding.');
    return;
  }

  const sizes = ['Small', 'Medium', 'Large'];

  for (const master of productMasters) {
    for (const size of sizes) {
      try {
        const basePrice = faker.number.int({ min: 15000, max: 35000 });
        const sizeMultiplier = size === 'Small' ? 0.8 : size === 'Large' ? 1.2 : 1;
        const price = Math.round(basePrice * sizeMultiplier);
        const hpp = Math.round(price * 0.6); // HPP is 60% of price

        await prisma.product.create({
          data: {
            product_master_id: master.id,
            image_path: `/products/${faker.string.alphanumeric(10)}.jpg`,
            description: `${master.name} - ${size} size`,
            price: price,
            hpp: hpp,
            is_active: true,
          },
        });
      } catch (error) {
        console.error(`  ✗ Error creating product variant:`, error);
      }
    }
  }
  console.log(`  ✓ Created product variants`);
}

export async function seedProductInventories() {
  console.log('📋 Seeding product inventories (BOM)...');

  const productMasters = await prisma.productMaster.findMany();
  const materials = await prisma.material.findMany();

  if (productMasters.length === 0 || materials.length === 0) {
    console.log('  ⚠ No product masters or materials found. Skipping product inventories seeding.');
    return;
  }

  for (const master of productMasters) {
    try {
      // Each product needs 3-5 materials
      const neededMaterials = faker.helpers.arrayElements(materials, faker.number.int({ min: 3, max: 5 }));

      for (const material of neededMaterials) {
        await prisma.productInventory.create({
          data: {
            product_id: master.id,
            material_id: material.id,
            quantity: faker.number.int({ min: 1, max: 10 }),
            unit_quantity: faker.helpers.arrayElement(['kg', 'pcs', 'grams', 'ml']),
          },
        });
      }
      console.log(`  ✓ Created inventory for: ${master.name}`);
    } catch (error) {
      console.error(`  ✗ Error creating inventory for ${master.name}:`, error);
    }
  }
}

export async function seedProductStocks() {
  console.log('📦 Seeding product stocks...');

  const productMasters = await prisma.productMaster.findMany();
  const suppliers = await prisma.supplier.findMany();

  if (productMasters.length === 0 || suppliers.length === 0) {
    console.log('  ⚠ No product masters or suppliers found. Skipping product stocks seeding.');
    return;
  }

  for (let i = 0; i < 50; i++) {
    try {
      const master = faker.helpers.arrayElement(productMasters);
      const source = faker.helpers.arrayElement([PRODUCTSOURCE.PRODUCTION, PRODUCTSOURCE.PURCHASE]);
      
      const stock = await prisma.productStock.create({
        data: {
          product_id: master.id,
          quantity: faker.number.int({ min: 10, max: 500 }),
          units: 'pcs',
          date: faker.date.past({ years: 1 }),
          source_from: source,
          is_active: true,
        },
      });

      // If from purchase, add detail
      if (source === PRODUCTSOURCE.PURCHASE) {
        const supplier = faker.helpers.arrayElement(suppliers);
        await prisma.productStockDetail.create({
          data: {
            stock_id: stock.id,
            price: faker.number.int({ min: 5000, max: 20000 }),
            supplier_id: supplier.id,
          },
        });
      }
    } catch (error) {
      console.error('  ✗ Error creating product stock:', error);
    }
  }
  console.log(`  ✓ Created 50 product stock records`);
}
