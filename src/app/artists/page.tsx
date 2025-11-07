"use client";

import { PageNavigation } from "@/components/page-navigation";

export default function ArtistsPage() {
  return (
    <div className="w-full">
      <div className="w-full max-w-screen-lg mx-auto -mt-6 px-8 relative z-10 mb-16">
        <PageNavigation />

        {/* AVAX Art Mentors Section - Moved to Top */}
        <div className="w-full rounded-lg shadow-lg mb-8 border-2" style={{
          background: 'linear-gradient(to bottom right, #e6f0f5, #d4e8f0)',
          borderColor: '#4f8aae'
        }}>
          <div className="px-8 py-6">
            <h2 className="text-3xl font-bold mb-2" style={{
              background: 'linear-gradient(to right, #416c99, #283470)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>AVAX Art Mentors</h2>
            <p className="mb-6 text-sm" style={{ color: '#416c99' }}>
              Meet our talented mentors who will guide you through your artistic journey on Avalanche
            </p>

            {/* Artist Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {/* Ly (SOPESGAL) */}
              <a
                href="https://sopesgal-art.carrd.co/"
                target="_blank"
                className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-zinc-800 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-700 flex-shrink-0 relative">
                  <img
                    src="https://sopesgal-art.carrd.co/assets/images/image01.jpg"
                    alt="Ly"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-center">Ly</span>
              </a>

              {/* Frogwell */}
              <a
                href="https://frogwell.art/"
                target="_blank"
                className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-zinc-800 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-700 flex-shrink-0 relative">
                  <img
                    src="https://cdn.myportfolio.com/09357e92-1a86-4105-9a77-5fd2e0472d1b/92b0576d-695b-4c11-9a93-0c7cb0760390_rw_1920.jpg?h=4b7acd84a55b8adb4bed7916802070ab"
                    alt="Frogwell"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-center">Frogwell</span>
              </a>

              {/* Virk Pontelli */}
              <a
                href="https://linktr.ee/virkkk"
                target="_blank"
                className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-zinc-800 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-700 flex-shrink-0 relative">
                  <img
                    src="https://ugc.production.linktr.ee/T6qNiKmxSdqaAH0e1XhQ_33E481jTFuW56T8B"
                    alt="Virk"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-center">Virk</span>
              </a>

              {/* Aline Subi */}
              <a
                href="https://www.alinesubi.xyz/"
                target="_blank"
                className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-zinc-800 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-700 flex-shrink-0 relative">
                  <img
                    src="https://static.wixstatic.com/media/ab0adc_0487cc7ff4fd49c0abb53f46b86f523b~mv2.jpg/v1/fit/w_965,h_797,q_90,enc_avif,quality_auto/ab0adc_0487cc7ff4fd49c0abb53f46b86f523b~mv2.jpg"
                    alt="Aline"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-center">Aline</span>
              </a>

              {/* Furk */}
              <a
                href="https://www.furk-art.com/"
                target="_blank"
                className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-zinc-800 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-700 flex-shrink-0 relative">
                  <img
                    src="https://static.wixstatic.com/media/650e28_999a73b2df204830b5545c1879c2c95f~mv2.jpg/v1/fill/w_901,h_507,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Ferdy-web-2son.jpg"
                    alt="Furk"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-center">Furk</span>
              </a>

              {/* imverartis */}
              <a
                href="https://imverartis.carrd.co/"
                target="_blank"
                className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-zinc-800 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-700 flex-shrink-0 relative">
                  <img
                    src="https://imverartis.carrd.co/assets/images/image01.jpg"
                    alt="imverartis"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-center">imverartis</span>
              </a>

              {/* MrMocket */}
              <a
                href="https://www.mrmocket.com/"
                target="_blank"
                className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-zinc-800 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white dark:bg-zinc-700 flex-shrink-0 relative p-2">
                  <img
                    src="https://www.mrmocket.com/images/Mocket_bw.png"
                    alt="MrMocket"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-center">MrMocket</span>
              </a>
            </div>
          </div>
        </div>

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
