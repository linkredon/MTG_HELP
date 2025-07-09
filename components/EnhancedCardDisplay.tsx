"use client"

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Package } from 'lucide-react';
import { getImageUrl } from '@/utils/imageService';
import type { MTGCard } from '@/types/mtg';

interface EnhancedCardDisplayProps {
  cards: any[];
  viewMode: 'grid' | 'spoiler';
  onCardClick: (card: MTGCard) => void;
  onMoveCard: (cardId: string, fromCategory: 'mainboard' | 'sideboard' | 'commander', toCategory: 'mainboard' | 'sideboard' | 'commander') => void;
  onUpdateQuantity: (cardId: string, category: 'mainboard' | 'sideboard' | 'commander', newQuantity: number) => void;
  onRemoveCard: (cardId: string, category: 'mainboard' | 'sideboard' | 'commander') => void;
}

const EnhancedCardDisplay: React.FC<EnhancedCardDisplayProps> = ({ 
  cards, 
  viewMode, 
  onCardClick, 
  onMoveCard, 
  onUpdateQuantity, 
  onRemoveCard 
}) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-70" />
        <p className="text-gray-400 text-sm">Nenhuma carta para exibir</p>
      </div>
    );
  }

  // Agrupar cartas por categoria
  const cardsByCategory = {
    mainboard: cards.filter(card => card.category === 'mainboard'),
    sideboard: cards.filter(card => card.category === 'sideboard'),
    commander: cards.filter(card => card.category === 'commander')
  };

  // Função para renderizar o menu de movimentação de cartas
  const renderMoveMenu = (deckCard: any) => {
    const currentCategory = deckCard.category;
    
    return (
      <div className="absolute top-1 right-1 bg-black/70 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {currentCategory !== 'mainboard' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMoveCard(deckCard.card.id, currentCategory, 'mainboard');
            }}
            className="w-6 h-6 rounded bg-green-600/70 hover:bg-green-500 text-white flex items-center justify-center"
            title="Mover para Main Deck"
          >
            M
          </button>
        )}
        {currentCategory !== 'sideboard' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMoveCard(deckCard.card.id, currentCategory, 'sideboard');
            }}
            className="w-6 h-6 rounded bg-purple-600/70 hover:bg-purple-500 text-white flex items-center justify-center"
            title="Mover para Sideboard"
          >
            S
          </button>
        )}
        {currentCategory !== 'commander' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMoveCard(deckCard.card.id, currentCategory, 'commander');
            }}
            className="w-6 h-6 rounded bg-yellow-600/70 hover:bg-yellow-500 text-white flex items-center justify-center"
            title="Mover para Commander"
          >
            C
          </button>
        )}
      </div>
    );
  };

  // Renderizar seções separadas para cada categoria
  const renderCategorySection = (title: string, categoryCards: any[], categoryClass: string) => {
    if (categoryCards.length === 0) return null;
    
    return (
      <div className="mb-6">
        <div className={`text-sm font-medium mb-2 pb-1 border-b ${categoryClass}`}>
          {title} ({categoryCards.reduce((sum, card) => sum + card.quantity, 0)} cartas)
        </div>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categoryCards.map((deckCard) => (
              <div key={`${deckCard.card.id}-${deckCard.category}`} className="relative group">
                <div className="aspect-[63/88] bg-gray-800/80 rounded-md overflow-hidden shadow-md">
                  {getImageUrl(deckCard.card) ? (
                    <Image
                      src={getImageUrl(deckCard.card)}
                      alt={deckCard.card.name}
                      fill
                      className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => onCardClick(deckCard.card)}
                      sizes="120px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                      {deckCard.card.name}
                    </div>
                  )}
                  
                  <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                    {deckCard.quantity}
                  </div>
                  
                  {renderMoveMenu(deckCard)}
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{deckCard.card.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {categoryCards.map((deckCard) => (
              <div 
                key={`${deckCard.card.id}-${deckCard.category}`} 
                className="flex gap-3 p-3 bg-gray-800/40 rounded border border-gray-700 hover:bg-gray-700/40 transition-colors group"
              >
                <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                  {getImageUrl(deckCard.card, 'normal') ? (
                    <Image
                      src={getImageUrl(deckCard.card, 'normal')}
                      alt={deckCard.card.name}
                      width={48}
                      height={64}
                      className="object-cover cursor-pointer"
                      onClick={() => onCardClick(deckCard.card)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
                      {deckCard.card.name}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-gray-100 font-medium text-sm cursor-pointer hover:text-blue-400 truncate" onClick={() => onCardClick(deckCard.card)}>
                      {deckCard.card.name}
                    </h3>
                    <Badge className="bg-blue-600/30 text-blue-200 border-0 text-xs flex-shrink-0">
                      {deckCard.quantity}x
                    </Badge>
                  </div>
                  
                  <p className="text-gray-300 text-xs truncate">{deckCard.card.type_line}</p>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 bg-gray-700 rounded">
                    <button
                      onClick={() => onUpdateQuantity(deckCard.card.id, deckCard.category, deckCard.quantity - 1)}
                      className="h-6 w-6 p-0 hover:bg-red-600 text-red-400 hover:text-white rounded-l transition-colors flex items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onUpdateQuantity(deckCard.card.id, deckCard.category, deckCard.quantity + 1)}
                      className="h-6 w-6 p-0 hover:bg-green-600 text-green-400 hover:text-white rounded-r transition-colors flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  
                  {/* Botões para mover entre categorias */}
                  {deckCard.category !== 'mainboard' && (
                    <button
                      onClick={() => onMoveCard(deckCard.card.id, deckCard.category, 'mainboard')}
                      className="h-6 w-6 p-0 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded transition-colors flex items-center justify-center"
                      title="Mover para Main Deck"
                    >
                      M
                    </button>
                  )}
                  {deckCard.category !== 'sideboard' && (
                    <button
                      onClick={() => onMoveCard(deckCard.card.id, deckCard.category, 'sideboard')}
                      className="h-6 w-6 p-0 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white rounded transition-colors flex items-center justify-center"
                      title="Mover para Sideboard"
                    >
                      S
                    </button>
                  )}
                  {deckCard.category !== 'commander' && (
                    <button
                      onClick={() => onMoveCard(deckCard.card.id, deckCard.category, 'commander')}
                      className="h-6 w-6 p-0 bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white rounded transition-colors flex items-center justify-center"
                      title="Mover para Commander"
                    >
                      C
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-3">
      {renderCategorySection('Main Deck', cardsByCategory.mainboard, 'border-green-500/50 text-green-400')}
      {renderCategorySection('Sideboard', cardsByCategory.sideboard, 'border-purple-500/50 text-purple-400')}
      {renderCategorySection('Commander', cardsByCategory.commander, 'border-yellow-500/50 text-yellow-400')}
    </div>
  );
};

export default EnhancedCardDisplay;