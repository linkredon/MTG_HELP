"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCardModal } from '@/contexts/CardModalContext';
import { Plus, Minus, Info, AlertCircle, Eye, ChevronDown, ChevronUp, Loader2, Search, Package, Star, Filter, PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { MTGCard } from '@/types/mtg';
import { getImageUrl } from '@/utils/imageService';
import { getAllPrintsByNameWithTranslation } from '@/utils/scryfallService';
import CollectionIndicator from '@/components/CollectionIndicator';
import CardViewOptions from '@/components/CardViewOptions';

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
  searchResults?: {
    hasMore?: boolean;
    nextPage?: () => void;
    totalCards?: number;
    currentPage?: number;
    isLoadingMore?: boolean;
  };
  onSortChange?: (sortMode: string, direction: string) => void;
  currentSort?: {
    mode: string;
    direction: string;
  };
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
  },
  rarity: (card: any): string => {
    try {
      if (!card) return 'comum';
      return card.rarity || 'comum';
    } catch (e) {
      console.warn('Erro ao acessar rarity', e);
      return 'comum';
    }
  },
};

// Função utilitária para obter a cor da raridade
const getRarityColor = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case 'common': return 'border-gray-500';
    case 'uncommon': return 'border-green-500';
    case 'rare': return 'border-yellow-500';
    case 'mythic': return 'border-orange-500';
    case 'special': return 'border-purple-500';
    case 'bonus': return 'border-blue-300';
    default: return 'border-gray-500';
  }
};

// Função utilitária para obter a cor da raridade como texto
const getRarityTextColor = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case 'common': return 'text-gray-400';
    case 'uncommon': return 'text-green-400';
    case 'rare': return 'text-yellow-400';
    case 'mythic': return 'text-orange-400';
    case 'special': return 'text-purple-400';
    case 'bonus': return 'text-blue-300';
    default: return 'text-gray-400';
  }
};

// Função utilitária para obter a imagem da carta com fallback
const getCardImage = (card: MTGCard, size: 'small' | 'normal' = 'small'): string => {
  return getImageUrl(card, size);
};

// Utilizando o componente CollectionIndicator importado

