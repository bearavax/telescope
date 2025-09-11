'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ImageIcon, Search, Grid, List, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { NFTDetailModal } from '@/features/gallery/components/nft-detail-modal';

interface NFTItem {
  id: number;
  name: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface Collection {
  id: string;
  name: string;
  emoji: string;
  totalSupply: number;
  address: string;
  category: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalSupply: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const collections: Collection[] = [
  { 
    id: 'puppets', 
    name: 'Puppets', 
    emoji: '', 
    totalSupply: 0, // Will be fetched from API
    address: '0xc1a5507194a1e70c35678f53c48c3934abbcc140',
    category: 'TBA'
  },
  { 
    id: 'humping-unicorns', 
    name: 'Humping Unicorns', 
    emoji: '', 
    totalSupply: 0,
    address: '0x34b4da1a0b06cfb09cb0efb46f02e667330e17db',
    category: 'TBA'
  },
  { 
    id: 'the-salvors', 
    name: 'The Salvors', 
    emoji: '', 
    totalSupply: 0,
    address: '0xce4fee23ab35d0d9a4b6b644881ddd8adebeb300',
    category: 'TBA'
  },
  { 
    id: 'noir-nymphs', 
    name: 'Noir Nymphs', 
    emoji: '', 
    totalSupply: 0,
    address: '0x362c9690586a8b059208b782d0f2f03e93d448e6',
    category: 'TBA'
  },
  { 
    id: 'bear-a-day', 
    name: 'bear a day', 
    emoji: '', 
    totalSupply: 0,
    address: '0x0dfdf01b8ea1adfdb9439780763edc635c15b6f9',
    category: 'TBA'
  },
  { 
    id: 'analog-distortions', 
    name: 'Analog Distortions', 
    emoji: '', 
    totalSupply: 0,
    address: '0x0a337be2ea71e3aea9c82d45b036ac6a6123b6d0',
    category: 'TBA'
  },
  { 
    id: 'laifu', 
    name: 'Laifu', 
    emoji: '', 
    totalSupply: 0,
    address: '0x21e32d59b1f9574674006a4101150a004d93c24f',
    category: 'TBA'
  },
  { 
    id: 'lucid-things', 
    name: 'Lucid Things', 
    emoji: '', 
    totalSupply: 0,
    address: '0xce0b805a36fc812939203b9875137910291aac43',
    category: 'TBA'
  },
  { 
    id: 'wolfi', 
    name: 'Wolfi', 
    emoji: '', 
    totalSupply: 0,
    address: '0x204b3ee3f9bdcde258ba3f74de76ea8eedf0a36a',
    category: 'TBA'
  },
  { 
    id: 'nochillio', 
    name: 'nochillio', 
    emoji: '', 
    totalSupply: 0,
    address: '0xbc3323468319cf1a2a9ca71a6f4034b7cb5f8126',
    category: 'TBA'
  },
];

export default function GalleryTab({ initialCollection }: { initialCollection?: string }) {
  const [selectedCollection, setSelectedCollection] = useState(initialCollection || 'puppets');
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNFTClick = (nft: NFTItem) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNFT(null);
  };

  const handleTraitClick = (traitType: string, traitValue: string) => {
    setSelectedTrait(traitType);
    setTraitValues([traitValue]);
    setIsModalOpen(false);
    setSelectedNFT(null);
  };

  const getCollectionName = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection?.name || 'Unknown Collection';
  };

