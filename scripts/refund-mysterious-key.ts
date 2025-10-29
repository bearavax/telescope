import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Refunding Mysterious Key purchase...\n');

  // Find the Mysterious Key reward
  const mysteriousKey = await prisma.reward.findFirst({
    where: {
      name: 'Mysterious Key'
    }
  });

  if (!mysteriousKey) {
    console.log('❌ Mysterious Key not found');
    return;
  }

  console.log('Found Mysterious Key:', mysteriousKey.id);

  // Find the most recent claim for this reward
  const claim = await prisma.claim.findFirst({
    where: {
      rewardId: mysteriousKey.id
    },
    orderBy: {
      claimedAt: 'desc'
    },
    include: {
      user: true
    }
  });

  if (!claim) {
    console.log('❌ No claim found for Mysterious Key');
    return;
  }

  console.log('Found claim by user:', claim.user.address);
  console.log('Coins spent:', claim.coinsSpent);

  // Refund the coins to the user
  await prisma.user.update({
    where: {
      id: claim.userId
    },
    data: {
      coins: {
        increment: claim.coinsSpent
      }
    }
  });

  console.log('✅ Refunded', claim.coinsSpent, 'coins to user');

  // Delete the claim
  await prisma.claim.delete({
    where: {
      id: claim.id
    }
  });

  console.log('✅ Deleted claim');

  // Increment available count back to 1
  await prisma.reward.update({
    where: {
      id: mysteriousKey.id
    },
    data: {
      claimed: {
        decrement: 1
      }
    }
  });

  console.log('✅ Put Mysterious Key back on the market (1/1 available)');
  console.log('\n🎉 Refund complete!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