// Componente para controle de quantidade
const QuantityControl = React.memo(({ onAdd, compact = false }: { onAdd: (quantity: number) => void; compact?: boolean }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = useCallback(() => {
    onAdd(quantity);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1000);
  }, [quantity, onAdd]);

  const increment = useCallback(() => {
    setQuantity(prev => Math.min(prev + 1, 99));
  }, []);

  const decrement = useCallback(() => {
    setQuantity(prev => Math.max(prev - 1, 1));
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button 
          variant="outline"
          size="icon" 
          className="h-6 w-6 bg-gray-800 hover:bg-gray-700 border-gray-700" 
          onClick={handleAdd}
          disabled={isAdding}
        >
          {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button 
        variant="outline"
        size="icon" 
        className="h-7 w-7 bg-gray-800 hover:bg-gray-700 border-gray-700" 
        onClick={decrement}
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <div className="w-6 text-center text-sm font-medium">
        {quantity}
      </div>
      
      <Button 
        variant="outline"
        size="icon" 
        className="h-7 w-7 bg-gray-800 hover:bg-gray-700 border-gray-700" 
        onClick={increment}
      >
        <Plus className="h-3 w-3" />
      </Button>
      
      <Button 
        variant="default"
        className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700" 
        onClick={handleAdd}
        disabled={isAdding}
      >
        {isAdding ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
        <span>Adicionar</span>
      </Button>
    </div>
  );
});

QuantityControl.displayName = 'QuantityControl';

// Definindo as props do componente de carta
interface SearchCardItemProps {
  card: MTGCard;
  collection: CollectionCard[];
  onAddCard: (card: MTGCard, quantity?: number) => void;
  viewMode: string;
  index: number;
  isVersion?: boolean;
  originalId?: string;
  isExpanded?: boolean;
  isLoading?: boolean; // Indica se a carta está carregando dados (como versões)
  onToggleVersions?: () => void;
  versionsCount?: number;
  onShowInListing?: (card: MTGCard) => void;
  isPlaceholder?: boolean; // Indica se é um placeholder (mensagem especial)
  hasNoVersions?: boolean; // Indica se uma carta principal não tem versões
}

// Componente de carta individual
const SearchCardItem = React.memo(({ 
  card, 
  collection, 
  onAddCard,
  viewMode,
  index,
  isVersion = false,
  originalId,
  isExpanded = false,
  isLoading = false,
  onToggleVersions,
  versionsCount = 0,
  onShowInListing,
  isPlaceholder = false,
  hasNoVersions = false
}: SearchCardItemProps) => {
  const { openModal } = useCardModal();
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const imageUrl = useMemo(() => getCardImage(card, 'small'), [card]);
  const rarityBorderClass = useMemo(() => getRarityColor(safeCardAccess.rarity(card)), [card]);
  const rarityTextClass = useMemo(() => getRarityTextColor(safeCardAccess.rarity(card)), [card]);
  
  // Classes especiais para versões alternativas
  const versionClassNames = useMemo(() => {
    if (!isVersion) return '';
    
    // Verificar se a carta já foi adicionada à listagem principal
    const isInMainListing = card.id && onShowInListing === undefined;
    
    if (isInMainListing) {
      // Estilo para versões que já foram adicionadas à listagem principal
      return 'ring-2 ring-emerald-500/70 scale-95 origin-top-left shadow-lg shadow-emerald-500/30';
    }
    
    // Estilo padrão para versões alternativas
    return 'ring-2 ring-blue-500/50 scale-95 origin-top-left shadow-lg shadow-blue-500/20';
  }, [isVersion, card.id, onShowInListing]);
  
  const animationDelay = useMemo(() => {
    // Delay incremental para animação de entrada das cartas
    return `${Math.min(index * 0.05, 0.5)}s`;
  }, [index]);

  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsImageLoading(false);
  }, []);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(card);
  }, [card, openModal]);

  const handleAddCard = useCallback((quantity: number = 1) => {
    onAddCard(card, quantity);
  }, [card, onAddCard]);
  
  const handleShowInListing = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVersion && onShowInListing) {
      onShowInListing(card);
    }
  }, [card, isVersion, onShowInListing]);
  
  const handleToggleVersions = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleVersions) {
      onToggleVersions();
    }
  }, [onToggleVersions]);
  
  // Determinar se deve mostrar o botão de versões
  const hasMultipleVersions = versionsCount > 0;

  // Renderizar placeholder para mensagem de "nenhuma versão disponível" ou "carregando"
  if (isPlaceholder) {
    if (viewMode === 'grid') {
      return (
        <div 
          className="relative group animate-fadeIn card-version" 
          style={{ animationDelay }}
        >
          <div className={`card-grid rounded-xl overflow-hidden border p-4 flex items-center justify-center h-48 ${
            isLoading 
              ? 'border-blue-600/30 bg-blue-900/20' 
              : 'border-gray-600 bg-gray-800/50'
          }`}>
            <div className="text-center">
              {isLoading ? (
                <Loader2 className="h-6 w-6 text-blue-400 mx-auto mb-2 animate-spin" />
              ) : (
                <AlertCircle className="h-6 w-6 text-gray-500 mx-auto mb-2" />
              )}
              <p className={`text-sm ${isLoading ? 'text-blue-300' : 'text-gray-400'}`}>
                {card.name}
              </p>
              <p className={`text-xs mt-1 ${isLoading ? 'text-blue-400/70' : 'text-gray-500'}`}>
                {card.type_line}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="animate-fadeIn ml-4" style={{ animationDelay }}>
        <div className={`p-3 rounded-lg backdrop-blur-md border ${
          isLoading 
            ? 'border-blue-600/30 bg-blue-900/20' 
            : 'border-gray-600 bg-gray-800/50'
        }`}>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gray-500" />
            )}
            <p className={`text-sm ${isLoading ? 'text-blue-300' : 'text-gray-400'}`}>
              {card.name}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (modo compacto/grid)
  if (viewMode === 'grid') {
    return (
      <div 
        className={`relative group animate-fadeIn ${isVersion ? 'card-version' : ''}`}
        data-card-name={card.id}
        style={{ animationDelay }}
      >
        {/* Indicador de coleção (badge) */}
        <div className="absolute top-2 left-2 z-10">
          <CollectionIndicator 
            card={card} 
            collection={collection}
          />
        </div>
        
        {/* Badge de versões disponíveis */}
        {!isVersion && versionsCount > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-blue-600/90 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium border border-blue-500/50">
              {versionsCount}v
            </div>
          </div>
        )}
        
        <div 
          className={`card-grid cursor-pointer rounded-xl overflow-hidden flex flex-col border ${rarityBorderClass} transition-all ${isExpanded ? 'card-active' : ''}`}
          onClick={handleViewDetails}
        >
          {imageUrl && !imageError ? (
            <div className="aspect-[63/88] relative overflow-hidden bg-gray-900 flex items-center justify-center">
              {isImageLoading && (
                <div className="absolute inset-0 bg-gray-800 rounded-t-xl animate-pulse flex items-center justify-center">
                  <div className="text-gray-400 text-xs">Carregando...</div>
                </div>
              )}
              <Image
                src={imageUrl}
                alt={card.name}
                fill
                className={`object-contain transition-opacity ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
            </div>
          ) : (
            <div className="aspect-[63/88] bg-gray-800 flex items-center justify-center text-center p-2">
              <span className="text-xs text-gray-400">{card.name}</span>
            </div>
          )}
          
          <div className="bg-gray-900/90 p-2 flex flex-col h-16">
            <div className="flex items-center justify-between mb-1">
              <div className="flex-1 truncate">
                <span className="text-xs font-medium text-white truncate block">{card.name}</span>
              </div>
              <span className={`text-[10px] ${rarityTextClass}`}>
                {safeCardAccess.rarity(card).charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 truncate block flex-1">
                {safeCardAccess.setName(card)}
              </span>
              <span className="text-[10px] text-gray-500">
                {safeCardAccess.setCode(card)}
              </span>
            </div>
            
            <div 
              className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-2 p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <QuantityControl onAdd={handleAddCard} compact={true} />
              
              {!isVersion && (
                <button
                  onClick={handleToggleVersions}
                  className="text-xs h-5 px-2 rounded border transition-colors flex items-center gap-1 text-blue-400 hover:text-blue-300 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20"
                >
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Buscando...
                    </>
                  ) : versionsCount > 0 ? (
                    <>Versões ({versionsCount})</>
                  ) : (
                    <>Versões</>
                  )}
                </button>
              )}
              
              {isVersion && (
                <>
                {onShowInListing ? (
                  <button
                    onClick={handleShowInListing}
                    className="text-xs text-emerald-400 hover:text-emerald-300 h-5 px-2 rounded border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                  >
                    <PlusCircle className="h-3 w-3" />
                    Mostrar na Listagem
                  </button>
                ) : (
                  <div className="text-xs text-emerald-500 h-5 px-2 rounded border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Na Listagem Principal
                  </div>
                )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view (modo lista horizontal compacta)
  return (
    <div 
      data-card-name={card.id} 
      className={`animate-fadeIn ${isVersion ? 'ml-4' : ''}`}
      style={{ animationDelay }}
    >
      <div className={`p-2 rounded-lg bg-gray-900/70 backdrop-blur-md border ${rarityBorderClass} hover:border-blue-500/50 hover:bg-gray-800/70 transition-all group ${isVersion ? 'card-version' : ''} ${isExpanded ? 'card-active' : ''}`}>
        <div className="flex items-center gap-3">          
          <div className="relative flex-shrink-0">
            {imageUrl && !imageError ? (
              <div 
                className="relative w-12 h-16 rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all"
                onClick={handleViewDetails}
              >
                {isImageLoading && (
                  <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
                )}
                <Image
                  src={imageUrl}
                  alt={card.name}
                  fill
                  className={`object-cover transition-opacity ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  sizes="48px"
                />
              </div>
            ) : (
              <div 
                className="w-12 h-16 bg-gray-800 rounded-md flex items-center justify-center cursor-pointer"
                onClick={handleViewDetails}
              >
                <span className="text-[8px] text-gray-500 text-center p-1">
                  {card.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 
                className="text-sm font-medium text-white truncate cursor-pointer hover:text-blue-300 transition-colors"
                onClick={handleViewDetails}
              >
                {card.name}
              </h3>
              
              {/* Indicador de coleção (inline) */}
              <CollectionIndicator 
                card={card} 
                collection={collection} 
                compact={true}
              />
            </div>
            
            <div className="flex items-center text-xs gap-1">
              <span className={`${rarityTextClass}`}>
                {safeCardAccess.rarity(card).charAt(0).toUpperCase()}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400 truncate">{card.set_name}</span>
            </div>
            <p className="text-gray-500 text-xs truncate">{card.type_line}</p>
          </div>

          <div className="flex items-center gap-1">
            <QuantityControl onAdd={handleAddCard} compact={true} />
            
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 bg-gray-800 hover:bg-gray-700 border-gray-700"
              onClick={handleViewDetails}
            >
              <Eye className="h-3 w-3" />
            </Button>
            
            {!isVersion && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 bg-gray-800 hover:bg-gray-700 border-gray-700 ${isExpanded ? 'bg-blue-900/30 text-blue-400' : ''} ${isLoading ? 'animate-pulse' : ''}`}
                  onClick={handleToggleVersions}
                  title={isLoading ? "Buscando versões..." : versionsCount > 0 ? `${versionsCount} versões disponíveis` : "Ver outras versões"}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
                {/* Badge de versões no modo lista */}
                {versionsCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] px-1 py-0.5 rounded-full font-bold min-w-[14px] text-center leading-none">
                    {versionsCount}
                  </div>
                )}
              </div>
            )}
            
            {isVersion && (
              <>
              {onShowInListing ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 bg-emerald-900/30 hover:bg-emerald-800/50 border-emerald-700/50 text-emerald-400"
                  onClick={handleShowInListing}
                  title="Mostrar na Listagem Principal"
                >
                  <PlusCircle className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 bg-emerald-900/50 border-emerald-700/70 text-emerald-400 cursor-default"
                  title="Adicionado à Listagem Principal"
                >
                  <Star className="h-3 w-3" />
                </Button>
              )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

SearchCardItem.displayName = 'SearchCardItem';

// Componente principal
export default function EnhancedSearchCardList({ 
  cards, 
  collection, 
  onAddCard, 
  className = '', 
  searchResults,
  onSortChange,
  currentSort = { mode: 'name', direction: 'asc' }
}: SearchCardListProps) {
  const { visualizationType } = useCardModal();
  const [viewMode, setViewMode] = useState(visualizationType || 'grid');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [versionsData, setVersionsData] = useState<Record<string, MTGCard[]>>({});
  const [loadingVersions, setLoadingVersions] = useState<Record<string, boolean>>({});
  const [cardVersionCounts, setCardVersionCounts] = useState<Record<string, number>>({});

  // Efeito para sincronizar com o contexto global
  useEffect(() => {
    setViewMode(visualizationType);
  }, [visualizationType]);

  // Função para buscar apenas a contagem de versões (sem baixar todas as cartas)
  const fetchVersionCount = useCallback(async (card: MTGCard) => {
    if (cardVersionCounts[card.id] !== undefined) return; // Já tem a contagem
    
    try {
      console.log(`Buscando contagem de versões para: ${card.name}`);
      
      // Usar a API do Scryfall com &format=json&page=1 para pegar apenas a primeira página
      // e usar total_cards do response para saber quantas existem
      const url = `https://api.scryfall.com/cards/search?q="${encodeURIComponent(card.name)}"+unique:prints&order=released&page=1`;
      
      try {
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          const totalVersions = data.total_cards || 0;
          const currentCardVersions = totalVersions > 0 ? totalVersions - 1 : 0; // Subtraí 1 pois não conta a carta atual
          
          setCardVersionCounts(prev => ({
            ...prev,
            [card.id]: currentCardVersions
          }));
          
          console.log(`${card.name} tem ${currentCardVersions} versões alternativas`);
        } else if (response.status === 404) {
          // Não encontrou versões
          setCardVersionCounts(prev => ({
            ...prev,
            [card.id]: 0
          }));
        } else {
          // Outros erros HTTP
          setCardVersionCounts(prev => ({
            ...prev,
            [card.id]: 0
          }));
        }
      } catch (error) {
        console.error(`Erro ao buscar contagem de versões para ${card.name}:`, error);
        // Em caso de erro de rede, definir como 0
        setCardVersionCounts(prev => ({
          ...prev,
          [card.id]: 0
        }));
      }
    } catch (error) {
      console.error(`Erro ao processar busca de versões para ${card.name}:`, error);
      setCardVersionCounts(prev => ({
        ...prev,
        [card.id]: 0
      }));
    }
  }, [cardVersionCounts]);

  // Buscar contagem de versões para todas as cartas quando elas mudarem
  useEffect(() => {
    // Evitar loop infinito - só executar se cards mudou
    const cardsToFetch = cards.filter(card => cardVersionCounts[card.id] === undefined);
    
    if (cardsToFetch.length > 0) {
      // Limitar a 5 chamadas por vez para não sobrecarregar
      cardsToFetch.slice(0, 5).forEach((card, index) => {
        setTimeout(() => fetchVersionCount(card), index * 200); // 200ms entre cada chamada
      });
    }
  }, [cards]); // Remover cardVersionCounts e fetchVersionCount das dependências
  const fetchCardVersions = useCallback(async (card: MTGCard) => {
    if (loadingVersions[card.id] || versionsData[card.id]) return;
    
    setLoadingVersions(prev => ({ ...prev, [card.id]: true }));
    
    try {
      console.log(`Buscando versões para carta: ${card.name}`);
      
      // Usar diretamente a função com tradução que funciona na coleção
      const response = await getAllPrintsByNameWithTranslation(card.name);
      
      // Se a resposta não estiver ok (404, 500, etc)
      if (!response.ok) {
        // Se for 404 (não encontrado), apenas define um array vazio
        if (response.status === 404) {
          setVersionsData(prev => ({
            ...prev,
            [card.id]: []
          }));
          return;
        }
        throw new Error(`Erro ao buscar versões: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Dados recebidos para ${card.name}:`, data);
      
      const versions = data.data || [];
      console.log(`${versions.length} versões brutas encontradas para ${card.name}`);
      
      // Filtrar a carta atual - usar lógica mais simples como na coleção
      const filteredVersions = versions.filter((v: MTGCard) => 
        v && v.id && v.id !== card.id
      );
      
      console.log(`${filteredVersions.length} versões filtradas para ${card.name}`);
      
      setVersionsData(prev => ({
        ...prev,
        [card.id]: filteredVersions
      }));
    } catch (error) {
      console.error(`Erro ao buscar versões para carta ${card.name} (id: ${card.id}):`, error);
      // Em caso de erro, apenas deixa o array vazio
      setVersionsData(prev => ({
        ...prev,
        [card.id]: []
      }));
    } finally {
      setLoadingVersions(prev => ({ ...prev, [card.id]: false }));
    }
  }, [versionsData, loadingVersions]);

  // Função para controlar o estado expandido da carta
  const toggleCardVersions = useCallback((cardId: string, card: MTGCard) => {
    setExpandedCardId(prev => {
      // Se clicar na mesma carta, fecha o painel de versões
      if (prev === cardId) {
        return null;
      }
      
      // Se abrir uma nova carta, busca as versões se necessário
      if (!versionsData[cardId] && !loadingVersions[cardId]) {
        fetchCardVersions(card);
      }
      
      return cardId;
    });
  }, [fetchCardVersions, versionsData, loadingVersions]);

  // As cartas já vêm ordenadas da API conforme os parâmetros de busca
  const displayCards = cards;

  // Estado para armazenar as versões adicionadas à lista principal
  const [addedVersions, setAddedVersions] = useState<string[]>(() => {
    // Carregar do localStorage se disponível
    if (typeof window !== 'undefined') {
      const savedVersions = localStorage.getItem('addedVersions');
      return savedVersions ? JSON.parse(savedVersions) : [];
    }
    return [];
  });
  
  // Função para adicionar uma versão à lista principal
  const addVersionToMainList = useCallback((versionCard: MTGCard) => {
    if (!addedVersions.includes(versionCard.id)) {
      const newAddedVersions = [...addedVersions, versionCard.id];
      setAddedVersions(newAddedVersions);
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('addedVersions', JSON.stringify(newAddedVersions));
      }
    }
  }, [addedVersions]);

  // Preparar todas as cartas a serem exibidas (incluindo versões)
  const allDisplayCards = useMemo(() => {
    let result: Array<{card: MTGCard, isVersion?: boolean, originalId?: string, index: number, isPlaceholder?: boolean, isLoading?: boolean}> = [];
    
    // Primeiro adicionamos todas as cartas principais (já ordenadas pela API)
    displayCards.forEach((card, index) => {
      // Adiciona a carta principal
      result.push({
        card,
        index
      });
      
      // Se a carta está expandida
      if (expandedCardId === card.id) {
        // Se tem versões carregadas
        if (versionsData[card.id] && versionsData[card.id].length > 0) {
          const versions = versionsData[card.id].map((versionCard, vIndex) => ({
            card: versionCard,
            isVersion: true,
            originalId: card.id,
            index: index + 0.1 + (vIndex * 0.01)
          }));
          
          result = [...result, ...versions];
        } 
        // Se ainda está carregando, mostra indicador de carregamento
        else if (loadingVersions[card.id]) {
          result.push({
            card: {
              id: `loading-${card.id}`,
              name: "Buscando versões alternativas...",
              set_name: "",
              set_code: "",
              rarity: "common",
              type_line: "Aguarde enquanto buscamos outras impressões desta carta."
            } as MTGCard,
            isVersion: true,
            originalId: card.id,
            index: index + 0.1,
            isPlaceholder: true,
            isLoading: true
          });
        }
        // Se terminou de carregar mas não encontrou versões
        else if (versionsData[card.id] && versionsData[card.id].length === 0) {
          result.push({
            card: {
              id: `no-versions-${card.id}`,
              name: "Não há versões alternativas disponíveis",
              set_name: "",
              set_code: "",
              rarity: "common",
              type_line: "Esta carta não possui outras impressões disponíveis."
            } as MTGCard,
            isVersion: true,
            originalId: card.id,
            index: index + 0.1,
            isPlaceholder: true
          });
        }
      }
    });
    
    // Agora adicionamos as versões que foram selecionadas para mostrar na listagem principal
    // Mas apenas se elas não forem duplicadas
    Object.entries(versionsData).forEach(([cardId, versions]) => {
      versions.forEach(versionCard => {
        if (addedVersions.includes(versionCard.id)) {
          // Verificar se esta versão já não está na lista de resultados
          const alreadyInResults = result.some(item => item.card.id === versionCard.id);
          
          if (!alreadyInResults) {
            // Adicionar ao final com um índice maior que qualquer outra carta
            result.push({
              card: versionCard,
              index: result.length + 1
            });
          }
        }
      });
    });
    
    return result;
  }, [displayCards, expandedCardId, versionsData, addedVersions]);

  // Determinar classe do container
  const containerClass = useMemo(() => {
    switch (viewMode) {
      case 'grid':
        return `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 ${className}`;
      default: // lista
        return `space-y-2 ${className}`;
    }
  }, [viewMode, className]);

  // Renderizar controles de paginação
  const renderPaginationControls = useCallback(() => {
    if (!searchResults || (!searchResults.hasMore && !searchResults.totalCards)) {
      return null;
    }

    return (
      <div className="mt-4 flex flex-col gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {searchResults.totalCards && (
              <span>
                Mostrando {cards.length} de {searchResults.totalCards} cartas
                {searchResults.currentPage && (
                  <span className="ml-2">• Página {searchResults.currentPage}</span>
                )}
              </span>
            )}
          </div>
          
          {searchResults.hasMore && (
            <Button
              onClick={searchResults.nextPage}
              disabled={searchResults.isLoadingMore}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {searchResults.isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Carregar mais cartas
                </>
              )}
            </Button>
          )}
        </div>
        
        {searchResults.hasMore && (
          <div className="text-xs text-gray-500 text-center">
            <Info className="h-3 w-3 inline mr-1" />
            Há mais resultados disponíveis. Clique em "Carregar mais cartas" para ver resultados adicionais.
          </div>
        )}
      </div>
    );
  }, [searchResults, cards.length]);

  // Renderizar opções de ordenação
  const renderSortOptions = useCallback(() => {
    return (
      <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-gray-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Ordenar por:</span>
            <div className="flex gap-1">
              <Button 
                variant={currentSort.mode === 'name' ? 'default' : 'outline'}
                className={`quantum-btn compact text-xs ${currentSort.mode === 'name' ? 'primary' : ''}`}
                onClick={() => onSortChange?.('name', currentSort.direction)}
              >
                Nome
              </Button>
              <Button 
                variant={currentSort.mode === 'set' ? 'default' : 'outline'}
                className={`quantum-btn compact text-xs ${currentSort.mode === 'set' ? 'primary' : ''}`}
                onClick={() => onSortChange?.('set', currentSort.direction)}
              >
                Coleção
              </Button>
              <Button 
                variant={currentSort.mode === 'rarity' ? 'default' : 'outline'}
                className={`quantum-btn compact text-xs ${currentSort.mode === 'rarity' ? 'primary' : ''}`}
                onClick={() => onSortChange?.('rarity', currentSort.direction)}
              >
                Raridade
              </Button>
              <Button 
                variant={currentSort.mode === 'released' ? 'default' : 'outline'}
                className={`quantum-btn compact text-xs ${currentSort.mode === 'released' ? 'primary' : ''}`}
                onClick={() => onSortChange?.('released', currentSort.direction)}
              >
                Lançamento
              </Button>
            </div>
            
            {/* Controle de direção da ordenação */}
            <div className="flex gap-1 ml-2">
              <Button 
                variant={currentSort.direction === 'asc' ? 'default' : 'outline'}
                className={`quantum-btn compact text-xs ${currentSort.direction === 'asc' ? 'primary' : ''}`}
                onClick={() => onSortChange?.(currentSort.mode, 'asc')}
                title={
                  currentSort.mode === 'released' ? 'Mais antigas primeiro' :
                  currentSort.mode === 'name' ? 'A-Z' :
                  currentSort.mode === 'set' ? 'A-Z' :
                  'Crescente'
                }
              >
                ↑ Cresc.
              </Button>
              <Button 
                variant={currentSort.direction === 'desc' ? 'default' : 'outline'}
                className={`quantum-btn compact text-xs ${currentSort.direction === 'desc' ? 'primary' : ''}`}
                onClick={() => onSortChange?.(currentSort.mode, 'desc')}
                title={
                  currentSort.mode === 'released' ? 'Mais recentes primeiro' :
                  currentSort.mode === 'name' ? 'Z-A' :
                  currentSort.mode === 'set' ? 'Z-A' :
                  'Decrescente'
                }
              >
                ↓ Decr.
              </Button>
            </div>
          </div>
          
          {expandedCardId && (
            <Button
              variant="outline"
              className="h-7 px-2.5 text-xs bg-blue-900/30 hover:bg-blue-900/50 border-blue-900/50 text-blue-400"
              onClick={() => setExpandedCardId(null)}
            >
              <ChevronUp className="h-3 w-3 mr-1" />
              Fechar versões
            </Button>
          )}
        </div>
        
        {/* Informação explicativa sobre ordenação por lançamento */}
        {currentSort.mode === 'released' && (
          <div className="text-xs text-gray-500 px-2">
            {currentSort.direction === 'asc' 
              ? '📅 Mostrando das coleções mais antigas para as mais recentes'
              : '📅 Mostrando das coleções mais recentes para as mais antigas'
            }
          </div>
        )}
        
        {/* Informação sobre versões alternativas */}
        <div className="flex items-start gap-1 px-2 py-1.5 bg-blue-900/20 rounded-md border border-blue-800/30">
          <Info className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-blue-300 leading-tight mb-1">
              Cada carta mostra quantas versões alternativas estão disponíveis. 
              Use o botão "Versões" para explorar impressões alternativas e "Mostrar na Listagem" para adicioná-las.
            </p>
            
            {addedVersions.length > 0 && (
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => {
                    // Mostrar todas as versões disponíveis
                    const allVersionsToAdd: string[] = [];
                    Object.values(versionsData).forEach(versions => {
                      versions.forEach(version => {
                        if (!addedVersions.includes(version.id)) {
                          allVersionsToAdd.push(version.id);
                        }
                      });
                    });
                    
                    if (allVersionsToAdd.length > 0) {
                      const newAddedVersions = [...addedVersions, ...allVersionsToAdd];
                      setAddedVersions(newAddedVersions);
                      
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('addedVersions', JSON.stringify(newAddedVersions));
                      }
                    }
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                >
                  <PlusCircle className="h-2.5 w-2.5" />
                  <span>Mostrar todas as versões</span>
                </button>
                
                <button 
                  onClick={() => {
                    setAddedVersions([]);
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('addedVersions');
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-0.5"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                  <span>Limpar versões adicionadas ({addedVersions.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [currentSort.mode, currentSort.direction, expandedCardId, addedVersions, versionsData]);

  if (cards.length === 0) {
    return null;
  }

  // Componente de controle de visualização
  const ViewControls = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 bg-slate-800/30 p-3 rounded-md border border-slate-700/50">
      <div>
        <h3 className="text-white font-medium flex items-center">
          <Search className="w-4 h-4 mr-2 text-blue-400" />
          Resultados da Pesquisa
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {cards.length} cartas correspondentes com visualização avançada
        </p>
      </div>
      <div className="flex items-center bg-slate-800/70 rounded-md p-1.5 border border-slate-700/30">
        <span className="text-xs text-slate-400 mr-2 hidden sm:inline-block">Visualização:</span>
        <CardViewOptions size="sm" className="inline-flex" />
      </div>
    </div>
  );

  return (
    <div>
      {renderSortOptions()}
      <ViewControls />
      <div className={containerClass}>
        {allDisplayCards.map((item) => (
          <SearchCardItem
            key={`enhanced-card-${item.isVersion ? `version-${item.card.id}` : item.card.id}`}
            card={item.card}
            collection={collection}
            onAddCard={onAddCard}
            viewMode={viewMode}
            index={Math.floor(item.index)}
            isVersion={item.isVersion}
            isExpanded={expandedCardId === (item.originalId || item.card.id)}
            isLoading={item.isLoading || loadingVersions[item.card.id] || false}
            originalId={item.originalId}
            onToggleVersions={() => toggleCardVersions(item.card.id, item.card)}
            versionsCount={
              item.isVersion 
                ? 0 
                : (cardVersionCounts[item.card.id] ?? 0)
            }
            onShowInListing={item.isVersion && !item.isPlaceholder ? addVersionToMainList : undefined}
            isPlaceholder={item.isPlaceholder}
            hasNoVersions={false}
          />
        ))}
      </div>
      {renderPaginationControls()}
    </div>
  );
}

// Adicione estas animações ao seu CSS global
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-slideDown {
  animation: slideDown 0.2s ease-out forwards;
}

.shadow-glow-sm {
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.7);
}
`;
