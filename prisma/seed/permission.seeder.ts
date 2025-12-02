import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define all permissions based on the endpoint analysis
const permissions = [
  // ============================================================================
  // AUTH MODULE - Public endpoints (no permissions required)
  // ============================================================================
  
  // ============================================================================
  // DASHBOARD MODULE - ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Dashboard', code: 'dashboard:read', module: 'DASHBOARD', description: 'Access dashboard metrics' },
  
  // ============================================================================
  // OUTLETS MODULE - ADMIN | SUPERADMIN (MasterOutlet page)
  // ============================================================================
  { name: 'View Outlets', code: 'outlets:read', module: 'OUTLETS', description: 'View all outlets' },
  { name: 'View Outlet Detail', code: 'outlets:read:detail', module: 'OUTLETS', description: 'View outlet details by ID' },
  { name: 'Create Outlet', code: 'outlets:create', module: 'OUTLETS', description: 'Create new outlet' },
  { name: 'Update Outlet', code: 'outlets:update', module: 'OUTLETS', description: 'Update existing outlet' },
  { name: 'Delete Outlet', code: 'outlets:delete', module: 'OUTLETS', description: 'Delete outlet' },
  
  // ============================================================================
  // PRODUCTS MODULE - ADMIN | SUPERADMIN (MasterMenu page)
  // ============================================================================
  { name: 'View Products', code: 'products:read', module: 'PRODUCTS', description: 'View all products' },
  { name: 'Create Product', code: 'products:create', module: 'PRODUCTS', description: 'Create new product' },
  { name: 'Update Product', code: 'products:update', module: 'PRODUCTS', description: 'Update existing product' },
  { name: 'Delete Product', code: 'products:delete', module: 'PRODUCTS', description: 'Delete product' },
  { name: 'Toggle Product Status', code: 'products:toggle-status', module: 'PRODUCTS', description: 'Toggle product active status' },
  
  // ============================================================================
  // MATERIALS MODULE - ADMIN | SUPERADMIN (MasterMenu page)
  // ============================================================================
  { name: 'View Materials', code: 'materials:read', module: 'MATERIALS', description: 'View all materials' },
  { name: 'Create Material', code: 'materials:create', module: 'MATERIALS', description: 'Create new material' },
  { name: 'Material Stock In', code: 'materials:stock-in', module: 'MATERIALS', description: 'Add material stock' },
  { name: 'Material Stock Out', code: 'materials:stock-out', module: 'MATERIALS', description: 'Remove material stock' },
  
  // ============================================================================
  // ORDERS MODULE - ADMIN | SUPERADMIN (TransaksiPOS page)
  // ============================================================================
  { name: 'View Orders', code: 'orders:read', module: 'ORDERS', description: 'View all orders' },
  { name: 'View Order Detail', code: 'orders:read:detail', module: 'ORDERS', description: 'View order details by ID' },
  { name: 'Create Order', code: 'orders:create', module: 'ORDERS', description: 'Create new order' },
  { name: 'View My Orders', code: 'orders:read:my', module: 'ORDERS', description: 'View own orders' },
  
  // ============================================================================
  // FINANCE - ACCOUNTS MODULE - FINANCE | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Accounts', code: 'finance:accounts:read', module: 'FINANCE', description: 'View financial accounts' },
  { name: 'Create Account', code: 'finance:accounts:create', module: 'FINANCE', description: 'Create financial account' },
  { name: 'Update Account', code: 'finance:accounts:update', module: 'FINANCE', description: 'Update financial account' },
  { name: 'Delete Account', code: 'finance:accounts:delete', module: 'FINANCE', description: 'Delete financial account' },
  
  // ============================================================================
  // FINANCE - ACCOUNT CATEGORIES MODULE - FINANCE | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Account Categories', code: 'finance:account-categories:read', module: 'FINANCE', description: 'View account categories' },
  
  // ============================================================================
  // FINANCE - ACCOUNT TYPES MODULE - FINANCE | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Account Types', code: 'finance:account-types:read', module: 'FINANCE', description: 'View account types' },
  
  // ============================================================================
  // FINANCE - TRANSACTIONS MODULE - FINANCE | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Transactions', code: 'finance:transactions:read', module: 'FINANCE', description: 'View financial transactions' },
  { name: 'Create Transaction', code: 'finance:transactions:create', module: 'FINANCE', description: 'Create financial transaction' },
  { name: 'Update Transaction', code: 'finance:transactions:update', module: 'FINANCE', description: 'Update financial transaction' },
  { name: 'Delete Transaction', code: 'finance:transactions:delete', module: 'FINANCE', description: 'Delete financial transaction' },
  
  // ============================================================================
  // FINANCE - PAYROLL MODULE - FINANCE | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Payroll', code: 'finance:payroll:read', module: 'FINANCE', description: 'View payroll records' },
  { name: 'Create Payroll', code: 'finance:payroll:create', module: 'FINANCE', description: 'Create payroll record' },
  { name: 'Update Payroll', code: 'finance:payroll:update', module: 'FINANCE', description: 'Update payroll record' },
  { name: 'Delete Payroll', code: 'finance:payroll:delete', module: 'FINANCE', description: 'Delete payroll record' },
  
  // ============================================================================
  // FINANCE - REPORTS MODULE - FINANCE | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Reports', code: 'finance:reports:read', module: 'FINANCE', description: 'View financial reports' },
  
  // ============================================================================
  // HR - EMPLOYEES MODULE - HR | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Employees', code: 'hr:employees:read', module: 'HR', description: 'View all employees' },
  { name: 'View Employee Detail', code: 'hr:employees:read:detail', module: 'HR', description: 'View employee details by ID' },
  { name: 'Create Employee', code: 'hr:employees:create', module: 'HR', description: 'Create new employee' },
  { name: 'Update Employee', code: 'hr:employees:update', module: 'HR', description: 'Update existing employee' },
  { name: 'Delete Employee', code: 'hr:employees:delete', module: 'HR', description: 'Delete employee' },
  
  // ============================================================================
  // HR - SCHEDULE MODULE - HR | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Schedules', code: 'hr:schedules:read', module: 'HR', description: 'View employee schedules' },
  { name: 'Create Schedule', code: 'hr:schedules:create', module: 'HR', description: 'Create employee schedule' },
  { name: 'Update Schedule', code: 'hr:schedules:update', module: 'HR', description: 'Update employee schedule' },
  { name: 'Delete Schedule', code: 'hr:schedules:delete', module: 'HR', description: 'Delete employee schedule' },
  
  // ============================================================================
  // USERS MODULE - ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Users', code: 'users:read', module: 'USERS', description: 'View all users' },
  { name: 'View User Detail', code: 'users:read:detail', module: 'USERS', description: 'View user details by ID' },
  { name: 'Create User', code: 'users:create', module: 'USERS', description: 'Create new user' },
  { name: 'Update User', code: 'users:update', module: 'USERS', description: 'Update existing user' },
  { name: 'Delete User', code: 'users:delete', module: 'USERS', description: 'Delete user' },
  
  // ============================================================================
  // ROLES MODULE - ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Roles', code: 'roles:read', module: 'ROLES', description: 'View all roles' },
  { name: 'Create Role', code: 'roles:create', module: 'ROLES', description: 'Create new role' },
  { name: 'Update Role', code: 'roles:update', module: 'ROLES', description: 'Update existing role' },
  { name: 'Delete Role', code: 'roles:delete', module: 'ROLES', description: 'Delete role' },
  
  // ============================================================================
  // WAREHOUSE - OUTLET MANAGEMENT - WAREHOUSE | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Outlet Stocks', code: 'warehouse:outlet-stocks:read', module: 'WAREHOUSE', description: 'View outlet stock levels' },
  { name: 'View Outlet Stock Summary', code: 'warehouse:outlet-stocks:summarize', module: 'WAREHOUSE', description: 'View outlet stock summary' },
  { name: 'View Outlet Requests', code: 'warehouse:outlet-requests:read', module: 'WAREHOUSE', description: 'View outlet requests' },
  { name: 'Approve Outlet Requests', code: 'warehouse:outlet-requests:approve', module: 'WAREHOUSE', description: 'Approve outlet requests' },
  
  // ============================================================================
  // WAREHOUSE - MASTER PRODUCTS - WAREHOUSE | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Master Products', code: 'warehouse:master-products:read', module: 'WAREHOUSE', description: 'View master products' },
  { name: 'View Master Product Inventory', code: 'warehouse:master-products:inventory:read', module: 'WAREHOUSE', description: 'View master product inventory' },
  
  // ============================================================================
  // WAREHOUSE - PRODUCT STOCK - WAREHOUSE | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Product Stock', code: 'warehouse:product-stock:read', module: 'WAREHOUSE', description: 'View product stock' },
  { name: 'Add Product Stock In', code: 'warehouse:product-stock:in', module: 'WAREHOUSE', description: 'Add product stock' },
  { name: 'Delete Product Stock', code: 'warehouse:product-stock:delete', module: 'WAREHOUSE', description: 'Delete product stock' },
  
  // ============================================================================
  // WAREHOUSE - SUPPLIERS - WAREHOUSE | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Suppliers', code: 'warehouse:suppliers:read', module: 'WAREHOUSE', description: 'View all suppliers' },
  { name: 'View Supplier Detail', code: 'warehouse:suppliers:read:detail', module: 'WAREHOUSE', description: 'View supplier details' },
  { name: 'Create Supplier', code: 'warehouse:suppliers:create', module: 'WAREHOUSE', description: 'Create new supplier' },
  { name: 'Update Supplier', code: 'warehouse:suppliers:update', module: 'WAREHOUSE', description: 'Update existing supplier' },
  { name: 'Delete Supplier', code: 'warehouse:suppliers:delete', module: 'WAREHOUSE', description: 'Delete supplier' },
  
  // ============================================================================
  // WAREHOUSE - MATERIAL STOCKS - WAREHOUSE | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Material Stocks', code: 'warehouse:material-stocks:read', module: 'WAREHOUSE', description: 'View material stock levels' },
  { name: 'Material Stock Out', code: 'warehouse:material-stocks:out', module: 'WAREHOUSE', description: 'Record material stock out' },
  { name: 'Delete Material Stock', code: 'warehouse:material-stocks:delete', module: 'WAREHOUSE', description: 'Delete material stock record' },
  
  // ============================================================================
  // MOBILE/OUTLET EMPLOYEE ENDPOINTS - OUTLET | EMPLOYEE
  // ============================================================================
  { name: 'View Employee Schedule by Outlet', code: 'mobile:schedule:read', module: 'MOBILE', description: 'View employee schedule by outlet' },
  { name: 'Employee Check-in', code: 'mobile:attendance:checkin', module: 'MOBILE', description: 'Employee check-in' },
  { name: 'Employee Check-out', code: 'mobile:attendance:checkout', module: 'MOBILE', description: 'Employee check-out' },
  { name: 'Create Outlet Request', code: 'mobile:outlet-requests:create', module: 'MOBILE', description: 'Create outlet product/material request' },
  
  // ============================================================================
  // COMMON/SHARED ENDPOINTS - ALL AUTHENTICATED USERS
  // ============================================================================
  { name: 'View Categories', code: 'common:categories:read', module: 'COMMON', description: 'View product categories' },
  { name: 'View Quantity Units', code: 'common:quantity-units:read', module: 'COMMON', description: 'View quantity units' },
  
  // ============================================================================
  // INVENTORY MODULE - WAREHOUSE | ADMIN | SUPERADMIN
  // ============================================================================
  { name: 'View Inventory Buy List', code: 'inventory:buy:read', module: 'INVENTORY', description: 'View inventory buy list' },
  { name: 'Inventory Stock In', code: 'inventory:stock-in', module: 'INVENTORY', description: 'Add inventory stock' },
  { name: 'Update Inventory Stock In', code: 'inventory:stock-in:update', module: 'INVENTORY', description: 'Update inventory stock record' },
];

