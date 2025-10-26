import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INITIAL_BOARDS = [
  { name: "gen", title: "General", description: "General community discussion & Avalanche topics" },
  { name: "tech", title: "Tech & Development", description: "Tech is good" },
  { name: "defi", title: "DeFi & Yield Farming", description: "Decentralized finance and yield opportunities" },
  { name: "nft", title: "NFTs & Collectibles", description: "NFT projects, marketplaces, and collections" },
  { name: "game", title: "Gaming & Metaverse", description: "Gaming projects and virtual worlds" },
  { name: "rwa", title: "Real-World Assets & Tokenization", description: "Tokenization of real-world assets" },
  { name: "inst", title: "Institutional Adoption & Partnerships", description: "Enterprise and institutional adoption" },
  { name: "price", title: "Price Discussion & Trading", description: "Token prices and market analysis" },
  { name: "meme", title: "Memecoins & Shitposting", description: "nochillio" },
  { name: "drama", title: "Drama", description: "Contribute to Avalore" },
  { name: "gov", title: "Governance & Proposals", description: "DAO governance and proposals" },
  { name: "sec", title: "Security & Audits", description: "Security best practices and audits" },
  { name: "adopt", title: "Adoption & Use Cases", description: "Real-world adoption and use cases" },
  { name: "dev", title: "Developer Resources", description: "Tools, docs, and developer support" },
  { name: "eco", title: "Ecosystem Projects", description: "Projects building on Avalanche" },
  { name: "reg", title: "Regulations & Compliance", description: "Legal and regulatory discussions" },
  { name: "bridge", title: "Newcomers", description: "Arriving to Avalanche" },
  { name: "b", title: "Random", description: "Off-topic and random discussion" }
];

export async function GET() {
  try {
    // Check if boards exist, auto-seed if empty
    const boardCount = await prisma.board.count();
    
    if (boardCount === 0) {
      console.log("No boards found, auto-seeding initial boards...");
      await prisma.board.createMany({
        data: INITIAL_BOARDS
      });
      console.log("Auto-seeded 18 boards successfully");
    }

    const boards = await prisma.board.findMany({
      include: {
        _count: {
          select: { threads: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Calculate total threads created across all boards for unlock tracking
    const totalThreadsCreated = boards.reduce((sum, board) => sum + board.totalThreadsCreated, 0);

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
