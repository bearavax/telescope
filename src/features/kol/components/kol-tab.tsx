"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ExternalLink, TrendingUp, RefreshCw } from "lucide-react";
import { getTextColorClass } from "@/shared/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

interface KOL {
  id: string;
  name: string;
  symbol: string;
  description: string;
  category: 'dev' | 'artist' | 'meme' | 'gamer';
  contractAddress: string;
  marketCap: number;
  price: number;
  volume24h: number;
  dailyChange: number;
  hasValidMarketCap: boolean;
  rank?: number;
  avatar?: string;
  yourWorthUrl?: string;
  dexScreenerUrl?: string;
  arenaProUrl?: string;
  lastPriceUpdate?: string;
  holders?: number;
}

export const KOLTab = () => {
  // Remove category state since we don't need categories
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch KOLs from API
  const {
    data: kols = [],
    isLoading,
    isError,
    refetch
  } = useQuery<KOL[]>({
    queryKey: ["kols"],
    queryFn: async () => {
      const response = await fetch(
        `/api/kol?category=all&limit=50`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch KOLs");
      }
      return response.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 120000, // Refetch every 2 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger price updates
      await fetch('/api/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'update-prices' })
      });
      
      // Refetch data
      await refetch();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleScrapeKOL = async () => {
    setIsRefreshing(true);
    try {
      // Trigger price updates first
      await fetch('/api/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'update-prices' })
      });
      
      // Then trigger KOL scraping from YourWorth
      const response = await fetch('/api/scrape-kol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('KOL scraping completed:', result);
        
        // Refetch data to show new KOLs
        await refetch();
      } else {
        console.error('KOL scraping failed:', response.status);
      }
    } catch (error) {
      console.error('Error updating KOL data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const getDexScreenerUrl = (address: string) => {
    return `https://dexscreener.com/avalanche/${address}`;
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="season1" className="w-full">
        <TabsList className="bg-transparent flex gap-2 justify-start mb-6">
          <TabsTrigger
            value="season1"
            className="px-4 py-2 font-bold text-sm bg-white border-white border-2 cursor-not-allowed opacity-60 flex items-center gap-2"
            disabled
          >
            <span>Season 1</span>
            <span className="text-xs text-gray-500 font-normal">Coming Soon</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="season1" className="mt-4">
          {/* Separate launched and pre-launch tokens */}
          {(() => {
            const launchedTokens = kols.filter(kol => kol.hasValidMarketCap);
            const preLaunchTokens = kols.filter(kol => !kol.hasValidMarketCap);
            
            return (
              <>
                {/* Rankings Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Rankings</h3>
                    <div className="flex items-center gap-2">
                      <a
                        href="https://yourworth.launchpd.xyz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Create Token
                      </a>
                      <button
                        onClick={handleScrapeKOL}
                        disabled={isRefreshing || isLoading}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={`h-3 w-3 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Updating...' : 'Refresh'}
                      </button>
                    </div>
                  </div>
              {launchedTokens.length > 0 ? (
                <div className="space-y-4">
                  {launchedTokens.map((kol, index) => {
                    const rank = kol.rank || index + 1;
                    return (
                      <div
                        key={kol.id}
                        className={`flex flex-col md:flex-row items-center gap-4 rounded-lg pl-4 pr-4 md:pr-8 py-4 shadow transition-all hover:shadow-md border ${
                          rank === 1
                            ? "border-yellow-400 bg-[#fff0c3]"
                            : rank === 2
                            ? "border-gray-300 bg-[#f0f0f0]"
                            : rank === 3
                            ? "border-amber-600 bg-[#f8e1c4]"
                            : "border-zinc-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-zinc-400">#{rank}</div>
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={kol.avatar} alt={kol.name} />
                            <AvatarFallback className="bg-zinc-100 text-zinc-600 font-bold">
                              {kol.symbol?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="font-bold text-lg text-zinc-800">{kol.name}</div>
                            <div className="text-sm text-zinc-500">({kol.symbol})</div>
                          </div>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                          <div className="text-sm text-zinc-600 mb-1">{kol.description}</div>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span>Contract: {kol.contractAddress.slice(0, 6)}...{kol.contractAddress.slice(-4)}</span>
                            {kol.holders && <span>{kol.holders} holders</span>}
                          </div>
                          <div className="mt-2">
                            <a
                              href={getDexScreenerUrl(kol.contractAddress)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              DexScreener
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex md:hidden flex-col items-end">
                          <div className="flex items-center gap-1 text-lg font-bold text-zinc-800">
                            <TrendingUp className="h-4 w-4" />
                            {formatMarketCap(kol.marketCap)}
                          </div>
                          <div className="text-xs text-zinc-500">Market Cap</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-zinc-50 rounded-lg border-2 border-dashed border-zinc-200">
                  <div className="text-6xl mb-4">🏆</div>
                  <h4 className="text-xl font-bold text-zinc-600 mb-2">Waiting for First Graduation</h4>
                  <p className="text-zinc-500 mb-4">When tokens launch and get market caps, they'll appear here ranked by value.</p>
                  <div className="text-sm text-zinc-400">
                    Once 10 tokens graduate, Season 1 will begin
                  </div>
                </div>
              )}
            </div>

            {/* Pre-Launch Tokens Waiting Area */}
            {preLaunchTokens.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Waiting Area</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {preLaunchTokens.map((kol, index) => (
                    <div
                      key={kol.id}
                      className="flex flex-col items-center gap-3 rounded-lg p-4 border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors group h-64"
                    >
                      <Avatar className="h-16 w-16 group-hover:scale-105 transition-transform">
                        <AvatarImage src={kol.avatar} alt={kol.name} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                          {kol.symbol?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center flex-1 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-lg text-zinc-800 group-hover:text-orange-700 transition-colors">{kol.name}</div>
                          <div className="text-sm text-zinc-500 mb-2">({kol.symbol})</div>
                          <div className="text-xs text-zinc-600 mb-3 line-clamp-2">{kol.description}</div>
                        </div>
                        <a
                          href={kol.arenaProUrl || `https://www.arenapro.io/swap?inputCurrency=AVAX&outputCurrency=${kol.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="snow-button text-center mt-auto mx-auto block"
                          style={{
                            backgroundImage: 'linear-gradient(to bottom, #f97316, #ea580c, #c2410c), linear-gradient(to bottom, #ea580c, #c2410c)',
                            backgroundClip: 'padding-box, border-box',
                            width: '100%',
                            maxWidth: '120px'
                          }}
                        >
                          Invest
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      })()}

          {/* Loading and Error States */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-zinc-200 p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-zinc-300 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-zinc-300 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load KOL data</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : kols.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 mb-2">No KOLs found</p>
              <p className="text-sm text-zinc-400">Check back later as new tokens are added</p>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};