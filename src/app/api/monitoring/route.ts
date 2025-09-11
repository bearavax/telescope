import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/shared/services/monitoringService';
import { priceMonitor } from '@/shared/services/priceMonitor';

export async function GET(request: NextRequest) {
  // Health check
  try {
    const health = await monitoringService.healthCheck();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Health check failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { action } = await request.json();

  try {
    switch (action) {
      case 'start':
        await monitoringService.initialize();
        return NextResponse.json({ message: 'Monitoring services started successfully' });

      case 'sync':
        await monitoringService.syncYourWorthData();
        return NextResponse.json({ message: 'YourWorth data sync initiated' });

      case 'update-prices':
        // Force update all token prices
        const origin = request.headers.get('origin') || 'http://localhost:3000';
        const tokensResponse = await fetch(`${origin}/api/kol?onlyWithMarketCap=false&limit=1000`);
        const tokens = await tokensResponse.json();
        
        let updated = 0;
        for (const token of tokens) {
          const success = await priceMonitor.forceUpdateToken(token.contractAddress);
          if (success) updated++;
        }
        
        return NextResponse.json({ 
          message: `Price update completed for ${updated}/${tokens.length} tokens` 
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: start, sync, or update-prices' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json({ 
      error: 'Action failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

