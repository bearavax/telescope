import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { awardPostXP } from "@/lib/xp-system";

// Generate unique poster ID (same wallet = same ID per board)
function generatePosterId(walletAddress: string, boardName: string): string {
  const hash = createHash("md5")
    .update(walletAddress + boardName + process.env.POSTER_SALT || "telescope-salt")
    .digest("hex");
  return hash.substring(0, 8);
}

export async function GET(
  request: Request,
  { params }: { params: { boardName: string } }
) {
  try {
    const { boardName } = params;

    const board = await prisma.board.findUnique({
      where: { name: boardName }
    });

    if (!board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
    }

    const threads = await prisma.thread.findMany({
      where: { boardId: board.id },
      include: {
        posts: {
          orderBy: { createdAt: 'asc' },
          take: 1 // Get only the first post (OP)
        }
      },
      orderBy: { bumpedAt: 'desc' },
      take: 150 // Max 150 threads per board
    });

    return NextResponse.json(threads);
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { boardName: string } }
) {
  try {
    const { boardName } = params;
    const { comment, imageHash, walletAddress, subject, anonymous } = await request.json();

    if (!comment || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const board = await prisma.board.findUnique({
      where: { name: boardName }
    });

    if (!board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
    }

    const posterId = generatePosterId(walletAddress, boardName);

    // Ensure user exists
    await prisma.user.upsert({
      where: { address: walletAddress },
      create: { address: walletAddress },
      update: {}
    });

    // Check and award XP BEFORE creating the post
    const xpResult = await awardPostXP(walletAddress);

    // Create thread and first post in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if board is at max threads (90)
      const threadCount = await tx.thread.count({
        where: { boardId: board.id }
      });

      // If at max, delete the oldest (least recently bumped) thread
      if (threadCount >= 90) {
        const oldestThread = await tx.thread.findFirst({
          where: { boardId: board.id },
          orderBy: { bumpedAt: 'asc' },
          include: { posts: true }
        });

        if (oldestThread) {
          // Delete all posts in the thread first
          await tx.post.deleteMany({
            where: { threadId: oldestThread.id }
          });
          // Then delete the thread
          await tx.thread.delete({
            where: { id: oldestThread.id }
          });
        }
      }

      const thread = await tx.thread.create({
        data: {
          boardId: board.id,
          subject: subject || null,
          bumpedAt: new Date(),
          replyCount: 0
        }
      });

      const post = await tx.post.create({
        data: {
          threadId: thread.id,
          comment,
          imageHash: imageHash || null,
          walletAddress,
          posterId,
          isOp: true,
          anonymous: anonymous !== undefined ? anonymous : true
        }
      });

      // Increment all-time thread count for unlock tracking
      await tx.board.update({
        where: { id: board.id },
        data: { totalThreadsCreated: { increment: 1 } }
      });

      return { thread, post };
    });

    return NextResponse.json({
      success: true,
      threadId: result.thread.id,
      postId: result.post.id,
      xpAwarded: xpResult.xpAwarded,
      newXp: xpResult.newXp,
      newLevel: xpResult.newLevel
    });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}
