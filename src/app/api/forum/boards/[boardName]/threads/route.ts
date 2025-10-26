import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

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

    // Verify user has a Discord account connected
    const user = await prisma.user.findUnique({
      where: { address: walletAddress }
    });

    if (!user || !user.discordId) {
      return NextResponse.json(
        { error: "Must connect Discord account to post" },
        { status: 403 }
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

    // Create thread and first post in a transaction
    const result = await prisma.$transaction(async (tx) => {
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

      return { thread, post };
    });

    return NextResponse.json({
      success: true,
      threadId: result.thread.id,
      postId: result.post.id
    });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}
