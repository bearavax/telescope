import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixClaimCoins() {
  console.log('Fixing null coinsSpent values in claims...\n');

  // Use raw query to find claims with null coinsSpent
  const nullClaims: any[] = await prisma.$queryRaw`
    SELECT * FROM "Claim" WHERE "coinsSpent" IS NULL
  `;

  console.log(`Found ${nullClaims.length} claims with null coinsSpent`);

  if (nullClaims.length > 0) {
    // Get the reward info to set the correct coinsSpent
    for (const claim of nullClaims) {
      const reward = await prisma.reward.findUnique({
        where: { id: claim.rewardId }
      });

      if (reward) {
        await prisma.$executeRaw`
          UPDATE "Claim"
          SET "coinsSpent" = ${reward.xpRequired}
          WHERE id = ${claim.id}
        `;
        console.log(`  Fixed claim ${claim.id} - set coinsSpent to ${reward.xpRequired}`);
      }
    }
  }

  console.log('\n✅ Done!');
}

fixClaimCoins()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
