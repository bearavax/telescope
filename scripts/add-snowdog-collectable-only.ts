import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding Snowdog collectable to the database...');

  // Check if it already exists
  const existing = await prisma.collectable.findUnique({
    where: { collectableId: 'snowdog' }
  });

  if (existing) {
    console.log('✅ Snowdog collectable already exists!');
    console.log('📦 Collectable ID:', existing.id);
    return;
  }

  // Create the collectable (NOT a shop reward)
  const snowdogCollectable = await prisma.collectable.create({
    data: {
      collectableId: 'snowdog',
      name: 'Snowdog',
      description: 'Early Snowdog participant from 2021',
      imageUrl: '/collectables/snowdog-og.png',
      rarity: 'legendary',
      category: 'og',
      active: true,
    },
  });

  console.log('✅ Snowdog collectable created successfully!');
  console.log('📦 Collectable ID:', snowdogCollectable.id);
  console.log('🎁 Free to claim for eligible users (2021 participants)');
}

main()
  .catch((e) => {
    console.error('Error adding Snowdog collectable:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


