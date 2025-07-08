"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { useCardModal } from '@/contexts/CardModalContext';
import { searchCardsWithTranslation, getAllPrintsByNameWithTranslation } from '@/utils/scryfallService';
import { translatePtToEn, cardMatchesSearchTerm } from '@/utils/translationService';
import { Search, Grid3X3, ListFilter, RefreshCw, X, Filter, Library, LayoutGrid, LayoutList, ChevronDown, Sparkles, Plus, Info, CheckCircle, Heart, Star, Download, Package } from 'lucide-react';
import type { MTGCard } from '@/types/mtg';
import { getImageUrl } from '@/utils/imageService';
import QuantityControl from '@/components/QuantityControl';
import "@/styles/collection-interface.css";

// Tipos para coleção
interface CollectionCard {
  card: MTGCard;
  quantity: number;
  condition: string;
  foil: boolean;
}

interface UserCollection {
  id: string;
  name: string;
  description: string;
  cards: CollectionCard[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

// Props do componente
export interface ColecaoImprovedProps {
  allCards: MTGCard[];
  setAllCards: (cards: MTGCard[]) => void;
  exportCollectionToCSV: (collection: UserCollection) => void;
}

export default function ColecaoImproved({
  allCards,
  setAllCards,
  exportCollectionToCSV
}: ColecaoImprovedProps) {
  // Estado para as tabs principais
  const [activeTab, setActiveTab] = useState('pesquisa');
  
  // Estado para pesquisa
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MTGCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<MTGCard | null>(null);
  const [showOtherVersions, setShowOtherVersions] = useState(false);
  
  // Estado para visualização
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Estado para filtros
  const [rarityFilter, setRarityFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cmc, setCmc] = useState('');
  const [searchInCollection, setSearchInCollection] = useState(false);

  // Estado para feedback de adição
  const [addedCards, setAddedCards] = useState<Record<string, { count: number, timestamp: number }>>({});
  
  // Contextos
  const { currentCollection, adicionarCarta } = useAppContext();
  const { openModal } = useCardModal();
  
  // Função para buscar cartas
  const searchCards = async () => {
    if (!searchTerm || searchTerm.length < 2) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await searchCardsWithTranslation(searchTerm.trim());
      
      if (!response.ok) {
        throw new Error(`Erro na busca: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSearchResults(data.data || []);
      
      if (data.data?.length === 0) {
        setSearchError('Nenhuma carta encontrada');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchError('Falha ao buscar cartas');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Limpar a busca
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchError(null);
  };
  
  // Buscar ao pressionar Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchCards();
    }
  };
  
  // Selecionar uma carta
  const handleSelectCard = (card: MTGCard) => {
    setSelectedCard(card);
    setShowOtherVersions(false);
  };
  
  // Adicionar carta à coleção
  const handleAddCard = (card: MTGCard, quantity: number = 1) => {
    // Adicionar a carta com a quantidade especificada
    for (let i = 0; i < quantity; i++) {
      adicionarCarta(card);
    }
    
    // Feedback visual
    setAddedCards(prev => {
      const currentCount = prev[card.id]?.count || 0;
      return {
        ...prev,
        [card.id]: {
          count: currentCount + quantity,
          timestamp: Date.now()
        }
      };
    });
    
    // Limpar feedback após 3 segundos
    setTimeout(() => {
      setAddedCards(prev => {
        const newState = { ...prev };
        if (newState[card.id] && Date.now() - newState[card.id].timestamp > 2900) {
          delete newState[card.id];
        }
        return newState;
      });
    }, 3000);
  };
  
  // Ver detalhes da carta
  const handleViewDetails = (card: MTGCard) => {
    openModal(card);
  };
  
  // Alternar visualização de outras versões
  const toggleOtherVersions = () => {
    setShowOtherVersions(!showOtherVersions);
  };
  
  // Cartas filtradas da coleção
  const filteredCollectionCards = useCallback(() => {
    // Verificar se currentCollection existe e tem a propriedade cards
    if (!currentCollection || !currentCollection.cards) return [];
    
    return currentCollection.cards.filter(item => {
      // Filtrar por nome
      if (searchTerm && !item.card.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtrar por raridade
      if (rarityFilter !== 'all' && item.card.rarity !== rarityFilter) {
        return false;
      }
      
      // Filtrar por tipo
      if (typeFilter !== 'all' && !item.card.type_line.toLowerCase().includes(typeFilter.toLowerCase())) {
        return false;
      }
      
      // Filtrar por custo de mana convertido
      if (cmc && item.card.cmc !== parseInt(cmc, 10)) {
        return false;
      }
      
      return true;
    });
  }, [currentCollection.cards, searchTerm, rarityFilter, typeFilter, cmc]);
  
  // Verificar se uma carta está na coleção
  const getCardQuantityInCollection = useCallback((cardId: string): number => {
    if (!currentCollection || !currentCollection.cards) return 0;
    
    const found = currentCollection.cards.find(item => item.card.id === cardId);
    return found ? found.quantity : 0;
  }, [currentCollection?.cards]);
  
  // Obter versões alternativas de uma carta
  const getCardOtherVersions = useCallback((cardName: string, currentCardId: string): CollectionCard[] => {
    if (!currentCollection || !currentCollection.cards) return [];
    
    return currentCollection.cards.filter(item => 
      item.card.name.toLowerCase() === cardName.toLowerCase() && 
      item.card.id !== currentCardId
    );
  }, [currentCollection?.cards]);
  
  return (
    <div className="mtg-helper-collection">
      {/* Cabeçalho estilizado */}
      <div className="dark-theme-header mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Gerenciador de Coleção</h1>
          <div className="stats flex gap-4">
            <Badge variant="outline" className="py-1 px-3 border-blue-600 bg-blue-900/20 text-blue-300">
              <Library className="w-4 h-4 mr-2" />
              {currentCollection?.cards?.length || 0} cartas únicas
            </Badge>
            <Badge variant="outline" className="py-1 px-3 border-purple-600 bg-purple-900/20 text-purple-300">
              <Sparkles className="w-4 h-4 mr-2" />
              {currentCollection?.cards?.reduce((total, item) => total + item.quantity, 0) || 0} no total
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Tabs principais */}
      <Card className="dark-collection-card border-slate-700 bg-slate-900/70 overflow-hidden">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Cabeçalho das tabs */}
          <div className="border-b border-slate-700">
            <TabsList className="flex h-12 w-full rounded-none bg-slate-900/90">
              <TabsTrigger
                value="pesquisa"
                className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Pesquisar
              </TabsTrigger>
              <TabsTrigger
                value="colecao"
                className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white"
              >
                <Library className="w-4 h-4 mr-2" />
                Coleção ({currentCollection?.cards?.reduce((total, item) => total + item.quantity, 0) || 0})
              </TabsTrigger>
              <TabsTrigger
                value="estatisticas"
                className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Estatísticas
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Conteúdo da tab de Pesquisa */}
          <TabsContent value="pesquisa" className="p-0 m-0">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Busca rápida de cartas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="bg-slate-900/80 border-slate-700 pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button onClick={searchCards} className="bg-blue-700 hover:bg-blue-800">
                  {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Buscar'}
                </Button>
                <Button 
                  variant="outline"
                  className="border-slate-700 bg-slate-800"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <div className="border border-slate-700 rounded-md bg-slate-800 flex">
                  <Button
                    variant="ghost"
                    className={`px-2 ${viewMode === 'grid' ? 'bg-slate-700' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className={`px-2 ${viewMode === 'list' ? 'bg-slate-700' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Filtros avançados */}
              {filterOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Raridade</label>
                    <Select value={rarityFilter} onValueChange={setRarityFilter}>
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="common">Comum</SelectItem>
                        <SelectItem value="uncommon">Incomum</SelectItem>
                        <SelectItem value="rare">Rara</SelectItem>
                        <SelectItem value="mythic">Mítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Tipo</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="creature">Criatura</SelectItem>
                        <SelectItem value="instant">Instantâneo</SelectItem>
                        <SelectItem value="sorcery">Feitiço</SelectItem>
                        <SelectItem value="artifact">Artefato</SelectItem>
                        <SelectItem value="enchantment">Encantamento</SelectItem>
                        <SelectItem value="land">Terreno</SelectItem>
                        <SelectItem value="planeswalker">Planeswalker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">CMC</label>
                    <Input
                      type="number"
                      placeholder="Custo de mana"
                      value={cmc}
                      onChange={(e) => setCmc(e.target.value)}
                      min="0"
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="outline" className="border-slate-700" onClick={() => {
                      setRarityFilter('all');
                      setTypeFilter('all');
                      setCmc('');
                    }}>
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Resultados da busca */}
            <div className="p-4">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                  <p className="text-slate-300">Buscando cartas...</p>
                </div>
              ) : searchError ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <p className="text-red-400">{searchError}</p>
                  <p className="text-slate-400 text-sm">Tente outro termo de busca</p>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-slate-400">
                      {searchResults.length} {searchResults.length === 1 ? 'carta encontrada' : 'cartas encontradas'}
                    </p>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="searchInCollection"
                        checked={searchInCollection}
                        onChange={(e) => setSearchInCollection(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="searchInCollection" className="text-sm text-slate-400">
                        Destacar cartas na coleção
                      </label>
                    </div>
                  </div>
                  
                  {/* Grid View */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {searchResults.map((card) => {
                        const inCollection = getCardQuantityInCollection(card.id);
                        
                        return (
                          <div
                            key={card.id}
                            className={`card-item relative group rounded-lg overflow-hidden border transition-all cursor-pointer ${
                              inCollection > 0 && searchInCollection
                                ? 'border-blue-500 shadow-md shadow-blue-500/20'
                                : 'border-slate-700 hover:border-slate-500'
                            }`}
                            onClick={() => handleSelectCard(card)}
                          >
                            {/* Badge para quantidade na coleção */}
                            {inCollection > 0 && (
                              <div className={`absolute top-1 left-1 z-10 rounded-md px-1.5 py-0.5 text-xs font-medium ${
                                searchInCollection ? 'bg-blue-600' : 'bg-slate-700/70 backdrop-blur-sm'
                              }`}>
                                {inCollection}x na coleção
                              </div>
                            )}
                            
                            {/* Feedback de adição */}
                            {addedCards[card.id] && (
                              <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in duration-300">
                                <div className="bg-slate-900/90 text-green-400 px-3 py-2 rounded-lg flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5" />
                                  <span>+{addedCards[card.id].count}</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Imagem da carta */}
                            <div className="aspect-[63/88] bg-slate-800">
                              {getImageUrl(card, 'small') ? (
                                <div className="relative w-full h-full">
                                  <Image 
                                    src={getImageUrl(card, 'small')}
                                    alt={card.name}
                                    className="object-contain"
                                    fill
                                    sizes="(max-width: 768px) 100px, 150px"
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-slate-500">{card.name}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Informações da carta */}
                            <div className="p-2 bg-slate-800/90">
                              <h3 className="text-sm font-medium text-slate-200 truncate" title={card.name}>{card.name}</h3>
                              <p className="text-xs text-slate-400">{card.set_name} ({card.set_code?.toUpperCase()})</p>
                              
                              {/* Ações - visíveis apenas no hover */}
                              <div className="mt-2 grid grid-cols-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  size="sm" 
                                  className="bg-blue-700 hover:bg-blue-800 h-7 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddCard(card, 1);
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Adicionar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-slate-600 h-7 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(card);
                                  }}
                                >
                                  <Info className="h-3 w-3 mr-1" />
                                  Detalhes
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* List View */}
                  {viewMode === 'list' && (
                    <div className="space-y-2">
                      {searchResults.map((card) => {
                        const inCollection = getCardQuantityInCollection(card.id);
                        
                        return (
                          <div
                            key={card.id}
                            className={`card-item-list flex items-center p-2 rounded-lg border transition-all ${
                              inCollection > 0 && searchInCollection
                                ? 'border-blue-500 bg-blue-950/20'
                                : 'border-slate-700 bg-slate-800/60 hover:border-slate-500'
                            }`}
                          >
                            {/* Feedback de adição */}
                            {addedCards[card.id] && (
                              <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in duration-300">
                                <div className="bg-slate-900/90 text-green-400 px-3 py-2 rounded-lg flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5" />
                                  <span>+{addedCards[card.id].count}</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Miniatura */}
                            <div 
                              className="w-12 h-16 bg-slate-800 rounded overflow-hidden flex-shrink-0 cursor-pointer"
                              onClick={() => handleViewDetails(card)}
                            >
                              {getImageUrl(card, 'small') ? (
                                <div className="relative w-full h-full">
                                  <Image 
                                    src={getImageUrl(card, 'small')}
                                    alt={card.name}
                                    className="object-contain"
                                    fill
                                    sizes="48px"
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-slate-500 text-xs">{card.set_code}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Detalhes da carta */}
                            <div className="ml-3 flex-grow" onClick={() => handleSelectCard(card)}>
                              <div className="flex items-center">
                                <h3 className="font-medium text-slate-200">{card.name}</h3>
                                {inCollection > 0 && (
                                  <Badge 
                                    variant="outline" 
                                    className={`ml-2 ${searchInCollection ? 'bg-blue-900/50 border-blue-700' : 'bg-slate-800 border-slate-700'}`}
                                  >
                                    {inCollection}x
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">
                                {card.set_name} • {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
                              </div>
                              <div className="text-xs text-slate-500 truncate mt-0.5">{card.type_line}</div>
                            </div>
                            
                            {/* Ações */}
                            <div className="flex items-center gap-2">
                              <div className="flex border border-slate-700 rounded-md overflow-hidden">
                                <button 
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 w-8 h-8 flex items-center justify-center text-sm"
                                  onClick={() => handleAddCard(card, 1)}
                                >
                                  1x
                                </button>
                                <button 
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 w-8 h-8 flex items-center justify-center text-sm"
                                  onClick={() => handleAddCard(card, 4)}
                                >
                                  4x
                                </button>
                                <button 
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 w-8 h-8 flex items-center justify-center"
                                  onClick={() => handleViewDetails(card)}
                                >
                                  <Info className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Search className="h-12 w-12 text-slate-600" />
                  <p className="text-slate-400">Busque por nome da carta para começar</p>
                </div>
              )}
            </div>
            
            {/* Detalhes da carta selecionada */}
            {selectedCard && (
              <div className="border-t border-slate-700 bg-slate-800/40 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Coluna da imagem */}
                  <div className="md:w-1/4 lg:w-1/5">
                    <div className="aspect-[63/88] bg-slate-900 rounded overflow-hidden">
                      {getImageUrl(selectedCard, 'normal') ? (
                        <Image 
                          src={getImageUrl(selectedCard, 'normal')}
                          alt={selectedCard.name}
                          className="object-contain"
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-slate-500">{selectedCard.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Coluna das informações */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-slate-100">{selectedCard.name}</h2>
                        <p className="text-slate-400">{selectedCard.type_line}</p>
                        
                        <div className="mt-2 space-x-2">
                          <Badge variant="secondary" className="bg-slate-700 hover:bg-slate-600">
                            {selectedCard.set_name} ({selectedCard.set_code?.toUpperCase()})
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-700 hover:bg-slate-600">
                            {selectedCard.rarity.charAt(0).toUpperCase() + selectedCard.rarity.slice(1)}
                          </Badge>
                        </div>
                        
                        {selectedCard.oracle_text && (
                          <div className="mt-4">
                            <h3 className="text-sm font-semibold text-slate-300 mb-1">Texto:</h3>
                            <p className="text-slate-400 italic whitespace-pre-line">{selectedCard.oracle_text}</p>
                          </div>
                        )}
                        
                        {(selectedCard.power || selectedCard.toughness) && (
                          <div className="mt-4">
                            <h3 className="text-sm font-semibold text-slate-300">Força/Resistência:</h3>
                            <p className="text-slate-400">{selectedCard.power}/{selectedCard.toughness}</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-slate-300"
                          onClick={() => setSelectedCard(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Quantidade na coleção */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Library className="h-4 w-4 text-blue-500" />
                        <h3 className="text-sm font-semibold text-slate-300">Coleção:</h3>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="outline" className="py-1 px-3 text-blue-400 border-blue-800 bg-blue-900/20">
                          {getCardQuantityInCollection(selectedCard.id)} na coleção
                        </Badge>
                      </div>
                      
                      {/* Controles de adição */}
                      <div className="mt-2">
                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Adicionar à coleção:</h3>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                          <QuantityControl
                            initialValue={1}
                            onChange={(value) => handleAddCard(selectedCard, value)}
                            className="w-full max-w-sm"
                          />
                          
                          <Button 
                            onClick={toggleOtherVersions}
                            variant="outline"
                            className="border-slate-600 self-start"
                          >
                            {showOtherVersions ? 
                              <ChevronDown className="h-4 w-4 mr-1" /> : 
                              <ChevronDown className="h-4 w-4 mr-1" />
                            }
                            Outras Versões
                          </Button>
                        </div>
                        
                        {/* Outras versões */}
                        {showOtherVersions && (
                          <div className="mt-4 p-3 rounded border border-slate-700 bg-slate-800/50">
                            <h4 className="text-sm font-medium text-slate-300 mb-2">
                              Outras versões de "{selectedCard.name}"
                            </h4>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                              {getCardOtherVersions(selectedCard.name, selectedCard.id).map((version) => (
                                <div
                                  key={version.card.id}
                                  className="border border-slate-700 rounded bg-slate-800 overflow-hidden hover:border-blue-500/70 transition-all"
                                >
                                  <div className="p-2 flex items-center gap-2">
                                    {/* Miniatura */}
                                    <div className="w-8 h-10 bg-slate-900 rounded overflow-hidden flex-shrink-0">
                                      {getImageUrl(version.card, 'small') ? (
                                        <div className="relative w-full h-full">
                                          <Image 
                                            src={getImageUrl(version.card, 'small')}
                                            alt={version.card.name}
                                            className="object-contain"
                                            fill
                                            sizes="32px"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <span className="text-slate-500 text-[10px]">{version.card.set_code}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-grow min-w-0">
                                      <div className="text-xs font-medium text-slate-300 truncate">
                                        {version.card.set_name}
                                      </div>
                                      <div className="text-[10px] text-slate-400">
                                        {version.quantity}x
                                      </div>
                                    </div>
                                    
                                    {/* Visualizar */}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleViewDetails(version.card)}
                                    >
                                      <Info className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Conteúdo da tab de Coleção */}
          <TabsContent value="colecao" className="p-0 m-0">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Filtrar coleção..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-900/80 border-slate-700 pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button 
                  variant="outline"
                  className="border-slate-700 bg-slate-800"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <div className="border border-slate-700 rounded-md bg-slate-800 flex">
                  <Button
                    variant="ghost"
                    className={`px-2 ${viewMode === 'grid' ? 'bg-slate-700' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className={`px-2 ${viewMode === 'list' ? 'bg-slate-700' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Filtros avançados */}
              {filterOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Raridade</label>
                    <Select value={rarityFilter} onValueChange={setRarityFilter}>
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="common">Comum</SelectItem>
                        <SelectItem value="uncommon">Incomum</SelectItem>
                        <SelectItem value="rare">Rara</SelectItem>
                        <SelectItem value="mythic">Mítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Tipo</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="creature">Criatura</SelectItem>
                        <SelectItem value="instant">Instantâneo</SelectItem>
                        <SelectItem value="sorcery">Feitiço</SelectItem>
                        <SelectItem value="artifact">Artefato</SelectItem>
                        <SelectItem value="enchantment">Encantamento</SelectItem>
                        <SelectItem value="land">Terreno</SelectItem>
                        <SelectItem value="planeswalker">Planeswalker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">CMC</label>
                    <Input
                      type="number"
                      placeholder="Custo de mana"
                      value={cmc}
                      onChange={(e) => setCmc(e.target.value)}
                      min="0"
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="outline" className="border-slate-700" onClick={() => {
                      setRarityFilter('all');
                      setTypeFilter('all');
                      setCmc('');
                      setSearchTerm('');
                    }}>
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Conteúdo da coleção */}
            <div className="p-4">
              {!currentCollection?.cards?.length ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Library className="h-16 w-16 text-slate-700" />
                  <div className="text-center">
                    <p className="text-slate-400 mb-2">Sua coleção está vazia</p>
                    <p className="text-slate-500 text-sm">Use a guia "Pesquisar" para encontrar e adicionar cartas</p>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('pesquisa')}
                    className="bg-blue-700 hover:bg-blue-800 mt-4"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Pesquisar Cartas
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-slate-400">
                      {filteredCollectionCards().length} {filteredCollectionCards().length === 1 ? 'carta' : 'cartas'} na coleção
                    </p>
                  </div>
                  
                  {/* Grid View */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {filteredCollectionCards().map((item) => (
                        <div
                          key={item.card.id}
                          className="card-item relative group rounded-lg overflow-hidden border border-slate-700 hover:border-slate-500 transition-all cursor-pointer"
                          onClick={() => handleViewDetails(item.card)}
                        >
                          {/* Badge para quantidade */}
                          <div className="absolute top-1 left-1 z-10 rounded-md px-1.5 py-0.5 bg-blue-600 text-xs font-medium">
                            {item.quantity}x
                          </div>
                          
                          {/* Feedback de adição */}
                          {addedCards[item.card.id] && (
                            <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in duration-300">
                              <div className="bg-slate-900/90 text-green-400 px-3 py-2 rounded-lg flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>+{addedCards[item.card.id].count}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Imagem da carta */}
                          <div className="aspect-[63/88] bg-slate-800">
                            {getImageUrl(item.card, 'small') ? (
                              <div className="relative w-full h-full">
                                <Image 
                                  src={getImageUrl(item.card, 'small')}
                                  alt={item.card.name}
                                  className="object-contain"
                                  fill
                                  sizes="(max-width: 768px) 100px, 150px"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-slate-500">{item.card.name}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Informações da carta */}
                          <div className="p-2 bg-slate-800/90">
                            <h3 className="text-sm font-medium text-slate-200 truncate" title={item.card.name}>{item.card.name}</h3>
                            <p className="text-xs text-slate-400">{item.card.set_name} ({item.card.set_code?.toUpperCase()})</p>
                            
                            {/* Ações - visíveis apenas no hover */}
                            <div className="mt-2 grid grid-cols-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="sm" 
                                className="bg-blue-700 hover:bg-blue-800 h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddCard(item.card, 1);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Adicionar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-slate-600 h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(item.card);
                                }}
                              >
                                <Info className="h-3 w-3 mr-1" />
                                Detalhes
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* List View */}
                  {viewMode === 'list' && (
                    <div className="space-y-2">
                      {filteredCollectionCards().map((item) => (
                        <div
                          key={item.card.id}
                          className="card-item-list flex items-center p-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:border-slate-500 transition-all relative"
                        >
                          {/* Feedback de adição */}
                          {addedCards[item.card.id] && (
                            <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in duration-300">
                              <div className="bg-slate-900/90 text-green-400 px-3 py-2 rounded-lg flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>+{addedCards[item.card.id].count}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Badge de quantidade */}
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white font-medium mr-2 flex-shrink-0">
                            {item.quantity}
                          </div>
                          
                          {/* Miniatura */}
                          <div 
                            className="w-12 h-16 bg-slate-800 rounded overflow-hidden flex-shrink-0 cursor-pointer"
                            onClick={() => handleViewDetails(item.card)}
                          >
                            {getImageUrl(item.card, 'small') ? (
                              <div className="relative w-full h-full">
                                <Image 
                                  src={getImageUrl(item.card, 'small')}
                                  alt={item.card.name}
                                  className="object-contain"
                                  fill
                                  sizes="48px"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-slate-500 text-xs">{item.card.set_code}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Detalhes da carta */}
                          <div className="ml-3 flex-grow cursor-pointer" onClick={() => handleViewDetails(item.card)}>
                            <h3 className="font-medium text-slate-200">{item.card.name}</h3>
                            <div className="text-xs text-slate-400">
                              {item.card.set_name} • {item.card.rarity.charAt(0).toUpperCase() + item.card.rarity.slice(1)}
                            </div>
                            <div className="text-xs text-slate-500 truncate mt-0.5">{item.card.type_line}</div>
                          </div>
                          
                          {/* Ações */}
                          <div className="flex items-center gap-2">
                            <div className="flex border border-slate-700 rounded-md overflow-hidden">
                              <button 
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 w-8 h-8 flex items-center justify-center text-sm"
                                onClick={() => handleAddCard(item.card, 1)}
                              >
                                +1
                              </button>
                              <button 
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 w-8 h-8 flex items-center justify-center"
                                onClick={() => handleViewDetails(item.card)}
                              >
                                <Info className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
          
          {/* Conteúdo da tab de Estatísticas */}
          <TabsContent value="estatisticas" className="p-0 m-0">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-6">Estatísticas da Coleção</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <h3 className="text-sm text-slate-400 mb-1">Cartas Únicas</h3>
                    <div className="text-2xl font-bold text-slate-100">{currentCollection?.cards?.length || 0}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <h3 className="text-sm text-slate-400 mb-1">Total de Cartas</h3>
                    <div className="text-2xl font-bold text-slate-100">
                      {currentCollection?.cards?.reduce((total, item) => total + item.quantity, 0) || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <h3 className="text-sm text-slate-400 mb-1">Cartas Míticas</h3>
                    <div className="text-2xl font-bold text-orange-400">
                      {currentCollection?.cards?.filter(item => item.card.rarity === 'mythic').length || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <h3 className="text-sm text-slate-400 mb-1">Cartas Raras</h3>
                    <div className="text-2xl font-bold text-yellow-400">
                      {currentCollection?.cards?.filter(item => item.card.rarity === 'rare').length || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
