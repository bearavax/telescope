"use client";
import React, { useState } from "react";
import { Sparkles, ShoppingCart, Search } from "lucide-react";
import { useAccount } from "wagmi";
import { Address } from "viem";

interface NFTListing {
  tokenId: string;
  collection: string;
  collectionAddress: Address;
  name: string;
  image: string;
  price: string;
  seller: string;
  rarity?: number;
}

const featuredListings: NFTListing[] = [
  {
    tokenId: "1",
    collection: "Humping Unicorns",
    collectionAddress: "0x0000000000000000000000000000000000000000" as Address,
    name: "Unicorn #1",
    image: "https://via.placeholder.com/400x400/FF69B4/FFFFFF?text=🦄",
    price: "25.5",
    seller: "0x1234...5678",
    rarity: 85
  },
  {
    tokenId: "234",
    collection: "Puppets",
    collectionAddress: "0x0000000000000000000000000000000000000000" as Address,
    name: "Puppet #234",
    image: "https://via.placeholder.com/400x400/8B0000/FFFFFF?text=🎭",
    price: "18.2",
    seller: "0xabcd...efgh",
    rarity: 72
  },
  {
    tokenId: "100",
    collection: "bear a day",
    collectionAddress: "0x0000000000000000000000000000000000000000" as Address,
    name: "Bear Day 100",
    image: "https://via.placeholder.com/400x400/8B4513/FFFFFF?text=🐻",
    price: "15.8",
    seller: "0x9876...5432",
    rarity: 90
  },
  {
    tokenId: "42",
    collection: "Laifu",
    collectionAddress: "0x21e32d59b1f9574674006a4101150a004d93c24f" as Address,
    name: "Laifu #42",
    image: "https://via.placeholder.com/400x400/FF1493/FFFFFF?text=👾",
    price: "7.2",
    seller: "0x5555...6666",
    rarity: 65
  },
  {
    tokenId: "777",
    collection: "APA",
    collectionAddress: "0x0000000000000000000000000000000000000000" as Address,
    name: "Ape #777",
    image: "https://via.placeholder.com/400x400/8B4513/FFFFFF?text=🦧",
    price: "32.1",
    seller: "0x7777...8888",
    rarity: 95
  },
  {
    tokenId: "33",
    collection: "Orb New",
    collectionAddress: "0x0000000000000000000000000000000000000000" as Address,
    name: "Orb #33",
    image: "https://via.placeholder.com/400x400/9370DB/FFFFFF?text=🔮",
    price: "8.5",
    seller: "0x9999...0000",
    rarity: 78
  }
];

const collections = [
  { name: "Humping Unicorns", floor: "25", volume: "150", emoji: "🦄" },
  { name: "Puppets", floor: "18", volume: "85", emoji: "🎭" },
  { name: "The Salvors", floor: "35", volume: "220", emoji: "⚓" },
  { name: "APA", floor: "30", volume: "125", emoji: "🦧" },
  { name: "AVAX Pengs", floor: "20", volume: "88", emoji: "🐧" },
  { name: "Noir Nymphs", floor: "22", volume: "95", emoji: "🌙" },
  { name: "bear a day", floor: "15", volume: "68", emoji: "🐻" },
  { name: "Ferdy Frens", floor: "12", volume: "45", emoji: "🐸" },
  { name: "Analog Distortions", floor: "10", volume: "38", emoji: "📼" },
  { name: "Orb New", floor: "8", volume: "32", emoji: "🔮" },
  { name: "Laifu", floor: "7", volume: "28", emoji: "👾" }
];

export function NFTMarketplace() {
  const { isConnected } = useAccount();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");

  const filteredListings = featuredListings.filter(listing => {
    const matchesSearch = searchTerm === "" || 
      listing.collection.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const price = parseFloat(listing.price);
    const matchesPrice = priceFilter === "all" ||
      (priceFilter === "under10" && price < 10) ||
      (priceFilter === "10to20" && price >= 10 && price <= 20) ||
      (priceFilter === "over20" && price > 20);
    
    return matchesSearch && matchesPrice;
  });

  const handleBuyNow = async (listing: NFTListing) => {
    if (!isConnected) {
      alert("Connect wallet first");
      return;
    }
    alert(`Buying ${listing.name} for ${listing.price} AVAX...`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Quick Actions Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-zinc-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-800 mb-1">🛒 NFT Marketplace</h2>
            <p className="text-zinc-600">Buy, sell, and discover the best NFTs on Avalanche</p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-zinc-600">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>{filteredListings.length} Available</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search collections or NFTs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Prices</option>
            <option value="under10">Under 10 AVAX</option>
            <option value="10to20">10-20 AVAX</option>
            <option value="over20">20+ AVAX</option>
          </select>
        </div>
      </div>

      {/* Featured Listings - One Click Buy */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">🔥 Buy Now</h3>
          <div className="text-sm text-zinc-500">{filteredListings.length} items</div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredListings.map((listing) => (
            <div key={`${listing.collection}-${listing.tokenId}`} className="border border-zinc-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
              <div className="aspect-square bg-white overflow-hidden">
                <img
                  src={listing.image}
                  alt={listing.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.parentElement;
                    if (fallback) {
                      const collection = collections.find(c => c.name === listing.collection);
                      fallback.innerHTML = `<div class="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-zinc-50 to-zinc-100">${collection?.emoji || '🖼️'}</div>`;
                    }
                  }}
                />
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-zinc-500">{listing.collection}</p>
                    <h4 className="font-bold text-sm">{listing.name}</h4>
                  </div>
                  {listing.rarity && (
                    <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded text-xs">
                      <Sparkles className="w-3 h-3 text-yellow-600" />
                      <span className="text-yellow-700">{listing.rarity}%</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold">{listing.price} AVAX</p>
                    <p className="text-xs text-zinc-500">{listing.seller}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyNow(listing)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collections Quick Access */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">🎨 Collections</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {collections
            .filter(c => searchTerm === "" || c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((collection) => (
            <div
              key={collection.name}
              className="p-4 border border-zinc-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="text-center space-y-2">
                <div className="text-3xl">{collection.emoji}</div>
                <div>
                  <p className="font-bold text-sm">{collection.name}</p>
                  <div className="flex justify-between text-xs text-zinc-600 mt-1">
                    <span>{collection.floor} AVAX</span>
                    <span>{collection.volume} Vol</span>
                  </div>
                </div>
                <button className="w-full py-1 text-xs bg-zinc-100 text-zinc-700 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-zinc-800">1.2K AVAX</p>
          <p className="text-sm text-zinc-600">24h Volume</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-zinc-800">156</p>
          <p className="text-sm text-zinc-600">Active Listings</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-zinc-800">7 AVAX</p>
          <p className="text-sm text-zinc-600">Lowest Floor</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-zinc-800">3.8K</p>
          <p className="text-sm text-zinc-600">Total Holders</p>
        </div>
      </div>
    </div>
  );
}