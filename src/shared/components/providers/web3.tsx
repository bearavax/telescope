"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import {
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  argentWallet,
  trustWallet,
  ledgerWallet,
  coreWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createStorage,
  WagmiProvider,
  Config,
  createConfig,
  http,
} from "wagmi";

interface BaseStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

import { env } from "@/core/config/env";
import { siteConfig } from "@/shared/utils/site";
import { SessionProvider } from "next-auth/react";

export const noopStorage: BaseStorage = {
  getItem: () => null,
  setItem: () => { },
  removeItem: () => { },
};

const singularEnv =
  env.NEXT_PUBLIC_ENVIRONMENT === "PRODUCTION" ? "prod" : "dev";

export const storage =
  typeof window !== "undefined" && window.localStorage
    ? createStorage({
      key: `telescope-${singularEnv}`,
      storage: window.localStorage,
    })
    : null;

export const web3Config = createConfig({
  chains: [avalanche],
  transports: {
    [avalanche.id]: http(),
  },
  storage,
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    const config = getDefaultConfig({
      appName: siteConfig.name,
      projectId: env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
      wallets: [
        {
          groupName: "Most used",
          wallets: [coreWallet, metaMaskWallet, rainbowWallet],
        },
        {
          groupName: "Other",
          wallets: [
            coinbaseWallet,
            argentWallet,
            trustWallet,
            ledgerWallet,
            coinbaseWallet,
          ],
        },
      ],
      chains: [avalanche, avalancheFuji],
      transports: {
        [avalanche.id]: http("https://avalanche-c-chain-rpc.publicnode.com"),
        [avalancheFuji.id]: http(
          "https://avalanche-fuji-c-chain-rpc.publicnode.com"
        ),
      },
      storage,
    });

    setConfig(config);
  }, []);

  const queryClient = new QueryClient();

  if (!config) return null;

  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider modalSize="compact" theme={darkTheme()}>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
