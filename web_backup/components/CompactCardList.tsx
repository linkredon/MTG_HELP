import React, { useState } from 'react';
import { MTGCard } from '@/types/mtg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FilterX, Grid3X3, LayoutList, Plus } from 'lucide-react';
import CardVersionSelector from './CardVersionSelector';
import { getImageUrl } from '@/utils/imageService';
import { useCardModal } from '@/contexts/CardModalContext';

interface CompactCardListProps {
  cards: MTGCard[];
  onAddCard: (card: MTGCard, quantity?: number) => void;
  hasFilters?: boolean;
  showSearch?: boolean;
  className?: string;
}

export default function CompactCardList({
  cards,
  onAddCard,
  hasFilters = true,
  showSearch = true,
  className = ''
}: CompactCardListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { openModal } = useCardModal();
  
  // Filtrar cartas com base na pesquisa
  const filteredCards = cards.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.set_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.type_line.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Função para exibir detalhes da carta
  const handleViewDetails = (card: MTGCard) => {
    openModal(card);
  };
  
  // Obter URL da imagem da carta
  const getCardImage = (card: MTGCard): string => {
    return getImageUrl(card, 'small');
  };

  return (
    <div className={`compact-card-list ${className}`}>
      {/* Barra de controles */}
      {(showSearch || hasFilters) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {showSearch && (
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar cartas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-800/50 border-gray-700"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FilterX className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          
          {/* Botões para alternar visualização */}
          <div className="flex items-center rounded-md border border-gray-700 bg-gray-800/50 p-0.5">
            <Button
              onClick={() => setViewMode('grid')}
              variant="ghost"
              size="sm"
              className={`px-2 ${viewMode === 'grid' ? 'bg-gray-700' : ''}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant="ghost"
              size="sm"
              className={`px-2 ${viewMode === 'list' ? 'bg-gray-700' : ''}`}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Contagem de resultados */}
      {filteredCards.length > 0 ? (
        <p className="text-sm text-gray-400 mb-3">
          {filteredCards.length} {filteredCards.length === 1 ? 'carta' : 'cartas'} encontradas
        </p>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">Nenhuma carta encontrada.</p>
        </div>
      )}
      
      {/* Visualização em Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredCards.map((card) => (
            <div 
              key={card.id}
              className="group relative border border-gray-700 rounded-lg overflow-hidden bg-gray-800/40 hover:border-blue-500/50 hover:bg-gray-800/70 transition-all"
            >
              {/* Imagem da carta */}
              <div 
                className="aspect-[63/88] cursor-pointer"
                onClick={() => handleViewDetails(card)}
              >
                {getCardImage(card) ? (
                  <img
                    src={getCardImage(card)}
                    alt={card.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">{card.name}</span>
                  </div>
                )}
              </div>
              
              {/* Informações básicas e ações */}
              <div className="p-2">
                <div 
                  className="text-sm font-medium truncate cursor-pointer"
                  onClick={() => handleViewDetails(card)}
                >
                  {card.name}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {card.set_name}
                </div>
                
                {/* Botão de adicionar que aparece ao passar o mouse */}
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CardVersionSelector
                    card={card}
                    otherVersions={[]} // Em um cenário real, você buscaria versões relacionadas
                    onAddCard={onAddCard}
                    onViewDetails={handleViewDetails}
                    layout="compact"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Visualização em Lista */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {filteredCards.map((card) => (
            <div 
              key={card.id}
              className="group flex items-center gap-3 p-2 border border-gray-700 rounded-lg bg-gray-800/40 hover:border-blue-500/50 hover:bg-gray-800/70 transition-all"
            >
              {/* Miniatura da carta */}
              <div 
                className="w-10 h-14 bg-gray-900 rounded overflow-hidden flex-shrink-0 cursor-pointer"
                onClick={() => handleViewDetails(card)}
              >
                {getCardImage(card) ? (
                  <img
                    src={getCardImage(card)}
                    alt={card.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500 text-[10px]">{card.set_code}</span>
                  </div>
                )}
              </div>
              
              {/* Informações da carta */}
              <div 
                className="flex-grow min-w-0 cursor-pointer"
                onClick={() => handleViewDetails(card)}
              >
                <div className="text-sm font-medium">{card.name}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <span>{card.set_name}</span>
                  <span className="text-gray-600">•</span>
                  <span>{card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}</span>
                </div>
                <div className="text-xs text-gray-500 truncate">{card.type_line}</div>
              </div>
              
              {/* Botão de adição rápida */}
              <div>
                <Button 
                  size="sm"
                  className="h-8 bg-blue-600 hover:bg-blue-700"
                  onClick={() => onAddCard(card, 1)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