  // Preload collection background images
  useEffect(() => {
    const preloadImages = () => {
      const imageUrls = [
        'https://telescope.isbjorn.co.nz/puppets/images/1.png', // puppets
        'https://ipfs.io/ipfs/QmfX84bi4Gn5FTvx8sYWurDY7pkLdKB3LMqgEms6kbFhDe/610.png', // humping-unicorns
        'https://cdn.salvor.io/salvors_v2/1.png', // the-salvors
        'https://ipfs.io/ipfs/QmbJhm6pQpYQiSJec7iexSX11z3dgsCgedxnYTvcoquxHe/129.png', // noir-nymphs
        'https://ipfs.io/ipfs/QmWitEz68EQFLCG2kco3A1nSh1TYGpTkYW994CvHNiDqS7/bear%202.png', // bear-a-day
        'https://pbs.twimg.com/media/GHRn4GaXoAAK_NO?format=jpg&name=large', // analog-distortions
        'https://ipfs.io/ipfs/QmS4BdyzLPTL3C9rTSTZPspUTM8oFz7TTvWrEeyBPrCsyR/eger.jpg', // orb-new
        'https://ipfs.io/ipfs/bafybeie2tywmipz666iyrcweuhrtpfptddq74cahdqfjhpxhx2uclromwu/color_010_tile_1_2.png', // laifu
        'https://cdn.salvor.io/launchpad/lucid_things/images/324.png', // lucid-things
        'https://ipfs.io/ipfs/bafybeid5ggptrphfw5nmytawz66opqeaegzbd6kgpqwqwkgwuok4h2ikgm/724.png', // wolfi
        'https://images.nochill.lol/nochillio/images/1.png' // nochillio
      ];
      
      imageUrls.forEach(url => {
        const img = new window.Image();
        img.src = url;
      });
    };

    preloadImages();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [availableTraits, setAvailableTraits] = useState<string[]>([]);
  const [selectedTrait, setSelectedTrait] = useState('');
  const [traitValues, setTraitValues] = useState<string[]>([]);
  const [selectedTraitValues, setSelectedTraitValues] = useState<string[]>([]);
  const [traitCache, setTraitCache] = useState<Map<string, string[]>>(new Map());
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    totalSupply: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [collectionSupplies, setCollectionSupplies] = useState<Map<string, number>>(new Map());
  const currentRequestRef = useRef<string | null>(null);

  // Load NFTs from blockchain API
  const loadNFTs = async (collectionId: string, page: number = 1) => {
    console.log(`=== LOADING NFTs for collection: ${collectionId} ===`);
    
    // Cancel previous request
    currentRequestRef.current = collectionId;
    
    setLoading(true);
    setNfts([]); // Clear NFTs immediately to prevent mixing
    setSearchTerm('');
    setSelectedTrait('');
    setTraitValues([]);
    setSelectedTraitValues([]);
    
    try {
      const response = await fetch(`/api/nft-collections/${collectionId}?page=${page}&limit=12`);
      const data = await response.json();
      
      // Check if this is still the current request (prevent race conditions)
      if (currentRequestRef.current !== collectionId) {
        console.log(`Ignoring response for ${collectionId} - current request is ${currentRequestRef.current}`);
        return;
      }
      
      if (data.error) {
        console.error('Error loading NFTs:', data.error);
        setNfts([]);
        return;
      }

      console.log(`Setting ${data.nfts?.length || 0} NFTs for ${collectionId}`);
      console.log(`First NFT name: ${data.nfts?.[0]?.name || 'none'}`);
      setNfts(data.nfts || []);
      setPagination(data.pagination || pagination);
      
      // Update collection supply cache
      if (data.pagination?.totalSupply) {
        setCollectionSupplies(prev => new Map(prev).set(collectionId, data.pagination.totalSupply));
      }
      
      // Extract available traits and cache them
      const traits = new Set<string>();
      const traitValueMap = new Map<string, Set<string>>();
      
      data.nfts.forEach((nft: NFTItem) => {
        nft.attributes?.forEach(attr => {
          traits.add(attr.trait_type);
          if (!traitValueMap.has(attr.trait_type)) {
            traitValueMap.set(attr.trait_type, new Set());
          }
          traitValueMap.get(attr.trait_type)!.add(attr.value);
        });
      });
      
      setAvailableTraits(Array.from(traits));
      
      // Cache trait values for this collection
      const traitValuesMap = new Map<string, string[]>();
      traitValueMap.forEach((values, trait) => {
        traitValuesMap.set(trait, Array.from(values).sort()); // Sort to ensure consistent order
      });
      setTraitCache(prev => new Map(prev).set(collectionId, traitValuesMap));
      
    } catch (error) {
      console.error('Error loading NFTs:', error);
      setNfts([]);
    } finally {
      // Only set loading to false if this is still the current request
      if (currentRequestRef.current === collectionId) {
        setLoading(false);
      }
    }
  };

  // Load NFTs when collection changes
  useEffect(() => {
    loadNFTs(selectedCollection, 1);
  }, [selectedCollection]);

  // Search across whole collection when search term or trait is used
  const [searchResults, setSearchResults] = useState<NFTItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Client-side filtering for better performance
  const clientSideFilter = (nfts: NFTItem[]) => {
    return nfts.filter(nft => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = nft.name.toLowerCase().includes(searchLower);
        const attributeMatch = nft.attributes?.some(attr => 
          attr.value.toLowerCase().includes(searchLower)
        ) || false;
        if (!nameMatch && !attributeMatch) return false;
      }

      // Trait filter
      if (selectedTrait && selectedTraitValues.length > 0) {
        const traitMatch = nft.attributes?.some(attr => 
          attr.trait_type === selectedTrait && selectedTraitValues.includes(attr.value)
        ) || false;
        if (!traitMatch) return false;
      }

      return true;
    });
  };

