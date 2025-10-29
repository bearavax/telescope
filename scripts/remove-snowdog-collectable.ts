import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Removing Snowdog OG collectable from the database...');

  // Find the Snowdog reward
  const snowdogReward = await prisma.reward.findFirst({
    where: {
      name: 'Snowdog OG'
    }
  });

  if (!snowdogReward) {
    console.log('❌ Snowdog OG collectable not found in database');
    return;
  }

  console.log('Found Snowdog OG collectable with ID:', snowdogReward.id);

  // Delete any claims first (due to foreign key constraint)
  const deletedClaims = await prisma.claim.deleteMany({
    where: {
      rewardId: snowdogReward.id
    }
  });

  console.log(`🗑️  Deleted ${deletedClaims.count} claims`);

  // Delete the reward
  await prisma.reward.delete({
    where: {
      id: snowdogReward.id
    }
  });

  console.log('✅ Snowdog OG collectable removed successfully!');
}

main()
  .catch((e) => {
    console.error('Error removing Snowdog collectable:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
