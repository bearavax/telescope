import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating Snowdog collectable image URL for profile...');

  const updated = await prisma.collectable.update({
    where: {
      collectableId: 'snowdog'
    },
    data: {
      imageUrl: '/collectables/snowdog-profile.png'
    }
  });

  console.log('✅ Updated Snowdog collectable to use profile image');
  console.log('New image URL:', updated.imageUrl);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


