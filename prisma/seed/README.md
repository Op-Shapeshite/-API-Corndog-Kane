# Database Seeders

This directory contains all database seeder files for the Corndog Kane API project.

## Overview

Each file in this directory is responsible for seeding specific tables with realistic dummy data using Faker.js.

## Usage

Run all seeders:
```bash
npm run prisma:generate:data
```

## Seeder Files

### Core Module

#### `user.seeder.ts`
Seeds users and roles (authentication system)
- **Exports**: `seedAll()`, `seedRoles()`, `seedUsers()`
- **Creates**: 5 roles, 8 users
- **Default Password**: `password123`

#### `login.seeder.ts`
Seeds login history records
- **Exports**: `seedLogins()`
- **Creates**: 5-15 login records per user
- **Dependency**: Users

#### `productCategory.seeder.ts`
Seeds product categories
- **Exports**: `seedProductCategories()`
- **Creates**: 5 main categories
- **Categories**: ISI CORNDOG, BALUTAN, TOPPING, SAUS ASIN, SAUS MANIS

#### `product.seeder.ts`
Legacy product seeder (backward compatibility)
- **Exports**: `seedProducts()`
- **Creates**: ~22 products across categories
- **Dependency**: Product categories

#### `productMaster.seeder.ts`
Seeds product masters, variants, inventories, and stocks
- **Exports**: 
  - `seedProductMasters()` - 10 product types
  - `seedProducts()` - Variants (Small/Medium/Large)
  - `seedProductInventories()` - Bill of Materials
  - `seedProductStocks()` - Stock records
- **Dependency**: Product categories, materials, suppliers

### Warehouse Module

#### `supplier.seeder.ts`
Seeds suppliers
- **Exports**: `seedSuppliers()`
- **Creates**: 10 suppliers with realistic company names
- **Fields**: Name, phone, address, active status

#### `material.seeder.ts`
Seeds materials and transactions
- **Exports**: 
  - `seedMaterials()` - 18 material types
  - `seedMaterialIns()` - 50 incoming records
  - `seedMaterialOuts()` - 50 outgoing records
- **Dependency**: Suppliers (for materials)
- **Material Types**: Batter mix, sausages, sauces, packaging, etc.

### HR Module

#### `employee.seeder.ts`
Seeds employee profiles
- **Exports**: `seedEmployees()`
- **Creates**: 30 employees with complete profiles
- **Fields**: 
  - Personal: NIK, name, phone, address, birth info
  - Location: Province, city, district, subdistrict
  - Employment: Position, hire date, work type
  - Additional: Blood type, marital status, religion

#### `attendance.seeder.ts`
Seeds attendance records
- **Exports**: `seedAttendances()`
- **Creates**: 30 days of attendance per outlet employee
- **Features**:
  - Check-in/check-out times
  - Late arrivals (20% probability)
  - Various statuses (Present, Sick, Leave, Excused)
  - Image proofs and approval tracking
- **Dependency**: Outlet employees

### Outlets Module

#### `outlet.seeder.ts`
Seeds outlets, settings, and employee assignments
- **Exports**: 
  - `seedOutlets()` - 2-5 outlets/branches
  - `seedOutletSettings()` - Work hours and salary
  - `seedOutletEmployees()` - 3-7 employees per outlet
- **Dependency**: Users (managers), employees
- **Features**: Location, income targets, work schedules

### POS Module

#### `order.seeder.ts`
Seeds orders and material usage
- **Exports**: 
  - `seedOrders()` - 100 orders with 1-5 items each
  - `seedOrderMaterialUsages()` - Material tracking per order
- **Dependency**: Outlets, employees, products, materials
- **Features**:
  - Payment methods (Cash, Debit, Credit, QRIS, E-Wallet)
  - Order statuses (85% completed, 10% pending, 5% cancelled)
  - Packaging options (bags, cups, boxes)

### SCM Module

#### `outletRequest.seeder.ts`
Seeds supply chain requests
- **Exports**: 
  - `seedOutletProductRequests()` - 30 product requests
  - `seedOutletMaterialRequests()` - 30 material requests
- **Dependency**: Outlets, products, materials
- **Statuses**: Pending, Approved, Rejected, Fulfilled

### Payroll Module

#### `payroll.seeder.ts`
Seeds payroll and payment batches
- **Exports**: 
  - `seedPayrolls()` - Payroll records from attendance
  - `seedPaymentBatches()` - Monthly payment batches
- **Dependency**: Employees, outlets, attendance
- **Features**:
  - Base salary calculation
  - Bonuses (1-3 per payroll)
  - Deductions (1-2 per payroll)
  - Payment status tracking

## Execution Order

The seeders execute in dependency order (managed by `seed.ts`):

