import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

interface ForumStats {
  totalPosts: number;
  totalThreads: number;
  totalReplies: number;
  boardsPostedIn: Array<{ name: string; title: string }>;
  boardCount: number;
  joinedDate: string | null;
  isSuperOG: boolean;
  currentPostStreak: number;
  longestPostStreak: number;
}

export function useForumStats(address: Address | undefined) {
  return useQuery<ForumStats>({
    queryKey: ["forumStats", address],
    queryFn: async () => {
      if (!address) throw new Error("No address");
      const response = await fetch(`/api/users/${address}/forum-stats`);
      if (!response.ok) throw new Error("Failed to fetch forum stats");
      return response.json();
    },
    enabled: !!address,
  });
}
