"use client";
import ArtistsTab from "@/features/artists/components/artists-tab";
import { Home as HomeIcon, Palette, FolderOpen, Users, Paintbrush } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ArtistsPage() {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <div className="w-full max-w-screen-lg mx-auto -mt-6 px-8 relative z-10 mb-16">
        <div className="flex flex-col gap-4">
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <div className="gap-2 bg-transparent m-0 p-0 flex">
                <Link
                  href="/"
                  className="px-4 py-2 font-bold text-md text-gray-600 bg-white border-white border-2 flex items-center justify-center rounded-md hover:bg-gray-50"
                >
                  <HomeIcon className="w-5 h-5 mr-2" />
                  Home
                </Link>
                <Link
                  href="/gallery"
                  className="px-4 py-2 font-bold text-md text-gray-600 bg-white border-white border-2 flex items-center justify-center rounded-md hover:bg-gray-50"
                >
                  <Palette className="w-5 h-5 mr-2" />
                  Gallery
                </Link>
                <Link
                  href="/artists"
                  className="px-4 py-2 font-bold text-md text-gray-600 bg-white border-white border-2 flex items-center justify-center rounded-md hover:bg-gray-50"
                >
                  <Paintbrush className="w-5 h-5 mr-2" />
                  Artists
                </Link>
                <Link
                  href="/projects"
                  className="px-4 py-2 font-bold text-md text-gray-600 bg-white border-white border-2 flex items-center justify-center rounded-md hover:bg-gray-50"
                >
                  <FolderOpen className="w-5 h-5 mr-2" />
                  Projects
                </Link>
                <Link
                  href="/kol"
                  className="px-4 py-2 font-bold text-md text-gray-600 bg-white border-white border-2 flex items-center justify-center rounded-md hover:bg-gray-50"
                >
                  <Users className="w-5 h-5 mr-2" />
                  KOL
                </Link>
              </div>
            </div>
          </div>
          <ArtistsTab />
        </div>
      </div>
    </div>
  );
}
