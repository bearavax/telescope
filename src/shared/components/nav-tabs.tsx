"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home as HomeIcon, Palette, FolderOpen, Users, Paintbrush } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/gallery", label: "Gallery", Icon: Palette },
  { href: "/artists", label: "Artists", Icon: Paintbrush },
  { href: "/projects", label: "Projects", Icon: FolderOpen },
  { href: "/kol", label: "KOL", Icon: Users },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <div className="gap-2 bg-transparent m-0 p-0 flex">
      {tabs.map(({ href, label, Icon }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 font-bold text-md text-gray-600 bg-white border-white border-2 flex items-center justify-center rounded-md hover:bg-gray-50 overflow-hidden"
          >
            {/* Icon always visible */}
            <Icon className="w-5 h-5 mr-2" />

            {/* Desktop: always show; Mobile: only show for active with animation */}
            <span
              className={
                "transition-all duration-300 " +
                "md:opacity-100 md:max-w-[200px] md:ml-0 " +
                (isActive
                  ? "opacity-100 max-w-[200px] ml-1"
                  : "opacity-0 max-w-0 ml-0")
              }
            >
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}


