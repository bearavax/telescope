import mongoose from 'mongoose';

export interface IKOL {
  id: string;
  name: string;
  symbol: string;
  avatar?: string;
  marketCap: number;
  price: number;
  volume24h: number;
  category: 'dev' | 'artist' | 'meme' | 'gamer';
  contractAddress: string;
  creatorAddress: string;
  description: string;
  isActive: boolean;
  yourWorthUrl?: string;
  dexScreenerUrl?: string;
  arenaProUrl?: string;
  twitterHandle?: string;
  telegramHandle?: string;
  discordHandle?: string;
  createdAt: Date;
  updatedAt: Date;
  lastPriceUpdate: Date;
  hasValidMarketCap: boolean;
  dailyChange: number;
  holders?: number;
  totalSupply?: number;
}

const KOLSchema = new mongoose.Schema<IKOL>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: true,
    index: true
  },
  avatar: {
    type: String,
    default: null
  },
  marketCap: {
    type: Number,
    required: true,
    default: 0,
    index: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  volume24h: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['dev', 'artist', 'meme', 'gamer'],
    required: true,
    index: true
  },
  contractAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  creatorAddress: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  yourWorthUrl: String,
  dexScreenerUrl: String,
  arenaProUrl: String,
  twitterHandle: String,
  telegramHandle: String,
  discordHandle: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastPriceUpdate: {
    type: Date,
    default: Date.now,
    index: true
  },
  hasValidMarketCap: {
    type: Boolean,
    default: false,
    index: true
  },
  dailyChange: {
    type: Number,
    default: 0
  },
  holders: Number,
  totalSupply: Number
}, {
  timestamps: true
});

// Indexes for performance
KOLSchema.index({ marketCap: -1, hasValidMarketCap: 1 });
KOLSchema.index({ creatorAddress: 1, createdAt: -1 });
KOLSchema.index({ category: 1, marketCap: -1 });
KOLSchema.index({ isActive: 1, hasValidMarketCap: 1, marketCap: -1 });

export default mongoose.models.KOL || mongoose.model<IKOL>('KOL', KOLSchema);