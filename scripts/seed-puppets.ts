import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPuppets() {
  console.log('Seeding 50 puppet rewards...');

  // Check if puppets already exist
  const existingRewards = await prisma.reward.count();

  if (existingRewards > 0) {
    console.log(`Found ${existingRewards} existing rewards. Skipping seed.`);
    console.log('If you want to re-seed, delete existing rewards first.');
    return;
  }

  // Create the puppet reward
  const reward = await prisma.reward.create({
    data: {
      name: 'Puppet NFT',
      description: 'Puppets have no master, 50x available and 10 XP to get them!',
      imageUrl: 'https://rcdn.salvor.io/images/nft/1300/edc1968d-20a7-473d-8aa1-bd19898402a1.png',
      nftCollectionUrl: 'https://salvor.io/collections/0xc1a5507194a1e70c35678f53c48c3934abbcc140',
      tokenId: null, // Can be set to specific token IDs if needed
      xpRequired: 10,
      totalAvailable: 50,
      claimed: 0,
      active: true,
    },
  });

  console.log(`Created reward: ${reward.name}`);
  console.log(`Total available: ${reward.totalAvailable}`);
  console.log(`XP Required: ${reward.xpRequired}`);
  console.log('Done!');
}

seedPuppets()
  .catch((e) => {
    console.error('Error seeding puppets:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
