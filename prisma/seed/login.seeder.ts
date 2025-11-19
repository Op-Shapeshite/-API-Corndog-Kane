import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedLogins() {
  console.log('🔐 Seeding login records...');

  const users = await prisma.user.findMany({ where: { is_active: true } });

  if (users.length === 0) {
    console.log('  ⚠ No users found. Skipping logins seeding.');
    return;
  }

  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ];

  let loginCount = 0;
  for (const user of users) {
    // Create 5-15 login records per user
    const loginRecords = faker.number.int({ min: 5, max: 15 });
    
    for (let i = 0; i < loginRecords; i++) {
      try {
        await prisma.login.create({
          data: {
            user_id: user.id,
            ip_address: faker.internet.ip(),
            user_agent: faker.helpers.arrayElement(userAgents),
            login_at: faker.date.past({ years: 1 }),
            is_active: faker.datatype.boolean(0.8),
          },
        });
        loginCount++;
      } catch (error) {
        console.error('  ✗ Error creating login record:', error);
      }
    }
  }
  console.log(`  ✓ Created ${loginCount} login records`);
}
