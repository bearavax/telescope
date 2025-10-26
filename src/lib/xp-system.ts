import { prisma } from "@/lib/prisma";

// XP required to reach a specific level (matching xp.ts calculation)
function getXpForLevel(level: number): number {
  if (level === 1) return 0;
  if (level === 2) return 11;
  // Level 3+ requires 11 + (level-2)*30
  return 11 + (level - 2) * 30;
}

// Award XP for interacting (1 XP per day via posting)
export async function awardPostXP(walletAddress: string): Promise<{ xpAwarded: boolean; newXp: number; newLevel: number }> {
  try {
    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { address: walletAddress }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { address: walletAddress }
      });
    }

    // Check if user already posted today (UTC)
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    // Get last post date from posts table
    const lastPost = await prisma.post.findFirst({
      where: { walletAddress },
      orderBy: { createdAt: 'desc' }
    });

    if (lastPost) {
      const lastPostDate = new Date(lastPost.createdAt);
      const lastPostUTC = new Date(Date.UTC(lastPostDate.getUTCFullYear(), lastPostDate.getUTCMonth(), lastPostDate.getUTCDate()));
      
      // If already posted today, don't award XP
      if (lastPostUTC.getTime() === todayUTC.getTime()) {
        return { xpAwarded: false, newXp: user.xp, newLevel: user.level };
      }
    }

    // Award 1 XP
    const newXp = user.xp + 1;
    let newLevel = user.level;
    
    // Check if leveled up (using the same logic as calculateLevel in xp.ts)
    if (newXp <= 10) {
      newLevel = 1;
    } else {
      newLevel = Math.floor((newXp - 11) / 30) + 2;
    }

    // Update user
    await prisma.user.update({
      where: { address: walletAddress },
      data: {
        xp: newXp,
        level: newLevel
      }
    });

    return { xpAwarded: true, newXp, newLevel };
  } catch (error) {
    console.error("Error awarding XP:", error);
    return { xpAwarded: false, newXp: 0, newLevel: 1 };
  }
}

