import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findUsers() {
  console.log('Searching for users with "bear" in username or address...\n');

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: 'bear', mode: 'insensitive' } },
        { address: { contains: 'bear', mode: 'insensitive' } }
      ]
    },
    select: {
      address: true,
      username: true,
      xp: true,
      coins: true
    }
  });

  if (users.length === 0) {
    console.log('No users found with "bear" in username or address');
    console.log('\nSearching for all users...\n');
    
    const allUsers = await prisma.user.findMany({
      select: {
        address: true,
        username: true,
        xp: true,
        coins: true
      },
      take: 20
    });
    
    console.log('First 20 users:');
    allUsers.forEach(user => {
      console.log(`Username: ${user.username || 'N/A'}, Address: ${user.address.substring(0, 10)}..., XP: ${user.xp}, Coins: ${user.coins}`);
    });
  } else {
    console.log('Found users:');
    users.forEach(user => {
      console.log(`Username: ${user.username || 'N/A'}, Address: ${user.address}, XP: ${user.xp}, Coins: ${user.coins}`);
    });
  }
}

findUsers()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

