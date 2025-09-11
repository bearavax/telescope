'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import Image from 'next/image';

interface NFTItem {
  id: number;
  name: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFTDetailModalProps {
  nft: NFTItem | null;
  isOpen: boolean;
  onClose: () => void;
  collectionName?: string;
  onTraitClick?: (traitType: string, traitValue: string) => void;
}

export function NFTDetailModal({ nft, isOpen, onClose, collectionName, onTraitClick }: NFTDetailModalProps) {
  if (!nft) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{nft.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* NFT Image */}
          <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
            <Image
              src={nft.image || '/placeholder-nft.png'}
              alt={nft.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* NFT Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Token ID: #{nft.id}
              </h3>
            </div>

            {/* Traits */}
            {nft.attributes && nft.attributes.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Traits
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nft.attributes.map((trait, index) => (
                    <div
                      key={index}
                      className={`bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border ${
                        onTraitClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors' : ''
                      }`}
                      onClick={() => onTraitClick?.(trait.trait_type, trait.value)}
                    >
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {trait.trait_type}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {trait.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collection Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Collection:</span>
              <Badge variant="secondary" className="text-xs">
                {collectionName || 'NFT Collection'}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
