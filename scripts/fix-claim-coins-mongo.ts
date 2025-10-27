import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixClaimCoins() {
  console.log('Fixing null coinsSpent values in claims...\n');

  // Find all claims
  const allClaims = await prisma.claim.findMany({
    include: {
      reward: true
    }
  });

  console.log(`Total claims in database: ${allClaims.length}`);

  let fixed = 0;
  for (const claim of allClaims) {
    // Check if coinsSpent is null or undefined by trying to access it
    const claimData: any = claim;
    if (claimData.coinsSpent === null || claimData.coinsSpent === undefined) {
      await prisma.claim.update({
        where: { id: claim.id },
        data: {
          coinsSpent: claim.reward.xpRequired
        }
      });
      console.log(`  Fixed claim ${claim.id} - set coinsSpent to ${claim.reward.xpRequired}`);
      fixed++;
    }
  }

  console.log(`\n✅ Fixed ${fixed} claims`);

  // Now list all claims
  const claims = await prisma.claim.findMany({
    include: {
      user: {
        select: {
          address: true,
          username: true,
        }
      },
      reward: {
        select: {
          name: true,
        }
      }
    },
    orderBy: {
      claimedAt: 'desc'
    }
  });

  console.log(`\nAll claims (${claims.length}):`);
  claims.forEach((claim, index) => {
    console.log(`${index + 1}. ${claim.user.address} claimed ${claim.reward.name} for ${claim.coinsSpent} coins`);
  });
}

fixClaimCoins()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
