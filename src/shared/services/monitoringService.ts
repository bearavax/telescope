import { blockchainMonitor } from './blockchainMonitor';
import { priceMonitor } from './priceMonitor';

export class MonitoringService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    console.log('Initializing YourWorth monitoring services...');
    
    try {
      // Start blockchain monitoring for new tokens
      await blockchainMonitor.startMonitoring();
      
      // Start price monitoring for existing tokens
      await priceMonitor.startMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Monitoring services initialized successfully');
      
      // Set up graceful shutdown
      this.setupGracefulShutdown();
      
    } catch (error) {
      console.error('❌ Error initializing monitoring services:', error);
      throw error;
    }
  }

  private setupGracefulShutdown() {
    const shutdownHandler = () => {
      console.log('Shutting down monitoring services...');
      blockchainMonitor.stopMonitoring();
      priceMonitor.stopMonitoring();
      process.exit(0);
    };

    process.on('SIGTERM', shutdownHandler);
    process.on('SIGINT', shutdownHandler);
    process.on('SIGUSR2', shutdownHandler); // nodemon restart
  }

  // Method to manually sync YourWorth data
  async syncYourWorthData() {
    console.log('Starting manual YourWorth data sync...');
    
    // Trigger the scraping process
    try {
      const response = await fetch('http://localhost:3000/api/scrape-kol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ YourWorth scraping completed:', result);
        return result;
      } else {
        console.error('❌ YourWorth scraping failed:', response.status);
        throw new Error(`Scraping failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error triggering YourWorth scraping:', error);
      throw error;
    }
  }

  // Legacy method with initial seed data (kept for fallback)
  async syncYourWorthDataLegacy() {
    console.log('Starting legacy YourWorth data sync...');
    
    // Initial seed data based on your provided list
    const initialTokens = [
      {
        id: 'bear',
        name: 'bear',
        symbol: 'BEAR',
        contractAddress: '0x91465C2c9282D75d59C283D4eE02aC5a4FC99282',
        creatorAddress: '0x0C39a8e8Ff9b8Fb36eF5b2ECebE8CB26494E4980',
        description: 'I will rug you and save the bears',
        category: 'dev' as const
      },
      {
        id: 'yourworth',
        name: 'your worth by chef Goose',
        symbol: 'YW',
        contractAddress: '0x2AA6af86cBb77C25d74c12FEb07F8C7a5Ed6dB19',
        creatorAddress: '0xd2615000',
        description: 'Launchpad official token',
        category: 'meme' as const
      },
      {
        id: 'tactical_retreat',
        name: 'tactical_retreat',
        symbol: 'TAC',
        contractAddress: '0x47a0E3c6b6e0e1E4c2B2A0e9e8a8F4a8F1A11310',
        creatorAddress: '0x4c48E9Cf',
        description: 'r o b o t',
        category: 'dev' as const
      },
      {
        id: 'aihansu',
        name: 'aihansu',
        symbol: 'AIH',
        contractAddress: '0x0127eC8e5B1C3e8eC8e5B1C3e8eC8e5B1C3eE50c',
        creatorAddress: '0xaCCb0C0b',
        description: 'og liker on web 2.5',
        category: 'meme' as const
      },
      {
        id: 'bigtexlaw',
        name: 'BigTexLaw',
        symbol: 'TEX',
        contractAddress: '0xA26D2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2626',
        creatorAddress: '0xaCCb0C0b',
        description: 'Big Tex. Big Takes.',
        category: 'meme' as const
      },
      {
        id: 'virtualquery',
        name: 'VirtualQuery',
        symbol: 'VQ',
        contractAddress: '0x7C5455555555555555555555555555555555A3d0',
        creatorAddress: '0xaCCb0C0b',
        description: 'I will dump on you',
        category: 'meme' as const
      },
      {
        id: 'studleemore',
        name: 'Studleemore',
        symbol: 'STUD',
        contractAddress: '0x01ef8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C43',
        creatorAddress: '0xaCCb0C0b',
        description: 'Avalanche Blockchain Mogul. Good Rando on Spaces. Avax Coop Documentarian.',
        category: 'dev' as const
      },
      {
        id: 'stupifff',
        name: 'Stupifff',
        symbol: 'STPF',
        contractAddress: '0x0EE37777777777777777777777777777777777845',
        creatorAddress: '0xaCCb0C0b',
        description: 'Founder. Irresponsible memecoin degen. Responsible DeFi enjoyoor',
        category: 'dev' as const
      },
      {
        id: 'clarz',
        name: 'clarz',
        symbol: 'clarz',
        contractAddress: '0x473222222222222222222222222222222222FA62',
        creatorAddress: '0xaCCb0C0b',
        description: 'https://ferdyflip.xyz/referral/clarz',
        category: 'gamer' as const
      },
      {
        id: 'ogalf',
        name: 'og liker on web 2.5',
        symbol: 'ALF',
        contractAddress: '0x9a5c8888888888888888888888888888888880C9',
        creatorAddress: '0xaCCb0C0b',
        description: 'Stuff',
        category: 'meme' as const
      }
    ];

    // Add each token to database
    for (const token of initialTokens) {
      try {
        const kolData = {
          ...token,
          marketCap: 0,
          price: 0,
          volume24h: 0,
          isActive: true,
          hasValidMarketCap: false,
          dailyChange: 0,
          yourWorthUrl: 'https://yourworth.launchpd.xyz',
          dexScreenerUrl: `https://dexscreener.com/avalanche/${token.contractAddress}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastPriceUpdate: new Date()
        };

        const response = await fetch('http://localhost:3000/api/kol', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(kolData)
        });

        if (response.ok) {
          console.log(`✅ Synced token: ${token.name} (${token.symbol})`);
          
          // Immediately try to fetch price data
          setTimeout(async () => {
            await priceMonitor.forceUpdateToken(token.contractAddress);
          }, 1000);
        } else {
          console.log(`⚠️  Token ${token.name} might already exist or failed to sync`);
        }
      } catch (error) {
        console.error(`❌ Error syncing token ${token.name}:`, error);
      }
    }

    console.log('Manual sync completed');
  }

  // Health check method
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        blockchainMonitor: blockchainMonitor ? 'running' : 'stopped',
        priceMonitor: priceMonitor ? 'running' : 'stopped'
      }
    };
  }
}

export const monitoringService = new MonitoringService();