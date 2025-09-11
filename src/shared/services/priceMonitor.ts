interface TokenPriceData {
  contractAddress: string;
  price: number;
  marketCap: number;
  volume24h: number;
  dailyChange: number;
  holders?: number;
  source: 'dexscreener' | 'coingecko' | 'moralis' | 'unknown';
}

export class PriceMonitor {
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  async startMonitoring() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting price monitoring for all KOL tokens...');
    
    // Initial update
    await this.updateAllTokenPrices();
    
    // Update every 2 minutes
    this.updateInterval = setInterval(async () => {
      await this.updateAllTokenPrices();
    }, 120000);
  }

  private async updateAllTokenPrices() {
    try {
      // Get all active tokens from database
      const response = await fetch('http://localhost:3000/api/kol?onlyWithMarketCap=false&limit=1000');
      const tokens = await response.json();
      
      console.log(`Updating prices for ${tokens.length} tokens...`);
      
      // Update prices in batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        await Promise.all(batch.map((token: any) => this.updateTokenPrice(token.contractAddress)));
        
        // Wait 1 second between batches to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('Price update completed');
    } catch (error) {
      console.error('Error updating token prices:', error);
    }
  }

  private async updateTokenPrice(contractAddress: string): Promise<void> {
    try {
      const priceData = await this.fetchTokenPriceData(contractAddress);
      
      if (priceData) {
        // Only set hasValidMarketCap to true if data came from DexScreener (real trading pair)
        const isValidMarketCap = priceData.marketCap > 1000 && priceData.source === 'dexscreener';
        
        // Update token in database
        await fetch('http://localhost:3000/api/kol', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contractAddress: priceData.contractAddress,
            price: priceData.price,
            marketCap: priceData.marketCap,
            volume24h: priceData.volume24h,
            dailyChange: priceData.dailyChange,
            holders: priceData.holders,
            hasValidMarketCap: isValidMarketCap,
            lastPriceUpdate: new Date()
          })
        });
        
        if (priceData.marketCap > 0) {
          console.log(`Updated ${contractAddress}: $${priceData.price.toFixed(8)} | MC: $${priceData.marketCap.toLocaleString()} | Valid: ${isValidMarketCap}`);
        }
      }
    } catch (error) {
      console.error(`Error updating price for ${contractAddress}:`, error);
    }
  }

  private async fetchTokenPriceData(contractAddress: string): Promise<TokenPriceData | null> {
    try {
      // Try DexScreener first
      let priceData = await this.fetchFromDexScreener(contractAddress);
      
      // If DexScreener fails, try other sources
      if (!priceData) {
        priceData = await this.fetchFromAlternativeSources(contractAddress);
      }
      
      return priceData;
    } catch (error) {
      console.error(`Error fetching price data for ${contractAddress}:`, error);
      return null;
    }
  }

  private async fetchFromDexScreener(contractAddress: string): Promise<TokenPriceData | null> {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        // Find the pair with highest liquidity/volume
        const bestPair = data.pairs.reduce((best: any, current: any) => {
          const currentLiquidity = parseFloat(current.liquidity?.usd || '0');
          const bestLiquidity = parseFloat(best.liquidity?.usd || '0');
          return currentLiquidity > bestLiquidity ? current : best;
        });
        
        const price = parseFloat(bestPair.priceUsd || '0');
        const marketCap = parseFloat(bestPair.marketCap || '0');
        const volume24h = parseFloat(bestPair.volume?.h24 || '0');
        const dailyChange = parseFloat(bestPair.priceChange?.h24 || '0');
        
        // Only return data if we have a valid price and market cap
        if (price > 0 && marketCap > 0) {
          return {
            contractAddress,
            price,
            marketCap,
            volume24h,
            dailyChange,
            source: 'dexscreener' as const
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error(`DexScreener API error for ${contractAddress}:`, error);
      return null;
    }
  }

  private async fetchFromAlternativeSources(contractAddress: string): Promise<TokenPriceData | null> {
    // Try CoinGecko API (if token is listed)
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=${contractAddress}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        const tokenData = data[contractAddress.toLowerCase()];
        
        if (tokenData) {
          return {
            contractAddress,
            price: tokenData.usd || 0,
            marketCap: tokenData.usd_market_cap || 0,
            volume24h: tokenData.usd_24h_vol || 0,
            dailyChange: tokenData.usd_24h_change || 0,
            source: 'coingecko' as const
          };
        }
      }
    } catch (error) {
      console.error(`CoinGecko API error for ${contractAddress}:`, error);
    }

    // Try Moralis API (requires API key)
    if (process.env.MORALIS_API_KEY) {
      try {
        const response = await fetch(
          `https://deep-index.moralis.io/api/v2/erc20/${contractAddress}/price?chain=avalanche`,
          {
            headers: {
              'X-API-Key': process.env.MORALIS_API_KEY
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          return {
            contractAddress,
            price: parseFloat(data.usdPrice || '0'),
            marketCap: 0, // Moralis doesn't provide market cap directly
            volume24h: 0,
            dailyChange: 0,
            source: 'moralis' as const
          };
        }
      } catch (error) {
        console.error(`Moralis API error for ${contractAddress}:`, error);
      }
    }
    
    return null;
  }

  // Method to get current price for a specific token (for real-time updates)
  async getTokenPrice(contractAddress: string): Promise<TokenPriceData | null> {
    return this.fetchTokenPriceData(contractAddress);
  }

  // Method to force update a specific token
  async forceUpdateToken(contractAddress: string): Promise<boolean> {
    try {
      await this.updateTokenPrice(contractAddress);
      return true;
    } catch (error) {
      console.error(`Error force updating ${contractAddress}:`, error);
      return false;
    }
  }

  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('Price monitoring stopped');
  }
}

export const priceMonitor = new PriceMonitor();