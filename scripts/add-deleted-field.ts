import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addDeletedField() {
  console.log('Adding deleted field to existing threads...');

  // Update all threads to ensure deleted field is set to false
  // This is safe to run multiple times
  const result = await prisma.thread.updateMany({
    data: {
      deleted: false
    }
  });

  console.log(`Updated ${result.count} threads`);
  console.log('Done!');
}

addDeletedField()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
