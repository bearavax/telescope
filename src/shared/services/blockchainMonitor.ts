import { ethers } from 'ethers';

// YourWorth Factory Contract Addresses (based on the pattern you provided)
const YOURWORTH_FACTORY_ADDRESSES = [
  '0xaCCb...0C0b', // Main factory contract - you'll need to provide the full address
  '0xd2615000' // Another creator pattern we saw
];

// Avalanche C-Chain RPC
const AVALANCHE_RPC = process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc';
const provider = new ethers.JsonRpcProvider(AVALANCHE_RPC);

// ERC-20 Token Created Event ABI
const TOKEN_CREATED_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event TokenCreated(address indexed token, address indexed creator, string name, string symbol)"
];

// Standard ERC-20 ABI for token info
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
];

interface NewTokenEvent {
  contractAddress: string;
  creatorAddress: string;
  name: string;
  symbol: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  creatorAddress: string;
  contractAddress: string;
}

export class BlockchainMonitor {
  private isMonitoring = false;
  private lastCheckedBlock = 0;

  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Starting blockchain monitor for YourWorth tokens...');
    
    // Get current block number
    this.lastCheckedBlock = await provider.getBlockNumber();
    console.log(`Starting from block: ${this.lastCheckedBlock}`);
    
    // Monitor new blocks
    this.monitorNewBlocks();
    
