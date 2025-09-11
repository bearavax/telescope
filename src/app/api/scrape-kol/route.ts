import { NextRequest, NextResponse } from 'next/server';
import { yourWorthScraper } from '@/shared/services/yourworthScraper';
import mongoose from 'mongoose';
import KOL from '@/shared/types/KOL';

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

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting KOL scraping process...');
    
    // Connect to database
    await connectDB();
    
    // Scrape all KOL data from YourWorth
    const scrapedData = await yourWorthScraper.scrapeAllKOLData();
    
    console.log(`📊 Scraped ${scrapedData.length} KOL tokens`);
    
    let created = 0;
    let updated = 0;
    let errors = 0;

    // Process each scraped KOL token
    for (const kolData of scrapedData) {
      try {
        const {
          name,
          symbol,
          description,
          category,
          contractAddress,
          dexScreenerUrl,
          arenaProUrl,
          avatar,
          dexScreenerData
        } = kolData;

        console.log(`🔗 Processing ${name}: arenaProUrl = ${arenaProUrl}`);

        // Check if KOL already exists
        const existingKOL = await KOL.findOne({
          $or: [
            { contractAddress: contractAddress },
            { name: name, symbol: symbol }
          ]
        });

        const kolDocument = {
          id: contractAddress, // Use contract address as unique ID
          name,
          symbol,
          description,
          category,
          contractAddress,
          dexScreenerUrl,
          arenaProUrl,
          avatar,
          creatorAddress: '0x0000000000000000000000000000000000000000', // Default creator
          isActive: true,
          marketCap: dexScreenerData?.marketCap || 0,
          price: dexScreenerData?.price || 0,
          volume24h: dexScreenerData?.volume24h || 0,
          dailyChange: dexScreenerData?.dailyChange || 0,
          holders: dexScreenerData?.holders || 0,
          hasValidMarketCap: (dexScreenerData?.marketCap || 0) > 1000,
          lastPriceUpdate: new Date(),
          updatedAt: new Date()
        };

        if (existingKOL) {
          // Update existing KOL - force update arenaProUrl
          await KOL.findByIdAndUpdate(
            existingKOL._id,
            {
              ...kolDocument,
              id: contractAddress, // Ensure id is set
              createdAt: existingKOL.createdAt, // Preserve original creation date
              arenaProUrl: arenaProUrl // Force update arenaProUrl
            },
            { new: true, upsert: false }
          );
          updated++;
          console.log(`✅ Updated: ${name} (${symbol}) - ArenaPro: ${arenaProUrl}`);
        } else {
          // Create new KOL
          const newKOL = new KOL({
            ...kolDocument,
            id: contractAddress, // Ensure id is set
            createdAt: new Date()
          });
          await newKOL.save();
          created++;
          console.log(`✅ Created: ${name} (${symbol})`);
        }

      } catch (error) {
        console.error(`❌ Error processing ${kolData.name}:`, error);
        errors++;
      }
    }

    // Close the scraper
    await yourWorthScraper.close();

    const result = {
      success: true,
      message: `KOL scraping completed successfully`,
      stats: {
        total: scrapedData.length,
        created,
        updated,
        errors
      },
      timestamp: new Date().toISOString()
    };

    console.log('📈 Scraping results:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in KOL scraping:', error);
    
    // Ensure scraper is closed on error
    try {
      await yourWorthScraper.close();
    } catch (closeError) {
      console.error('Error closing scraper:', closeError);
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to scrape KOL data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'KOL scraping endpoint - use POST to trigger scraping',
    usage: 'POST /api/scrape-kol to start scraping process'
  });
}
