"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Home, CircleDollarSign } from "lucide-react";
import { useAccount } from "wagmi";
import { Address } from "viem";

import { FAQ } from "@/components/faq";
import { ConnectButton } from "@/components/connect-button";
import { BackButton } from "@/components/back-button";
import { DonateModal } from "@/components/donate-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUserStats } from "@/hooks/use-user-stats";

// Play random shop sound
const playShopSound = () => {
  const soundIndex = Math.floor(Math.random() * 5) + 1;
  const audio = new Audio(`/sounds/UI_TradingPost_OpenMenu_0${soundIndex}.ogg`);
  audio.volume = 0.5;
  audio.play().catch(() => {}); // Ignore errors if autoplay is blocked
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: userStats } = useUserStats(address as Address, isConnected);

  return (
    <header className="w-full bg-transparent border-b-4 border-zinc-300 dark:border-zinc-700">
      <div className="w-full relative h-40 md:h-auto max-w-screen-lg mx-auto pt-12 pb-4 px-4 md:px-8 flex items-start justify-end md:justify-between md:flex-row">
        <div className="flex items-center gap-4 absolute left-4 md:left-8 z-10">
          <BackButton />
        </div>
        <Image
          src="/logo.png"
          alt="Telescope"
          className="flex items-end absolute md:relative left-4 md:left-0 -bottom-4 w-56 md:w-80"
          width={320}
          height={80}
          style={{ width: 'auto', height: 'auto' }}
        />
        <div className="flex items-center relative z-10 justify-center gap-2 md:self-auto">
          {isConnected && userStats && (
            <Link
              href="/shop"
              onClick={playShopSound}
            >
              <div className="hidden md:flex items-center gap-1.5 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 h-9 shadow cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                <CircleDollarSign className="h-4 w-4 text-yellow-600" />
                <span className="font-bold text-sm text-yellow-600">{userStats.coins || 0}</span>
              </div>
            </Link>
          )}
          <DonateModal />
          <FAQ />
          <ThemeToggle />
          <ConnectButton />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 rounded-lg bg-white dark:bg-zinc-800 shadow hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
