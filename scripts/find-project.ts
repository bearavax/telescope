import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findProject() {
  console.log('Searching for projects with "bear" in name...\n');

  const projects = await prisma.project.findMany({
    where: {
      name: { contains: 'bear', mode: 'insensitive' }
    },
    select: {
      name: true,
      description: true
    }
  });

  console.log('Found projects:');
  projects.forEach(project => {
    console.log(`Project: ${project.name}`);
  });
}

findProject()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

