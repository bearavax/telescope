import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateDescription() {
  console.log('Updating puppet description...');

  const result = await prisma.reward.updateMany({
    where: {
      name: 'Puppet NFT'
    },
    data: {
      description: 'Puppets have no master, 50x available and 10 XP to get them!'
    }
  });

  console.log(`✅ Updated ${result.count} reward(s)`);
}

updateDescription()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
