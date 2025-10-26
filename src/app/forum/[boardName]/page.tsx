"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccount } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { useUserStats } from "@/hooks/use-user-stats";
import { Address } from "viem";

interface Thread {
  id: string;
  subject: string | null;
  bumpedAt: string;
  createdAt: string;
  replyCount: number;
  posts: Post[];
}

interface Post {
  id: string;
  comment: string;
  posterId: string;
  createdAt: string;
  walletAddress: string;
}

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const boardName = params.boardName as string;
  const { data: userStats } = useUserStats(address as Address, isConnected);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [subject, setSubject] = useState("");
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stayAnonymous, setStayAnonymous] = useState(true);

  useEffect(() => {
    fetchThreads();
  }, [boardName]);

  const fetchThreads = async () => {
    try {
      const response = await fetch(`/api/forum/boards/${boardName}/threads`);
      const data = await response.json();
      setThreads(data);
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const createThread = async () => {
    if (!address || !comment.trim() || !userStats?.discordId) return;

    setCreating(true);
    try {
      const response = await fetch(`/api/forum/boards/${boardName}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim() || null,
          comment,
          walletAddress: address,
          imageHash: imageUrl.trim() || null,
          anonymous: stayAnonymous
        })
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/forum/thread/${data.threadId}`);
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-screen-lg mx-auto px-8 py-16">
        <div className="h-12 w-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-lg mx-auto px-8 py-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/forum" className="text-primary hover:underline mb-2 inline-block">
            ← Back to boards
          </Link>
          <h1 className="text-4xl font-bold">/{boardName}/</h1>
        </div>
        {address && userStats?.discordId && (
          <Button onClick={() => setShowNewThread(!showNewThread)}>
            {showNewThread ? "Cancel" : "New Thread"}
          </Button>
        )}
        {address && !userStats?.discordId && (
          <p className="text-sm text-muted-foreground">
            Connect Discord to post
          </p>
        )}
      </div>

      {showNewThread && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Create New Thread</h2>
          <div className="space-y-4">
            <Input
              placeholder="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
            />
            <Textarea
              placeholder="Write your post..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
            />
            <Input
              placeholder="Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={stayAnonymous}
                onCheckedChange={(checked) => setStayAnonymous(checked as boolean)}
              />
              <label
                htmlFor="anonymous"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Stay Anonymous
              </label>
            </div>
            <Button
              onClick={createThread}
              disabled={creating || !comment.trim() || !userStats?.discordId}
              className="w-full"
            >
              {creating ? "Creating..." : "Create Thread"}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {threads.map((thread) => (
          <Link key={thread.id} href={`/forum/thread/${thread.id}`}>
            <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  {thread.subject && (
                    <h3 className="text-lg font-semibold mb-1">{thread.subject}</h3>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {thread.posts[0]?.comment}
                  </p>
                </div>
                <div className="ml-4 flex flex-col items-end gap-2">
                  <Badge variant="secondary">{thread.replyCount} replies</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(thread.bumpedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                <span>ID: {thread.posts[0]?.posterId}</span>
                <span>•</span>
                <span>{new Date(thread.createdAt).toLocaleString()}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {threads.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No threads yet. Be the first to post!</p>
          {!address && (
            <p className="text-sm text-muted-foreground">
              Connect your wallet and Discord to create a thread.
            </p>
          )}
          {address && !userStats?.discordId && (
            <p className="text-sm text-muted-foreground">
              Connect Discord to create a thread.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
