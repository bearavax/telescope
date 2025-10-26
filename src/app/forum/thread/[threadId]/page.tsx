"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccount } from "wagmi";
import { useUserStats } from "@/hooks/use-user-stats";
import { Address } from "viem";
import { PageNavigation } from "@/components/page-navigation";
import { useQueryClient } from "@tanstack/react-query";

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
  imageHash: string | null;
  anonymous: boolean;
  user?: {
    createdAt: string;
    postCount?: number;
    discordId?: string;
    username?: string;
    discordAvatar?: string | null;
  };
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
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const threadId = params.threadId as string;
  const { data: userStats } = useUserStats(address as Address, isConnected);

  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [stayAnonymous, setStayAnonymous] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stayAnonymous');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });

  const handleAnonymousChange = (checked: boolean) => {
    setStayAnonymous(checked);
    localStorage.setItem('stayAnonymous', JSON.stringify(checked));
  };

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
    if (!address || !comment.trim() || !thread) return;

    setReplying(true);
    try {
      let uploadedImageUrl = null;
      
      // Upload image if one is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const uploadData = await uploadResponse.json();
        
        if (uploadData.url) {
          uploadedImageUrl = uploadData.url;
        }
      }

      const response = await fetch(`/api/forum/threads/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment,
          walletAddress: address,
          boardName: thread.board.name,
          imageHash: uploadedImageUrl || imageUrl.trim() || null,
          anonymous: stayAnonymous
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.xpAwarded) {
          queryClient.invalidateQueries({ queryKey: ["userStats", address] });
          alert(`Reply posted! You earned 1 XP. Total XP: ${data.newXp} (Level ${data.newLevel})`);
        }
        setComment("");
        setImageUrl("");
        setImageFile(null);
        setImagePreview("");
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
    <div className="w-full">
      <div className="w-full max-w-screen-lg mx-auto -mt-6 px-8 relative z-10 mb-4">
        <PageNavigation />
      </div>
      <div className="w-full max-w-screen-lg mx-auto px-8 pb-16">
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
            <div className="flex gap-4 mb-4">
              {/* User Avatar */}
              {post.anonymous ? (
                <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                </div>
              ) : post.user?.discordAvatar ? (
                <img 
                  src={post.user.discordAvatar} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-lg flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
              )}
              
              {/* Post Content */}
              <div className="flex-1 min-w-0">
                {/* User Info Bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {post.anonymous 
                        ? 'Anonymous' 
                        : (post.user?.username || post.user?.discordId || (post.walletAddress.slice(0, 6) + '...' + post.walletAddress.slice(-4)))
                      }
                    </span>
                    {post.isOp && <Badge variant="secondary">OP</Badge>}
                    <span className="text-sm text-muted-foreground">ID: {post.posterId}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>No.{index + 1}</span>
                    <span className="ml-4">{new Date(post.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Post Image */}
                {post.imageHash && (
                  <div className="mb-4">
                    <img 
                      src={post.imageHash} 
                      alt="Post image" 
                      className="rounded border max-h-96 max-w-full object-contain"
                    />
                  </div>
                )}
                
                {/* Post Text */}
                <div className="whitespace-pre-wrap break-words">
                  {post.comment.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('>') ? 'text-green-600 dark:text-green-400' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {address ? (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Post Reply</h2>
          <div className="space-y-4">
            <Textarea
              placeholder="Write your reply..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
            />
            <div>
              <label className="block text-sm font-medium mb-2">
                Image (optional)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-64 rounded border"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous-reply"
                checked={stayAnonymous}
                onCheckedChange={(checked) => handleAnonymousChange(checked as boolean)}
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
            Connect your wallet to post a reply.
          </p>
        </Card>
      )}
      </div>
    </div>
  );
}
