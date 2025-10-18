import 'dotenv/config';
import { seedAll } from './seed/user.seeder';

async function main() {
  console.log('🚀 Starting database seeding...\n');
  
  try {
    // Seed all (roles and users)
    await seedAll();
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