    // Also do periodic checks for missed blocks
    this.periodicCheck();
  }

  private async monitorNewBlocks() {
    provider.on('block', async (blockNumber) => {
      if (blockNumber <= this.lastCheckedBlock) return;
      
      console.log(`Checking new block: ${blockNumber}`);
      await this.checkBlockForNewTokens(blockNumber);
      this.lastCheckedBlock = blockNumber;
    });
  }

  private async periodicCheck() {
    setInterval(async () => {
      try {
        const currentBlock = await provider.getBlockNumber();
        const blocksToCheck = Math.min(10, currentBlock - this.lastCheckedBlock);
        
        if (blocksToCheck > 0) {
          console.log(`Periodic check: scanning ${blocksToCheck} blocks...`);
          for (let i = 1; i <= blocksToCheck; i++) {
            await this.checkBlockForNewTokens(this.lastCheckedBlock + i);
          }
          this.lastCheckedBlock = currentBlock;
        }
      } catch (error) {
        console.error('Error in periodic check:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  private async checkBlockForNewTokens(blockNumber: number) {
    try {
      const block = await provider.getBlock(blockNumber, true);
      if (!block || !block.transactions) return;

      for (const txHash of block.transactions) {
        await this.checkTransactionForTokenCreation(txHash, block.timestamp);
      }
    } catch (error) {
      console.error(`Error checking block ${blockNumber}:`, error);
    }
  }

  private async checkTransactionForTokenCreation(txHash: string, blockTimestamp: number) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt || receipt.status !== 1) return;

      // Check if transaction is from a known factory contract
      const tx = await provider.getTransaction(txHash);
      if (!tx) return;

      // Look for contract creation (to field is null) or interaction with factory
      const isFactoryInteraction = YOURWORTH_FACTORY_ADDRESSES.some(factory => 
        tx.to?.toLowerCase() === factory.toLowerCase()
      );

      const isContractCreation = tx.to === null;

      if (isFactoryInteraction || isContractCreation) {
        await this.processPotentialTokenCreation(receipt, tx, blockTimestamp);
      }
    } catch (error) {
      console.error(`Error checking transaction ${txHash}:`, error);
    }
  }

  private async processPotentialTokenCreation(
    receipt: ethers.TransactionReceipt, 
    tx: ethers.TransactionResponse,
    blockTimestamp: number
  ) {
    try {
      // For contract creation, the contract address is in the receipt
      let tokenAddress = receipt.contractAddress;
      
      // For factory interactions, look for Transfer events from zero address (minting)
      if (!tokenAddress) {
        const transferEvents = receipt.logs.filter(log => 
          log.topics[0] === ethers.id('Transfer(address,address,uint256)') &&
          log.topics[1] === ethers.ZeroHash // from address is zero (minting)
        );
        
        if (transferEvents.length > 0) {
          tokenAddress = transferEvents[0].address;
        }
      }

      if (!tokenAddress) return;

      // Verify it's an ERC-20 token and get metadata
      const tokenMetadata = await this.getTokenMetadata(tokenAddress, tx.from!);
      if (!tokenMetadata) return;

      console.log(`New token detected: ${tokenMetadata.name} (${tokenMetadata.symbol}) at ${tokenAddress}`);

      // Save to database
      await this.saveNewToken(tokenMetadata, tx.hash, blockTimestamp);

    } catch (error) {
      console.error('Error processing potential token creation:', error);
    }
  }

  private async getTokenMetadata(contractAddress: string, creatorAddress: string): Promise<TokenMetadata | null> {
    try {
      const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name().catch(() => null),
        contract.symbol().catch(() => null),
        contract.decimals().catch(() => 18),
        contract.totalSupply().catch(() => '0')
      ]);

      if (!name || !symbol) return null;

      return {
        name,
        symbol,
        decimals,
        totalSupply: totalSupply.toString(),
        creatorAddress,
        contractAddress
      };
    } catch (error) {
      console.error(`Error getting token metadata for ${contractAddress}:`, error);
      return null;
    }
  }

  private async saveNewToken(metadata: TokenMetadata, txHash: string, timestamp: number) {
    try {
      const kolData = {
        id: metadata.contractAddress.toLowerCase(),
        name: metadata.name,
        symbol: metadata.symbol,
        contractAddress: metadata.contractAddress,
        creatorAddress: metadata.creatorAddress,
        description: `New token: ${metadata.name}`,
        category: this.categorizeToken(metadata.name, metadata.symbol),
        marketCap: 0,
        price: 0,
        volume24h: 0,
        isActive: true,
        hasValidMarketCap: false,
        dailyChange: 0,
        totalSupply: metadata.totalSupply,
        yourWorthUrl: 'https://yourworth.launchpd.xyz',
        dexScreenerUrl: `https://dexscreener.com/avalanche/${metadata.contractAddress}`,
        createdAt: new Date(timestamp * 1000),
        updatedAt: new Date(),
        lastPriceUpdate: new Date()
      };

      // Call our API to save the token
      const response = await fetch('/api/kol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(kolData)
      });

      if (response.ok) {
        console.log(`Successfully saved new token: ${metadata.name}`);
        
        // Start monitoring this token's price
        setTimeout(() => {
          this.fetchTokenPrice(metadata.contractAddress);
        }, 5000);
      } else {
        console.error('Failed to save new token:', await response.text());
      }
    } catch (error) {
      console.error('Error saving new token:', error);
    }
  }

  private categorizeToken(name: string, symbol: string): 'dev' | 'artist' | 'meme' | 'gamer' {
    const nameSymbol = `${name} ${symbol}`.toLowerCase();
    
    if (nameSymbol.includes('art') || nameSymbol.includes('nft') || nameSymbol.includes('creative')) {
      return 'artist';
    }
    if (nameSymbol.includes('game') || nameSymbol.includes('play') || nameSymbol.includes('gaming')) {
      return 'gamer';
    }
    if (nameSymbol.includes('dev') || nameSymbol.includes('build') || nameSymbol.includes('protocol')) {
      return 'dev';
    }
    return 'meme'; // Default category
  }

  async fetchTokenPrice(contractAddress: string) {
    try {
      // Try to get price from DexScreener API
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`);
      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        const price = parseFloat(pair.priceUsd || '0');
        const marketCap = parseFloat(pair.marketCap || '0');
        const volume24h = parseFloat(pair.volume?.h24 || '0');
        
        if (price > 0 || marketCap > 0) {
          // Update token with real market data
          await fetch('/api/kol', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contractAddress,
              price,
              marketCap,
              volume24h,
              hasValidMarketCap: marketCap > 0,
              lastPriceUpdate: new Date()
            })
          });
          
          console.log(`Updated price for ${contractAddress}: $${price}, MC: $${marketCap}`);
        }
      }
    } catch (error) {
      console.error(`Error fetching price for ${contractAddress}:`, error);
    }
  }

  stopMonitoring() {
    this.isMonitoring = false;
    provider.removeAllListeners();
    console.log('Blockchain monitoring stopped');
  }
}

export const blockchainMonitor = new BlockchainMonitor();