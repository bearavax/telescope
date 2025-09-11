"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Users, Calendar, TrendingUp, FolderOpen, XIcon, Newspaper, ImageIcon } from "lucide-react";
import { useMemo } from "react";

export default function HomeTab() {
  // Select multiple random collections and fetch a few NFTs from each
  const allCollections = useMemo(() => [
    { id: 'puppets', name: 'Puppets' },
    { id: 'humping-unicorns', name: 'Humping Unicorns' },
    { id: 'the-salvors', name: 'The Salvors' },
    { id: 'noir-nymphs', name: 'Noir Nymphs' },
    { id: 'bear-a-day', name: 'bear a day' },
    { id: 'analog-distortions', name: 'Analog Distortions' },
    { id: 'orb-new', name: 'Orb New' },
    { id: 'laifu', name: 'Laifu' },
    { id: 'lucid-things', name: 'Lucid Things' },
    { id: 'wolfi', name: 'Wolfi' },
    { id: 'nochillio', name: 'nochillio' },
  ], []);

  const selectedCollections = useMemo(() => {
    // Shuffle all collections; we'll pick distinct ones when assembling
    return [...allCollections].sort(() => Math.random() - 0.5);
  }, [allCollections]);

  const [afterMounted, setAfterMounted] = useState(false);
  useEffect(() => { setAfterMounted(true); }, []);

  const { data: showcase, isLoading: isLoadingShowcase } = useQuery({
    queryKey: ["gallery-showcase", selectedCollections.map(c => c.id)],
    enabled: afterMounted,
    queryFn: async () => {
      const perCollection = 6;
      const subset = selectedCollections.slice(0, 8);
      const responses = await Promise.allSettled(subset.map(async (col) => {
        const res = await fetch(`/api/nft-collections/${col.id}?page=1&limit=${perCollection}`, {
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        });
        if (!res.ok) return [] as any[];
        const data = await res.json();
        const nfts = Array.isArray(data.nfts) ? data.nfts : [];
        const withImages = nfts.filter((n: any) => typeof n.image === 'string' && n.image.trim() !== '' && /^https?:\/\//.test(n.image));
        const first = withImages[0];
        return first ? [{ ...first, __collectionId: col.id, __collectionName: col.name }] : [];
      }));

      const flat: any[] = [];
      for (const r of responses) {
        if (r.status === 'fulfilled') flat.push(...r.value);
      }

      // Ensure unique collections and exactly 6 items
      const picks: any[] = [];
      const used = new Set<string>();
      for (const item of flat) {
        if (!item.__collectionId || used.has(item.__collectionId)) continue;
        used.add(item.__collectionId);
        picks.push(item);
        if (picks.length === 6) break;
      }

      // If fewer than 6, continue fetching next batches of collections in parallel
      if (picks.length < 6 && selectedCollections.length > subset.length) {
        const remaining = selectedCollections.slice(8);
        const more = await Promise.allSettled(remaining.map(async (col) => {
          const res = await fetch(`/api/nft-collections/${col.id}?page=1&limit=${perCollection}`, {
            headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
          });
          if (!res.ok) return [] as any[];
          const data = await res.json();
          const nfts = Array.isArray(data.nfts) ? data.nfts : [];
          const withImages = nfts.filter((n: any) => typeof n.image === 'string' && n.image.trim() !== '' && /^https?:\/\//.test(n.image));
          const first = withImages[0];
          return first ? [{ ...first, __collectionId: col.id, __collectionName: col.name }] : [];
        }));
        for (const r of more) {
          if (r.status === 'fulfilled') {
            for (const item of r.value) {
              if (!item.__collectionId || used.has(item.__collectionId)) continue;
              used.add(item.__collectionId);
              picks.push(item);
              if (picks.length === 6) break;
            }
          }
          if (picks.length === 6) break;
        }
      }

      return { nfts: picks.slice(0, 6) };
    },
    staleTime: 0,
  });

  // Fetch latest news (3 posts)
  const { data: newsPosts, isLoading: isLoadingNews } = useQuery({
    queryKey: ["latest-news"],
    queryFn: async () => {
      const response = await fetch("/api/news");
      if (!response.ok) throw new Error("Failed to fetch news");
      const all = await response.json();
      return Array.isArray(all) ? all.slice(0, 3) : [];
    },
    staleTime: 0,
  });

  return (
    <div className="w-full space-y-6">
      {/* Latest News */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-zinc-600" />
          Latest News
        </h2>
        {isLoadingNews ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-6 bg-zinc-100 rounded animate-pulse" />
            ))}
          </div>
        ) : newsPosts && newsPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {newsPosts.map((post: any) => (
              <a
                key={post.link}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg overflow-hidden border bg-white hover:shadow-md transition-shadow"
              >
                {post.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image} alt={post.title} className="h-32 w-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="h-32 w-full bg-zinc-100" />
                )}
                <div className="p-3">
                  <div className="text-sm text-zinc-500 mb-1">{post.source}</div>
                  <div className="font-semibold text-zinc-800 line-clamp-2 group-hover:underline">{post.title}</div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-zinc-300" />
            <p>No news found</p>
          </div>
        )}
      </div>

      {/* Gallery Showcase */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-blue-600" />
          Gallery Showcase
        </h2>
        {isLoadingShowcase ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-zinc-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : showcase && Array.isArray(showcase.nfts) && showcase.nfts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {showcase.nfts
              .filter((nft: any) => typeof nft?.image === 'string' && nft.image.trim() !== '')
              .slice(0, 6)
              .map((nft: any) => {
              const name = nft?.name || `#${nft?.id}`;
              const image = nft?.image as string | undefined;
              return (
                <a
                  key={nft.id || name}
                  href={`/gallery?collection=${encodeURIComponent(nft.__collectionId || '')}`}
                  className="group relative rounded-lg overflow-hidden border bg-white hover:shadow-md transition-shadow"
                >
                  <div className="h-28 w-full bg-zinc-100 relative">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-zinc-400" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute left-2 bottom-1 right-2 flex items-center justify-between">
                      <div className="text-white text-xs font-medium truncate">{name}</div>
                      {nft.__collectionName ? (
                        <div className="text-white/90 text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/30 backdrop-blur-sm">
                          {nft.__collectionName}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-zinc-300" />
            <p>No NFTs to showcase</p>
          </div>
        )}
      </div>

      {/* Patch Notes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-500" />
          Patch Notes
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold text-zinc-800">KOL Token Discovery Live</h3>
            <p className="text-sm text-zinc-600 mt-1">
              Discover and track new tokens from key opinion leaders on Avalanche. 
              Real-time market data and ArenaPro integration now available.
            </p>
            <span className="text-xs text-orange-600 font-medium">Just launched</span>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-zinc-800">Art Club Submissions Open</h3>
            <p className="text-sm text-zinc-600 mt-1">
              Submit your Wolfi artwork for the Team1 Art Club Cohort 1. 
              Top 10% will join our exclusive artist community.
            </p>
            <span className="text-xs text-blue-600 font-medium">Active now</span>
          </div>
        </div>
      </div>

      
    </div>
  );
}