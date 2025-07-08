"use client"

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Plus, Minus, AlertCircle, Loader2, Grid3X3, List, RotateCcw, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCardModal } from '@/contexts/CardModalContext';
import CollectionDeckUsage from '@/components/CollectionDeckUsage';
import Image from 'next/image';
import type { MTGCard } from '@/types/mtg';
import { translatePtToEn, cardMatchesSearchTerm } from '@/utils/translationService';
import { getImageUrl } from '@/utils/imageService';
import { getAllPrintsByNameWithTranslation } from '@/utils/scryfallService';

interface CollectionCard {
  card: MTGCard;
  quantity: number;
  condition: string;
  foil: boolean;
}

interface ExpandableCardGridProps {
  collectionCards: CollectionCard[];
  onRemoveCard: (card: MTGCard) => void;
  onAddCard: (card: MTGCard, quantity?: number) => void;
  onUpdateCardQuantity?: (card: MTGCard, newQuantity: number) => void;
  onAddToDeck?: (card: MTGCard) => void; // Nova prop para integração com construtor
  className?: string;
}

// Função utilitária para obter a imagem da carta com fallback
const getCardImage = (card: MTGCard, size: 'small' | 'normal' = 'small'): string => {
  return getImageUrl(card, size);
};

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

const ExpandableCardGrid: React.FC<ExpandableCardGridProps> = ({
  collectionCards,
  onRemoveCard,
  onAddCard,
  onUpdateCardQuantity,
  onAddToDeck,
  className = ''
}) => {
  const { openModal, visualizationType } = useCardModal();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [panelViewMode, setPanelViewMode] = useState<'grid' | 'list'>('grid');
  const [primaryCards, setPrimaryCards] = useState<Record<string, string>>({});
  const [addingCard, setAddingCard] = useState<string | null>(null);
  const [versionsData, setVersionsData] = useState<Record<string, {
    versions: MTGCard[];
    loading: boolean;
    error: string | null;
  }>>({});

  // Agrupar cartas por nome
  const groupedCards = collectionCards.reduce((acc, collectionCard) => {
    const cardName = collectionCard.card.name;
    if (!acc[cardName]) {
      acc[cardName] = [];
    }
    acc[cardName].push(collectionCard);
    return acc;
  }, {} as Record<string, CollectionCard[]>);

  // Função para obter a carta principal de exibição
  const getPrimaryCard = useCallback((cardName: string, cards: CollectionCard[]) => {
    const primaryCardId = primaryCards[cardName];
    if (primaryCardId) {
      const primaryCard = cards.find(c => c.card.id === primaryCardId);
      if (primaryCard) return primaryCard;
    }
    // Retorna a primeira carta se não houver carta principal definida
    return cards[0];
  }, [primaryCards]);

  // Função para definir carta principal
  const setPrimaryCard = useCallback((cardName: string, cardId: string) => {
    setPrimaryCards(prev => ({
      ...prev,
      [cardName]: cardId
    }));
  }, []);

  // Função para remover uma carta específica (não todas as versões)
  const handleRemoveSpecificCard = useCallback((card: MTGCard) => {
    onRemoveCard(card);
  }, [onRemoveCard]);

  // Função para remover todas as versões de uma carta
  const handleRemoveAllVersions = useCallback((cardName: string) => {
    const cards = groupedCards[cardName] || [];
    cards.forEach(collectionCard => {
      onRemoveCard(collectionCard.card);
    });
  }, [groupedCards, onRemoveCard]);

  // Função para atualizar quantidade de uma carta específica
  const handleUpdateQuantity = useCallback((card: MTGCard, newQuantity: number) => {
    if (onUpdateCardQuantity) {
      onUpdateCardQuantity(card, newQuantity);
    }
  }, [onUpdateCardQuantity]);

  // Função para alternar expansão de cartas
  const toggleExpansion = useCallback(async (cardName: string) => {
    const isCurrentlyExpanded = expandedCards[cardName];
    
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !isCurrentlyExpanded
    }));

    // Se está expandindo e ainda não carregou as versões, buscar
    if (!isCurrentlyExpanded && !versionsData[cardName]) {
      await fetchVersions(cardName);
      
      // Scroll para o topo quando abrir o box de outras versões
      setTimeout(() => {
        const element = document.querySelector(`[data-card-name="${cardName}"]`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [expandedCards, versionsData]);

  // Função para buscar versões alternativas
  const fetchVersions = useCallback(async (cardName: string) => {
    if (versionsData[cardName]?.loading) return;

    setVersionsData(prev => ({
      ...prev,
      [cardName]: { versions: [], loading: true, error: null }
    }));

    try {
      const response = await getAllPrintsByNameWithTranslation(cardName);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar versões');
      }

      const data = await response.json();
      const versions = data.data || [];
      
      // Filtrar versões que já estão na coleção
      const collectionIds = new Set(
        groupedCards[cardName]?.map(c => c.card.id) || []
      );
      const filteredVersions = versions.filter((v: MTGCard) => !collectionIds.has(v.id));

      setVersionsData(prev => ({
        ...prev,
        [cardName]: { 
          versions: filteredVersions, 
          loading: false, 
          error: null 
        }
      }));
    } catch (error) {
      console.error('Erro ao buscar versões:', error);
      setVersionsData(prev => ({
        ...prev,
        [cardName]: { 
          versions: [], 
          loading: false, 
          error: 'Erro ao buscar versões alternativas' 
        }
      }));
    }
  }, [groupedCards, versionsData]);

  // Função para adicionar carta e remover das versões
  const handleAddCard = useCallback(async (card: MTGCard) => {
    setAddingCard(card.id);
    
    try {
      onAddCard(card);
      
      // Remover carta das versões alternativas após adicionar
      setVersionsData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(cardName => {
          if (newData[cardName]) {
            newData[cardName] = {
              ...newData[cardName],
              versions: newData[cardName].versions.filter(v => v.id !== card.id)
            };
          }
        });
        return newData;
      });
      
      // Feedback visual
      setTimeout(() => setAddingCard(null), 1000);
    } catch (error) {
      console.error('Erro ao adicionar carta:', error);
      setAddingCard(null);
    }
  }, [onAddCard]);

  // Componente para controle de quantidade com input
  const QuantityControl = useCallback(({ card, quantity, onAdd, onUpdate, onRemove }: {
    card: MTGCard;
    quantity?: number;
    onAdd?: (quantity: number) => void;
    onUpdate?: (newQuantity: number) => void;
    onRemove?: () => void;
  }) => {
    const [inputQuantity, setInputQuantity] = useState(1);
    const [currentQuantity, setCurrentQuantity] = useState(quantity || 0);

    React.useEffect(() => {
      setCurrentQuantity(quantity || 0);
    }, [quantity]);

    const handleAdd = () => {
      if (onAdd) {
        onAdd(inputQuantity);
      }
    };

    const handleUpdate = (delta: number) => {
      const newQuantity = Math.max(0, currentQuantity + delta);
      if (onUpdate) {
        onUpdate(newQuantity);
      }
    };

    const handleDirectUpdate = (value: number) => {
      const newQuantity = Math.max(0, value);
      if (onUpdate) {
        onUpdate(newQuantity);
      }
    };

    return (
      <div className="flex items-center gap-1">
        {quantity !== undefined ? (
          // Controle para cartas na coleção
          <div className="flex items-center border rounded bg-gray-800">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleUpdate(-1)}
              className="h-6 w-6 p-0 text-white hover:bg-red-600"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              value={currentQuantity}
              onChange={(e) => handleDirectUpdate(parseInt(e.target.value) || 0)}
              className="w-12 h-6 text-center border-0 rounded-none bg-transparent text-white text-xs"
              min="0"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleUpdate(1)}
              className="h-6 w-6 p-0 text-white hover:bg-green-600"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          // Controle para adicionar novas cartas
          <div className="flex items-center gap-1">
            <div className="flex items-center border rounded bg-gray-800">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setInputQuantity(Math.max(1, inputQuantity - 1))}
                className="h-6 w-6 p-0 text-white"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={inputQuantity}
                onChange={(e) => setInputQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 h-6 text-center border-0 rounded-none bg-transparent text-white text-xs"
                min="1"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setInputQuantity(inputQuantity + 1)}
                className="h-6 w-6 p-0 text-white"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Button
              onClick={handleAdd}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 h-6"
            >
              +{inputQuantity}
            </Button>
          </div>
        )}
        {onRemove && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            className="h-6 w-6 p-0 text-red-400 hover:bg-red-900/20"
          >
            <Minus className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }, []);

  // Função auxiliar para conteúdo expandido horizontal
  const renderExpandedContent = useCallback((cardName: string, cards: CollectionCard[]) => {
    const versionData = versionsData[cardName];
    const totalQuantity = cards.reduce((sum, c) => sum + c.quantity, 0);
    const hasMultipleVersions = cards.length > 1;
    
    return (
      <div className="rounded-lg text-card-foreground bg-gray-800/80 backdrop-blur-xl shadow-2xl overflow-hidden border-0">
        {/* Header */}
        <div className="p-3 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">{cardName}</h4>
              <p className="text-xs text-gray-400">Gerencie suas versões e quantidades</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPanelViewMode('grid')}
                className={`h-7 w-7 p-0 ${panelViewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid3X3 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPanelViewMode('list')}
                className={`h-7 w-7 p-0 ${panelViewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content with fixed height and scroll */}
        <div className="h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
          {/* Loading state */}
          {versionData?.loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
              <span className="text-gray-300 text-sm">Buscando versões...</span>
            </div>
          )}
          
          {/* Versões na coleção */}
          {hasMultipleVersions && !versionData?.loading && (
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <h5 className="text-sm font-semibold text-white">Na sua coleção</h5>
                <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
                  {totalQuantity}x total
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPrimaryCard(cardName, cards[0].card.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 h-5 px-2"
                  title="Trocar arte principal"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Trocar Principal
                </Button>
              </div>
              
              {panelViewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {cards.map((collectionCard, index) => (
                    <div 
                      key={`${collectionCard.card.id}-${index}`} 
                      className="relative group bg-gray-800/50 rounded-lg p-2 hover:bg-gray-800/70 transition-colors"
                    >
                      {/* Imagem e controles em grid */}
                      <div className="w-full aspect-[63/88] bg-gray-900 rounded overflow-hidden border border-gray-600 mb-2">
                        {getCardImage(collectionCard.card) ? (
                          <img
                            src={getCardImage(collectionCard.card)}
                            alt={cardName}
                            className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => openModal(collectionCard.card)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-500 text-center">
                              {safeCardAccess.setCode(collectionCard.card)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Informações compactas */}
                      <div className="text-center mb-2">
                        <div className="text-xs text-white font-medium truncate">
                          {safeCardAccess.setCode(collectionCard.card)}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {safeCardAccess.setName(collectionCard.card)}
                        </div>
                      </div>

                      {/* Controles centralizados */}
                      <div className="flex justify-center">
                        <QuantityControl 
                          card={collectionCard.card}
                          quantity={collectionCard.quantity}
                          onAdd={(quantity) => onAddCard(collectionCard.card, quantity)}
                          onRemove={() => handleRemoveSpecificCard(collectionCard.card)}
                          onUpdate={(newQuantity) => handleUpdateQuantity(collectionCard.card, newQuantity)}
                        />
                      </div>
                      
                      {/* Botão de definir como principal */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPrimaryCard(cardName, collectionCard.card.id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0 bg-blue-600/80 hover:bg-blue-600 text-white transition-all"
                        title="Definir como arte principal"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {cards.map((collectionCard, index) => (
                    <div 
                      key={`${collectionCard.card.id}-${index}`} 
                      className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
                    >
                      {/* Imagem miniatura */}
                      <div className="w-12 h-16 bg-gray-900 rounded overflow-hidden border border-gray-600 flex-shrink-0">
                        {getCardImage(collectionCard.card) ? (
                          <img
                            src={getCardImage(collectionCard.card)}
                            alt={cardName}
                            className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => openModal(collectionCard.card)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-500 text-center">
                              {safeCardAccess.setCode(collectionCard.card)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Informações da versão */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-medium truncate">
                          {safeCardAccess.setCode(collectionCard.card)}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {safeCardAccess.setName(collectionCard.card)}
                        </div>
                      </div>

                      {/* Controles */}
                      <div className="flex items-center gap-2">
                        <QuantityControl 
                          card={collectionCard.card}
                          quantity={collectionCard.quantity}
                          onAdd={(quantity) => onAddCard(collectionCard.card, quantity)}
                          onRemove={() => handleRemoveSpecificCard(collectionCard.card)}
                          onUpdate={(newQuantity) => handleUpdateQuantity(collectionCard.card, newQuantity)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPrimaryCard(cardName, collectionCard.card.id)}
                          className="h-6 w-6 p-0 text-blue-400 hover:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-all"
                          title="Definir como arte principal"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Versões alternativas */}
          {versionData && !versionData.loading && (
            <div className="p-3 border-t border-gray-700/50">
              {versionData.error ? (
                <div className="text-red-400 text-sm flex items-center gap-2 py-4">
                  <AlertCircle className="w-4 h-4" />
                  <span>{versionData.error}</span>
                </div>
              ) : versionData.versions.length === 0 ? (
                <div className="text-gray-400 text-sm py-4 text-center">
                  Nenhuma versão alternativa encontrada
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h5 className="text-sm font-semibold text-white">Outras versões disponíveis</h5>
                    <Badge variant="outline" className="bg-blue-600/20 text-blue-400 text-xs border-blue-600/30">
                      {versionData.versions.length} encontradas
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {versionData.versions.map((version) => (
                      <div 
                        key={version.id} 
                        className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors group"
                      >
                        {/* Imagem miniatura */}
                        <div className="w-12 h-16 bg-gray-900 rounded overflow-hidden border border-gray-600 flex-shrink-0">
                          {getCardImage(version) ? (
                            <img
                              src={getCardImage(version)}
                              alt={cardName}
                              className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => openModal(version)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs text-gray-500 text-center">
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
                          <div className="text-xs text-gray-400 truncate">
                            {safeCardAccess.setName(version)}
                          </div>
                        </div>

                        {/* Botão de adicionar */}
                        <Button
                          size="sm"
                          onClick={() => handleAddCard(version)}
                          disabled={addingCard === version.id}
                          className={`px-3 py-1 text-xs opacity-70 group-hover:opacity-100 transition-all duration-200 transform hover:scale-105 ${
                            addingCard === version.id 
                              ? 'bg-green-600 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {addingCard === version.id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Adicionado!
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              Adicionar
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Uso em Decks */}
          <div className="p-3 border-t border-gray-700/50">
            <CollectionDeckUsage 
              card={cards[0]?.card}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }, [versionsData, openModal, handleAddCard, onAddCard, onRemoveCard]);

  // Renderização em grid
  if (visualizationType === 'grid') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
        {Object.entries(groupedCards).map(([cardName, cards]) => {
          const totalQuantity = cards.reduce((sum, c) => sum + c.quantity, 0);
          const isExpanded = expandedCards[cardName];
          const primaryCard = getPrimaryCard(cardName, cards);
          
          return (
            <div key={cardName} data-card-name={cardName} className={`relative transition-all duration-300 ${
              isExpanded ? 'col-span-full' : ''
            }`}>
              {isExpanded ? (
                // Layout expandido horizontal
                <div className="flex gap-4 bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                  {/* Carta principal */}
                  <div className="flex-shrink-0">
                    <div className="relative group">
                      <div className="w-48 aspect-[63/88] rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors">
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-sm rounded-full w-8 h-8 flex items-center justify-center font-bold z-10">
                          {totalQuantity}
                        </div>
                        
                        <div 
                          className="w-full h-full bg-gray-900 flex items-center justify-center cursor-pointer"
                          onClick={() => openModal(primaryCard.card)}
                        >
                          {getCardImage(primaryCard.card) ? (
                            <img
                              src={getCardImage(primaryCard.card)}
                              alt={cardName}
                              className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <span className="text-sm text-gray-400 text-center p-4">{cardName}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Controles da carta principal */}
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => toggleExpansion(cardName)}
                        >
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Ocultar Versões
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost" 
                          className="bg-red-700 hover:bg-red-600 text-white px-3"
                          onClick={() => handleRemoveSpecificCard(getPrimaryCard(cardName, cards).card)}
                          title="Remover apenas esta versão"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Painel de versões ao lado */}
                  <div className="flex-1 min-w-0">
                    {renderExpandedContent(cardName, cards)}
                  </div>
                </div>
              ) : (
                // Layout normal compacto
                <div className="relative group">
                  <div className="cursor-pointer rounded-lg overflow-hidden flex flex-col border border-gray-700 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-200">
                    
                    {/* Badge de quantidade total */}
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold z-10">
                      {totalQuantity}
                    </div>
                    
                    <div 
                      className="aspect-[63/88] overflow-hidden bg-gray-900 flex items-center justify-center relative"
                      onClick={() => openModal(primaryCard.card)}
                    >
                      {getCardImage(primaryCard.card) ? (
                        <img
                          src={getCardImage(primaryCard.card)}
                          alt={cardName}
                          className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <span className="text-xs text-gray-400 text-center p-2">{cardName}</span>
                      )}
                      
                      {/* Overlay de hover com informações */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="text-white text-center">
                          <p className="text-xs font-medium">{cards.length} versão{cards.length > 1 ? 'ões' : ''}</p>
                          <p className="text-xs text-gray-300">Clique para detalhes</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 p-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost" 
                        className="flex-1 bg-gray-700 hover:bg-blue-600 text-white h-7 transition-colors duration-200"
                        onClick={() => toggleExpansion(cardName)}
                      >
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Versões
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost" 
                        className="bg-red-700 hover:bg-red-600 text-white h-7 px-2 transition-colors duration-200"
                        onClick={() => handleRemoveSpecificCard(getPrimaryCard(cardName, cards).card)}
                        title="Remover apenas esta versão"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Renderização em lista
  if (visualizationType === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Object.entries(groupedCards).map(([cardName, cards]) => {
          const isExpanded = expandedCards[cardName];
          const totalQuantity = cards.reduce((sum, c) => sum + c.quantity, 0);
          const primaryCard = getPrimaryCard(cardName, cards);
          
          return (
            <Card key={cardName} data-card-name={cardName} className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Imagem da carta principal */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-20 bg-gray-900 rounded overflow-hidden">
                      {getCardImage(primaryCard.card) ? (
                        <img
                          src={getCardImage(primaryCard.card)}
                          alt={cardName}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => openModal(primaryCard.card)}
                        />
                      ) : (
                        <span className="text-xs text-gray-400 text-center p-2">{cardName}</span>
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {totalQuantity}
                    </div>
                  </div>

                  {/* Informações da carta */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium">{cardName}</h3>
                    <p className="text-gray-400 text-sm">{safeCardAccess.setName(primaryCard.card)}</p>
                    <p className="text-gray-500 text-xs">{cards.length} versão{cards.length > 1 ? 'ões' : ''} na coleção</p>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center gap-2">
                    {onAddToDeck && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddToDeck(primaryCard.card)}
                        className="border-green-600 text-green-400 hover:bg-green-900/20"
                        title="Adicionar ao deck"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleExpansion(cardName)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveSpecificCard(getPrimaryCard(cardName, cards).card)}
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                      title="Remover apenas esta versão"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
                
                {/* Conteúdo expandido */}
                {isExpanded && renderExpandedContent(cardName, cards)}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Renderização detalhada (default)
  return (
    <div className="space-y-4">
      {Object.entries(groupedCards).map(([cardName, cards]) => {
        const isExpanded = expandedCards[cardName];
        const totalQuantity = cards.reduce((sum, c) => sum + c.quantity, 0);
        const primaryCard = getPrimaryCard(cardName, cards);
        
        return (
          <Card key={cardName} className="bg-gray-800/50 border-gray-700/50 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-4">
                {/* Imagem da carta principal */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-22 bg-gray-900 rounded overflow-hidden">
                    {getCardImage(primaryCard.card) ? (
                      <img
                        src={getCardImage(primaryCard.card)}
                        alt={cardName}
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={() => openModal(primaryCard.card)}
                      />
                    ) : (
                      <span className="text-xs text-gray-400 text-center p-2">{cardName}</span>
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {totalQuantity}
                  </div>
                </div>

                {/* Informações detalhadas da carta */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{cardName}</h3>
                    <p className="text-gray-400">{safeCardAccess.setName(primaryCard.card)}</p>
                    <p className="text-gray-500 text-sm">{primaryCard.card.type_line}</p>
                  </div>
                  
                  {primaryCard.card.oracle_text && (
                    <div className="text-gray-300 text-sm">
                      <p className="font-medium text-gray-200 mb-1">Texto:</p>
                      <p className="italic">{primaryCard.card.oracle_text}</p>
                    </div>
                  )}
                  
                  {(primaryCard.card.power || primaryCard.card.toughness) && (
                    <div className="text-gray-300 text-sm">
                      <span className="font-medium text-gray-200">P/T:</span> {primaryCard.card.power}/{primaryCard.card.toughness}
                    </div>
                  )}
                </div>

                {/* Controles */}
                <div className="flex flex-col gap-2">
                  {onAddToDeck && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddToDeck(primaryCard.card)}
                      className="border-green-600 text-green-400 hover:bg-green-900/20"
                      title="Adicionar ao deck"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Deck
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleExpansion(cardName)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveSpecificCard(getPrimaryCard(cardName, cards).card)}
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                    title="Remover apenas esta versão"
                  >
                    Remover
                  </Button>
                </div>
              </div>
              
              {/* Conteúdo expandido */}
              {isExpanded && renderExpandedContent(cardName, cards)}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ExpandableCardGrid;
