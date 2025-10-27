import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateXpToCoins() {
  console.log('Migrating XP system to XP/Coins model...');
  console.log('XP (permanent, for leveling) and Coins (spendable)');

  // Get all users
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users to migrate`);

  // For each user, set coins = xp (since no one has spent yet)
  // The xp field is already the total earned
  for (const user of users) {
    // In the new model:
    // xp = total earned (was lifetimeXp, but we're renaming)
    // coins = spendable (was xp)

    // Since we renamed fields, existing xp is now coins
    // We need to set both to the same value (total earned so far)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // xp stays as is (it's the total earned)
        // coins should match xp initially
        coins: user.xp
      }
    });

    if (users.indexOf(user) % 100 === 0) {
      console.log(`Progress: ${users.indexOf(user)}/${users.length}`);
    }
  }

  console.log('✅ Migration complete!');
  console.log('All users now have coins = xp');
}

migrateXpToCoins()
  .catch((e) => {
    console.error('Error migrating:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
