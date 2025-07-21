"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import { Plus, Minus } from 'lucide-react'
import type { MTGCard } from '@/types/mtg'

export interface CardListProps {
  cards: MTGCard[]
  quantities?: number[]
  onCardClick?: (card: MTGCard) => void
  onAddCard?: (card: MTGCard) => void
  onRemoveCard?: (card: MTGCard | string) => void
  showQuantity?: boolean
  showActionButton?: boolean
  actionButtonLabel?: string
  onActionButtonClick?: (card: MTGCard) => void
  className?: string
}

export default function CardList({ 
  cards, 
  quantities, 
  onCardClick, 
  onAddCard, 
  onRemoveCard,
  showQuantity = false,
  showActionButton = false,
  actionButtonLabel = 'Ação',
  onActionButtonClick,
  className = ''
}: CardListProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  
  // Usar a visualização salva no localStorage, se disponível
  useState(() => {
    const savedView = localStorage.getItem('cardView')
    if (savedView === 'grid' || savedView === 'list') {
      setView(savedView)
    }
  })
  
  if (view === 'grid') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${className}`}>
        {cards.map((card, index) => (
          <div 
            key={card.id} 
            className="relative rounded-lg overflow-hidden transition-all hover:scale-[1.03] group"
            onClick={() => onCardClick?.(card)}
          >
            <div className="relative">
              <Image
                src={card.image_uris?.normal || '/placeholder-card.jpg'}
                alt={card.name}
                width={265}
                height={370}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white truncate">{card.name}</span>
                  <span className="text-xs text-gray-300">{card.rarity}</span>
                </div>
              </div>
              
              {/* Quantity badge */}
              {showQuantity && quantities && quantities[index] > 0 && (
                <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {quantities[index]}
                </div>
              )}
              
              {/* Controls overlay */}
              {(onAddCard || onRemoveCard || (showActionButton && onActionButtonClick)) && (
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  {onAddCard && (
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddCard(card);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  )}
                  
                  {onRemoveCard && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCard(card);
                      }}
                      className="border-red-600 text-red-500 hover:bg-red-900/20"
                    >
                      <Minus className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                  )}
                  
                  {showActionButton && onActionButtonClick && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onActionButtonClick(card);
                      }}
                      className="border-blue-600 text-blue-500 hover:bg-blue-900/20"
                    >
                      {actionButtonLabel}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      {cards.map((card, index) => (
        <div 
          key={card.id}
          className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          onClick={() => onCardClick?.(card)}
        >
          <div className="w-10 h-14 relative flex-shrink-0">
            <Image
              src={card.image_uris?.small || card.image_uris?.normal || '/placeholder-card.jpg'}
              alt={card.name}
              fill
              className="object-cover rounded"
            />
            
            {/* Quantity badge */}
            {showQuantity && quantities && quantities[index] > 0 && (
              <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {quantities[index]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-sm truncate">{card.name}</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                {card.set_name} ({card.set_code.toUpperCase()})
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {card.type_line}
            </p>
          </div>
          <div className="flex gap-1">
            {onAddCard && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddCard(card);
                }}
                className="flex-shrink-0 h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
            
            {onRemoveCard && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCard(card);
                }}
                className="flex-shrink-0 h-8 w-8 p-0 text-red-500"
              >
                <Minus className="w-4 h-4" />
              </Button>
            )}
            
            {showActionButton && onActionButtonClick && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onActionButtonClick(card);
                }}
                className="flex-shrink-0"
              >
                {actionButtonLabel}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}