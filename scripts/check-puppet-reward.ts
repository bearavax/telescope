import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking Puppet reward in Rewards table...\n');

  const puppetReward = await prisma.reward.findFirst({
    where: {
      OR: [
        { name: { contains: 'Puppet', mode: 'insensitive' } },
        { name: { contains: 'puppet', mode: 'insensitive' } }
      ]
    }
  });

  if (!puppetReward) {
    console.log('❌ Puppet reward not found');
    return;
  }

  console.log('✅ Found Puppet reward:');
  console.log('ID:', puppetReward.id);
  console.log('Name:', puppetReward.name);
  console.log('Description:', puppetReward.description);
  console.log('Image URL:', puppetReward.imageUrl);
  console.log('NFT Collection URL:', puppetReward.nftCollectionUrl);
  console.log('XP Required:', puppetReward.xpRequired);
  console.log('Total Available:', puppetReward.totalAvailable);
  console.log('Claimed:', puppetReward.claimed);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


