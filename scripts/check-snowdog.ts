import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Searching for Snowdog in database...\n');

  // Search for any reward with "Snowdog" or "snowdog" in the name
  const snowdogRewards = await prisma.reward.findMany({
    where: {
      OR: [
        { name: { contains: 'Snowdog', mode: 'insensitive' } },
        { name: { contains: 'snowdog', mode: 'insensitive' } },
        { description: { contains: 'Snowdog', mode: 'insensitive' } },
        { description: { contains: 'snowdog', mode: 'insensitive' } }
      ]
    }
  });

  if (snowdogRewards.length === 0) {
    console.log('❌ No Snowdog rewards found in database');
  } else {
    console.log(`✅ Found ${snowdogRewards.length} Snowdog reward(s):\n`);
    snowdogRewards.forEach(reward => {
      console.log('---');
      console.log('ID:', reward.id);
      console.log('Name:', reward.name);
      console.log('Description:', reward.description);
      console.log('XP Required:', reward.xpRequired);
      console.log('Total Available:', reward.totalAvailable);
      console.log('Claimed:', reward.claimed);
      console.log('Contract Address:', reward.contractAddress);
      console.log('Required Year:', reward.requiredYear);
      console.log('Limited Time:', reward.limitedTime);
      console.log('Available Until:', reward.availableUntil);
      console.log('---\n');
    });
  }

  // Also check all rewards
  console.log('\n📋 All rewards in database:');
  const allRewards = await prisma.reward.findMany();
  console.log(`Total rewards: ${allRewards.length}\n`);
  allRewards.forEach(reward => {
    console.log(`- ${reward.name} (${reward.xpRequired} coins, ${reward.claimed}/${reward.totalAvailable} claimed)`);
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


