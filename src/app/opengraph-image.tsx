import { siteConfig } from "@/lib/site";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        className="flex flex-col items-center justify-center w-full h-full text-white"
        style={{
          background:
            "linear-gradient(to right bottom, rgb(17, 24, 39), rgb(75, 85, 99))",
        }}
      >
        <h1 className="text-8xl">{siteConfig.name}</h1>
        <h2 className="text-4xl">{siteConfig.description}</h2>
        <div className="flex flex-col items-center justify-center mt-8">
          <div className="text-xl">
            Next.js · Ethereum · Viem · Wagmi · Web3Modal · SIWE
          </div>
          <div className="text-xl mt-2">Tailwind · Shadcn UI · and more..</div>
        </div>
      </div>
    )
  );
}
