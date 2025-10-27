import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

interface AvaxBadge {
  firstTxHash: string;
  firstTxDate: string;
  timestamp: number;
  year: number;
  classOf: string;
  blockNumber: string;
}

export function useAvaxBadge(address: Address | undefined) {
  return useQuery<AvaxBadge>({
    queryKey: ["avaxBadge", address],
    queryFn: async () => {
      if (!address) throw new Error("No address");
      const response = await fetch(`/api/users/${address}/avax-first-tx`);
      if (!response.ok) throw new Error("Failed to fetch Avax badge");
      return response.json();
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours (first tx won't change)
  });
}
