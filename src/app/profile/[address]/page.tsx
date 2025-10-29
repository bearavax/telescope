"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStats } from "@/hooks/use-user-stats";
import { useForumStats } from "@/hooks/use-forum-stats";
import { useAvaxBadge } from "@/hooks/use-avax-badge";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
// import { VoteStreak } from "@/components/vote-streak";
import { ConnectDiscordAlert } from "@/components/connect-discord-alert";
import { useUserDiscord } from "@/hooks/use-user-discord";
import { Address } from "viem";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { UserBadge } from "@/components/user-badge";
import { MessageSquare, ThumbsUp, Award, ExternalLink, Package, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface VoteHistory {
  votes: {
    projectId: string;
    projectName: string;
    votedDate: string;
    type: "like" | "dislike";
    season: string;
  }[];
  currentStreak: number;
  longestStreak: number;
}

interface ForumPost {
  id: string;
  comment: string;
  threadId: string;
  threadSubject: string | null;
  boardName: string;
  boardTitle: string;
  isOp: boolean;
  createdAt: string;
  imageHash: string | null;
}


export default function ProfilePage() {
  const params = useParams();
  const addressParam = params.address as Address;
  const [showVoteHistory, setShowVoteHistory] = useState(false);
  const [showForumPosts, setShowForumPosts] = useState(false);

  const { address: connectedAddress } = useAccount();
  const isOwnProfile = addressParam === connectedAddress;

  const { data: userStats, isLoading: isLoadingStats } = useUserStats(
    addressParam,
    !!addressParam
  );
  const { data: discordUser, isLoading: isLoadingDiscordUser } = useUserDiscord(
    userStats?.discordId || ""
  );
  const { data: forumStats, isLoading: isLoadingForumStats } = useForumStats(addressParam);
  const { data: avaxBadge } = useAvaxBadge(addressParam);

  const { data: voteHistory, isLoading: isLoadingHistory } =
    useQuery<VoteHistory>({
      queryKey: ["voteHistory", addressParam],
      queryFn: async () => {
        if (!addressParam) throw new Error("No address");
        const response = await fetch(`/api/users/${addressParam}/votes`);
        if (!response.ok) throw new Error("Failed to fetch vote history");
        return response.json();
      },
      enabled: !!addressParam,
    });

  const { data: forumPosts, isLoading: isLoadingForumPosts } =
    useQuery<ForumPost[]>({
      queryKey: ["forumPosts", addressParam],
      queryFn: async () => {
        if (!addressParam) throw new Error("No address");
        const response = await fetch(`/api/users/${addressParam}/forum-posts`);
        if (!response.ok) throw new Error("Failed to fetch forum posts");
        return response.json();
      },
      enabled: !!addressParam && showForumPosts, // Only load when dialog is open
    });

  const { data: collectables, isLoading: isLoadingCollectables } =
    useQuery<any[]>({
      queryKey: ["collectables", addressParam],
      queryFn: async () => {
        if (!addressParam) throw new Error("No address");
        const response = await fetch(`/api/collectables?address=${addressParam}`);
        if (!response.ok) throw new Error("Failed to fetch collectables");
        const data = await response.json();
        return data.filter((c: any) => c.hasClaimed);
      },
      enabled: !!addressParam,
    });


  if (!addressParam) {
    return (
      <div className="w-full max-w-screen-lg mx-auto -mt-6 px-8 relative z-10 mb-16 bg-white dark:bg-zinc-800 rounded-lg py-16 shadow flex items-center justify-center flex-col gap-4">
        <div className="flex flex-col items-center">
          <Skeleton className="w-64 h-6 mb-4" />
          <Skeleton className="w-48 h-4" />
        </div>
      </div>
    );
  }

  if (isLoadingStats || isLoadingHistory || isLoadingDiscordUser) {
    return (
      <div className="w-full max-w-screen-lg mx-auto -mt-6 px-8 relative z-10 mb-16">
        {/* Discord Alert Skeleton */}
        {isOwnProfile && !discordUser && (
          <div className="mb-8">
            <div className="w-full h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>
        )}

        {/* Profile Header Skeleton */}
        <div className="bg-white dark:bg-zinc-800 rounded-md shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-700 animate-pulse" />
              <div className="space-y-2">
                <div className="w-48 h-6 rounded bg-zinc-100 dark:bg-zinc-700 animate-pulse" />
                <div className="w-32 h-4 rounded bg-zinc-100 dark:bg-zinc-700 animate-pulse" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="w-24 h-6 rounded bg-zinc-100 dark:bg-zinc-700 animate-pulse ml-auto" />
              <div className="w-40 h-4 rounded bg-zinc-100 dark:bg-zinc-700 animate-pulse ml-auto" />
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <div className="w-32 h-6 rounded bg-zinc-100 dark:bg-zinc-700 animate-pulse mb-4" />
            <div className="w-20 h-10 rounded bg-zinc-100 dark:bg-zinc-700 animate-pulse mb-2" />
            <div className="w-24 h-4 rounded bg-zinc-100 dark:bg-zinc-700 animate-pulse" />
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <div className="w-32 h-6 rounded bg-zinc-100 dark:bg-zinc-700 animate-pulse mb-4" />
            <div className="w-20 h-10 rounded bg-zinc-100 dark:bg-zinc-700 animate-pulse mb-2" />
            <div className="w-24 h-4 rounded bg-zinc-100 dark:bg-zinc-700 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-lg mx-auto -mt-6 px-4 md:px-8 relative z-10 mb-8 md:mb-16">
      {/* Show Discord alert if no Discord account is connected and on own profile */}
      {isOwnProfile && !discordUser && (
        <div className="mb-8">
          <ConnectDiscordAlert />
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white dark:bg-zinc-800 rounded-md shadow p-4 md:p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {discordUser?.avatar_url ? (
                <AvatarImage
                  src={discordUser.avatar_url}
                  alt={discordUser.username}
                />
              ) : (
                <AvatarFallback>
                  {addressParam?.substring(2, 4).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                {discordUser?.global_name ||
                  `${addressParam?.substring(0, 6)}...${addressParam?.substring(
                    38
                  )}`}
                <UserBadge address={addressParam} />
              </h1>
              {/* TODO: Create badge component */}
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {discordUser?.username &&
                  `${addressParam?.substring(0, 6)}...
                ${addressParam?.substring(38)} • @${discordUser.username}`}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto text-left sm:text-right flex-shrink-0">
            <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Level {userStats?.level}
            </p>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
              {userStats?.xp} XP • {userStats?.xpForNextLevel} XP until next level
            </p>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {(avaxBadge || forumStats?.isSuperOG || (voteHistory && voteHistory.votes.length > 0)) && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges
          </h2>
          <div className="flex flex-wrap gap-4 items-center">
            {avaxBadge && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  {avaxBadge.classOf}
                </Badge>
                <a
                  href={`https://snowtrace.io/tx/${avaxBadge.firstTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                >
                  First tx: {format(new Date(avaxBadge.firstTxDate), 'MMM d, yyyy')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {forumStats?.isSuperOG && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  Super OG
                </Badge>
                <span className="text-xs text-muted-foreground">First 100 to post on forum</span>
              </div>
            )}
            {voteHistory && (() => {
              const seasons = new Set<string>();
              voteHistory.votes.forEach(vote => {
                if (vote.season === 'Season 1') seasons.add('Season 1');
                if (vote.season === 'Current Season') seasons.add('Season 2');
              });
              return Array.from(seasons).sort().map(season => (
                <div key={season} className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    {season === 'Season 1' ? 'Season 1 Participant' : 'Season 2 Participant'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Voted in {season === 'Season 1' ? 'S1' : 'S2'}</span>
                </div>
              ));
            })()}
          </div>
        </Card>
      )}

      {/* Collectables Grid - 20 boxes */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Collectables
        </h2>
        {isLoadingCollectables ? (
          <div className="flex gap-3 flex-wrap">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="w-20 h-20" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 flex-wrap">
            {Array.from({ length: 10 }).map((_, index) => {
              const collectable = collectables?.[index];
              const isLocked = !collectable;
              const isSnowdog = collectable?.name === 'Snowdog';
              
              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isLocked
                        ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                        : isSnowdog
                        ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border-blue-400 dark:border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.6)]'
                        : 'bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border-zinc-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-600'
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
                    ) : (
                      <img
                        src={collectable.imageUrl}
                        alt={collectable.name}
                        className={`object-contain ${isSnowdog ? 'w-[180%] h-[180%]' : 'w-full h-full p-2'}`}
                      />
                    )}
                  </div>
                  <span className={`text-[10px] text-center ${
                    isLocked 
                      ? 'text-zinc-600 dark:text-zinc-400' 
                      : isSnowdog 
                      ? 'text-blue-500 dark:text-blue-300 font-semibold' 
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {isLocked ? 'redacted' : collectable.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Forum Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Forum Activity
          </h2>
          {isLoadingForumStats ? (
            <div className="space-y-3">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
            </div>
          ) : forumStats ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                    {forumStats.totalPosts}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Posts</div>
                </div>
              </div>
              {forumStats.boardsPostedIn && forumStats.boardsPostedIn.length > 0 && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="text-xs text-muted-foreground mb-2">Most Active Boards</div>
                  <div className="flex flex-wrap gap-2">
                    {forumStats.boardsPostedIn.slice(0, 3).map((board) => (
                      <a
                        key={board.name}
                        href={`/forum/${board.name}`}
                        className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        /{board.name}/
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {isOwnProfile && forumStats && forumStats.totalPosts > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForumPosts(true)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>View Post History</span>
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No forum activity yet</p>
          )}
        </Card>

        {/* Project Voting Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Voting Activity
          </h2>
          {isLoadingHistory ? (
            <div className="space-y-3">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
            </div>
          ) : voteHistory ? (
            <>
              {(() => {
                const season1Count = voteHistory.votes.filter(v => v.season === 'Season 1').length;
                const season2Count = voteHistory.votes.filter(v => v.season === 'Current Season').length;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                          {voteHistory.votes.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Votes</div>
                      </div>
                    </div>
                    {(season1Count > 0 || season2Count > 0) && (
                      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
                        <div className="text-xs text-muted-foreground mb-2">Seasons Participated</div>
                        <div className="flex flex-wrap gap-2">
                          {season1Count > 0 && (
                            <div className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded flex items-center gap-1">
                              Season 1
                              <span className="font-semibold ml-1">({season1Count})</span>
                            </div>
                          )}
                          {season2Count > 0 && (
                            <div className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded flex items-center gap-1">
                              Season 2
                              <span className="font-semibold ml-1">({season2Count})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {isOwnProfile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowVoteHistory(true)}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>View Vote History</span>
                      </Button>
                    )}
                  </div>
                );
              })()}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No voting activity yet</p>
          )}
        </Card>
      </div>

      {/* Vote Streak */}
      {/* <VoteStreak /> */}

      {/* Vote History Modal */}
      <Dialog open={showVoteHistory} onOpenChange={setShowVoteHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" />
              Your Voting History
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {voteHistory && voteHistory.votes.length > 0 ? (
              <>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {voteHistory.votes.map((vote) => (
                    <div
                      key={`${vote.projectId}-${vote.votedDate}`}
                      className="p-4 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors rounded"
                    >
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {vote.projectName}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                          <span>
                            {formatDistanceToNow(new Date(vote.votedDate), {
                              addSuffix: true,
                            })}
                          </span>
                          <span>•</span>
                          <span>Season {vote.season === 'Season 1' ? '1' : '2'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${vote.type === "like" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                          {vote.type === "like" ? "👍" : "👎"}
                        </span>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">+1 XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">No votes yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Forum Posts Modal */}
      <Dialog open={showForumPosts} onOpenChange={setShowForumPosts}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Your Forum Activity
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {forumPosts && forumPosts.length > 0 ? (
              <div className="space-y-3">
                {forumPosts.map((post) => (
                  <a
                    key={post.id}
                    href={`/forum/${post.boardName}/${post.threadId}`}
                    className="p-4 block hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors rounded-lg border border-zinc-200 dark:border-zinc-700"
                    onClick={() => setShowForumPosts(false)}
                  >
                    <div className="flex items-start gap-4">
                      {post.imageHash && (
                        <img
                          src={`https://ipfs.io/ipfs/${post.imageHash}`}
                          alt="Post attachment"
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={post.isOp ? "default" : "secondary"} className="text-xs">
                            {post.isOp ? "Thread" : "Reply"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            /{post.boardName}/
                          </span>
                        </div>
                        {post.threadSubject && (
                          <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-2">
                            {post.threadSubject}
                          </p>
                        )}
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 mb-2">
                          {post.comment}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <span>
                            {formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <span>•</span>
                          <span>{post.boardTitle}</span>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No posts yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
