import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixReplyCounts() {
  console.log('Starting reply count fix...');

  // Get all threads
  const threads = await prisma.thread.findMany({
    include: {
      posts: {
        select: {
          isOp: true
        }
      }
    }
  });

  console.log(`Found ${threads.length} threads to check`);

  let fixedCount = 0;

  for (const thread of threads) {
    // Count actual replies (posts that are not OP)
    const actualReplyCount = thread.posts.filter(post => !post.isOp).length;

    // If the stored count doesn't match, update it
    if (thread.replyCount !== actualReplyCount) {
      console.log(`Thread ${thread.id}: Fixing count from ${thread.replyCount} to ${actualReplyCount}`);

      await prisma.thread.update({
        where: { id: thread.id },
        data: { replyCount: actualReplyCount }
      });

      fixedCount++;
    }
  }

  console.log(`\nFixed ${fixedCount} threads`);
  console.log('Done!');
}

fixReplyCounts()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