```
1. Users & Roles
2. Logins
3. Product Categories
4. Product Masters
5. Suppliers
6. Materials (+ ins/outs)
7. Product Inventories & Stocks
8. Employees
9. Outlets (+ settings + assignments)
10. Attendances
11. Orders (+ material usages)
12. Outlet Requests
13. Payrolls (+ payment batches)
```

## Creating New Seeders

### Template

```typescript
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedYourTable() {
  console.log('🎯 Seeding your table...');

  // Check dependencies
  const dependencies = await prisma.dependency.findMany();
  if (dependencies.length === 0) {
    console.log('  ⚠ No dependencies found. Skipping seeding.');
    return;
  }

  // Generate data
  for (let i = 0; i < 10; i++) {
    try {
      await prisma.yourTable.create({
        data: {
          field1: faker.lorem.word(),
          field2: faker.number.int({ min: 1, max: 100 }),
          // ... more fields
        },
      });
    } catch (error) {
      console.error('  ✗ Error creating record:', error);
    }
  }
  
  console.log(`  ✓ Created records`);
}
```

### Adding to Main Seeder

1. Create your seeder file in this directory
2. Export your seeder function
3. Import in `../seed.ts`:
   ```typescript
   import { seedYourTable } from './seed/yourTable.seeder';
   ```
4. Call it in the appropriate phase:
   ```typescript
   await seedYourTable();
   ```

## Customization Tips

### Adjusting Volume
```typescript
for (let i = 0; i < 50; i++) {  // Change this number
  // ...
}
```

### Changing Probabilities
```typescript
faker.datatype.boolean(0.9)  // 90% true
faker.helpers.weightedArrayElement([
  { value: 'A', weight: 0.7 },  // 70% chance
  { value: 'B', weight: 0.3 },  // 30% chance
])
```

### Using Realistic Data
```typescript
// Instead of random strings
name: faker.company.name()
phone: `+62${faker.string.numeric(10)}`
email: faker.internet.email()
date: faker.date.past({ years: 1 })
```

## Common Patterns

### Safe Foreign Key References
```typescript
const dependencies = await prisma.dependency.findMany();
const randomDep = faker.helpers.arrayElement(dependencies);
// Use: randomDep.id
```

### Error Handling
```typescript
try {
  await prisma.table.create({ data });
} catch (error) {
  console.error('  ✗ Error:', error);
  // Continue or skip
}
```

### Checking Existing Data
```typescript
const existing = await prisma.table.findUnique({
  where: { uniqueField: value }
});
if (!existing) {
  await prisma.table.create({ data });
}
```

## Faker.js Quick Reference

```typescript
// Text
faker.lorem.word()
faker.lorem.sentence()
faker.lorem.paragraph()

// Person
faker.person.firstName()
faker.person.lastName()
faker.person.fullName()

// Company
faker.company.name()
faker.company.catchPhrase()

// Location
faker.location.city()
faker.location.streetAddress(true)
faker.location.country()

// Internet
faker.internet.email()
faker.internet.url()
faker.internet.ip()

// Numbers
faker.number.int({ min: 1, max: 100 })
faker.number.float({ min: 0, max: 1, precision: 0.01 })

// Dates
faker.date.past({ years: 1 })
faker.date.recent({ days: 30 })
faker.date.future({ years: 1 })
faker.date.birthdate({ min: 18, max: 60, mode: 'age' })

// Random
faker.datatype.boolean()
faker.datatype.boolean(0.9)  // 90% true
faker.helpers.arrayElement(array)
faker.helpers.arrayElements(array, count)
faker.string.numeric(length)
faker.string.alphanumeric(length)
```

## Testing Your Seeder

1. Create your seeder file
2. Add it to `seed.ts`
3. Test it:
   ```bash
   npm run prisma:generate:data
   ```
4. Verify in Prisma Studio:
   ```bash
   npm run prisma:studio
   ```

## Best Practices

1. ✅ Always check dependencies first
2. ✅ Use try-catch for error handling
3. ✅ Log progress with descriptive messages
4. ✅ Use realistic data with Faker.js
5. ✅ Respect foreign key relationships
6. ✅ Handle edge cases (empty arrays, nulls)
7. ✅ Make volume configurable (loop counts)
8. ✅ Follow existing naming conventions
9. ✅ Document complex logic
10. ✅ Test thoroughly before committing

## Notes

- All seeders use TypeScript
- Executed via `ts-node`
- Prisma Client is auto-generated
- Faker.js provides realistic dummy data
- Execution takes 1-2 minutes for all seeders

## Documentation

- Full docs: `../docs/DATABASE_SEEDER.md`
- Quick ref: `../docs/SEEDER_QUICK_REFERENCE.md`
- Schema: `../schema.prisma`

---

**Last Updated**: November 18, 2025
