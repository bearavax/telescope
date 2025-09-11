import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import KOL, { IKOL } from '@/shared/types/KOL';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    // Clear all KOL data
    await KOL.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: 'All KOL data cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing KOL data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear KOL data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const onlyWithMarketCap = searchParams.get('onlyWithMarketCap') === 'true';
    
    const filter: any = {
      isActive: true,
    };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (onlyWithMarketCap) {
      filter.hasValidMarketCap = true;
      filter.marketCap = { $gt: 0 };
    }

    // Get all tokens
    const kols = await KOL.find(filter)
      .limit(limit)
      .lean();

    // Separate tokens with and without market caps
    let tokensWithMarketCap = kols.filter(kol => kol.hasValidMarketCap && kol.marketCap > 0);
    let tokensWithoutMarketCap = kols.filter(kol => !kol.hasValidMarketCap || kol.marketCap <= 0);

    // Sort tokens with market caps by market cap (highest first)
    tokensWithMarketCap.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

    // Sort pre-launch tokens by creation date (newest first) since they all have 0 supply/holders
    tokensWithoutMarketCap.sort((a, b) => {
      const aDate = new Date(a.createdAt || 0);
      const bDate = new Date(b.createdAt || 0);
      return bDate.getTime() - aDate.getTime();
    });

    // Add rank to tokens with market caps
    const tokensWithMarketCapRanked = tokensWithMarketCap.map((kol, index) => ({
      ...kol,
      rank: index + 1,
      id: kol.id || kol._id?.toString()
    }));

    // Add rank to pre-launch tokens (continuing from last ranked position)
    const tokensWithoutMarketCapRanked = tokensWithoutMarketCap.map((kol, index) => ({
      ...kol,
      rank: tokensWithMarketCap.length + index + 1,
      id: kol.id || kol._id?.toString()
    }));

    const kolsWithRank = [...tokensWithMarketCapRanked, ...tokensWithoutMarketCapRanked];

    return NextResponse.json(kolsWithRank);
  } catch (error) {
    console.error('Error fetching KOLs:', error);
    return NextResponse.json({ error: 'Failed to fetch KOLs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const kolData = await request.json();
    
    // Check if KOL already exists
    const existingKOL = await KOL.findOne({
      $or: [
        { contractAddress: kolData.contractAddress },
        { id: kolData.id }
      ]
    });

    if (existingKOL) {
      // Update existing KOL
      const updatedKOL = await KOL.findByIdAndUpdate(
        existingKOL._id,
        {
          ...kolData,
          updatedAt: new Date(),
          lastPriceUpdate: new Date()
        },
        { new: true }
      );
      
      return NextResponse.json(updatedKOL);
    } else {
      // Create new KOL
      const newKOL = new KOL(kolData);
      await newKOL.save();
      
      return NextResponse.json(newKOL, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating KOL:', error);
    return NextResponse.json({ error: 'Failed to create/update KOL' }, { status: 500 });
  }
}
