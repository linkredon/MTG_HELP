"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCardModal } from '@/contexts/CardModalContext';
import DeckSelector from '@/components/DeckSelector';
import CardViewOptions from '@/components/CardViewOptions';
import { Plus, Minus, Info, AlertCircle, Eye, ChevronDown, ChevronUp, Loader2, Search, Package } from 'lucide-react';
import Image from 'next/image';
import type { MTGCard } from '@/types/mtg';
import { translatePtToEn, cardMatchesSearchTerm } from '@/utils/translationService';
import { getImageUrl, getDoubleFacedImageUrls } from '@/utils/imageService';
import { getAllPrintsByNameWithTranslation } from '@/utils/scryfallService';

interface CollectionCard {
  card: MTGCard;
  quantity: number;
  condition: string;
  foil: boolean;
}

interface SearchCardListProps {
  cards: MTGCard[];
  collection: CollectionCard[];
  onAddCard: (card: MTGCard, quantity?: number) => void;
  className?: string;
}

// Função utilitária para seguramente acessar propriedades de cartas
const safeCardAccess = {
  setCode: (card: any): string => {
    try {
      if (!card) return 'N/A';
      if (card.set_code === undefined || card.set_code === null) return 'N/A';
      if (typeof card.set_code !== 'string') return String(card.set_code);
      return card.set_code.toUpperCase();
    } catch (e) {
      console.warn('Erro ao acessar set_code', e);
      return 'N/A';
    }
  },
  setName: (card: any): string => {
    try {
      if (!card) return 'Coleção desconhecida';
      return card.set_name || 'Coleção desconhecida';
    } catch (e) {
      console.warn('Erro ao acessar set_name', e);
      return 'Coleção desconhecida';
    }
  }
};

// Função utilitária para obter a imagem da carta com fallback
const getCardImage = (card: MTGCard, size: 'small' | 'normal' = 'small'): string => {
  return getImageUrl(card, size);
};

// Componente para badge de quantidade com memo
const QuantityBadge = React.memo(({ card, collection }: { card: MTGCard; collection: CollectionCard[] }) => {
  const quantity = useMemo(() => {
    return collection
      .filter(item => item.card.id === card.id)
      .reduce((total, item) => total + item.quantity, 0);
  }, [card.id, collection]);

  if (quantity === 0) return null;

  return (
    <Badge 
      variant="secondary" 
      className="absolute top-2 left-2 bg-blue-600/90 text-white border-blue-500/50 z-10 backdrop-blur-sm"
    >
      {quantity}x na coleção
    </Badge>
  );
});

QuantityBadge.displayName = 'QuantityBadge';

// Usando o componente QuantityControl melhorado
import QuantityControlComponent from '@/components/QuantityControl';

// Componente para controle de quantidade (wrapper para o novo componente)
const QuantityControl = React.memo(({ onAdd, compact = false }: { onAdd: (quantity: number) => void; compact?: boolean }) => {
  const [isAdding, setIsAdding] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAdd = useCallback((quantity: number) => {
    setIsAdding(true);
    onAdd(quantity);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set timeout to reset adding state
    timeoutRef.current = setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  }, [onAdd]);

  if (compact) {
    return (
      <QuantityControlComponent
        initialValue={1}
        onChange={handleAdd}
        showPresets={false}
        className="scale-90 origin-top-left"
      />
    );
  }

  return (
    <QuantityControlComponent
      initialValue={1}
      onChange={handleAdd}
      showPresets={true}
    />
  );
});

QuantityControl.displayName = 'QuantityControl';

