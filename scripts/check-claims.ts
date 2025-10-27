import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkClaims() {
  console.log('Checking all claims in database...\n');

  const claims = await prisma.claim.findMany({
    include: {
      user: {
        select: {
          address: true,
          username: true,
          xp: true,
          coins: true,
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

  console.log(`Total claims: ${claims.length}\n`);

  if (claims.length > 0) {
    claims.forEach((claim, index) => {
      console.log(`Claim #${index + 1}:`);
      console.log(`  Address: ${claim.user.address}`);
      console.log(`  Username: ${claim.user.username || 'N/A'}`);
      console.log(`  Reward: ${claim.reward.name}`);
      console.log(`  Coins Spent: ${claim.coinsSpent}`);
      console.log(`  Claimed At: ${claim.claimedAt}`);
      console.log(`  User Current Coins: ${claim.user.coins}`);
      console.log('');
    });
  } else {
    console.log('No claims found in database');
  }

  // Also check rewards
  const rewards = await prisma.reward.findMany();
  console.log(`\nRewards in database: ${rewards.length}`);
  rewards.forEach(reward => {
    console.log(`  - ${reward.name}: ${reward.claimed}/${reward.totalAvailable} claimed`);
  });
}

checkClaims()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
