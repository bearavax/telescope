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
  'orb-new': {
    address: '0xc3e4513ee34cee77365573ca593823bda7191592',
    name: 'Orbs by YellowCatDao',
    symbol: 'Orbs'
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

function convertIpfsUrl(url: string): string {
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return url;
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collection');
    const searchTerm = searchParams.get('q');
    const traitType = searchParams.get('trait');
    const traitValue = searchParams.get('value');

    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID required' }, { status: 400 });
    }

    const collection = COLLECTIONS[collectionId as keyof typeof COLLECTIONS];
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const contract = new ethers.Contract(collection.address, ERC721_ABI, provider);
    
    // Get total supply
    let totalSupply = 0;
    try {
      const supply = await contract.totalSupply();
      totalSupply = Number(supply);
    } catch (error) {
      // Fallback: check tokens individually
      for (let i = 1; i <= 10000; i++) {
        try {
          await contract.tokenURI(i);
          totalSupply = i;
        } catch {
          break;
        }
      }
    }

    // Search through NFTs with optimized approach
    const matchingNFTs = [];
    const maxSearch = Math.min(totalSupply, 200); // Reduced limit for much faster performance
    
    // For trait searches, we can be more targeted
    if (traitType && traitValue) {
      // Search in batches for better performance
      const batchSize = 20;
      for (let startId = 1; startId <= maxSearch; startId += batchSize) {
        const endId = Math.min(startId + batchSize - 1, maxSearch);
        const batchPromises = [];
        
        for (let tokenId = startId; tokenId <= endId; tokenId++) {
          batchPromises.push(
            fetchNFTMetadata(contract, tokenId).then(metadata => ({ tokenId, metadata }))
          );
        }
        
        try {
          const batchResults = await Promise.allSettled(batchPromises);
          
          for (const result of batchResults) {
            if (result.status === 'fulfilled') {
              const { tokenId, metadata } = result.value;
              const traitValues = traitValue.split(',').map(v => v.trim());
              const traitMatch = metadata.attributes.some(attr => 
                attr.trait_type === traitType && traitValues.includes(attr.value)
              );
              
              if (traitMatch) {
                matchingNFTs.push({
                  id: tokenId,
                  name: metadata.name,
                  image: metadata.image,
                  attributes: metadata.attributes
                });
              }
            }
          }
        } catch (error) {
          console.error('Batch search error:', error);
        }
        
        // Small delay between batches
        if (endId < maxSearch) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } else {
      // For text searches, use sequential approach but faster
      for (let tokenId = 1; tokenId <= maxSearch; tokenId++) {
        try {
          const metadata = await fetchNFTMetadata(contract, tokenId);
          
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const nameMatch = metadata.name.toLowerCase().includes(searchLower);
            const attributeMatch = metadata.attributes.some(attr => 
              attr.value.toLowerCase().includes(searchLower)
            );
            
            if (nameMatch || attributeMatch) {
              matchingNFTs.push({
                id: tokenId,
                name: metadata.name,
                image: metadata.image,
                attributes: metadata.attributes
              });
            }
          }
          
          // Reduced delay for faster search
          if (tokenId % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        } catch (error) {
          // Continue with next token
        }
      }
    }

    return NextResponse.json({
      collection: {
        id: collectionId,
        name: collection.name,
        symbol: collection.symbol,
        emoji: collection.emoji,
        totalSupply,
        address: collection.address
      },
      nfts: matchingNFTs,
      totalResults: matchingNFTs.length
    });

  } catch (error) {
    console.error('Error searching NFT collection:', error);
    return NextResponse.json(
      { error: 'Failed to search NFT collection' },
      { status: 500 }
    );
  }
}
