# Database Seeder - Quick Reference

## Quick Commands

```bash
# Generate all dummy data
npm run prisma:generate:data

# View generated data
npm run prisma:studio

# Reset & re-seed database
npx prisma migrate reset
npm run prisma:generate:data
```

## Test Credentials

**Password for all users**: `password123`

| Username | Role | Status |
|----------|------|--------|
| superadmin | Super Admin | Active |
| admin | Admin | Active |
| hr.manager | HR | Active |
| finance.manager | Finance | Active |
| warehouse.manager | Warehouse | Active |
| outlet.user | Outlet | Active |

## What Gets Seeded

### 📋 Core Module
- ✅ 6 Roles (Super Admin, Admin, HR, Finance, Warehouse, Outlet)
- ✅ 6 Users  
- ✅ 100+ Login Records
- ✅ 32 Product Categories & Products
- ✅ 30 Product Masters with Variants

### 📦 Warehouse Module
- ✅ 10 Suppliers
- ✅ 18 Materials
- ✅ 50 Material In Records
- ✅ 50 Material Out Records
- ✅ 50 Product Stocks
- ✅ Bill of Materials (BOM)

### 👥 HR Module
- ✅ 30 Employees
- ✅ 210 Attendance Records (30 days)
- ✅ 100+ Payroll Records
- ✅ 20 Payment Batches
- ✅ Bonuses & Deductions

### 🏪 Outlets Module
- ✅ 2-5 Outlets
- ✅ Outlet Settings
- ✅ 3-7 Employees per Outlet

### 💰 POS Module
- ✅ 100 Orders
- ✅ 200-300 Order Items
- ✅ Material Usage Tracking

### 🚚 SCM Module
- ✅ 30 Product Requests
- ✅ 30 Material Requests

## Seeder Files

```
prisma/seed/
├── user.seeder.ts              # Users & Roles
├── login.seeder.ts             # Login History
├── productCategory.seeder.ts   # Product Categories
├── product.seeder.ts           # Legacy Products
├── productMaster.seeder.ts     # Product Masters & Variants
├── supplier.seeder.ts          # Suppliers
├── material.seeder.ts          # Materials & Transactions
├── employee.seeder.ts          # Employees
├── outlet.seeder.ts            # Outlets & Settings
├── attendance.seeder.ts        # Attendance Records
├── order.seeder.ts             # Orders & Items
├── outletRequest.seeder.ts     # SCM Requests
└── payroll.seeder.ts           # Payroll & Payments
```

## Execution Order

The seeder automatically handles dependencies in this order:

1. **Users & Roles** → 2. **Product Categories** → 3. **Suppliers** → 4. **Materials** → 5. **Employees** → 6. **Outlets** → 7. **Attendance** → 8. **Orders** → 9. **Requests** → 10. **Payroll**

## Customization Examples

### Change Data Volume

```typescript
// prisma/seed/supplier.seeder.ts
for (let i = 0; i < 20; i++) {  // Changed from 10 to 20
  // Creates 20 suppliers instead of 10
}
```

### Modify Data Patterns

```typescript
// prisma/seed/employee.seeder.ts
hire_date: faker.date.past({ years: 2 }), // Changed from 5 to 2 years
```

### Add Custom Data

```typescript
// Create your own seeder
export async function seedCustomData() {
  console.log('🎯 Seeding custom data...');
  // Your seeding logic here
}

// Add to seed.ts
import { seedCustomData } from './seed/custom.seeder';
await seedCustomData();
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No suppliers found" | Previous phase failed. Check error logs |
| TypeScript errors | Run `npm run prisma:generate` |
| Duplicate errors | Reset database: `npx prisma migrate reset` |
| Slow seeding | Normal for 1000+ records. Wait 1-2 minutes |

## Data Volume Reference

| Table | Records | Notes |
|-------|---------|-------|
| users | 8 | Fixed test accounts |
| roles | 5 | System roles |
| logins | ~62 | 5-15 per user |
| suppliers | 10 | Customizable |
| materials | 18 | Fixed types |
| material_ins | 50 | Past year |
| material_outs | 50 | Past year |
| employees | 30 | Customizable |
| outlets | 2-5 | Based on manager users |
| attendances | ~210 | 30 days × employees |
| orders | 100 | With items |
| product_stocks | 50 | Mixed sources |
| payrolls | ~100 | Based on attendance |

**Total**: ~800-1000 records

## Advanced Usage

### Reset Only Specific Tables

```bash
# Manual cleanup (use with caution)
npx prisma studio
# Delete records from specific tables manually
npm run prisma:generate:data
```

### Seed Production-Like Data

```bash
# 1. Modify seeders to use realistic business data
# 2. Adjust volumes in seeder files
# 3. Run seeding
npm run prisma:generate:data
```

### Generate Test Reports

```bash
# After seeding, use Prisma Studio or SQL
npm run prisma:studio

# Or query directly
npx prisma studio
```

## Notes

- 🔒 Password for all test users: `password123`
- 🚫 Never run on production databases
- ⏱️ Seeding takes 1-2 minutes for all data
- 📊 Creates realistic test scenarios
- 🔄 Can be run multiple times (idempotent where possible)

## Support

For issues or questions:
1. Check `docs/DATABASE_SEEDER.md` for full documentation
2. Review error logs in terminal output
3. Ensure migrations are up to date: `npm run prisma:migrate`

---

**Last Updated**: November 18, 2025
