import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    // Get user info for join date
    const user = await prisma.user.findUnique({
      where: { address },
      select: { createdAt: true },
    });

    // Get total posts count
    const totalPosts = await prisma.post.count({
      where: { walletAddress: address },
    });

    // Get total threads created
    const totalThreads = await prisma.thread.count({
      where: {
        posts: {
          some: {
            walletAddress: address,
            isOp: true,
          }
        }
      },
    });

    // Get total replies (posts that are not OP)
    const totalReplies = await prisma.post.count({
      where: {
        walletAddress: address,
        isOp: false,
      },
    });

    // Get boards posted in
    const boardsPostedIn = await prisma.post.findMany({
      where: { walletAddress: address },
      select: {
        thread: {
          select: {
            boardId: true,
            board: {
              select: {
                name: true,
                title: true,
              }
            }
          }
        }
      },
      distinct: ['threadId'],
    });

    const uniqueBoards = Array.from(
      new Map(
        boardsPostedIn
          .filter(p => p.thread?.board)
          .map(p => [p.thread.board.name, p.thread.board])
      ).values()
    );

    // Check badge eligibility based on signup order
    let isSuperOG = false;
    let isEarlyAdopter = false;

    if (user?.createdAt) {
      // Count how many users signed up before this user
      const usersBeforeCount = await prisma.user.count({
        where: {
          createdAt: {
            lt: user.createdAt
          }
        }
      });

      // Super OG: First 100 signups
      if (usersBeforeCount < 100) {
        isSuperOG = true;
      }
      // Early Adopter: Signups 101-1100 (first 1000 after Super OG)
      else if (usersBeforeCount >= 100 && usersBeforeCount < 1100) {
        isEarlyAdopter = true;
      }
    }

    // Calculate forum posting streak
    const posts = await prisma.post.findMany({
      where: { walletAddress: address },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    let currentPostStreak = 0;
    let longestPostStreak = 0;

    if (posts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const uniqueDays = new Set<string>();
      posts.forEach(post => {
        const date = new Date(post.createdAt);
        date.setHours(0, 0, 0, 0);
        uniqueDays.add(date.toISOString().split('T')[0]);
      });

      const sortedDays = Array.from(uniqueDays).sort().reverse();

      // Calculate current streak
      for (let i = 0; i < sortedDays.length; i++) {
        const dayDate = new Date(sortedDays[i]);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);

        if (dayDate.getTime() === expectedDate.getTime()) {
          currentPostStreak++;
        } else {
          break;
        }
      }

      // Calculate longest streak
      let tempStreak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const currentDay = new Date(sortedDays[i]);
        const previousDay = new Date(sortedDays[i - 1]);
        const diffDays = Math.floor((previousDay.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          longestPostStreak = Math.max(longestPostStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      longestPostStreak = Math.max(longestPostStreak, tempStreak, currentPostStreak);
    }

    return NextResponse.json({
      totalPosts,
      totalThreads,
      totalReplies,
      boardsPostedIn: uniqueBoards,
      boardCount: uniqueBoards.length,
      joinedDate: user?.createdAt,
      isSuperOG,
      isEarlyAdopter,
      currentPostStreak,
      longestPostStreak,
    });
  } catch (error) {
    console.error("Failed to fetch forum stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch forum stats" },
      { status: 500 }
    );
  }
}
