# Prisma Schema Organization

## Overview

The Prisma schema for Corndog-Kane API has been reorganized by **business modules** for better maintainability and understanding. While all models remain in a single `schema.prisma` file (for Prisma compatibility), they are now clearly organized with section headers and comments.

## Business Module Structure

### 📋 CORE MODULE
**Purpose**: Foundation entities used across the entire system

#### Enums (Lines ~45-63)
- `MeritalStatus` - Employee marital status
- `OUTLETREQUESTSTATUS` - Request approval status
- `PRODUCTSOURCE` - Product origin (production/purchase)

#### Authentication & Authorization (Lines ~68-110)
- `User` - System users with role-based access
- `Role` - User roles and permissions
- `Login` - Login session tracking

#### Product Master Data (Lines ~115-142)
- `Product` - Product catalog
- `ProductCategory` - Product categorization

---

### 👥 HR MODULE
**Purpose**: Human resources and employee management

#### Employee Management & Payroll (Lines ~147-186)
- `Employee` - Employee profiles and personal information
- `Payroll` - Employee salary and payroll records

---

### 📦 WAREHOUSE MODULE
**Purpose**: Inventory, materials, and supplier management

#### Supplier Management (Lines ~191-206)
- `Supplier` - Vendor/supplier information

#### Raw Materials Management (Lines ~211-248)
- `material` - Raw material catalog
- `MaterialIn` - Material incoming transactions
- `MaterialOut` - Material outgoing/usage transactions

#### Finished Goods Inventory (Lines ~253-278)
- `ProductStock` - Product inventory levels
- `ProductStockDetail` - Detailed stock information with supplier

---

### 🏪 OUTLETS MODULE
**Purpose**: Store/branch operations and management

#### Store/Branch Management (Lines ~283-321)
- `Outlet` - Store/branch information
- `OutletEmployee` - Employee-outlet assignments

#### Employee Attendance Tracking (Lines ~326-347)
- `Attendance` - Employee check-in/check-out records

---

### 💰 POS MODULE
**Purpose**: Point of sale and sales transactions

#### Sales Transactions (Lines ~352-383)
- `Order` - Sales orders
- `OrderItem` - Order line items

---

### 🚚 SCM MODULE
**Purpose**: Supply chain and distribution management

#### Distribution Requests (Lines ~388-421)
- `OutletProductRequest` - Product distribution requests from outlets
- `OutletMaterialRequest` - Material distribution requests from outlets

---

## Benefits of This Organization

### 1. **Business Domain Alignment**
- Schema reflects real business processes
- Easy to understand for non-technical stakeholders
- Clear separation of concerns

### 2. **Improved Maintainability**
- Quick navigation to relevant models
- Clear section headers for easy location
- Related models grouped together

### 3. **Better Collaboration**
- Team members can focus on their domain
- Reduced merge conflicts (different sections)
- Self-documenting structure

### 4. **Scalability**
- Easy to add new models to appropriate sections
- Clear patterns for future additions
- Modular thinking encourages better design

---

## Usage Guidelines

### Finding Models
Use the line numbers in section headers to quickly jump to specific modules:
```bash
# Open schema at specific line
code -g prisma/schema.prisma:147  # HR Module
code -g prisma/schema.prisma:283  # Outlets Module
```

### Adding New Models
1. Identify the appropriate business module
2. Add the model within that section
3. Update this documentation with line numbers if needed
4. Run `npx prisma format` to maintain formatting

### Cross-Module Relations
Models can reference other modules (e.g., Order → Outlet → User):
- Relations are clearly visible in the model definitions
- This is expected and encouraged for data integrity
- Document complex cross-module relationships if needed

---

## Schema Statistics

- **Total Models**: 20
- **Total Enums**: 3
- **Business Modules**: 6 (CORE, HR, WAREHOUSE, OUTLETS, POS, SCM)
- **File Size**: ~420 lines
- **Database**: PostgreSQL

---

## Migration Notes

### From Previous Structure
- **Before**: 343-line monolithic schema
- **After**: Same content, organized with 6 business module sections
- **Changes**: NO schema changes, only organization with comments
- **Impact**: Zero migration needed, fully backward compatible

### Prisma Multi-File Schema Attempt
Initially attempted to split into separate `.prisma` files by module, but Prisma 6.17.1 has limitations:
- Multi-file support exists but has auto-discovery issues
- Consolidated approach proved more reliable
- Section headers provide similar organizational benefits
- No functionality lost, better compatibility gained

---

## Maintenance

### Keeping It Organized
- Always add new models to appropriate sections
- Use clear comments for complex relationships
- Run `prisma format` after changes
- Update documentation if structure changes significantly

### Version Control
- Schema changes should be reviewed by module owners
- Keep this documentation in sync with schema
- Document breaking changes clearly
- Use meaningful commit messages referencing modules

---

**Last Updated**: November 5, 2025  
**Schema Version**: Organized by Business Modules  
**Maintained By**: Development Team