// Define role-permission mappings based on the problem statement
const rolePermissionMappings: Record<string, string[]> = {
  'Super Admin': permissions.map(p => p.code), // Super Admin has all permissions
  
  'Admin': [
    // Dashboard
    'dashboard:read',
    // Outlets
    'outlets:read', 'outlets:read:detail', 'outlets:create', 'outlets:update', 'outlets:delete',
    // Products
    'products:read', 'products:create', 'products:update', 'products:delete', 'products:toggle-status',
    // Materials
    'materials:read', 'materials:create', 'materials:stock-in', 'materials:stock-out',
    // Orders
    'orders:read', 'orders:read:detail', 'orders:create', 'orders:read:my',
    // Finance
    'finance:accounts:read', 'finance:accounts:create', 'finance:accounts:update', 'finance:accounts:delete',
    'finance:account-categories:read', 'finance:account-types:read',
    'finance:transactions:read', 'finance:transactions:create', 'finance:transactions:update', 'finance:transactions:delete',
    'finance:payroll:read', 'finance:payroll:create', 'finance:payroll:update', 'finance:payroll:delete',
    'finance:reports:read',
    // HR
    'hr:employees:read', 'hr:employees:read:detail', 'hr:employees:create', 'hr:employees:update', 'hr:employees:delete',
    'hr:schedules:read', 'hr:schedules:create', 'hr:schedules:update', 'hr:schedules:delete',
    // Users
    'users:read', 'users:read:detail', 'users:create', 'users:update', 'users:delete',
    // Roles
    'roles:read', 'roles:create', 'roles:update', 'roles:delete',
    // Warehouse
    'warehouse:outlet-stocks:read', 'warehouse:outlet-stocks:summarize',
    'warehouse:outlet-requests:read', 'warehouse:outlet-requests:approve',
    'warehouse:master-products:read', 'warehouse:master-products:inventory:read',
    'warehouse:product-stock:read', 'warehouse:product-stock:in', 'warehouse:product-stock:delete',
    'warehouse:suppliers:read', 'warehouse:suppliers:read:detail', 'warehouse:suppliers:create', 'warehouse:suppliers:update', 'warehouse:suppliers:delete',
    'warehouse:material-stocks:read', 'warehouse:material-stocks:out', 'warehouse:material-stocks:delete',
    // Inventory
    'inventory:buy:read', 'inventory:stock-in', 'inventory:stock-in:update',
    // Common
    'common:categories:read', 'common:quantity-units:read',
  ],
  
  'HR': [
    // HR module
    'hr:employees:read', 'hr:employees:read:detail', 'hr:employees:create', 'hr:employees:update', 'hr:employees:delete',
    'hr:schedules:read', 'hr:schedules:create', 'hr:schedules:update', 'hr:schedules:delete',
    // Common
    'common:categories:read', 'common:quantity-units:read',
  ],
  
  'Finance': [
    // Finance module
    'finance:accounts:read', 'finance:accounts:create', 'finance:accounts:update', 'finance:accounts:delete',
    'finance:account-categories:read', 'finance:account-types:read',
    'finance:transactions:read', 'finance:transactions:create', 'finance:transactions:update', 'finance:transactions:delete',
    'finance:payroll:read', 'finance:payroll:create', 'finance:payroll:update', 'finance:payroll:delete',
    'finance:reports:read',
    // HR employees for payroll
    'hr:employees:read',
    // Common
    'common:categories:read', 'common:quantity-units:read',
  ],
  
  'Warehouse': [
    // Warehouse module
    'warehouse:outlet-stocks:read', 'warehouse:outlet-stocks:summarize',
    'warehouse:outlet-requests:read', 'warehouse:outlet-requests:approve',
    'warehouse:master-products:read', 'warehouse:master-products:inventory:read',
    'warehouse:product-stock:read', 'warehouse:product-stock:in', 'warehouse:product-stock:delete',
    'warehouse:suppliers:read', 'warehouse:suppliers:read:detail', 'warehouse:suppliers:create', 'warehouse:suppliers:update', 'warehouse:suppliers:delete',
    'warehouse:material-stocks:read', 'warehouse:material-stocks:out', 'warehouse:material-stocks:delete',
    // Materials
    'materials:read', 'materials:stock-in', 'materials:stock-out',
    // Products for inventory
    'products:read',
    // Outlets for warehouse management
    'outlets:read', 'outlets:read:detail',
    // Inventory
    'inventory:buy:read', 'inventory:stock-in', 'inventory:stock-in:update',
    // Common
    'common:categories:read', 'common:quantity-units:read',
  ],
  
  'Outlet': [
    // Mobile/Outlet endpoints
    'mobile:schedule:read', 'mobile:attendance:checkin', 'mobile:attendance:checkout',
    'mobile:outlet-requests:create',
    // Orders
    'orders:create', 'orders:read:my', 'orders:read:detail',
    // Products view
    'products:read',
    // Materials stocks
    'warehouse:material-stocks:read',
    // Outlet view own
    'outlets:read:detail',
    // Common
    'common:categories:read', 'common:quantity-units:read',
  ],
};

