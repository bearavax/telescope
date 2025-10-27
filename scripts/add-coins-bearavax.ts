import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCoinsToBearavax() {
  console.log('Adding 100 coins to bearavax...');

  // Find user by username or address
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { contains: 'bearavax', mode: 'insensitive' } },
        { address: { contains: 'bearavax', mode: 'insensitive' } }
      ]
    }
  });

  if (!user) {
    console.log('User bearavax not found. Please provide the exact address:');
    console.log('You can run: npx tsx scripts/add-coins-bearavax.ts <address>');
    return;
  }

  // Add 100 coins
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      coins: user.coins + 100
    }
  });

  console.log(`✅ Added 100 coins to ${user.username || user.address}`);
  console.log(`Previous coins: ${user.coins} -> New coins: ${updated.coins}`);
}

// Allow passing address as command line argument
const addressArg = process.argv[2];

async function main() {
  if (addressArg) {
    console.log(`Adding 100 coins to address: ${addressArg}...`);

    const user = await prisma.user.findUnique({
      where: { address: addressArg }
    });

    if (!user) {
      console.log('User not found with that address');
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        coins: user.coins + 100
      }
    });

    console.log(`✅ Added 100 coins to ${user.username || user.address}`);
    console.log(`Previous coins: ${user.coins} -> New coins: ${updated.coins}`);
  } else {
    await addCoinsToBearavax();
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
