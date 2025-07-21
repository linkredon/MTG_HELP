import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { MTGCard } from '@/types/mtg';

interface CollectionIndicatorProps {
  card: MTGCard;
  collection: Array<{
    card: MTGCard;
    quantity: number;
    condition: string;
    foil: boolean;
  }>;
  compact?: boolean;
}

export default function CollectionIndicator({ 
  card, 
  collection,
  compact = false
}: CollectionIndicatorProps) {
  const quantity = useMemo(() => {
    return collection
              .filter(item => item.card?.id === card.id)
      .reduce((total, item) => total + item.quantity, 0);
  }, [card.id, collection]);

  if (quantity === 0) return null;

  if (compact) {
    return (
      <Badge 
        variant="outline" 
        className="h-5 px-1.5 bg-blue-900/50 text-blue-300 border-blue-700/50 text-[10px] ml-1"
      >
        {quantity}x
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className="bg-blue-600/90 text-white border-blue-500/50 shadow-glow-sm"
    >
      {quantity}x
    </Badge>
  );
}
