# Database Seeder Documentation

## Overview

This project includes a comprehensive database seeder system that populates all tables with realistic dummy data using Faker.js. The seeder is designed to respect foreign key dependencies and create meaningful test data for development and testing purposes.

## Quick Start

To populate your database with dummy data, run:

```bash
npm run prisma:generate:data
```

This command will:
1. Generate realistic dummy data for all tables
2. Respect foreign key relationships and dependencies
3. Create meaningful test scenarios
4. Display progress for each seeding phase

## Seeding Phases

The seeder executes in 10 organized phases to maintain data integrity:

### Phase 1: Core Module - Authentication & Base Data
- **Users & Roles**: Creates 6 roles (Super Admin, Admin, HR, Finance, Warehouse, Outlet) and 6 test users
- **Login Records**: Generates 5-15 login history records per user
- **Default Password**: All users have password `password123`

### Phase 2: Core Module - Product Categories
- **Product Categories**: Seeds 5 main categories (ISI CORNDOG, BALUTAN, TOPPING, SAUS ASIN, SAUS MANIS)
- **Product Masters**: Creates 10 product masters (Original Corn Dog, Cheese Corn Dog, etc.)
- **Product Variants**: Generates Small, Medium, Large variants for each product master

### Phase 3: Warehouse Module - Suppliers & Materials
- **Suppliers**: Creates 10 suppliers with random company names
- **Materials**: Seeds 18 material types (ingredients and supplies)
- **Material Ins**: Generates 50 material incoming records
- **Material Outs**: Generates 50 material outgoing records

### Phase 4: Warehouse Module - Product Inventory
- **Product Inventories (BOM)**: Creates Bill of Materials linking products to required materials
- **Product Stocks**: Generates 50 product stock records from production or purchase

### Phase 5: HR Module - Employees
- **Employees**: Creates 30 employees with complete profiles including:
  - NIK, name, phone, address (province, city, district, subdistrict)
  - Personal info (birth date/place, blood type, marital status, religion)
  - Employment details (hire date, position, work type)
  - Profile images

### Phase 6: Outlets Module - Outlets & Assignments
- **Outlets**: Creates 2-5 outlets (branches) with location and income targets
- **Outlet Settings**: Generates work hours and salary settings per outlet
- **Outlet Employees**: Assigns 3-7 employees to each outlet

### Phase 7: Outlets Module - Attendance
- **Attendances**: Generates 30 days of attendance records for each outlet employee
  - Check-in/check-out times
  - Late arrivals (20% probability)
  - Various attendance statuses (Present, Sick, Leave, Excused)
  - Image proofs and approval statuses

### Phase 8: POS Module - Orders & Sales
- **Orders**: Creates 100 orders with 1-5 items each
  - Random payment methods (Cash, Debit, Credit, QRIS, E-Wallet)
  - Order statuses (85% completed, 10% pending, 5% cancelled)
  - Packaging options (bags and types)
- **Order Material Usages**: Links orders to materials used

### Phase 9: SCM Module - Supply Chain Requests
- **Outlet Product Requests**: Creates 30 product requests from outlets
- **Outlet Material Requests**: Creates 30 material requests from outlets
- Various request statuses (Pending, Approved, Rejected, Fulfilled)

### Phase 10: HR Module - Payroll & Payments
- **Payrolls**: Generates payroll records based on attendance
  - Base salary, bonuses, and deductions
  - Links to specific attendance records
- **Payroll Bonuses**: Adds 1-3 bonuses per payroll (performance, target achievement, etc.)
- **Payroll Deductions**: Adds 1-2 deductions per payroll (late, loans, etc.)
- **Payment Batches**: Creates monthly payment batches with status tracking

## Seeder Files Structure

```
prisma/seed/
├── attendance.seeder.ts        # Employee attendance records
├── employee.seeder.ts          # Employee profiles
├── login.seeder.ts             # User login history
├── material.seeder.ts          # Materials, ins, and outs
├── order.seeder.ts             # Orders and material usages
├── outlet.seeder.ts            # Outlets, settings, assignments
├── outletRequest.seeder.ts     # Product/material requests
├── payroll.seeder.ts           # Payroll and payment batches
├── product.seeder.ts           # Legacy product seeder
├── productCategory.seeder.ts   # Product categories
├── productMaster.seeder.ts     # Product masters & variants
├── supplier.seeder.ts          # Suppliers
├── user.seeder.ts              # Users and roles
└── role.seeder.ts              # (included in user.seeder.ts)
```

## Default Test Credentials

All users have the same password: **`password123`**

Available usernames:
- `superadmin` - Super Admin role
- `admin` - Admin role
- `hr.manager` - HR role
- `finance.manager` - Finance role
- `warehouse.manager` - Warehouse role
- `outlet.user` - Outlet role

## Customization

### Adjusting Data Volume

You can modify the number of generated records by editing the seeder files:

```typescript
// In prisma/seed/supplier.seeder.ts
for (let i = 0; i < 10; i++) {  // Change 10 to desired number
  // ...
}
```

### Modifying Data Patterns

Each seeder uses Faker.js to generate realistic data. You can customize patterns in individual seeder files:

```typescript
// Example: Change phone number format
phone: `+62${faker.string.numeric(10)}`,  // Indonesian format
```

### Adding New Tables

To add seeding for new tables:

1. Create a new seeder file in `prisma/seed/`
2. Export a seeder function
3. Import and call it in `prisma/seed.ts` in the appropriate phase

## Common Commands

```bash
# Generate dummy data
npm run prisma:generate:data

# Same as above (alias)
npm run prisma:seed

# View data in Prisma Studio
npm run prisma:studio

# Reset database and re-seed
npx prisma migrate reset
npm run prisma:generate:data
```

## Data Statistics

A successful seeding run creates approximately:
- **8** users with **62** login records
- **10** suppliers
- **18** materials with **100** material transactions
- **32** product categories and products
- **50** product stock records
- **30** employees
- **2-5** outlets with **3-7** employees each
- **210** attendance records (30 days × 7 employees)
- **100** orders with **200-300** order items
- **60** supply chain requests
- **100+** payroll records with bonuses/deductions
- **20** payment batches

**Total Records**: ~800-1000 records across all tables

## Troubleshooting

### Issue: "No suppliers found"
**Solution**: The seeder respects dependencies. Ensure previous phases completed successfully.

### Issue: TypeScript compilation errors
**Solution**: Run `npm run prisma:generate` to regenerate Prisma Client types.

### Issue: Unique constraint violations
**Solution**: The seeder includes duplicate detection. If you see many duplicates, consider resetting the database:
```bash
npx prisma migrate reset
npm run prisma:generate:data
```

### Issue: Seeding takes too long
**Solution**: The comprehensive seeding can take 1-2 minutes. This is normal due to the volume of realistic data being generated.

## Best Practices

1. **Development**: Run seeding on a fresh database after migrations
2. **Testing**: Use seeded data for integration tests
3. **Production**: **NEVER** run seeders on production databases
4. **Customization**: Modify seeder parameters in individual files rather than changing the main seed.ts

## Technical Details

- **Library**: @faker-js/faker v10.1.0
- **Language**: TypeScript
- **ORM**: Prisma Client
- **Execution**: ts-node
- **Dependencies**: Respects foreign key relationships
- **Idempotency**: Can safely re-run (skips duplicates where applicable)

## Contributing

When adding new tables to the schema:
1. Create a corresponding seeder file
2. Follow existing naming conventions
3. Add the seeder to the appropriate phase in seed.ts
4. Update this documentation

## License

This seeder system is part of the Corndog Kane API project.
