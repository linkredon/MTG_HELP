import React from 'react';
import { MTGCard } from '@/types/mtg';
import { Button } from '@/components/ui/button';
import { Plus, Info } from 'lucide-react';
import QuantityControl from './QuantityControl';
import Image from 'next/image';

interface CardVersionSelectorProps {
  card: MTGCard;
  otherVersions: MTGCard[];
  onAddCard: (card: MTGCard, quantity?: number) => void;
  onViewDetails: (card: MTGCard) => void;
  className?: string;
  layout?: 'compact' | 'full';
}

export default function CardVersionSelector({
  card,
  otherVersions,
  onAddCard,
  onViewDetails,
  className = '',
  layout = 'full'
}: CardVersionSelectorProps) {
  // Função para obter URL da imagem com fallback
  const getCardImage = (card: MTGCard): string => {
    if (card.image_uris?.small) {
      return card.image_uris.small;
    } else if (card.card_faces?.[0]?.image_uris?.small) {
      return card.card_faces[0].image_uris.small;
    }
    return '';
  };

  return (
    <div className={`card-version-selector ${className}`}>
      {layout === 'compact' ? (
        // Layout compacto
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Button 
              size="sm" 
              className="h-7 px-1.5 bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => onAddCard(card, 1)}
            >
              <Plus className="h-3 w-3 mr-1" />
              <span className="text-xs">Adicionar</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-1.5 border-gray-600"
              onClick={() => onViewDetails(card)}
            >
              <Info className="h-3 w-3" />
            </Button>
          </div>
          
          {otherVersions.length > 0 && (
            <div className="mt-1 p-1.5 rounded border border-gray-700 bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">Outras versões:</p>
              <div className="grid grid-cols-3 gap-1">
                {otherVersions.slice(0, 3).map((version) => (
                  <button
                    key={version.id}
                    className="rounded overflow-hidden border border-gray-700 bg-gray-800 hover:border-blue-500/50 transition-all"
                    onClick={() => onAddCard(version, 1)}
                  >
                    <div className="aspect-[63/88] bg-gray-900">
                      {getCardImage(version) ? (
                        <img 
                          src={getCardImage(version)} 
                          alt={version.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[10px] text-gray-500">{version.set_code}</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                {otherVersions.length > 3 && (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-xs text-gray-400">+{otherVersions.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Layout completo
        <div>
          <QuantityControl 
            initialValue={1}
            onChange={(quantity) => onAddCard(card, quantity)}
            showPresets={true}
          />
        </div>
      )}
    </div>
  );
}
