"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Board {
  id: string;
  name: string;
  title: string;
  description: string;
  _count: {
    threads: number;
  };
}

interface Thread {
  id: string;
  subject: string | null;
  bumpedAt: string;
  createdAt: string;
  replyCount: number;
  boardId: string;
  posts: Array<{
    id: string;
    comment: string;
    posterId: string;
  }>;
}

interface BoardWithThreads extends Board {
  threads: Thread[];
}

export function ForumOverview() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [recentThreads, setRecentThreads] = useState<Array<Thread & { boardName: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBoards: 0, totalThreads: 0 });

  useEffect(() => {
    fetchForumData();
  }, []);

  const calculateTrendingScore = (thread: Thread): number => {
    const now = new Date().getTime();
    const bumpedAt = new Date(thread.bumpedAt).getTime();
    const createdAt = new Date(thread.createdAt).getTime();

    const hoursSinceLastBump = (now - bumpedAt) / (1000 * 60 * 60);
    const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

    // Trending score: higher for more replies, recent activity, and newer threads
    // Formula: (replies * 10) / (hours since bump + 2) + bonus for new threads
    const engagementScore = (thread.replyCount * 10) / (hoursSinceLastBump + 2);
    const recencyBonus = hoursSinceCreation < 24 ? 5 : 0;

    return engagementScore + recencyBonus;
  };

  const fetchForumData = async () => {
    try {
      // Fetch boards
      const boardsResponse = await fetch("/api/forum/boards");
      const boardsData = await boardsResponse.json();

      if (Array.isArray(boardsData)) {
        setBoards(boardsData);

        // Calculate stats
        const totalThreads = boardsData.reduce((sum, board) => sum + board._count.threads, 0);
        setStats({
          totalBoards: boardsData.length,
          totalThreads
        });

        // Fetch threads from all boards
        const threadsPromises = boardsData.map(async (board) => {
          const response = await fetch(`/api/forum/boards/${board.name}/threads`);
          const threads = await response.json();
          return Array.isArray(threads)
            ? threads.map((t: Thread) => ({ ...t, boardName: board.name }))
            : [];
        });

        const threadsArrays = await Promise.all(threadsPromises);
        const allThreads = threadsArrays.flat();

        // Calculate trending scores and sort
        const threadsWithScores = allThreads.map(thread => ({
          ...thread,
          trendingScore: calculateTrendingScore(thread)
        }));

        const trendingThreads = threadsWithScores
          .sort((a, b) => b.trendingScore - a.trendingScore)
          .slice(0, 10);

        setRecentThreads(trendingThreads);
      }
    } catch (error) {
      console.error("Error fetching forum data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trending Threads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Threads
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentThreads.length > 0 ? (
            recentThreads.map((thread) => (
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
            <Card className="p-8 text-center col-span-2">
              <p className="text-muted-foreground text-sm">No threads yet</p>
            </Card>
          )}
        </div>
      </div>

      {/* All Boards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Boards
          </h2>
        </div>
        <div className="space-y-6">
          {/* General Discussion */}
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-2">General Discussion</h3>
            <Card className="overflow-hidden">
              <div className="divide-y">
                {boards.filter(b => ['gen', 'drama'].includes(b.name)).sort((a, b) => {
                  const order = ['gen', 'drama'];
                  return order.indexOf(a.name) - order.indexOf(b.name);
                }).map((board) => (
                  <Link key={board.id} href={`/forum/${board.name}`}>
                    <div className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <h3 className="font-bold text-sm whitespace-nowrap text-primary">
                            /{board.name}/
                          </h3>
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 flex-1 min-w-0">
                            <span className="font-semibold text-sm truncate">
                              {board.title}
                            </span>
                            <span className="text-xs text-muted-foreground truncate hidden md:block">
                              - {board.description}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {board._count.threads}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Development & Technical */}
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-2">Development & Technical</h3>
            <Card className="overflow-hidden">
              <div className="divide-y">
                {boards.filter(b => ['tech', 'dev', 'sec', 'bridge'].includes(b.name)).map((board) => (
                  <Link key={board.id} href={`/forum/${board.name}`}>
                    <div className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <h3 className="font-bold text-sm whitespace-nowrap text-primary">
                            /{board.name}/
                          </h3>
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 flex-1 min-w-0">
                            <span className="font-semibold text-sm truncate">
                              {board.title}
                            </span>
                            <span className="text-xs text-muted-foreground truncate hidden md:block">
                              - {board.description}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {board._count.threads}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* DeFi & Trading */}
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-2">DeFi & Trading</h3>
            <Card className="overflow-hidden">
              <div className="divide-y">
                {boards.filter(b => ['defi', 'price', 'rwa', 'meme'].includes(b.name)).sort((a, b) => {
                  const order = ['defi', 'price', 'rwa', 'meme'];
                  return order.indexOf(a.name) - order.indexOf(b.name);
                }).map((board) => (
                  <Link key={board.id} href={`/forum/${board.name}`}>
                    <div className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <h3 className="font-bold text-sm whitespace-nowrap text-primary">
                            /{board.name}/
                          </h3>
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 flex-1 min-w-0">
                            <span className="font-semibold text-sm truncate">
                              {board.title}
                            </span>
                            <span className="text-xs text-muted-foreground truncate hidden md:block">
                              - {board.description}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {board._count.threads}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Projects & Applications */}
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-2">Projects & Applications</h3>
            <Card className="overflow-hidden">
              <div className="divide-y">
                {boards.filter(b => ['nft', 'game', 'eco'].includes(b.name)).map((board) => (
                  <Link key={board.id} href={`/forum/${board.name}`}>
                    <div className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <h3 className="font-bold text-sm whitespace-nowrap text-primary">
                            /{board.name}/
                          </h3>
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 flex-1 min-w-0">
                            <span className="font-semibold text-sm truncate">
                              {board.title}
                            </span>
                            <span className="text-xs text-muted-foreground truncate hidden md:block">
                              - {board.description}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {board._count.threads}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Governance & Institutional */}
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-2">Governance & Institutional</h3>
            <Card className="overflow-hidden">
              <div className="divide-y">
                {boards.filter(b => ['gov', 'inst', 'adopt', 'reg'].includes(b.name)).map((board) => (
                  <Link key={board.id} href={`/forum/${board.name}`}>
                    <div className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <h3 className="font-bold text-sm whitespace-nowrap text-primary">
                            /{board.name}/
                          </h3>
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 flex-1 min-w-0">
                            <span className="font-semibold text-sm truncate">
                              {board.title}
                            </span>
                            <span className="text-xs text-muted-foreground truncate hidden md:block">
                              - {board.description}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {board._count.threads}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Boards</p>
              <p className="text-2xl font-bold">{stats.totalBoards}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Threads</p>
              <p className="text-2xl font-bold">{stats.totalThreads}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Now</p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
