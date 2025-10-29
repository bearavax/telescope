import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking Collectables table...\n');

  const collectables = await prisma.collectable.findMany();

  if (collectables.length === 0) {
    console.log('❌ No collectables found in database');
  } else {
    console.log(`✅ Found ${collectables.length} collectable(s):\n`);
    collectables.forEach(c => {
      console.log('---');
      console.log('ID:', c.id);
      console.log('Collectable ID:', c.collectableId);
      console.log('Name:', c.name);
      console.log('Description:', c.description);
      console.log('Image URL:', c.imageUrl);
      console.log('Rarity:', c.rarity);
      console.log('Category:', c.category);
      console.log('Active:', c.active);
      console.log('---\n');
    });
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


