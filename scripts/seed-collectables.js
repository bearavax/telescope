const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const collectables = [
  {
    collectableId: 'snowdog',
    name: 'Snowdog',
    description: 'The legendary Snowdog mascot of Avalanche',
    imageUrl: '/collectables/snowdog.png',
    rarity: 'legendary',
    category: 'mascot',
    active: true
  },
  {
    collectableId: 'puppet',
    name: 'Puppet',
    description: 'A friendly puppet character from the Avalanche ecosystem',
    imageUrl: '/collectables/puppet.png',
    rarity: 'rare',
    category: 'character',
    active: true
  },
  {
    collectableId: 'yak',
    name: 'Yield Yak',
    description: 'The hardworking Yield Yak',
    imageUrl: '/collectables/yak.png',
    rarity: 'epic',
    category: 'mascot',
    active: true
  },
  {
    collectableId: 'early_adopter',
    name: 'Early Adopter',
    description: 'For being an early member of the Telescope community',
    imageUrl: '/collectables/early_adopter.png',
    rarity: 'rare',
    category: 'achievement',
    active: true
  },
  {
    collectableId: 'vote_master',
    name: 'Vote Master',
    description: 'Awarded for casting 100 votes',
    imageUrl: '/collectables/vote_master.png',
    rarity: 'epic',
    category: 'achievement',
    active: true
  },
  {
    collectableId: 'streak_champion',
    name: 'Streak Champion',
    description: 'Achieved a 30-day voting streak',
    imageUrl: '/collectables/streak_champion.png',
    rarity: 'legendary',
    category: 'achievement',
    active: true
  }
];

async function main() {
  console.log('Seeding collectables...');

  for (const collectable of collectables) {
    const result = await prisma.collectable.upsert({
      where: { collectableId: collectable.collectableId },
      update: collectable,
      create: collectable
    });
    console.log(`✅ ${result.name} (${result.collectableId})`);
  }

  console.log('\n🎉 Collectables seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
