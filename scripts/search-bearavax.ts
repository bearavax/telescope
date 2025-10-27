import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function searchBearavax() {
  console.log('Searching all tables for "bearavax"...\n');

  // Check users
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { not: null } },
        { discordId: { not: null } }
      ]
    },
    select: {
      address: true,
      username: true,
      discordId: true,
      xp: true,
      coins: true
    }
  });

  console.log('All users with username or discordId:');
  users.forEach(user => {
    if (user.username?.toLowerCase().includes('bear') || user.discordId?.toLowerCase().includes('bear')) {
      console.log(`⭐ Username: ${user.username || 'N/A'}, Discord: ${user.discordId || 'N/A'}, Address: ${user.address}, XP: ${user.xp}, Coins: ${user.coins}`);
    }
  });

  // Check projects
  const projects = await prisma.project.findMany({
    select: {
      name: true
    }
  });

  console.log('\nAll projects:');
  projects.forEach(project => {
    console.log(`Project: ${project.name}`);
    if (project.name.toLowerCase().includes('bear')) {
      console.log(`⭐ Found match: ${project.name}`);
    }
  });

  // Check art submissions
  const artSubmissions = await prisma.artSubmission.findMany({
    where: {
      artistName: { contains: 'bear', mode: 'insensitive' }
    },
    select: {
      artistName: true,
      artistAddress: true
    }
  });

  if (artSubmissions.length > 0) {
    console.log('\nArt submissions from bearavax:');
    artSubmissions.forEach(sub => {
      console.log(`Artist: ${sub.artistName}, Address: ${sub.artistAddress}`);
    });
  }
}

searchBearavax()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

