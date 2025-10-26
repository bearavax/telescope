import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const boards = await prisma.board.findMany({
      include: {
        _count: {
          select: { threads: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, title, description } = await request.json();

    if (!name || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const board = await prisma.board.create({
      data: {
        name,
        title,
        description
      }
    });

    return NextResponse.json(board);
  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json(
      { error: "Failed to create board", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
