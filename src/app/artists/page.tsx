"use client";

import { PageNavigation } from "@/components/page-navigation";

export default function ArtistsPage() {
  return (
    <div className="w-full">
      <div className="w-full max-w-screen-lg mx-auto -mt-6 px-8 relative z-10 mb-16">
        <PageNavigation />

        <div className="w-full bg-white dark:bg-zinc-800 rounded-lg shadow">
          <div className="px-8 py-6 space-y-6">
            {/* Header & Prompt Combined */}
            <div>
              <h2 className="text-2xl font-bold">Art Club - Cohort 1</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1 mb-4">Submit artwork based on the prompt below</p>
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Current Prompt:</span>
                  <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">&quot;Wolfi&quot;</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Create original artwork featuring the Avalanche mascot, suitable for NFT minting
                </p>
              </div>
            </div>

            {/* Process & Benefits Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* How It Works */}
              <div>
                <h3 className="font-bold mb-3">How It Works</h3>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">1.</span>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Submit your Wolfi artwork</div>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">2.</span>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Community votes (10 votes each)</div>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">3.</span>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Top 10% join the Art Club</div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="font-bold mb-3">Club Benefits</h3>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <span className="text-zinc-400 dark:text-zinc-500">•</span>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Monthly AMAs with mentors</div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-zinc-400 dark:text-zinc-500">•</span>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Skill development workshops</div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-zinc-400 dark:text-zinc-500">•</span>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Exclusive Discord channels</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentors & Partners - Compact */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Mentors:</span>
                  <span className="text-zinc-600 dark:text-zinc-400 ml-2">Wrath, Ly, Scribble, TimDraws & more</span>
                </div>
                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Partners:</span>
                  <span className="text-zinc-600 dark:text-zinc-400 ml-2">zeroone, Cozy, Salvor & Avax projects</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button className="snow-button flex-1" disabled>
                Submissions Opening Soon
              </button>
              <a
                href="https://discord.gg/K4z7xxFVGc"
                target="_blank"
                className="snow-button-secondary flex-1 text-center"
              >
                Join Discord for Updates
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
