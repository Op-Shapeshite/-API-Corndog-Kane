import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface RoleData {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Seed roles into the database
 */
export async function seedRoles(): Promise<RoleData[]> {
  console.log('📝 Seeding roles...');

  const roles = [
    { name: 'Human Resource', description: 'Mengkoordinir pegawai' },
    { name: 'Super Admin', description: 'All akses' },
    { name: 'Finance', description: 'FINANCE' },
    { name: 'Gudang', description: 'Menginput data pembelian bahan baku' },
    { name: 'Karyawan', description: 'Karyawan onsite ( Outlet )' },
  ];

  let createdRoles: RoleData[] = [];

  for (const role of roles) {
    try {
      const existingRole = await prisma.role.findUnique({
        where: { name: role.name },
      });

      if (!existingRole) {
        await prisma.role.create({
          data: role,
        });
      } 
      const roles = await prisma.role.findMany();
      createdRoles = roles as RoleData[];
      console.log(`  ✓ Created role: ${role.name} `);
    } catch (error) {
      console.error(`  ✗ Error creating role ${role.name}:`, error);
      throw error;
    }
  }

  return createdRoles;
}

/**
 * Seed users into the database
 */
export async function seedUsers(roles: RoleData[]): Promise<void> {
  console.log('\n👥 Seeding users...');

  // Get role IDs
  const superAdminRole = roles.find((r) => r.name === "Super Admin");
  const adminRole = roles.find(r => r.name === 'Super Admin');
  const hrRole = roles.find(r => r.name === 'Human Resource');
  const financeRole = roles.find(r => r.name === 'Finance');
  const warehouseRole = roles.find(r => r.name === 'Gudang');
  const outletRole = roles.find(r => r.name === 'Karyawan');

  if (!superAdminRole || !adminRole || !hrRole || !financeRole || !warehouseRole || !outletRole) {
    throw new Error('Failed to find all required roles');
  }

  // Hash password for all users (using bcrypt with 10 rounds)
  const defaultPassword = await bcrypt.hash('password123', 10);

  // Define test users
  const users = [
    {
      username: 'superadmin',
      name: 'Super Administrator',
      password: defaultPassword,
      role_id: superAdminRole.id,
      is_active: true,
    },
    {
      username: 'admin',
      name: 'Admin User',
      password: defaultPassword,
      role_id: adminRole.id,
      is_active: true,
    },
    {
      username: 'hr.manager',
      name: 'HR Manager',
      password: defaultPassword,
      role_id: hrRole.id,
      is_active: true,
    },
    {
      username: 'finance.manager',
      name: 'Finance Manager',
      password: defaultPassword,
      role_id: financeRole.id,
      is_active: true,
    },
    {
      username: 'warehouse.manager',
      name: 'Warehouse Manager',
      password: defaultPassword,
      role_id: warehouseRole.id,
      is_active: true,
    },
    {
      username: 'outlet.user',
      name: 'Outlet User',
      password: defaultPassword,
      role_id: outletRole.id,
      is_active: true,
    },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { username: user.username },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: user,
        });
        const roleName = roles.find(r => r.id === user.role_id)?.name || 'Unknown';
        console.log(`  ✓ Created user: ${user.username.padEnd(15)} (${user.name.padEnd(20)}) - Role: ${roleName}`);
        createdCount++;
      } else {
        console.log(`  ℹ User already exists: ${user.username}`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`  ✗ Error creating user ${user.username}:`, error);
      throw error;
    }
  }

  console.log(`\n  Summary: ${createdCount} users created, ${skippedCount} users skipped`);
}

/**
 * Main seeder function that seeds both roles and users
 */
export async function seedAll() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed roles first (users depend on roles)
    const roles = await seedRoles();

    // Seed users
    await seedUsers(roles);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Default credentials (all users):');
    console.log('   Password: password123\n');
    console.log('   Usernames:');
    console.log('   - superadmin        (Super Admin role)');
    console.log('   - admin             (Admin role)');
    console.log('   - hr.manager        (HR role)');
    console.log('   - finance.manager   (Finance role)');
    console.log('   - warehouse.manager (Warehouse role)');
    console.log('   - outlet.user       (Outlet role)\n');

  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedAll()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
