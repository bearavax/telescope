import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding Mysterious Key to the shop...');

  const mysteriousKey = await prisma.reward.create({
    data: {
      name: 'Mysterious Key',
      description: '???',
      imageUrl: '/shop/mysterious-key.png',
      nftCollectionUrl: '#', // No collection
      xpRequired: 100,
      totalAvailable: 1,
      claimed: 0,
      limitedTime: false,
      availableUntil: null,
      contractAddress: null,
      requiredYear: null,
    },
  });

  console.log('✅ Mysterious Key added to shop!');
  console.log('📦 Reward ID:', mysteriousKey.id);
  console.log('💰 Price: 100 Coins');
  console.log('📊 Available: 1/1');
  console.log('🔍 Description:', mysteriousKey.description);
}

main()
  .catch((e) => {
    console.error('Error adding Mysterious Key:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


