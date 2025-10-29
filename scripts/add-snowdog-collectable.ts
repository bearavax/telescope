import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding Snowdog OG collectable to the database...');

  const snowdogReward = await prisma.reward.create({
    data: {
      name: 'Snowdog',
      description: 'Early Snowdog participant from 2021',
      imageUrl: '/collectables/snowdog-og.png',
      nftCollectionUrl: 'https://snowdogdao.com',
      xpRequired: 0, // Free to claim if eligible
      totalAvailable: 999999, // Unlimited for eligible users
      claimed: 0,
      active: true,
      limitedTime: false, // Not a shop item, it's a collectable
      availableUntil: null,
      contractAddress: '0xde9e52f1838951e4d2bb6c59723b003c353979b6', // Snowdog DAO contract on Avalanche
      requiredYear: 2021,
    },
  });

  console.log('✅ Snowdog OG collectable created successfully!');
  console.log('📦 Reward ID:', snowdogReward.id);
  console.log('🎁 Free to claim for eligible users');
  console.log('📜 Contract:', snowdogReward.contractAddress);
  console.log('📅 Required year:', snowdogReward.requiredYear);
}

main()
  .catch((e) => {
    console.error('Error adding Snowdog collectable:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
