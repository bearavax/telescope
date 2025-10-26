"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccount } from "wagmi";
import { useUserStats } from "@/hooks/use-user-stats";
import { Address } from "viem";

interface Board {
  id: string;
  name: string;
  title: string;
}

interface Post {
  id: string;
  comment: string;
  posterId: string;
  createdAt: string;
  isOp: boolean;
  walletAddress: string;
}

interface Thread {
  id: string;
  subject: string | null;
  createdAt: string;
  replyCount: number;
  board: Board;
  posts: Post[];
}

export default function ThreadPage() {
  const params = useParams();
  const { address, isConnected } = useAccount();
  const threadId = params.threadId as string;
  const { data: userStats } = useUserStats(address as Address, isConnected);

  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stayAnonymous, setStayAnonymous] = useState(true);

  useEffect(() => {
    fetchThread();
  }, [threadId]);

  const fetchThread = async () => {
    try {
      const response = await fetch(`/api/forum/threads/${threadId}`);
      const data = await response.json();
      setThread(data);
    } catch (error) {
      console.error("Error fetching thread:", error);
    } finally {
      setLoading(false);
    }
  };

  const createReply = async () => {
    if (!address || !comment.trim() || !thread || !userStats?.discordId) return;

    setReplying(true);
    try {
      const response = await fetch(`/api/forum/threads/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment,
          walletAddress: address,
          boardName: thread.board.name,
          imageHash: imageUrl.trim() || null,
          anonymous: stayAnonymous
        })
      });

      const data = await response.json();

      if (data.success) {
        setComment("");
        setImageUrl("");
        setStayAnonymous(true);
        fetchThread(); // Refresh thread to show new reply
      }
    } catch (error) {
      console.error("Error creating reply:", error);
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-screen-lg mx-auto px-8 py-16">
        <div className="h-12 w-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="w-full max-w-screen-lg mx-auto px-8 py-16">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Thread not found.</p>
          <Link href="/forum" className="text-primary hover:underline mt-4 inline-block">
            Back to forum
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-lg mx-auto px-8 py-16">
      <Link
        href={`/forum/${thread.board.name}`}
        className="text-primary hover:underline mb-2 inline-block"
      >
        ← Back to /{thread.board.name}/
      </Link>

      {thread.subject && (
        <h1 className="text-3xl font-bold mb-4">{thread.subject}</h1>
      )}

      <div className="space-y-4 mb-8">
        {thread.posts.map((post, index) => (
          <Card key={post.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <span className="font-semibold">Anonymous</span>
                {post.isOp && <Badge>OP</Badge>}
                <span className="text-sm text-muted-foreground">ID: {post.posterId}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span>No.{index + 1}</span>
                <span className="ml-4">{new Date(post.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="whitespace-pre-wrap break-words">
              {post.comment.split('\n').map((line, i) => (
                <p key={i} className={line.startsWith('>') ? 'text-green-600 dark:text-green-400' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {address && userStats?.discordId ? (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Post Reply</h2>
          <div className="space-y-4">
            <Textarea
              placeholder="Write your reply..."
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
                id="anonymous-reply"
                checked={stayAnonymous}
                onCheckedChange={(checked) => setStayAnonymous(checked as boolean)}
              />
              <label
                htmlFor="anonymous-reply"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Stay Anonymous
              </label>
            </div>
            <Button
              onClick={createReply}
              disabled={replying || !comment.trim()}
              className="w-full"
            >
              {replying ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {!address ? "Connect your wallet and Discord to post a reply." : "Connect Discord to post a reply."}
          </p>
        </Card>
      )}
    </div>
  );
}
