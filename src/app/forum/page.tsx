"use client";

import { ForumOverview } from "@/components/forum-overview";
import { PageNavigation } from "@/components/page-navigation";

export default function ForumPage() {
  return (
    <div className="w-full max-w-screen-lg mx-auto -mt-6 px-8 relative z-10 mb-16">
      <PageNavigation />
      <ForumOverview />
    </div>
  );
}
