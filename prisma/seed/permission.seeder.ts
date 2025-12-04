import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Load permissions from JSON file
 */
interface PermissionData {
  permissions: Array<{
    name: string;
    code: string;
    module: string;
    description: string;
  }>;
  rolePermissions: {
    [roleName: string]: string[] | 'ALL';
  };
}

function loadPermissionsFromJson(): PermissionData {
  const jsonPath = path.join(__dirname, 'permissions.json');
  const content = fs.readFileSync(jsonPath, 'utf-8');
  return JSON.parse(content);
}

// Load permissions and role mappings from JSON
const permData = loadPermissionsFromJson();
const permissions = permData.permissions;

// Build role-permission mappings from JSON
// Handle "ALL" for Super Admin by mapping to all permission codes
const rolePermissionMappings: Record<string, string[]> = Object.entries(
  permData.rolePermissions
).reduce((acc, [roleName, permCodes]) => {
  if (permCodes === 'ALL') {
    acc[roleName] = permissions.map((p) => p.code);
  } else {
    acc[roleName] = permCodes;
  }
  return acc;
}, {} as Record<string, string[]>);

/**
 * Seed permissions into the database
 */
export async function seedPermissions() {
  console.log('🔑 Seeding permissions...');
  
  // Get existing permissions to check which ones already exist
  const existingPermissions = await prisma.permission.findMany({
    select: { code: true }
  });
  const existingCodes = new Set(existingPermissions.map(p => p.code));
  
  // Filter out permissions that already exist
  const newPermissions = permissions.filter(p => !existingCodes.has(p.code));
  
  if (newPermissions.length > 0) {
    // Batch create new permissions
    const created = await prisma.permission.createMany({
      data: newPermissions,
      skipDuplicates: true,
    });
    console.log(`  ✓ Created ${created.count} new permissions`);
  }
  
  const skippedCount = permissions.length - newPermissions.length;
  console.log(`\n  Summary: ${newPermissions.length} permissions created, ${skippedCount} permissions skipped`);
}

/**
 * Seed role-permission mappings into the database
 */
export async function seedRolePermissions() {
  console.log('\n🔗 Seeding role-permission mappings...');
  
  // Get all roles and permissions upfront
  const allRoles = await prisma.role.findMany();
  const allPermissions = await prisma.permission.findMany();
  const existingMappings = await prisma.rolePermission.findMany({
    select: { role_id: true, permission_id: true }
  });
  
  // Create lookup maps
  const roleMap = new Map(allRoles.map(r => [r.name, r.id]));
  const permissionMap = new Map(allPermissions.map(p => [p.code, p.id]));
  const existingSet = new Set(existingMappings.map(m => `${m.role_id}-${m.permission_id}`));
  
  let totalCreated = 0;
  let totalSkipped = 0;
  
  for (const [roleName, permissionCodes] of Object.entries(rolePermissionMappings)) {
    console.log(`\n  📌 Processing role: ${roleName}`);
    
    const roleId = roleMap.get(roleName);
    if (!roleId) {
      console.log(`    ⚠ Role "${roleName}" not found, skipping...`);
      continue;
    }
    
    // Prepare batch data for this role
    const newMappings: { role_id: number; permission_id: number }[] = [];
    let skippedCount = 0;
    
    for (const code of permissionCodes) {
      const permissionId = permissionMap.get(code);
      if (!permissionId) {
        console.log(`    ⚠ Permission "${code}" not found, skipping...`);
        continue;
      }
      
      const key = `${roleId}-${permissionId}`;
      if (!existingSet.has(key)) {
        newMappings.push({ role_id: roleId, permission_id: permissionId });
      } else {
        skippedCount++;
      }
    }
    
    // Batch create mappings for this role
    if (newMappings.length > 0) {
      await prisma.rolePermission.createMany({
        data: newMappings,
        skipDuplicates: true,
      });
    }
    
    console.log(`    ✓ ${roleName}: ${newMappings.length} mappings created, ${skippedCount} skipped`);
    totalCreated += newMappings.length;
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