// Componente de carta individual
const SearchCardItem = React.memo(({ 
  card, 
  collection, 
  onAddCard,
  viewMode 
}: { 
  card: MTGCard; 
  collection: CollectionCard[];
  onAddCard: (card: MTGCard, quantity?: number) => void;
  viewMode: string;
}) => {
  const { openModal } = useCardModal();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [versionsData, setVersionsData] = useState<{
    versions: MTGCard[];
    loading: boolean;
    error: string | null;
  }>({ versions: [], loading: false, error: null });
  const [addingVersions, setAddingVersions] = useState<Record<string, boolean>>({});

  const imageUrl = useMemo(() => getCardImage(card, 'small'), [card]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(card);
  }, [card, openModal]);

  const handleAddCard = useCallback((quantity: number = 1) => {
    onAddCard(card, quantity);
  }, [card, onAddCard]);

  // Função para buscar versões alternativas
  const fetchVersions = useCallback(async () => {
    if (versionsData.loading) return;

    setVersionsData({ versions: [], loading: true, error: null });

    try {
      const response = await getAllPrintsByNameWithTranslation(card.name);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar versões');
      }

      const data = await response.json();
      const versions = data.data || [];
      
      // Filtrar a carta atual e versões já na coleção
      const collectionIds = new Set(collection.map(c => c.card.id));
      const filteredVersions = versions.filter((v: MTGCard) => 
        v.id !== card.id && !collectionIds.has(v.id)
      );

      setVersionsData({ 
        versions: filteredVersions, 
        loading: false, 
        error: null 
      });
    } catch (error) {
      console.error('Erro ao buscar versões:', error);
      setVersionsData({ 
        versions: [], 
        loading: false, 
        error: 'Erro ao buscar versões alternativas' 
      });
    }
  }, [card.name, card.id, collection]);

  // Função para alternar exibição de versões
  const toggleVersions = useCallback(async () => {
    const wasHidden = !showVersions;
    
    if (!showVersions && versionsData.versions.length === 0 && !versionsData.loading) {
      await fetchVersions();
    }
    setShowVersions(prev => !prev);

    // Scroll para o topo quando abrir o box de outras versões
    if (wasHidden) {
      setTimeout(() => {
        const element = document.querySelector(`[data-card-name="${card.id}"]`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [showVersions, versionsData, fetchVersions, card.id]);

  // Função para adicionar versão alternativa
  const handleAddVersion = useCallback(async (version: MTGCard, quantity: number = 1) => {
    setAddingVersions(prev => ({ ...prev, [version.id]: true }));
    
    try {
      onAddCard(version, quantity);
      
      // Remover versão da lista após adicionar
      setVersionsData(prev => ({
        ...prev,
        versions: prev.versions.filter(v => v.id !== version.id)
      }));
      
      // Feedback visual
      setTimeout(() => {
        setAddingVersions(prev => ({ ...prev, [version.id]: false }));
      }, 1000);
    } catch (error) {
      console.error('Erro ao adicionar versão:', error);
      setAddingVersions(prev => ({ ...prev, [version.id]: false }));
    }
  }, [onAddCard]);

  // Renderizar painel de versões alternativas
  const renderVersionsPanel = useCallback(() => {
    if (!showVersions) return null;

    return (
      <div className="mt-4 mtg-card">
        <div className="mtg-card-header">
          <Search className="mtg-card-icon" />
          <div className="mtg-card-content">
            <h5 className="mtg-card-title text-sm">Outras versões de "{card.name}"</h5>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto px-6 pb-6">
          {versionsData.loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
              <span className="text-slate-300 text-sm">Buscando versões...</span>
            </div>
          ) : versionsData.error ? (
            <div className="text-red-400 text-sm flex items-center gap-2 py-4">
              <AlertCircle className="w-4 h-4" />
              <span>{versionsData.error}</span>
            </div>
          ) : versionsData.versions.length === 0 ? (
            <div className="text-slate-400 text-sm py-4 text-center">
              Nenhuma versão alternativa encontrada
            </div>
          ) : (
            <div className="space-y-3">
              {versionsData.versions.map((version) => (
                <div 
                  key={version.id} 
                  className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors group border border-slate-700/30"
                >
                  {/* Imagem miniatura */}
                  <div className="w-12 h-16 bg-slate-900 rounded-lg overflow-hidden border border-slate-600/50 flex-shrink-0">
                    {getCardImage(version) ? (
                      <img
                        src={getCardImage(version)}
                        alt={version.name}
                        className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => openModal(version)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-slate-500 text-center">
                          {safeCardAccess.setCode(version)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informações da versão */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">
                      {safeCardAccess.setCode(version)}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {safeCardAccess.setName(version)}
                    </div>
                  </div>

                  {/* Controle de adicionar */}
                  <div className="flex items-center gap-1">
                    <QuantityControl 
                      onAdd={(quantity) => handleAddVersion(version, quantity)} 
                      compact={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }, [showVersions, versionsData, card.name, openModal, handleAddVersion]);

  // Grid view (versão compacta como no CardList original)
  if (viewMode === 'grid') {
    return (
      <div className="relative group" data-card-name={card.id}>
        <QuantityBadge card={card} collection={collection} />
        
        <div 
          className="cursor-pointer rounded-xl overflow-hidden flex flex-col border border-slate-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all bg-slate-800/30 backdrop-blur-sm"
          onClick={handleViewDetails}
        >
          {imageUrl && !imageError ? (
            <div className="aspect-[63/88] relative overflow-hidden bg-slate-900 flex items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 bg-slate-700 rounded-t-xl animate-pulse flex items-center justify-center">
                  <div className="text-slate-400 text-xs">Carregando...</div>
                </div>
              )}
              <Image
                src={imageUrl}
                alt={card.name}
                fill
                className={`object-contain transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
            </div>
          ) : (
            <div className="aspect-[63/88] bg-slate-800 flex items-center justify-center text-center p-2">
              <span className="text-xs text-slate-400">{card.name}</span>
            </div>
          )}
          
          <div className="bg-slate-800/50 p-2 min-h-[80px] flex flex-col items-center justify-center gap-1">
            <div 
              className="opacity-0 group-hover:opacity-100 transition-opacity w-full" 
              onClick={(e) => e.stopPropagation()}
            >
              <QuantityControl onAdd={handleAddCard} compact={true} />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVersions();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-400 hover:text-blue-300 h-5 px-2 rounded border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-colors flex items-center gap-1"
            >
              {showVersions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Versões
            </button>
          </div>
        </div>
        
        {renderVersionsPanel()}
      </div>
    );
  }

  // Details view (versão expandida com mais informações)
  if (viewMode === 'details') {
    return (
      <div data-card-name={card.id}>
        <div className="mtg-card">
          <div className="p-6">
            <div className="flex gap-6">
              <QuantityBadge card={card} collection={collection} />
              
              <div className="relative flex-shrink-0">
                {imageUrl && !imageError ? (
                  <div className="relative w-32 h-44">
                    {isLoading && (
                      <div className="absolute inset-0 bg-slate-700 rounded-lg animate-pulse"></div>
                    )}
                    <Image
                      src={imageUrl}
                      alt={card.name}
                      fill
                      className={`object-cover rounded-lg transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      sizes="128px"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-44 bg-slate-700 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-white font-semibold text-lg">{card.name}</h3>
                  <p className="text-slate-400">{card.set_name}</p>
                  <p className="text-slate-500 text-sm">{card.type_line}</p>
                </div>
                
                {card.oracle_text && (
                  <div className="text-slate-300 text-sm">
                    <p className="font-medium text-slate-200 mb-1">Texto:</p>
                    <p className="italic">{card.oracle_text}</p>
                  </div>
                )}
                
                {(card.power || card.toughness) && (
                  <div className="text-slate-300 text-sm">
                    <span className="font-medium text-slate-200">P/T:</span> {card.power}/{card.toughness}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 items-end">
                <QuantityControl onAdd={handleAddCard} />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleViewDetails}
                    variant="outline"
                    className="quantum-btn compact"
                  >
                    <Info className="h-4 w-4" />
                    <span>Ver Detalhes</span>
                  </Button>
                  <Button 
                    onClick={toggleVersions}
                    variant="outline"
                    className="quantum-btn compact"
                  >
                    {showVersions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Seletor de Deck - apenas no modo detalhes */}
                <div className="w-full mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-slate-300">Adicionar a Deck</span>
                  </div>
                  <DeckSelector 
                    card={card}
                    className="w-full"
                    showCreateDeck={true}
                    showCategorySelect={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {renderVersionsPanel()}
      </div>
    );
  }

  // List view (versão horizontal compacta)
  return (
    <div data-card-name={card.id}>
      <div className="mtg-card-mini">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <QuantityBadge card={card} collection={collection} />
            
            <div className="relative flex-shrink-0">
              {imageUrl && !imageError ? (
                <div className="relative w-16 h-20">
                  {isLoading && (
                    <div className="absolute inset-0 bg-slate-700 rounded-lg animate-pulse"></div>
                  )}
                  <Image
                    src={imageUrl}
                    alt={card.name}
                    fill
                    className={`object-cover rounded-lg transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-20 bg-slate-700 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-slate-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium">{card.name}</h3>
              <p className="text-slate-400 text-sm">{card.set_name}</p>
              <p className="text-slate-500 text-xs">{card.type_line}</p>
            </div>

            <div className="flex items-center gap-2">
              <QuantityControl onAdd={handleAddCard} />
              <Button 
                onClick={handleViewDetails}
                variant="outline"
                className="quantum-btn compact"
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button 
                onClick={toggleVersions}
                variant="outline"
                className="quantum-btn compact"
              >
                {showVersions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {renderVersionsPanel()}
    </div>
  );
});

SearchCardItem.displayName = 'SearchCardItem';

export default function SearchCardList({ cards, collection, onAddCard, className = '' }: SearchCardListProps) {
  const { visualizationType } = useCardModal();

  const containerClass = useMemo(() => {
    switch (visualizationType) {
      case 'grid':
        return `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ${className}`;
      case 'details':
        return `space-y-6 ${className}`;
      default: // list
        return `space-y-3 ${className}`;
    }
  }, [visualizationType, className]);
  
  // Componente de controle de visualização
  const ViewControls = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 bg-slate-800/30 p-3 rounded-md border border-slate-700/50">
      <div>
        <h3 className="text-white font-medium flex items-center">
          <Search className="w-4 h-4 mr-2 text-blue-400" />
          Resultados da Pesquisa
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Foram encontradas {cards.length} cartas correspondentes à sua busca
        </p>
      </div>
      <div className="flex items-center bg-slate-800/70 rounded-md p-1.5 border border-slate-700/30">
        <span className="text-xs text-slate-400 mr-2 hidden sm:inline-block">Visualização:</span>
        <CardViewOptions size="sm" className="inline-flex" />
      </div>
    </div>
  );

  return (
    <>
      <ViewControls />
      <div className={containerClass}>
        {cards.map((card) => (
          <SearchCardItem
            key={`search-card-item-${card.id}`}
            card={card}
            collection={collection}
            onAddCard={onAddCard}
            viewMode={visualizationType}
          />
        ))}
      </div>
    </>
  );
}
