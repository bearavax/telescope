"use client";

import Link from "next/link";
import { Home as HomeIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export function PageNavigation() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 mb-8">
      <div className="gap-2 flex flex-wrap">
        <Link href="/">
          <button
            className={`px-4 py-2 font-bold text-md border-2 rounded-lg transition-all ${
              pathname === "/"
                ? "bg-white border-white shadow text-foreground"
                : "bg-white border-white hover:bg-zinc-50 text-muted-foreground"
            }`}
          >
            <HomeIcon className="h-6 w-6" />
          </button>
        </Link>
        <Link href="/forum">
          <button
            className={`px-5 py-2 font-bold text-md border-2 rounded-lg transition-all ${
              pathname?.startsWith("/forum")
                ? "bg-white border-white shadow text-foreground"
                : "bg-white border-white hover:bg-zinc-50 text-muted-foreground"
            }`}
          >
            Forum
          </button>
        </Link>
        <Link href="/projects">
          <button
            className={`px-5 py-2 font-bold text-md border-2 rounded-lg transition-all ${
              pathname === "/projects"
                ? "bg-white border-white shadow text-foreground"
                : "bg-white border-white hover:bg-zinc-50 text-muted-foreground"
            }`}
          >
            Projects
          </button>
        </Link>
        <Link href="/artists">
          <button
            className={`px-5 py-2 font-bold text-md border-2 rounded-lg transition-all ${
              pathname?.startsWith("/artists")
                ? "bg-white border-white shadow text-foreground"
                : "bg-white border-white hover:bg-zinc-50 text-muted-foreground"
            }`}
          >
            Artists
          </button>
        </Link>
      </div>
    </div>
  );
}
