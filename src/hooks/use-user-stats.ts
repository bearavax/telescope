import { useQuery } from "@tanstack/react-query";
import { calculateLevel, getXpForNextLevel, getXpProgress } from "@/lib/xp";
import { Address } from "viem";

interface UserStats {
  xp: number;
  level: number;
  xpForNextLevel: number;
  discordId: string | null;
  username: string | null;
  progress: { currentProgress: number; totalNeeded: number };
}

export function useUserStats(address: Address, isConnected: boolean) {
  return useQuery<UserStats>({
    queryKey: ["userStats", address],
    queryFn: async () => {
      if (!address) throw new Error("No address");

      const response = await fetch(`/api/users/${address}/stats`);
      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }

      const { xp, discordId, username } = await response.json();
      console.log("🎮 xp", xp);
      console.log("🎮 discordId", discordId);
      console.log("🎮 username", username);
      return {
        xp,
        level: calculateLevel(xp),
        xpForNextLevel: getXpForNextLevel(xp),
        progress: getXpProgress(xp),
        discordId,
        username,
      };
    },
    enabled: !!address && isConnected,
  });
}
