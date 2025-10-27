import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBearavax() {
  const user = await prisma.user.findUnique({
    where: { address: '0x0C39f0970CF3118Fd004A3f069E59dabc6714980' }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('Current bearavax stats:');
  console.log(`XP: ${user.xp}`);
  console.log(`Coins: ${user.coins}`);
  console.log(`Level: ${user.level}`);
}

checkBearavax()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
