import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateLifetimeXp() {
  console.log('Migrating lifetimeXp for existing users...');

  // Get all users
  const users = await prisma.user.findMany();

  console.log(`Found ${users.length} users to migrate`);

  // Update each user's lifetimeXp to match their current XP
  // (assuming they haven't spent any XP yet)
  for (const user of users) {
    if (user.lifetimeXp === 0 && user.xp > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lifetimeXp: user.xp,
        },
      });
      console.log(`Updated ${user.address}: lifetimeXp set to ${user.xp}`);
    }
  }

  console.log('Migration complete!');
}

migrateLifetimeXp()
  .catch((e) => {
    console.error('Error migrating lifetimeXp:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