  useEffect(() => {
    const performSearch = async () => {
      // For search terms, use client-side filtering first, then API if needed
      if (searchTerm && !selectedTrait) {
        const clientFiltered = clientSideFilter(nfts);
        if (clientFiltered.length > 0) {
          setSearchResults(clientFiltered);
          return;
        }
      }

      // Only use API search for trait filtering or when client-side search finds nothing
      if (!searchTerm && !selectedTrait) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const params = new URLSearchParams({
          collection: selectedCollection,
          ...(searchTerm && { q: searchTerm }),
          ...(selectedTrait && selectedTraitValues.length > 0 && { 
            trait: selectedTrait, 
            value: selectedTraitValues.join(',') 
          })
        });

        const response = await fetch(`/api/nft-collections/search?${params}`);
        const data = await response.json();
        
        if (data.error) {
          console.error('Search error:', data.error);
          setSearchResults([]);
        } else {
          setSearchResults(data.nfts || []);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTrait, selectedTraitValues, selectedCollection, nfts]);

  // Use search results if searching, otherwise use current page NFTs
  const filteredNfts = (searchTerm || selectedTrait) ? searchResults : nfts;

  // Update trait values when selected trait changes - use cache for faster loading
  useEffect(() => {
    if (selectedTrait) {
      // Try to get from cache first
      const cachedValues = traitCache.get(selectedCollection)?.get(selectedTrait);
      if (cachedValues && cachedValues.length > 0) {
        setTraitValues(cachedValues);
      } else if (nfts.length > 0) {
        // Fallback to extracting from current NFTs only if we have NFTs loaded
        const values = new Set<string>();
        nfts.forEach(nft => {
          nft.attributes?.forEach(attr => {
            if (attr.trait_type === selectedTrait) {
              values.add(attr.value);
            }
          });
        });
        setTraitValues(Array.from(values).sort()); // Sort to ensure consistent order
      }
    } else {
      setTraitValues([]);
    }
  }, [selectedTrait, selectedCollection, traitCache, nfts]);

  // Ensure traits are always available when collection loads
  useEffect(() => {
    if (nfts.length > 0 && availableTraits.length === 0) {
      const traits = new Set<string>();
      nfts.forEach(nft => {
        nft.attributes?.forEach(attr => {
          traits.add(attr.trait_type);
        });
      });
      setAvailableTraits(Array.from(traits));
    }
  }, [nfts, availableTraits.length]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadNFTs(selectedCollection, newPage);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === pagination.page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="w-8 h-8 p-0"
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  return (
    <div className="space-y-6" key={selectedCollection}>

      {/* Collection Selector */}
      <div className="flex gap-1 flex-col mb-4">
        <h3 className="font-bold">Collections</h3>
        <div className="flex flex-wrap gap-2">
          {collections.map((collection) => (
            <Button
              key={collection.id}
              variant={selectedCollection === collection.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCollection(collection.id)}
              className="flex items-center gap-1 px-3 py-1 text-sm"
            >
              <ImageIcon size={16} />
              <span>{collection.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search NFTs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-white border-2 bg-white"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedTrait}
            onChange={(e) => {
              setSelectedTrait(e.target.value);
              setSelectedTraitValues([]); // Clear selected values when trait changes
            }}
            className="px-4 py-2 font-bold text-sm bg-white border-white border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Filter by trait...</option>
            {availableTraits.map(trait => (
              <option key={trait} value={trait}>{trait}</option>
            ))}
          </select>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="px-4 py-2 font-bold text-sm border-white border-2"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="px-4 py-2 font-bold text-sm border-white border-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Trait Value Selection */}
      {selectedTrait && traitValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {traitValues.map(value => {
            const isSelected = selectedTraitValues.includes(value);
            return (
              <button
                key={value}
                onClick={() => {
                  // Single selection - replace current selection
                  if (isSelected) {
                    setSelectedTraitValues([]);
                  } else {
                    setSelectedTraitValues([value]);
                  }
                }}
                className={`px-4 py-2 font-bold text-sm border-2 rounded-md transition-colors flex items-center gap-2 ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                    : "bg-white text-black border-white hover:bg-gray-50"
                }`}
              >
                {value}
                {isSelected && (
                  <X className="h-3 w-3" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Loading State */}
      {(loading || searchLoading) && !(selectedTrait && selectedTraitValues.length === 0) && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

         {/* NFT Grid/List */}
         {!loading && !searchLoading && !(selectedTrait && selectedTraitValues.length === 0) && (
           <>
             {viewMode === 'grid' ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {filteredNfts
                   .filter((nft) => {
                     // Hide blank tokens for Humping Unicorns
                     if (selectedCollection === 'humping-unicorns') {
                       return nft.image && nft.image.trim() !== '';
                     }
                     return true;
                   })
                   .map((nft) => (
                   <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNFTClick(nft)}>
                     <CardContent className="p-0">
                       <div className="aspect-square relative bg-gray-100">
                         {nft.image ? (
                           <Image
                             src={nft.image}
                             alt={nft.name}
                             fill
                             sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                             className="object-cover"
                             onError={(e) => {
                               const target = e.target as HTMLImageElement;
                               target.style.display = 'none';
                             }}
                           />
                         ) : (
                           <div className="flex items-center justify-center h-full">
                             <ImageIcon className="h-12 w-12 text-gray-400" />
                           </div>
                         )}
                       </div>
                       <div className="p-4">
                         <h3 className="font-medium text-base truncate">{nft.name}</h3>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             ) : (
               <div className="space-y-4">
                 {filteredNfts
                   .filter((nft) => {
                     // Hide blank tokens for Humping Unicorns
                     if (selectedCollection === 'humping-unicorns') {
                       return nft.image && nft.image.trim() !== '';
                     }
                     return true;
                   })
                   .map((nft) => (
                <Card key={nft.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNFTClick(nft)}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 relative flex-shrink-0">
                        {nft.image ? (
                          <Image
                            src={nft.image}
                            alt={nft.name}
                            fill
                            sizes="80px"
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-2">{nft.name}</h3>
                        {nft.attributes && nft.attributes.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {nft.attributes.map((attr, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium text-gray-600">{attr.trait_type}:</span>
                                <span className="ml-1 text-gray-800">{attr.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {!loading && !searchTerm && !selectedTrait && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {renderPageNumbers()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Page Info */}
      {!loading && !searchTerm && !selectedTrait && (
        <div className="text-center text-sm text-gray-500">
          Page {pagination.page} of {pagination.totalPages} • {pagination.totalSupply} total NFTs
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredNfts.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedTrait && selectedTraitValues.length === 0 ? 'Select a trait value' : 'No NFTs found'}
          </h3>
          <p className="text-gray-500">
            {selectedTrait && selectedTraitValues.length === 0 
              ? 'Choose a trait value from the options above to filter NFTs'
              : searchTerm || selectedTrait || selectedTraitValues.length > 0 
                ? 'Try adjusting your search or filters' 
                : 'This collection appears to be empty'
            }
          </p>
        </div>
      )}

      {/* Show "Select a trait value" when trait is selected but no value chosen */}
      {!loading && selectedTrait && selectedTraitValues.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a trait value</h3>
          <p className="text-gray-500">Choose a trait value from the options above to filter NFTs</p>
        </div>
      )}

      {/* NFT Detail Modal */}
      <NFTDetailModal
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        collectionName={getCollectionName(selectedCollection)}
        onTraitClick={handleTraitClick}
      />
    </div>
  );
}