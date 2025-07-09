"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { Plus, Minus, Grid, List, LayoutList } from 'lucide-react'
import Image from 'next/image'
import { useCardModal } from '@/contexts/CardModalContext'
import FavoriteButton from './FavoriteButton'
import type { MTGCard, CollectionCard } from '@/types/mtg'

interface ExpandableCardGridProps {
  collectionCards: CollectionCard[]
  onAddCard?: (card: MTGCard) => void
  onRemoveCard?: (card: MTGCard | string) => void
}

export default function ExpandableCardGrid({
  collectionCards,
  onAddCard,
  onRemoveCard
}: ExpandableCardGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'details'>('grid')
  const { openModal } = useCardModal()

  return (
    <div>
      {/* View Controls */}
      <div className="flex justify-end mb-3">
        <div className="flex rounded-md overflow-hidden border border-gray-700">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className={`rounded-none ${viewMode === 'grid' ? 'bg-indigo-600' : 'bg-gray-800'}`}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            className={`rounded-none ${viewMode === 'list' ? 'bg-indigo-600' : 'bg-gray-800'}`}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'details' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('details')}
            className={`rounded-none ${viewMode === 'details' ? 'bg-indigo-600' : 'bg-gray-800'}`}
          >
            <LayoutList className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {collectionCards.map(({ card, quantity }) => (
            <div 
              key={card.id} 
              className="relative rounded-lg overflow-hidden transition-all hover:scale-[1.03] group favorite-card"
              onClick={() => openModal(card)}
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
                
                {/* Favorite button */}
                <div className="absolute top-2 right-2 z-10">
                  <FavoriteButton card={card} size="sm" className="favorite-button" />
                </div>
                
                {/* Quantity badge */}
                {quantity > 0 && (
                  <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {quantity}
                  </div>
                )}
                
                {/* Controls overlay */}
                {(onAddCard || onRemoveCard) && (
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
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {collectionCards.map(({ card, quantity }) => (
            <div 
              key={card.id}
              className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => openModal(card)}
            >
              <div className="w-10 h-14 relative flex-shrink-0">
                <Image
                  src={card.image_uris?.small || card.image_uris?.normal || '/placeholder-card.jpg'}
                  alt={card.name}
                  fill
                  className="object-cover rounded"
                />
                
                {/* Quantity badge */}
                {quantity > 0 && (
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {quantity}
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
                <FavoriteButton card={card} size="sm" />
                
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details View */}
      {viewMode === 'details' && (
        <div className="space-y-3">
          {collectionCards.map(({ card, quantity }) => (
            <div 
              key={card.id} 
              className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => openModal(card)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 relative">
                  <Image 
                    src={card.image_uris?.art_crop || card.image_uris?.normal || '/placeholder-card.jpg'}
                    alt={card.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Quantity badge */}
                  {quantity > 0 && (
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {quantity}
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm truncate">{card.name}</h4>
                    <FavoriteButton card={card} size="sm" />
                  </div>
                  <p className="text-xs text-gray-400">{card.type_line}</p>
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
                </div>
              </div>
              <div className="text-xs text-gray-300 mt-2">
                {card.oracle_text?.split('\n').map((text, i) => (
                  <p key={i} className="mb-1">{text}</p>
                ))}
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <div>{card.set_name} ({card.set_code.toUpperCase()})</div>
                <div>{card.rarity}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}