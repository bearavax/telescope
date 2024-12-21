"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ConnectButton } from "@/components/connect-button";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { VoteButton } from "@/components/vote-button";
import { LeaderboardItem } from "@/types";
import { HomeIcon, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
// import { Input } from "@/components/ui/input";

interface VotingStatusProps {
  isLocked: boolean;
  nextVoteTime: Date | null;
}

const VotingStatusMessage = React.memo(
  ({ isLocked, nextVoteTime }: VotingStatusProps) => {
    if (!isLocked) {
      return (
        <div className="text-sm text-zinc-900 font-medium bg-white px-4 py-2 rounded-lg border-white border-2 flex items-center gap-2 shadow">
          You can vote now! 🎉
        </div>
      );
    }

    if (nextVoteTime) {
      const timeRemaining = nextVoteTime.getTime() - Date.now();
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );

      return (
        <div className="text-sm text-zinc-900 font-medium bg-white px-4 py-2 rounded-lg border-white border-2 flex items-center gap-2 shadow">
          You can vote again in {hoursRemaining}h {minutesRemaining}m ⏰
        </div>
      );
    }

    return null;
  }
);

VotingStatusMessage.displayName = "VotingStatusMessage";

export default function Home() {
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const [isVotingLocked, setIsVotingLocked] = useState(false);
  const [nextVoteTime, setNextVoteTime] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session, status } = useSession();

  const {
    data: projects,
    isLoading,
    isError,
  } = useQuery<LeaderboardItem[], Error>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch projects.");
      }
      return response.json();
    },
    staleTime: 0, // Consider data stale immediately
    gcTime: 0, // Remove data from cache immediately when unused
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  // Check global voting status when component mounts or address changes
  useEffect(() => {
    const checkGlobalVotingStatus = async () => {
      if (isConnected && address) {
        try {
          const response = await fetch(
            `/api/users/voting-status?walletAddress=${address}`
          );
          if (response.ok) {
            const data = await response.json();
            setIsVotingLocked(data.isLocked);
            if (data.isLocked && data.nextVoteTime) {
              setNextVoteTime(new Date(data.nextVoteTime));
            } else {
              setNextVoteTime(null);
            }
          }
        } catch (error) {
          console.error("Failed to fetch voting status:", error);
        }
      }
    };

    checkGlobalVotingStatus();
  }, [isConnected, address]);

  const handleVoteSuccess = useCallback(() => {
    setIsVotingLocked(true);
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }, [queryClient]);

  useEffect(() => {
    const associateWallet = async () => {
      if (status === "authenticated" && address && session?.user?.id) {
        try {
          const response = await fetch("/api/users/associate-wallet", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: session.user.id,
              walletAddress: address,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to associate wallet address");
          }

          const data = await response.json();
          console.log(data.message);
        } catch (error) {
          console.error(error);
        }
      }
    };

    associateWallet();
  }, [status, address, session]);

  return (
    <div className="w-full">
      <header className="w-full bg-white dark:bg-zinc-900 bg border-b-4 border-zinc-100 dark:border-zinc-700">
        <div className="w-full max-w-screen-lg mx-auto pt-24 px-8 flex items-start justify-between  md:flex-row">
          <img
            src="/logo.png"
            alt="Telescope"
            className="w-52 md:w-80 flex items-end"
          />
          <div className="flex items-center gap-2">
            {/* <div className="mt-4 md:mt-0 md:ml-8 w-full md:w-64">
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4  bg-white border-white border-2 shadow-md"
              />
            </div> */}
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="w-full max-w-screen-lg mx-auto -mt-6 px-8 relative z-10 mb-16">
        <Tabs defaultValue="projects">
          <div className="flex items-start md:items-center justify-between mb-6 flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <a
                href="https://isbjorn.co.nz"
                className="px-4 py-2 font-bold text-md bg-white border-white border-2 rounded-md shadow"
              >
                <HomeIcon className="w-6 h-6" />
              </a>
              <TabsList className="gap-2 bg-transparent m-0 p-0">
                <TabsTrigger
                  value="projects"
                  className="px-4 py-2 font-bold text-md bg-white border-white border-2"
                >
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="artists"
                  className="px-4 py-2 font-bold text-md bg-white relative border-white border-2"
                >
                  <Badge className="absolute -top-3 -right-6 text-xs bg-sky-900 text-white hover:bg-sky-900 border-white">
                    Soon
                  </Badge>
                  Artists
                </TabsTrigger>
              </TabsList>
            </div>

            {isConnected ? (
              <VotingStatusMessage
                isLocked={isVotingLocked}
                nextVoteTime={nextVoteTime}
              />
            ) : (
              <div className="text-sm text-zinc-900 font-medium bg-white px-4 py-2 rounded-lg border-white border-2 flex items-center gap-2 shadow">
                <span>Connect your wallet to vote</span>
                <img src="/telescope.svg" className="w-4 h-4" />
              </div>
            )}
          </div>
          <TabsContent value="projects" className="tab-content">
            <LeaderboardTable
              items={filteredProjects || []}
              renderMetadata={(item) => {
                if (!item.metadata) return null;
                return (
                  <div className="flex flex-col items-end mr-4">
                    <div className="text-base font-medium text-zinc-700 dark:text-zinc-200">
                      {item.metadata.votes.toLocaleString()} votes
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                      <Users className="h-3 w-3" />
                      <span>
                        {item.metadata.voters.toLocaleString()} voters
                      </span>
                    </div>
                  </div>
                );
              }}
              renderActions={(item) => (
                <VoteButton
                  projectId={item.id.toString()}
                  onVoteSuccess={handleVoteSuccess}
                  isGloballyDisabled={isVotingLocked}
                />
              )}
              isLoading={isLoading}
              isError={isError}
            />
          </TabsContent>
          <TabsContent value="artists" className="tab-content">
            <div className="w-full bg-white rounded-lg py-16 shadow flex items-center justify-center flex-col gap-4">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold">Coming soon</h2>
                <span className=" text-zinc-500">
                  Join our Discord to apply
                </span>
              </div>
              <a
                href="https://discord.gg/K4z7xxFVGc"
                target="_blank"
                className="snow-button"
              >
                Apply now
              </a>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
