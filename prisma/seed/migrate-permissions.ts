import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migration script to update permission codes from old structure to new structure
 * This fixes the mismatch between database permissions and router implementation
 */

const permissionMigrations = [
  // Consolidate outlet stocks permissions into single permission
  {
    from: ['outlets:stocks:products:read', 'outlets:stocks:materials:read', 'outlets:stocks:summarize'],
    to: {
      name: 'View Outlet Stocks',
      code: 'outlets:stocks:read',
      module: 'OUTLETS',
      description: 'View outlet stocks (products, materials, summary)'
    }
  },
  
  // Update materials permissions
  {
    from: ['materials:stock-in'],
    to: {
      name: 'Material Stock In',
      code: 'materials:in:create',
      module: 'MATERIALS',
      description: 'Add material stock (material in)'
    }
  },
  {
    from: ['materials:stock-out'],
    to: {
      name: 'Material Stock Out',
      code: 'materials:out:create',
      module: 'MATERIALS',
      description: 'Remove material stock (material out)'
    }
  },
  
  // Consolidate HR attendance permissions
  {
    from: ['hr:attendance:checkin', 'hr:attendance:checkout'],
    to: {
      name: 'Create Attendance',
      code: 'hr:attendance:create',
      module: 'HR',
      description: 'Employee check-in and check-out'
    }
  },
  
  // Update inventory permissions
  {
    from: ['inventory:stock-in'],
    to: {
      name: 'Inventory Stock In',
      code: 'inventory:stock-in:create',
      module: 'INVENTORY',
      description: 'Add inventory stock'
    }
  },
  
  // Fix material stocks permission (warehouse → materials module)
  {
    from: ['warehouse:material-stocks:read'],
    to: {
      name: 'View Material Stocks',
      code: 'materials:stocks:read',
      module: 'MATERIALS',
      description: 'View material stock inventory'
    }
  },
  
  // Fix outlet request create permission (mobile → warehouse module)
  {
    from: ['mobile:outlet-requests:create'],
    to: {
      name: 'Create Outlet Request',
      code: 'warehouse:outlet-requests:create',
      module: 'WAREHOUSE',
      description: 'Create outlet product/material request'
    }
  }
];

async function migratePermissions() {
  console.log('🔄 Starting permission code migration...\n');
  
  let totalMigrated = 0;
  let totalProcessed = 0;
  
  for (const migration of permissionMigrations) {
    totalProcessed++;
    console.log(`📌 Processing: ${migration.from.join(', ')} → ${migration.to.code}`);
    
    // Find all old permissions
    const oldPermissions = await prisma.permission.findMany({
      where: {
        code: { in: migration.from }
      },
      include: {
        rolePermissions: {
          include: {
            role: true
          }
        }
      }
    });
    
    if (oldPermissions.length === 0) {
      console.log('   ⚠ No old permissions found, skipping...');
      continue;
    }
    
    console.log(`   Found ${oldPermissions.length} old permission(s)`);
    
    // Create or update new permission
    let newPermission = await prisma.permission.findUnique({
      where: { code: migration.to.code }
    });
    
    if (!newPermission) {
      // Check if a permission with this name already exists
      const existingByName = await prisma.permission.findFirst({
        where: { name: migration.to.name }
      });
      
      if (existingByName) {
        // Update existing permission to use new code
        newPermission = await prisma.permission.update({
          where: { id: existingByName.id },
          data: {
            code: migration.to.code,
            module: migration.to.module,
            description: migration.to.description
          }
        });
        console.log(`   ✓ Updated existing permission: ${newPermission.code}`);
      } else {
        // Create new permission
        newPermission = await prisma.permission.create({
          data: migration.to
        });
        console.log(`   ✓ Created new permission: ${newPermission.code}`);
      }
    } else {
      console.log(`   ✓ New permission already exists: ${newPermission.code}`);
    }
    
    // Collect all unique roles from old permissions
    const roleIds = new Set<number>();
    for (const oldPerm of oldPermissions) {
      for (const rp of oldPerm.rolePermissions) {
        roleIds.add(rp.role_id);
      }
    }
    
    console.log(`   Found ${roleIds.size} role(s) with these permissions`);
    
    // Create role mappings for new permission if they don't exist
    let mappingsCreated = 0;
    for (const roleId of roleIds) {
      const existing = await prisma.rolePermission.findUnique({
        where: {
          role_id_permission_id: {
            role_id: roleId,
            permission_id: newPermission.id
          }
        }
      });
      
      if (!existing) {
        await prisma.rolePermission.create({
          data: {
            role_id: roleId,
            permission_id: newPermission.id
          }
        });
        mappingsCreated++;
      }
    }
    
    if (mappingsCreated > 0) {
      console.log(`   ✓ Migrated ${mappingsCreated} role mapping(s)`);
    }
    
    // Delete old role mappings
    const oldPermissionIds = oldPermissions.map(p => p.id);
    const deletedMappings = await prisma.rolePermission.deleteMany({
      where: {
        permission_id: { in: oldPermissionIds }
      }
    });
    console.log(`   ✓ Deleted ${deletedMappings.count} old mapping(s)`);
    
    // Delete old permissions
    const deletedPermissions = await prisma.permission.deleteMany({
      where: {
        id: { in: oldPermissionIds }
      }
    });
    console.log(`   ✓ Deleted ${deletedPermissions.count} old permission(s)`);
    
    totalMigrated += oldPermissions.length;
    console.log('   ✅ Migration complete\n');
  }
  
  console.log('============================================================');
  console.log(`✅ Permission migration completed successfully!`);
  console.log(`   ${totalProcessed} migration(s) processed`);
  console.log(`   ${totalMigrated} old permission(s) consolidated`);
  console.log('============================================================');
}

migratePermissions()
  .catch(e => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
