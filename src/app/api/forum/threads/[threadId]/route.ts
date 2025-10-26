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
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        board: true,
        posts: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(thread);
  } catch (error) {
    console.error("Error fetching thread:", error);
    return NextResponse.json(
      { error: "Failed to fetch thread" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;
    const { comment, imageHash, walletAddress, boardName, anonymous } = await request.json();

    if (!comment || !walletAddress || !boardName) {
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

    const thread = await prisma.thread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    const posterId = generatePosterId(walletAddress, boardName);

    // Create post and update thread in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          threadId: thread.id,
          comment,
          imageHash: imageHash || null,
          walletAddress,
          posterId,
          isOp: false,
          anonymous: anonymous !== undefined ? anonymous : true
        }
      });

      // Update thread bump time and reply count
      const updatedThread = await tx.thread.update({
        where: { id: threadId },
        data: {
          bumpedAt: new Date(),
          replyCount: { increment: 1 }
        }
      });

      return { post, thread: updatedThread };
    });

    return NextResponse.json({
      success: true,
      postId: result.post.id
    });
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    );
  }
}
