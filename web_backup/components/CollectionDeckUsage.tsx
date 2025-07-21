"use client"

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Target, Eye, ExternalLink } from 'lucide-react';
import type { MTGCard } from '@/types/mtg';

interface CollectionDeckUsageProps {
  card: MTGCard;
  onViewDeck?: (deckId: string) => void;
  className?: string;
}

const CollectionDeckUsage: React.FC<CollectionDeckUsageProps> = ({
  card,
  onViewDeck,
  className = ""
}) => {
  const { getCartasUsadasEmDecks } = useAppContext();
  
  const deckUsages = card?.id ? getCartasUsadasEmDecks(card.id) : [];

  if (deckUsages.length === 0) {
    return null;
  }

  const totalUsedInDecks = deckUsages.reduce((sum, usage) => sum + usage.quantity, 0);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-gray-300">
          Usada em {deckUsages.length} deck{deckUsages.length !== 1 ? 's' : ''}
        </span>
        <Badge variant="outline" className="text-xs">
          {totalUsedInDecks} total
        </Badge>
      </div>
      
      <div className="space-y-1">
        {deckUsages.map((usage, index) => (
          <div 
            key={`${usage.deck.id}-${usage.category}-${index}`}
            className="flex items-center justify-between p-2 bg-gray-700/30 rounded border border-gray-600/50"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Package className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">
                  {usage.deck.name}
                </div>
                <div className="text-xs text-gray-400">
                  {usage.deck.format} • {usage.category}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {usage.quantity}x
              </Badge>
              
              {onViewDeck && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewDeck(usage.deck.id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionDeckUsage;
