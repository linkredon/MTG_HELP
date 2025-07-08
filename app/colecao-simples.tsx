"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Minus, Check, RefreshCw, Info, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';
import { useCardModal } from '@/contexts/CardModalContext';
import { searchCardsWithTranslation } from '@/utils/scryfallService';
import { getImageUrl } from '@/utils/imageService';
import { cardMatchesSearchTerm } from '@/utils/translationService';

// Tipos para o componente
import type { MTGCard as MTGCardFull } from "@/types/mtg";

type MTGCard = MTGCardFull;

interface CollectionCard {
  card: MTGCard;
  quantity: number;
  condition: string;
  foil: boolean;
}

export default function ColecaoSimples() {
  // Estado
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MTGCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<MTGCard | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });
  const [showOtherVersions, setShowOtherVersions] = useState(false);
  const [filterInCollection, setFilterInCollection] = useState(false);
  
  // Contextos
  const { currentCollection, adicionarCarta, removerCarta } = useAppContext();
  const { openModal } = useCardModal();
  
  // Função de busca com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && searchTerm.length >= 2) {
        searchCards();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Função para buscar cartas
  const searchCards = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await searchCardsWithTranslation(searchTerm.trim());
      
      if (!response.ok) {
        throw new Error(`Erro na busca: ${response.statusText}`);
      }
      
      const data = await response.json();
      let results = data.data || [];
      
      // Filtrar apenas cartas não presentes na coleção se o filtro estiver ativado
      if (filterInCollection) {
        const collectionIds = new Set(currentCollection.cards.map(c => c.card.id));
        results = results.filter((card: MTGCard) => !collectionIds.has(card.id));
      }
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setSearchError("Nenhuma carta encontrada");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      setSearchError("Erro ao buscar cartas");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Limpar busca
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchError(null);
  };
  
  // Selecionar uma carta
  const handleSelectCard = (card: MTGCard) => {
    setSelectedCard(card);
    setQuantity(1);
    setShowOtherVersions(false);
  };
  
  // Alternar visualização de outras versões
  const toggleOtherVersions = () => {
    setShowOtherVersions(!showOtherVersions);
  };
  
  // Adicionar carta à coleção
  const addCardToCollection = () => {
    if (!selectedCard) return;
    
    setIsAdding(true);
    
    try {
      // Adicionar a carta várias vezes conforme a quantidade
      for (let i = 0; i < quantity; i++) {
        adicionarCarta(selectedCard);
      }
      
      // Mostrar notificação de sucesso
      setNotification({
        show: true,
        message: `${quantity}x ${selectedCard.name} adicionada à coleção`,
        type: 'success'
      });
      
      // Resetar estado
      setQuantity(1);
      
      // Auto-esconder notificação após 3 segundos
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
        adicionarCarta(selectedCard as MTGCardFull);
      setNotification({
        show: true,
        message: "Erro ao adicionar carta à coleção",
        type: 'error'
      });
    } finally {
      setIsAdding(false);
    }
  };
  
  // Alterar quantidade
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuantity(isNaN(value) || value < 1 ? 1 : value);
  };
  
  // Ver detalhes da carta
  const handleViewDetails = (card: MTGCard) => {
    openModal(card);
  };
  
  // Obter URL da imagem
  const getCardImageUrl = (card: MTGCard): string => {
    return getImageUrl(card, 'small');
  };
  
  // Verificar se a carta está na coleção e obter quantidade
  const getCardQuantityInCollection = useCallback((cardId: string): number => {
    const cardInCollection = currentCollection.cards.find(c => c.card.id === cardId);
    return cardInCollection ? cardInCollection.quantity : 0;
  }, [currentCollection.cards]);
  
  // Obter outras versões na coleção (mesmo nome, mas ID diferente)
  const getOtherVersionsInCollection = useCallback((cardName: string, currentCardId: string): CollectionCard[] => {
    return currentCollection.cards.filter(c => 
      c.card.name.toLowerCase() === cardName.toLowerCase() && 
      c.card.id !== currentCardId
    );
  }, [currentCollection.cards]);
  
  // Componente de carta para resultado de busca
  const SearchResultCard = ({ card }: { card: MTGCard }) => {
    const imageUrl = getCardImageUrl(card);
    const quantityInCollection = getCardQuantityInCollection(card.id);
    const isSelected = selectedCard && selectedCard.id === card.id;
    
    return (
      <div 
        className={`relative card-result flex flex-col cursor-pointer border rounded-lg overflow-hidden transition-all ${
          isSelected 
            ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
            : 'border-gray-700 hover:border-blue-400/50'
        }`}
        onClick={() => handleSelectCard(card)}
      >
        {/* Badge para indicar quantidade na coleção */}
        {quantityInCollection > 0 && (
          <Badge className="absolute top-1 right-1 z-10 bg-blue-600 text-white">
            {quantityInCollection}x
          </Badge>
        )}
        
        {/* Imagem da carta */}
        <div className="aspect-[63/88] bg-gray-800 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={card.name}
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <span className="text-xs text-gray-500">Sem imagem</span>
            </div>
          )}
        </div>
        
        {/* Informações da carta */}
        <div className="p-2 bg-gray-800/50 flex flex-col items-center justify-center">
          <div className="w-full text-center truncate text-sm">{card.name}</div>
          <div className="text-xs text-gray-400">{card.set_name}</div>
        </div>
      </div>
    );
  };
  
  // Componente para a carta selecionada
  const SelectedCardView = () => {
    if (!selectedCard) return null;
    
    const imageUrl = getCardImageUrl(selectedCard);
    const quantityInCollection = getCardQuantityInCollection(selectedCard.id);
    const otherVersions = getOtherVersionsInCollection(selectedCard.name, selectedCard.id);
    
    return (
      <Card className="border-gray-700 bg-gray-800/70 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Coluna da imagem */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center">
              <div className="w-full max-w-[250px] relative">
                {/* Imagem da carta */}
                <div className="aspect-[63/88] bg-gray-900 rounded-lg overflow-hidden border border-gray-700 mb-3">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={selectedCard.name}
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <span className="text-gray-500">Sem imagem</span>
                    </div>
                  )}
                </div>
                
                {/* Botões de ação */}
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewDetails(selectedCard)}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Ver detalhes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={toggleOtherVersions}
                  >
                    {showOtherVersions ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                    {showOtherVersions ? 'Ocultar versões' : 'Ver outras versões'}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Coluna das informações */}
            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-1">{selectedCard.name}</h2>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {selectedCard.set_name} ({selectedCard.set_code})
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {selectedCard.type_line}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {selectedCard.rarity.charAt(0).toUpperCase() + selectedCard.rarity.slice(1)}
                  </Badge>
                </div>
                
                {quantityInCollection > 0 && (
                  <div className="mb-3">
                    <Badge className="bg-blue-600">
                      {quantityInCollection}x na coleção
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Adicionar à coleção:</h3>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Controle de quantidade */}
                  <div className="flex items-center h-10 rounded-md border border-gray-600 overflow-hidden">
                    <button
                      onClick={decreaseQuantity}
                      className="w-10 h-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min={1}
                      className="w-16 h-full text-center bg-transparent border-none text-white"
                    />
                    <button
                      onClick={increaseQuantity}
                      className="w-10 h-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Botão adicionar */}
                  <Button 
                    onClick={addCardToCollection} 
                    disabled={isAdding}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isAdding ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar {quantity > 1 ? `${quantity}x` : ''}
                      </>
                    )}
                  </Button>
                  
                  {/* Presets de quantidade */}
                  <div className="flex gap-1">
                    {[1, 4].map(num => (
                      <Button 
                        key={num} 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setQuantity(num)}
                        className={`px-2 min-w-[36px] ${quantity === num ? 'bg-gray-700 border-gray-500' : 'bg-transparent'}`}
                      >
                        {num}x
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Outras versões na coleção */}
              {showOtherVersions && otherVersions.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Outras versões na coleção:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {otherVersions.map((item) => (
                      <div key={item.card.id} className="rounded-lg border border-gray-700 overflow-hidden bg-gray-800/50">
                        <div className="flex items-center p-2">
                          {/* Miniatura */}
                          <div className="w-10 h-14 bg-gray-900 rounded-md mr-2 overflow-hidden">
                            {getCardImageUrl(item.card) ? (
                              <img
                                src={getCardImageUrl(item.card)}
                                alt={item.card.name}
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-xs text-gray-500">{item.card.set_code}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-300 truncate">
                              {item.card.set_name}
                            </div>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {item.quantity}x
                            </Badge>
                          </div>
                          
                          {/* Ver */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(item.card);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-700"
                          >
                            <Info className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="quantum-compact p-4">
      {/* Notificação */}
      {notification.show && (
        <div 
          className={`fixed top-4 right-4 z-50 rounded-lg shadow-lg px-4 py-3 flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90'
          } text-white backdrop-blur-sm animate-fade-in`}
        >
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            className="ml-2 p-1 rounded-full hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Adicionar Cartas à Coleção</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna de busca */}
          <div className="md:col-span-1">
            <Card className="mb-4 border-gray-700 bg-gray-800/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-3">Buscar carta</h2>
                
                <div className="space-y-3">
                  {/* Campo de busca */}
                  <div className="relative">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Digite o nome da carta..."
                      className="pl-10 bg-gray-700/60 border-gray-600"
                    />
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Opções adicionais */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="filterInCollection"
                      checked={filterInCollection}
                      onChange={() => setFilterInCollection(!filterInCollection)}
                      className="mr-2"
                    />
                    <label htmlFor="filterInCollection" className="text-sm text-gray-300">
                      Destacar cartas na coleção
                    </label>
                  </div>
                  
                  {/* Informações de busca */}
                  {isSearching ? (
                    <div className="flex items-center justify-center py-4">
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin text-blue-500" />
                      <span>Buscando...</span>
                    </div>
                  ) : searchError ? (
                    <div className="text-red-400 text-center py-4">
                      {searchError}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="text-sm text-gray-400">
                      {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'}
                    </div>
                  ) : searchTerm ? (
                    <div className="text-gray-400 text-center py-4">
                      Digite pelo menos 2 caracteres para buscar
                    </div>
                  ) : null}
                  
                  {/* Sugestões populares */}
                  {!searchTerm && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Sugestões:</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Black Lotus', 'Lightning Bolt', 'Sol Ring'].map(suggestion => (
                          <Button
                            key={suggestion}
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchTerm(suggestion)}
                            className="bg-transparent border-gray-600"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Resultados da busca */}
            <div className="max-h-[600px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                {searchResults.map(card => (
                  <SearchResultCard key={card.id} card={card} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Coluna da carta selecionada */}
          <div className="md:col-span-2">
            {selectedCard ? (
              <SelectedCardView />
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] border border-gray-700 rounded-lg bg-gray-800/30 backdrop-blur-sm">
                <Search className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-xl font-medium text-gray-400 mb-2">Nenhuma carta selecionada</h2>
                <p className="text-gray-500 text-center max-w-md">
                  Busque e selecione uma carta à esquerda para adicioná-la à sua coleção
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
