import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setBearavaxCoins() {
  const address = '0x0C39f0970CF3118Fd004A3f069E59dabc6714980';

  console.log(`Setting bearavax coins to 134...`);

  const user = await prisma.user.findUnique({
    where: { address }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log(`Current stats:`);
  console.log(`  XP: ${user.xp}`);
  console.log(`  Coins: ${user.coins}`);
  console.log(`  Level: ${user.level}`);

  const updated = await prisma.user.update({
    where: { address },
    data: {
      coins: 134
    }
  });

  console.log(`\n✅ Updated coins to 134`);
  console.log(`New stats:`);
  console.log(`  XP: ${updated.xp}`);
  console.log(`  Coins: ${updated.coins}`);
  console.log(`  Level: ${updated.level}`);
}

setBearavaxCoins()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
