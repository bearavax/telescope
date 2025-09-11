"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { LeaderboardTable } from "@/features/kol/components/leaderboard-table";
import { LeaderboardItem } from "@/types";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { getTextColorClass } from "@/shared/utils/utils";
import { Categories } from "@/features/projects/components/categories";

export default function ProjectsTab() {
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get("tag") || undefined;


  const {
    data: projects,
    isLoading,
    isError,
  } = useQuery<LeaderboardItem[], Error>({
    queryKey: ["projects", selectedTag],
    queryFn: async () => {
      const response = await fetch(
        `/api/projects${selectedTag ? `?tag=${selectedTag}` : ""}`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch projects.");
      }
      return response.json();
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
  });

  const {
    data: season1Projects,
    isLoading: isLoadingSeason1,
    isError: isErrorSeason1,
  } = useQuery<LeaderboardItem[], Error>({
    queryKey: ["season1-projects", selectedTag],
    queryFn: async () => {
      console.log("Fetching Season 1 projects...");
      const response = await fetch(
        `/api/projects/season1${selectedTag ? `?tag=${selectedTag}` : ""}`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );
      if (!response.ok) {
        console.error("Failed to fetch Season 1 projects:", response.status);
        throw new Error("Failed to fetch season 1 projects.");
      }
      const data = await response.json();
      console.log("Received Season 1 projects:", data.length);
      return data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
  });

  return (
    <div className="w-full">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="bg-transparent flex gap-2 justify-start">
          <TabsTrigger
            value="season3"
            className="px-4 py-2 font-bold text-sm bg-white border-white border-2 cursor-not-allowed opacity-60 flex items-center gap-2"
            disabled
          >
            <span>Season 3</span>
            <span className="text-xs text-gray-500 font-normal">Coming Soon</span>
          </TabsTrigger>
          <TabsTrigger
            value="current"
            className="px-4 py-2 font-bold text-sm bg-white border-white border-2 flex items-center gap-2"
          >
            <span>Season 2</span>
            <span className="text-xs text-gray-500 font-normal">May 25</span>
          </TabsTrigger>
          <TabsTrigger
            value="season1"
            className="px-4 py-2 font-bold text-sm bg-white border-white border-2 flex items-center gap-2"
          >
            <span>Season 1</span>
            <span className="text-xs text-gray-500 font-normal">Feb 25</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="current" className="mt-4">
          <div className="flex gap-1 flex-col mb-4">
            <h3 className="font-bold">Categories</h3>
            <Categories />
          </div>
          <LeaderboardTable
            items={(projects || [])
              .sort((a, b) => {
                const aVotes = (a.metadata?.likes || 0) + (a.metadata?.dislikes || 0);
                const bVotes = (b.metadata?.likes || 0) + (b.metadata?.dislikes || 0);
                return bVotes - aVotes;
              })
              .map((item, idx) => ({ ...item, rank: idx + 1 }))}
            renderMetadata={(item) => {
              if (!item.metadata) return null;

              return (
                <div className="flex flex-col items-end mr-4">
                  <div className="text-base font-medium text-zinc-700 dark:text-zinc-200">
                    {item.metadata.likes + item.metadata.dislikes} votes
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs ${getTextColorClass(
                      item.rank
                    )}`}
                  >
                    <Users className="h-3 w-3" />
                    <span>
                      {item.metadata.voters.toLocaleString()} voters
                    </span>
                  </div>
                </div>
              );
            }}
            isLoading={isLoading}
            isError={isError}
          />
        </TabsContent>
        <TabsContent value="season1" className="mt-4">
          <div className="flex gap-1 flex-col mb-4">
            <h3 className="font-bold">Categories</h3>
            <Categories />
          </div>
          {isLoadingSeason1 ? (
            <div>Loading Season 1 projects...</div>
          ) : isErrorSeason1 ? (
            <div>Error loading Season 1 projects</div>
          ) : season1Projects?.length === 0 ? (
            <div>No Season 1 projects found</div>
          ) : (
            <LeaderboardTable
              items={(season1Projects || [])
                .sort((a, b) => {
                  const aVotes = (a.metadata?.likes || 0) + (a.metadata?.dislikes || 0);
                  const bVotes = (b.metadata?.likes || 0) + (b.metadata?.dislikes || 0);
                  return bVotes - aVotes;
                })
                .map((item, idx) => ({ ...item, rank: idx + 1 }))}
              renderMetadata={(item) => {
                if (!item.metadata) return null;

                return (
                  <div className="flex flex-col items-end mr-4">
                    <div className="text-base font-medium text-zinc-700 dark:text-zinc-200">
                      {item.metadata.likes + item.metadata.dislikes} votes
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs ${getTextColorClass(
                        item.rank
                      )}`}
                    >
                      <Users className="h-3 w-3" />
                      <span>
                        {item.metadata.voters.toLocaleString()} voters
                      </span>
                    </div>
                  </div>
                );
              }}
              isLoading={isLoadingSeason1}
              isError={isErrorSeason1}
            />
          )}
        </TabsContent>
        <TabsContent value="season3" className="mt-4">
          <div className="flex items-center justify-center py-12">
            <div className="bg-gray-300 border-2 border-gray-400 rounded-lg px-8 py-6 text-center">
              <h3 className="text-lg font-bold text-gray-600 mb-2">Season 3</h3>
              <p className="text-gray-500 text-sm">Coming Soon</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
