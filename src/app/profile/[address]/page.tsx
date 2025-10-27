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
import { MessageSquare, ThumbsUp, Award, ExternalLink, ChevronDown, ChevronUp, Flame, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

export default function ProfilePage() {
  const params = useParams();
  const addressParam = params.address as Address;
  const [isVoteHistoryExpanded, setIsVoteHistoryExpanded] = useState(false);

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
  const { data: avaxBadge, isLoading: isLoadingAvaxBadge } = useAvaxBadge(addressParam);

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

  if (!addressParam) {
    return (
      <div className="w-full max-w-screen-lg mx-auto -mt-6 px-8 relative z-10 mb-16 bg-white rounded-lg py-16 shadow flex items-center justify-center flex-col gap-4">
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
            <Skeleton className="w-full h-12" />
          </div>
        )}

        {/* Profile Header Skeleton */}
        <div className="bg-white rounded-md shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div>
                <Skeleton className="w-48 h-6 mb-2" />
                <Skeleton className="w-32 h-4" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="w-24 h-6 mb-2" />
              <Skeleton className="w-40 h-4" />
            </div>
          </div>
        </div>

        {/* Vote History Skeleton */}
        {isOwnProfile && (
          <div className="bg-white rounded-md shadow">
            <div className="p-4 border-b">
              <Skeleton className="w-32 h-6" />
            </div>
            <div className="divide-y">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="p-4 flex items-center justify-between hover:bg-zinc-50"
                >
                  <div>
                    <Skeleton className="w-40 h-4 mb-2" />
                    <Skeleton className="w-24 h-3" />
                  </div>
                  <Skeleton className="w-16 h-4" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-lg mx-auto -mt-6 px-8 relative z-10 mb-16">
      {/* Show Discord alert if no Discord account is connected and on own profile */}
      {isOwnProfile && !discordUser && (
        <div className="mb-8">
          <ConnectDiscordAlert />
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-md shadow p-6 mb-8">
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                {discordUser?.global_name ||
                  `${addressParam?.substring(0, 6)}...${addressParam?.substring(
                    38
                  )}`}
                <UserBadge address={addressParam} />
              </h1>
              {/* TODO: Create badge component */}
              <p className="text-sm text-zinc-500">
                {discordUser?.username &&
                  `${addressParam?.substring(0, 6)}...
                ${addressParam?.substring(38)} • @${discordUser.username}`}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold text-zinc-900">
              Level {userStats?.level}
            </p>
            <p className="text-sm text-zinc-700 whitespace-nowrap">
              {userStats?.xp} XP • {userStats?.xpForNextLevel} XP until next level
            </p>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {(avaxBadge || forumStats?.isSuperOG || (voteHistory && voteHistory.votes.length > 0)) && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Forum Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Threads</span>
                <span className="font-semibold">{forumStats.totalThreads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Replies</span>
                <span className="font-semibold">{forumStats.totalReplies}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No forum activity yet</p>
          )}
        </Card>

        {/* Project Voting Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
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
                // Determine first season user voted in by finding earliest vote
                const sortedVotes = [...voteHistory.votes].sort((a, b) =>
                  new Date(a.votedDate).getTime() - new Date(b.votedDate).getTime()
                );

                let firstSeason = 'N/A';
                if (sortedVotes.length > 0) {
                  const firstVote = sortedVotes[0];
                  if (firstVote.season === 'Season 1') firstSeason = '1';
                  else if (firstVote.season === 'Current Season') firstSeason = '2';
                }

                return (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Votes</span>
                      <span className="font-semibold">{voteHistory.votes.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">First Season</span>
                      <span className="font-semibold">{firstSeason}</span>
                    </div>
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

      {/* Vote History (only on own profile) */}
      {isOwnProfile && voteHistory && voteHistory.votes.length > 0 && (
        <div className="bg-white rounded-md shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900">
              Vote History
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVoteHistoryExpanded(!isVoteHistoryExpanded)}
              className="flex items-center gap-2"
            >
              {isVoteHistoryExpanded ? (
                <>
                  <span className="text-sm">Show Less</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span className="text-sm">Show All ({voteHistory.votes.length})</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <div className="divide-y">
            {(isVoteHistoryExpanded ? voteHistory.votes : voteHistory.votes.slice(0, 5)).map((vote) => (
              <div
                key={`${vote.projectId}-${vote.votedDate}`}
                className="p-4 flex items-center justify-between hover:bg-zinc-50"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {vote.projectName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
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
                  <span className={`text-sm ${vote.type === "like" ? "text-green-600" : "text-red-600"}`}>
                    {vote.type === "like" ? "👍" : "👎"}
                  </span>
                  <div className="text-sm text-zinc-500">+1 XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
