import { PrismaClient, BagSize, PackagingType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedOrders() {
  console.log('🛒 Seeding orders...');

  const outlets = await prisma.outlet.findMany();
  const outletEmployees = await prisma.outletEmployee.findMany({
    where: { is_active: true },
    include: { employee: true, outlet: true },
  });
  const products = await prisma.product.findMany({ where: { is_active: true } });

  if (outlets.length === 0 || outletEmployees.length === 0 || products.length === 0) {
    console.log('  ⚠ Missing required data. Skipping orders seeding.');
    return;
  }

  const paymentMethods = ['CASH', 'DEBIT', 'CREDIT', 'QRIS', 'E-WALLET'];
  const statuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

  // Generate 100 orders
  for (let i = 0; i < 100; i++) {
    try {
      const outletEmployee = faker.helpers.arrayElement(outletEmployees);
      const orderDate = faker.date.past({ years: 1 });
      
      const order = await prisma.order.create({
        data: {
          outlet_id: outletEmployee.outlet_id,
          outlet_location: outletEmployee.outlet.location,
          invoice_number: `INV-${faker.string.alphanumeric(10).toUpperCase()}`,
          employee_id: outletEmployee.employee_id,
          payment_method: faker.helpers.arrayElement(paymentMethods),
          total_amount: 0, // Will be calculated
          status: faker.helpers.weightedArrayElement([
            { value: 'COMPLETED', weight: 0.85 },
            { value: 'PENDING', weight: 0.1 },
            { value: 'CANCELLED', weight: 0.05 },
          ]),
          is_using_bag: faker.datatype.boolean(0.3) ? faker.helpers.arrayElement([BagSize.SMALL, BagSize.MEDIUM, BagSize.LARGE]) : null,
          packaging_type: faker.helpers.arrayElement([PackagingType.CUP, PackagingType.BOX, PackagingType.NONE]),
          is_active: true,
          createdAt: orderDate,
        },
      });

      // Add 1-5 order items
      const itemCount = faker.number.int({ min: 1, max: 5 });
      let totalAmount = 0;

      for (let j = 0; j < itemCount; j++) {
        const product = faker.helpers.arrayElement(products);
        const quantity = faker.number.int({ min: 1, max: 5 });
        const itemTotal = product.price * quantity;
        totalAmount += itemTotal;

        await prisma.orderItem.create({
          data: {
            order_id: order.id,
            product_id: product.id,
            quantity: quantity,
            price: product.price,
            is_active: true,
          },
        });
      }

      // Update order total
      await prisma.order.update({
        where: { id: order.id },
        data: { total_amount: totalAmount },
      });

    } catch (error) {
      console.error('  ✗ Error creating order:', error);
    }
  }
  console.log(`  ✓ Created 100 orders with items`);
}

export async function seedOrderMaterialUsages() {
  console.log('📊 Seeding order material usages...');

  const orders = await prisma.order.findMany({
    where: { status: 'COMPLETED' },
    take: 50,
  });
  const materials = await prisma.material.findMany();

  if (orders.length === 0 || materials.length === 0) {
    console.log('  ⚠ No completed orders or materials found. Skipping order material usages seeding.');
    return;
  }

  for (const order of orders) {
    try {
      // Each order uses 2-4 materials
      const usedMaterials = faker.helpers.arrayElements(materials, faker.number.int({ min: 2, max: 4 }));

      for (const material of usedMaterials) {
        await prisma.orderMaterialUsage.create({
          data: {
            order_id: order.id,
            material_id: material.id,
            quantity: faker.number.int({ min: 1, max: 20 }),
            quantity_unit: faker.helpers.arrayElement(['kg', 'pcs', 'grams', 'ml']),
            used_at: order.createdAt,
          },
        });
      }
    } catch (error) {
      console.error('  ✗ Error creating order material usage:', error);
    }
  }
  console.log(`  ✓ Created order material usages`);
}
