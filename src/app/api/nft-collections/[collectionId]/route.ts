import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RPC_URL = "https://api.avax.network/ext/bc/C/rpc";
const provider = new ethers.JsonRpcProvider(RPC_URL);

const ERC721_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];

// Collection configurations - CORRECTED ADDRESSES
const COLLECTIONS = {
  'puppets': {
    address: '0xc1a5507194a1e70c35678f53c48c3934abbcc140',
    name: 'Puppets',
    symbol: 'PUP'
  },
  'humping-unicorns': {
    address: '0x34b4da1a0b06cfb09cb0efb46f02e667330e17db',
    name: 'Humping Unicorns',
    symbol: 'HUMP'
  },
  'the-salvors': {
    address: '0xce4fee23ab35d0d9a4b6b644881ddd8adebeb300',
    name: 'The Salvors',
    symbol: 'SALVOR'
  },
  'noir-nymphs': {
    address: '0x362c9690586a8b059208b782d0f2f03e93d448e6',
    name: 'Noir Nymphs',
    symbol: 'NYMPHS'
  },
  'bear-a-day': {
    address: '0x0dfdf01b8ea1adfdb9439780763edc635c15b6f9',
    name: 'bear a day',
    symbol: 'BEAR'
  },
  'analog-distortions': {
    address: '0x0a337be2ea71e3aea9c82d45b036ac6a6123b6d0',
    name: 'Analog Distortions',
    symbol: 'ANALOG'
  },
  'laifu': {
    address: '0x21e32d59b1f9574674006a4101150a004d93c24f',
    name: 'Laifu',
    symbol: 'LAIFU'
  },
  'lucid-things': {
    address: '0xce0b805a36fc812939203b9875137910291aac43',
    name: 'Lucid Things',
    symbol: 'LUCID'
  },
  'wolfi': {
    address: '0xbc3323468319cf1a2a9ca71a6f4034b7cb5f8126',
    name: 'Wolfi',
    symbol: 'WOLFI'
  },
  'nochillio': {
    address: '0x204b3ee3f9bdcde258ba3f74de76ea8eedf0a36a',
    name: 'nochillio',
    symbol: 'NOCHILL'
  }
};

// Cache for supply numbers (persistent across requests)
const supplyCache = new Map<string, number>();

function convertIpfsUrl(url: string): string {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return url;
}

async function getCollectionSupply(contract: ethers.Contract): Promise<number> {
  try {
    const supply = await contract.totalSupply();
    const supplyNumber = Number(supply);
    
    // Cap unrealistic supply numbers (some contracts return extremely large numbers)
    if (supplyNumber > 10000) {
      console.log(`Supply ${supplyNumber} seems unrealistic, capping at 10000`);
      return 10000;
    }
    
    return supplyNumber;
  } catch (error) {
    console.log('totalSupply failed, trying to find max token ID...');
    // If totalSupply fails, try to find supply by checking tokens
    let maxTokenId = 0;
    for (let i = 1; i <= 10000; i++) {
      try {
        await contract.tokenURI(i);
        maxTokenId = i;
      } catch {
        break;
      }
    }
    return maxTokenId;
  }
}

async function fetchNFTMetadata(contract: ethers.Contract, tokenId: number) {
  try {
    const tokenURI = await contract.tokenURI(tokenId);
    
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64Data = tokenURI.split(',')[1];
      const jsonData = JSON.parse(Buffer.from(base64Data, 'base64').toString());
      return {
        name: jsonData.name || `Token #${tokenId}`,
        image: convertIpfsUrl(jsonData.image || ''),
        attributes: jsonData.attributes || []
      };
    } else {
      // Handle nochillio's custom base URI
      let metadataUrl = tokenURI;
      if (tokenURI.includes('images.nochill.io')) {
        // Fix the space issue in nochillio's tokenURI
        metadataUrl = tokenURI.replace(' ', '');
      } else {
        metadataUrl = convertIpfsUrl(tokenURI);
      }
      
      const response = await fetch(metadataUrl);
      if (!response.ok) throw new Error('Failed to fetch metadata');
      
      const metadata = await response.json();
      return {
        name: metadata.name || `Token #${tokenId}`,
        image: convertIpfsUrl(metadata.image || ''),
        attributes: metadata.attributes || []
      };
    }
  } catch (error) {
    return {
      name: `Token #${tokenId}`,
      image: '',
      attributes: []
    };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const { collectionId } = params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12'); // Load 12 at a time for faster loading
    const offset = (page - 1) * limit;

    const collection = COLLECTIONS[collectionId as keyof typeof COLLECTIONS];
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    console.log(`=== FETCHING NFTs for ${collection.name} (${collectionId}) at address ${collection.address} ===`);
    
    const contract = new ethers.Contract(collection.address, ERC721_ABI, provider);
    
    // Get total supply (cached)
    let totalSupply = 0;
    if (supplyCache.has(collectionId)) {
      totalSupply = supplyCache.get(collectionId)!;
    } else {
      totalSupply = await getCollectionSupply(contract);
      supplyCache.set(collectionId, totalSupply);
    }
    
    let actualSupply = totalSupply;
    
    const totalPages = Math.ceil(totalSupply / limit);
    const startTokenId = offset + 1;
    const endTokenId = Math.min(offset + limit, totalSupply);

    // Fetch NFTs for current page
    const nfts = [];
    
    for (let tokenId = startTokenId; tokenId <= endTokenId; tokenId++) {
      try {
        const metadata = await fetchNFTMetadata(contract, tokenId);
        
        nfts.push({
          id: tokenId,
          name: metadata.name,
          image: metadata.image,
          attributes: metadata.attributes
        });
        
        // Log first few NFTs to debug
        if (tokenId <= startTokenId + 2) {
          console.log(`Token ${tokenId} for ${collection.name}: ${metadata.name}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error fetching token ${tokenId} for ${collection.name}:`, error);
        // Continue with next token instead of breaking
      }
    }

    console.log(`Successfully fetched ${nfts.length} NFTs for ${collection.name}`);

    const result = {
      collection: {
        id: collectionId,
        name: collection.name,
        symbol: collection.symbol,
        emoji: collection.emoji,
        totalSupply: actualSupply,
        address: collection.address
      },
      nfts,
      pagination: {
        page,
        limit,
        totalSupply: actualSupply,
        totalPages: Math.ceil(actualSupply / limit),
        hasNext: page < Math.ceil(actualSupply / limit),
        hasPrev: page > 1
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching NFT collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFT collection' },
      { status: 500 }
    );
  }
}
