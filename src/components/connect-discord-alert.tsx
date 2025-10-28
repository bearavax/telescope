"use client";


import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ConnectDiscordButton } from "./connect-discord-button";

export function ConnectDiscordAlert() {
  return (
    <div>
      <Alert
        variant="default"
        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 py-4 flex flex-col md:flex-row justify-between items-center"
      >
        <div className="flex flex-row gap-2">
          <AlertCircle className="h-4 w-4 stroke-zinc-500 dark:stroke-zinc-400" />
          <div className="flex flex-col">
            <AlertTitle className="font-bold text-zinc-900 dark:text-zinc-100">
              Connect your Discord account
            </AlertTitle>
            <AlertDescription className="text-zinc-500 dark:text-zinc-400">
              Link your Discord account to be able to vote.
            </AlertDescription>
          </div>
        </div>
        <ConnectDiscordButton />
      </Alert>
    </div>
  );
}