/**
 * Seed permissions into the database
 */
export async function seedPermissions() {
  console.log('🔑 Seeding permissions...');
  
  let createdCount = 0;
  let skippedCount = 0;
  
  for (const permission of permissions) {
    try {
      const existingPermission = await prisma.permission.findUnique({
        where: { code: permission.code },
      });
      
      if (!existingPermission) {
        await prisma.permission.create({
          data: permission,
        });
        console.log(`  ✓ Created permission: ${permission.code}`);
        createdCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`  ✗ Error creating permission ${permission.code}:`, error);
      throw error;
    }
  }
  
  console.log(`\n  Summary: ${createdCount} permissions created, ${skippedCount} permissions skipped`);
}

/**
 * Seed role-permission mappings into the database
 */
export async function seedRolePermissions() {
  console.log('\n🔗 Seeding role-permission mappings...');
  
  let totalCreated = 0;
  let totalSkipped = 0;
  
  for (const [roleName, permissionCodes] of Object.entries(rolePermissionMappings)) {
    console.log(`\n  📌 Processing role: ${roleName}`);
    
    // Get the role
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });
    
    if (!role) {
      console.log(`    ⚠ Role "${roleName}" not found, skipping...`);
      continue;
    }
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const code of permissionCodes) {
      // Get the permission
      const permission = await prisma.permission.findUnique({
        where: { code },
      });
      
      if (!permission) {
        console.log(`    ⚠ Permission "${code}" not found, skipping...`);
        continue;
      }
      
      // Check if mapping exists
      const existingMapping = await prisma.rolePermission.findUnique({
        where: {
          role_id_permission_id: {
            role_id: role.id,
            permission_id: permission.id,
          },
        },
      });
      
      if (!existingMapping) {
        await prisma.rolePermission.create({
          data: {
            role_id: role.id,
            permission_id: permission.id,
          },
        });
        createdCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log(`    ✓ ${roleName}: ${createdCount} mappings created, ${skippedCount} skipped`);
    totalCreated += createdCount;
    totalSkipped += skippedCount;
  }
  
  console.log(`\n  Total: ${totalCreated} role-permission mappings created, ${totalSkipped} skipped`);
}

/**
 * Main seeder function
 */
export async function seedPermissionSystem() {
  console.log('🌱 Starting permission system seeding...\n');
  
  try {
    await seedPermissions();
    await seedRolePermissions();
    
    console.log('\n✅ Permission system seeding completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during permission seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedPermissionSystem()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
