import { NextResponse } from "next/server";
import { env } from "@/env";

export async function GET() {
  // Return the bot's client ID so the frontend can generate the invite link
  // This is safe to expose publicly
  return NextResponse.json({
    clientId: env.DISCORD_CLIENT_ID,
  });
}
