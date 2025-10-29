import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating Puppet reward image URL...');

  const updated = await prisma.reward.updateMany({
    where: {
      name: { contains: 'Puppet', mode: 'insensitive' }
    },
    data: {
      imageUrl: '/puppets/puppet-shop.png'
    }
  });

  console.log('✅ Updated', updated.count, 'Puppet reward(s) to use local image');
  
  // Verify the update
  const puppet = await prisma.reward.findFirst({
    where: {
      name: { contains: 'Puppet', mode: 'insensitive' }
    }
  });
  
  if (puppet) {
    console.log('New image URL:', puppet.imageUrl);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


