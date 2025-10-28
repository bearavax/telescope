"use client";

import Link from "next/link";
import { Home as HomeIcon, Calendar, Monitor, Library, Palette, Newspaper, Gift } from "lucide-react";
import { usePathname } from "next/navigation";

export function PageNavigation() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 sm:gap-3 mb-8 relative z-20">
      <div className="gap-2 sm:gap-3 flex flex-wrap">
        {/* Main navigation - always show titles */}
        <Link href="/">
          <button
            className={`px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-md border-2 rounded-xl transition-all duration-300 ease-in-out flex items-center gap-2 ${
              pathname === "/"
                ? "bg-white border-white shadow text-foreground"
                : "bg-white border-white hover:bg-zinc-50 text-muted-foreground"
            }`}
          >
            <HomeIcon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold">Home</span>
          </button>
        </Link>
        <Link href="/calendar">
          <button
            className={`px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-md border-2 rounded-xl transition-all duration-300 ease-in-out flex items-center gap-2 ${
              pathname === "/calendar"
                ? "bg-white border-white shadow text-foreground"
                : "bg-white border-white hover:bg-zinc-50 text-muted-foreground"
            }`}
          >
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold">Calendar</span>
          </button>
        </Link>
        <Link href="/forum">
          <button
            className={`px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-md border-2 rounded-xl transition-all duration-300 ease-in-out flex items-center gap-2 ${
              pathname?.startsWith("/forum")
                ? "bg-white border-white shadow text-foreground"
                : "bg-white border-white hover:bg-zinc-50 text-muted-foreground"
            }`}
          >
            <Monitor className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold">Forum</span>
          </button>
        </Link>
        <Link href="/projects">
          <button
            className={`px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-md border-2 rounded-xl transition-all duration-300 ease-in-out flex items-center gap-2 ${
              pathname === "/projects"
                ? "bg-white border-white shadow text-foreground"
                : "bg-white border-white hover:bg-zinc-50 text-muted-foreground"
            }`}
          >
            <Library className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold">Projects</span>
          </button>
        </Link>

        {/* Secondary navigation - icon only with hover expand */}
        <Link href="/news">
          <button
            className={`group py-2.5 sm:py-3 font-bold text-md border-2 rounded-xl transition-all duration-500 ease-in-out flex items-center overflow-hidden ${
              pathname?.startsWith("/news")
                ? "bg-white border-white shadow text-foreground justify-start pl-3 sm:pl-4 pr-3 sm:pr-4 gap-2"
                : "bg-white border-white hover:bg-zinc-50 text-muted-foreground justify-center px-3 sm:px-3.5 sm:group-hover:justify-start sm:group-hover:pl-4 sm:group-hover:pr-3 sm:group-hover:gap-2"
            }`}
          >
            <Newspaper className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className={`${pathname?.startsWith("/news") ? "max-w-[100px] opacity-100 ml-2" : "max-w-0 sm:group-hover:max-w-[100px] opacity-0 sm:group-hover:opacity-100 sm:group-hover:ml-2"} transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap text-sm sm:text-base font-semibold`}>
              News
            </span>
          </button>
        </Link>
        <Link href="/artists">
          <button
            className={`group py-2.5 sm:py-3 font-bold text-md border-2 rounded-xl transition-all duration-500 ease-in-out flex items-center overflow-hidden ${
              pathname?.startsWith("/artists")
                ? "bg-white border-white shadow text-foreground justify-start pl-3 sm:pl-4 pr-3 sm:pr-4 gap-2"
                : "bg-white border-white hover:bg-zinc-50 text-muted-foreground justify-center px-3 sm:px-3.5 sm:group-hover:justify-start sm:group-hover:pl-4 sm:group-hover:pr-3 sm:group-hover:gap-2"
            }`}
          >
            <Palette className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className={`${pathname?.startsWith("/artists") ? "max-w-[100px] opacity-100 ml-2" : "max-w-0 sm:group-hover:max-w-[100px] opacity-0 sm:group-hover:opacity-100 sm:group-hover:ml-2"} transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap text-sm sm:text-base font-semibold`}>
              Artists
            </span>
          </button>
        </Link>
        <Link href="/shop">
          <button
            className={`group py-2.5 sm:py-3 font-bold text-md border-2 rounded-xl transition-all duration-500 ease-in-out flex items-center overflow-hidden ${
              pathname?.startsWith("/shop")
                ? "bg-white border-white shadow text-foreground justify-start pl-3 sm:pl-4 pr-3 sm:pr-4 gap-2"
                : "bg-white border-white hover:bg-zinc-50 text-muted-foreground justify-center px-3 sm:px-3.5 sm:group-hover:justify-start sm:group-hover:pl-4 sm:group-hover:pr-3 sm:group-hover:gap-2"
            }`}
          >
            <Gift className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className={`${pathname?.startsWith("/shop") ? "max-w-[100px] opacity-100 ml-2" : "max-w-0 sm:group-hover:max-w-[100px] opacity-0 sm:group-hover:opacity-100 sm:group-hover:ml-2"} transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap text-sm sm:text-base font-semibold`}>
              Shop
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
}
