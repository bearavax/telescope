import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating Snowdog image URL...');

  const updated = await prisma.collectable.update({
    where: {
      collectableId: 'snowdog'
    },
    data: {
      imageUrl: '/collectables/snowdog-og.png'
    }
  });

  console.log('✅ Updated Snowdog image URL to:', updated.imageUrl);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

