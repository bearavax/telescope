"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Home as HomeIcon, User, Wallet, TrendingUp, Newspaper } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { PageNavigation } from "@/components/page-navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserStats } from "@/hooks/use-user-stats";
import { Address } from "viem";
import { formatDistanceToNow } from "date-fns";

interface Thread {
  id: string;
  subject: string | null;
  bumpedAt: string;
  createdAt: string;
  replyCount: number;
  boardName: string;
  posts: Array<{
    id: string;
    comment: string;
  }>;
}

interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  source: string;
  image: string | null;
}

export default function Home() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { data: userStats, isLoading: isUserStatsLoading } = useUserStats(
    address as Address,
    isConnected
  );
  const [trendingThreads, setTrendingThreads] = useState<Thread[]>([]);
  const [recentArticles, setRecentArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch trending threads
      const boardsResponse = await fetch("/api/forum/boards");
      const boardsData = await boardsResponse.json();

      if (Array.isArray(boardsData)) {
        const threadsPromises = boardsData.map(async (board: any) => {
          const response = await fetch(`/api/forum/boards/${board.name}/threads`);
          const threads = await response.json();
          return Array.isArray(threads)
            ? threads.map((t: any) => ({ ...t, boardName: board.name }))
            : [];
        });

        const threadsArrays = await Promise.all(threadsPromises);
        const allThreads = threadsArrays.flat();

        const threadsWithScores = allThreads.map(thread => ({
          ...thread,
          trendingScore: calculateTrendingScore(thread)
        }));

        const trending = threadsWithScores
          .sort((a, b) => b.trendingScore - a.trendingScore)
          .slice(0, 6);

        setTrendingThreads(trending);
      }

      // Fetch recent news
      const newsResponse = await fetch("/api/news");
      const newsData = await newsResponse.json();
      if (Array.isArray(newsData)) {
        setRecentArticles(newsData.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrendingScore = (thread: Thread): number => {
    const now = new Date().getTime();
    const bumpedAt = new Date(thread.bumpedAt).getTime();
    const createdAt = new Date(thread.createdAt).getTime();
    const hoursSinceLastBump = (now - bumpedAt) / (1000 * 60 * 60);
    const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
    const engagementScore = (thread.replyCount * 10) / (hoursSinceLastBump + 2);
    const recencyBonus = hoursSinceCreation < 24 ? 5 : 0;
    return engagementScore + recencyBonus;
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-screen-lg mx-auto -mt-6 px-8 relative z-10 mb-16">
        <PageNavigation />

        <div className="space-y-6">
          {/* User Profile / Connect Wallet */}
          <Card className="p-6">
            {isConnected ? (
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Connected Wallet</p>
                  <p className="font-mono text-sm font-semibold">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
                {!isUserStatsLoading && userStats && (
                  <div className="min-w-[300px]">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-semibold">Level {userStats.level || 1}</span>
                      <span className="text-muted-foreground text-xs">
                        {userStats.xp || 0} XP • {userStats.xpToNextLevel || 21} XP until next level
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${((userStats.xp || 0) / (userStats.xpToNextLevel || 21)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-100 rounded-lg">
                  <Wallet className="h-6 w-6 text-zinc-600" />
                </div>
                <div>
                  <p className="font-semibold">Connect Your Wallet</p>
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to vote on projects and participate in the community
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Recent News */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Recent Articles
              </h2>
              <Link href="/news" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-48 bg-zinc-100 animate-pulse rounded-lg" />
                  ))}
                </>
              ) : recentArticles.length > 0 ? (
                recentArticles.slice(0, 6).map((article, idx) => (
                  <Link key={idx} href={article.link} target="_blank">
                    <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer h-full">
                      {article.image && (
                        <div className="w-full h-32 overflow-hidden">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4 flex flex-col gap-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{article.title}</h3>
                        <div className="flex gap-2 items-center">
                          <Badge variant="outline" className="text-xs">
                            {article.source}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card className="p-8 text-center col-span-3">
                  <p className="text-muted-foreground text-sm">No articles yet</p>
                </Card>
              )}
            </div>
          </div>

          {/* Trending Threads */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Threads
              </h2>
              <Link href="/forum" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-24 bg-zinc-100 animate-pulse rounded-lg" />
                  ))}
                </>
              ) : trendingThreads.length > 0 ? (
                trendingThreads.map((thread) => (
                  <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
                    <Card className="p-4 hover:border-primary transition-colors cursor-pointer h-full">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          {thread.subject && (
                            <h3 className="font-semibold text-sm truncate flex-1">
                              {thread.subject}
                            </h3>
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(thread.bumpedAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {thread.posts[0]?.comment || "No content"}
                        </p>
                        <div className="flex gap-2 items-center">
                          <Badge variant="outline" className="text-xs">
                            /{thread.boardName}/
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {thread.replyCount} replies
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card className="p-8 text-center col-span-3">
                  <p className="text-muted-foreground text-sm">No threads yet</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
