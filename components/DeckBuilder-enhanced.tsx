"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../styles/deck-builder-enhanced.css';
import '../styles/dropdown-fixes-enhanced.css';
import '../styles/card-search-enhanced.css';
import '../styles/quantum-interface.css';
import { useAppContext } from '@/contexts/AppContext';
import { translatePtToEn, cardMatchesSearchTerm } from '@/utils/translationService';
import { getImageUrl } from '@/utils/imageService';
import { searchCardsWithTranslation } from '@/utils/scryfallService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCardModal } from '@/contexts/CardModalContext';
import SearchCardList from '@/components/SearchCardList';
import { 
  Search, Plus, Minus, X, Save, Settings, Target, 
  Library, Download, RefreshCw, AlertCircle, Loader2,
  Grid3X3, List, Filter, Package, Eye, Info,
  BookOpen, Star, CheckCircle, AlertTriangle
} from 'lucide-react';
import Image from 'next/image';
import type { MTGCard } from '@/types/mtg';

interface DeckBuilderEnhancedProps {
  deckId?: string;
  onSave?: (deckId: string) => void;
  onCancel?: () => void;
}

const getCardImage = (card: MTGCard, size: 'small' | 'normal' = 'small'): string => {
  return getImageUrl(card, size);
};

const DeckBuilderEnhanced: React.FC<DeckBuilderEnhancedProps> = ({ deckId, onSave, onCancel }) => {
  const { 
    decks, 
    collections,
    adicionarCartaAoDeck,
    removerCartaDoDeck,
    atualizarQuantidadeNoDeck,
    adicionarCartaAColecao,
    criarColecao
  } = useAppContext();
  
  const cardModalContext = useCardModal();
  
  // Estados locais
  const [currentDeck, setCurrentDeck] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MTGCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'mainboard' | 'sideboard' | 'commander'>('mainboard');
  const [showAddToCollection, setShowAddToCollection] = useState<string | null>(null);
  const [selectedCardForCollection, setSelectedCardForCollection] = useState<any>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    visible: boolean
  }>({ type: 'info', message: '', visible: false });

  // Estados para filtros
  const [raridade, setRaridade] = useState('all');
  const [tipo, setTipo] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Função para mostrar notificações
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Carregar deck atual
  useEffect(() => {
    if (deckId) {
      const deck = decks.find(d => d.id === deckId);
      if (deck) {
        setCurrentDeck(deck);
      }
    } else {
      // Criar novo deck
      setCurrentDeck({
        id: 'new',
        name: 'Novo Deck',
        format: 'Standard',
        colors: [],
        cards: [],
        description: ''
      });
    }
  }, [deckId, decks]);

  // Buscar cartas
  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchCardsWithTranslation(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar cartas:', error);
      showNotification('error', 'Erro ao buscar cartas');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Adicionar carta ao deck
  const handleAddCard = async (card: MTGCard, category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard', quantity: number = 1) => {
    if (!currentDeck) return;

    try {
      await adicionarCartaAoDeck(currentDeck.id, card, category, quantity);
      showNotification('success', `${card.name} adicionada ao deck!`);
    } catch (error) {
      showNotification('error', 'Erro ao adicionar carta ao deck');
    }
  };

  // Remover carta do deck
  const handleRemoveCard = async (cardId: string, category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard') => {
    if (!currentDeck) return;

    try {
      await removerCartaDoDeck(currentDeck.id, cardId, category);
      showNotification('success', 'Carta removida do deck!');
    } catch (error) {
      showNotification('error', 'Erro ao remover carta do deck');
    }
  };

  // Atualizar quantidade
  const handleUpdateQuantity = async (cardId: string, newQuantity: number, category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard') => {
    if (!currentDeck) return;

    try {
      await atualizarQuantidadeNoDeck(currentDeck.id, cardId, newQuantity, category);
      showNotification('success', 'Quantidade atualizada!');
    } catch (error) {
      showNotification('error', 'Erro ao atualizar quantidade');
    }
  };

  // Adicionar carta à coleção
  const handleAddCardToCollection = async (card: any, collectionId: string) => {
    try {
      await adicionarCartaAColecao(collectionId, {
        card: card,
        quantity: 1,
        condition: 'NM',
        isFoil: false
      });
      setShowAddToCollection(null);
      setSelectedCardForCollection(null);
      showNotification('success', 'Carta adicionada à coleção!');
    } catch (error) {
      showNotification('error', 'Erro ao adicionar carta à coleção');
    }
  };

  // Verificar se uma carta está na coleção
  const isCardInCollection = (cardId: string, collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return false;
    return collection.cards.some((cc: any) => cc.card.id === cardId);
  };

  // Verificar se uma carta está no deck
  const isCardInDeck = (cardId: string, category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard') => {
    if (!currentDeck) return false;
    return currentDeck.cards.some((dc: any) => dc.card.id === cardId && dc.category === category);
  };

  // Obter quantidade da carta no deck
  const getCardQuantityInDeck = (cardId: string, category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard') => {
    if (!currentDeck) return 0;
    const deckCard = currentDeck.cards.find((dc: any) => dc.card.id === cardId && dc.category === category);
    return deckCard ? deckCard.quantity : 0;
  };

  // Obter quantidade da carta na coleção
  const getCardQuantityInCollection = (cardId: string, collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return 0;
    const collectionCard = collection.cards.find((cc: any) => cc.card.id === cardId);
    return collectionCard ? collectionCard.quantity : 0;
  };

  if (!currentDeck) {
    return (
      <div className="quantum-container">
        <div className="quantum-loading">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Carregando deck...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="quantum-container">
      {/* Header */}
      <div className="quantum-header">
        <div className="quantum-header-left">
          <h1 className="quantum-title">
            <Target className="w-6 h-6 mr-3" />
            {currentDeck.name}
          </h1>
          <p className="quantum-subtitle">
            Construtor de Deck - {currentDeck.format}
          </p>
        </div>
        
        <div className="quantum-header-right">
          <Button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            variant="outline"
            className="quantum-button-secondary"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <Grid3X3 className="w-4 h-4 mr-2" />}
            {viewMode === 'grid' ? 'Lista' : 'Grid'}
          </Button>
          <Button
            onClick={() => onSave?.(currentDeck.id)}
            className="quantum-button-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Deck
          </Button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="quantum-content">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="quantum-tabs">
            <TabsTrigger value="search">Buscar Cartas</TabsTrigger>
            <TabsTrigger value="collection">Minha Coleção</TabsTrigger>
            <TabsTrigger value="deck">Deck Atual</TabsTrigger>
          </TabsList>

          {/* Aba de Busca de Cartas */}
          <TabsContent value="search" className="quantum-tab-content">
            <div className="quantum-search-section">
              <div className="quantum-search-controls">
                <div className="quantum-search-input">
                  <Search className="w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar cartas..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="quantum-input"
                  />
                </div>
                
                <div className="quantum-filter-controls">
                  <Select value={raridade} onValueChange={setRaridade}>
                    <SelectTrigger className="quantum-select">
                      <SelectValue placeholder="Raridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Raridades</SelectItem>
                      <SelectItem value="common">Comum</SelectItem>
                      <SelectItem value="uncommon">Incomum</SelectItem>
                      <SelectItem value="rare">Rara</SelectItem>
                      <SelectItem value="mythic">Mítica</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger className="quantum-select">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
                      <SelectItem value="creature">Criatura</SelectItem>
                      <SelectItem value="instant">Instantâneo</SelectItem>
                      <SelectItem value="sorcery">Feitiço</SelectItem>
                      <SelectItem value="enchantment">Encantamento</SelectItem>
                      <SelectItem value="artifact">Artefato</SelectItem>
                      <SelectItem value="planeswalker">Planeswalker</SelectItem>
                      <SelectItem value="land">Terreno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resultados da Busca */}
              <div className="quantum-search-results">
                {isSearching ? (
                  <div className="quantum-loading-state">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span>Buscando cartas...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className={`quantum-cards-grid ${viewMode === 'list' ? 'quantum-cards-list' : ''}`}>
                    {searchResults.map((card) => (
                      <Card key={card.id} className="quantum-card quantum-card-search">
                        <CardContent className="quantum-card-content">
                          <div className="quantum-card-image">
                            {getCardImage(card) && (
                              <Image
                                src={getCardImage(card)}
                                alt={card.name}
                                width={120}
                                height={168}
                                className="rounded-lg border border-slate-600"
                              />
                            )}
                          </div>
                          
                          <div className="quantum-card-info">
                            <h4 className="quantum-card-title">{card.name}</h4>
                            <p className="quantum-card-set">{card.set_name}</p>
                            <p className="quantum-card-type">{card.type_line}</p>
                            
                            <div className="quantum-card-stats">
                              <Badge variant="secondary" className="quantum-badge">
                                {card.rarity}
                              </Badge>
                              {isCardInDeck(card.id) && (
                                <Badge variant="secondary" className="quantum-badge-success">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  No Deck
                                </Badge>
                              )}
                            </div>
                            
                            <div className="quantum-card-actions">
                              <Button
                                onClick={() => handleAddCard(card, selectedCategory, 1)}
                                size="sm"
                                className="quantum-button-primary"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Adicionar
                              </Button>
                              
                              <Button
                                onClick={() => {
                                  setSelectedCardForCollection(card);
                                  setShowAddToCollection(card.id);
                                }}
                                size="sm"
                                variant="outline"
                                className="quantum-button-secondary"
                              >
                                <BookOpen className="w-3 h-3 mr-1" />
                                Coleção
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="quantum-empty-state">
                    <Package className="w-16 h-16 text-slate-500 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Nenhuma carta encontrada</h3>
                    <p className="text-slate-400">Tente ajustar os termos de busca</p>
                  </div>
                ) : (
                  <div className="quantum-empty-state">
                    <Search className="w-16 h-16 text-slate-500 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Busque por cartas</h3>
                    <p className="text-slate-400">Digite o nome de uma carta para começar</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Aba da Coleção */}
          <TabsContent value="collection" className="quantum-tab-content">
            <div className="quantum-collection-section">
              <div className="quantum-collection-header">
                <h3 className="quantum-section-title">
                  <Library className="w-5 h-5 mr-2" />
                  Minha Coleção
                </h3>
                <p className="quantum-section-subtitle">
                  Adicione cartas da sua coleção ao deck
                </p>
              </div>

              {collections.length === 0 ? (
                <div className="quantum-empty-state">
                  <Library className="w-16 h-16 text-slate-500 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Nenhuma coleção encontrada</h3>
                  <p className="text-slate-400">Crie uma coleção para começar</p>
                </div>
              ) : (
                <div className="quantum-collections-grid">
                  {collections.map((collection) => (
                    <Card key={collection.id} className="quantum-card quantum-collection-card">
                      <CardHeader className="quantum-card-header">
                        <div className="quantum-card-title">
                          <h4 className="font-semibold text-white">{collection.name}</h4>
                          <Badge variant="secondary" className="quantum-badge">
                            {collection.cards.length} cartas
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="quantum-card-content">
                        <div className="quantum-collection-cards">
                          {collection.cards.slice(0, 6).map((collectionCard: any) => {
                            const card = collectionCard.card;
                            const inDeck = isCardInDeck(card.id);
                            const deckQuantity = getCardQuantityInDeck(card.id);
                            
                            return (
                              <div key={card.id} className="quantum-collection-card-item">
                                <div className="quantum-card-image-small">
                                  {getCardImage(card, 'small') && (
                                    <Image
                                      src={getCardImage(card, 'small')}
                                      alt={card.name}
                                      width={60}
                                      height={84}
                                      className="rounded border border-slate-600"
                                    />
                                  )}
                                </div>
                                
                                <div className="quantum-card-info-small">
                                  <h5 className="quantum-card-title-small">{card.name}</h5>
                                  <div className="quantum-card-quantities">
                                    <span className="quantum-quantity-collection">
                                      {collectionCard.quantity}x coleção
                                    </span>
                                    {inDeck && (
                                      <span className="quantum-quantity-deck">
                                        {deckQuantity}x deck
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="quantum-card-actions-small">
                                    <Button
                                      onClick={() => handleAddCard(card, selectedCategory, 1)}
                                      size="sm"
                                      className="quantum-button-primary"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {collection.cards.length > 6 && (
                          <div className="quantum-collection-more">
                            <span className="text-sm text-slate-400">
                              +{collection.cards.length - 6} mais cartas
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Aba do Deck Atual */}
          <TabsContent value="deck" className="quantum-tab-content">
            <div className="quantum-deck-section">
              <div className="quantum-deck-header">
                <h3 className="quantum-section-title">
                  <Target className="w-5 h-5 mr-2" />
                  Deck Atual
                </h3>
                <div className="quantum-deck-stats">
                  <Badge variant="secondary" className="quantum-badge">
                    {currentDeck.cards.reduce((sum: number, c: any) => sum + c.quantity, 0)} cartas
                  </Badge>
                </div>
              </div>

              {currentDeck.cards.length === 0 ? (
                <div className="quantum-empty-state">
                  <Target className="w-16 h-16 text-slate-500 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Deck vazio</h3>
                  <p className="text-slate-400">Adicione cartas para começar a construir seu deck</p>
                </div>
              ) : (
                <div className="quantum-deck-cards">
                  {['mainboard', 'sideboard', 'commander'].map((category) => {
                    const categoryCards = currentDeck.cards.filter((c: any) => c.category === category);
                    if (categoryCards.length === 0) return null;

                    return (
                      <div key={category} className="quantum-deck-category">
                        <h4 className="quantum-category-title">
                          {category === 'mainboard' ? 'Deck Principal' :
                           category === 'sideboard' ? 'Sideboard' : 'Commander'}
                        </h4>
                        
                        <div className="quantum-category-cards">
                          {categoryCards.map((deckCard: any) => {
                            const card = deckCard.card;
                            
                            return (
                              <div key={`${card.id}-${category}`} className="quantum-deck-card-item">
                                <div className="quantum-card-image-small">
                                  {getCardImage(card, 'small') && (
                                    <Image
                                      src={getCardImage(card, 'small')}
                                      alt={card.name}
                                      width={60}
                                      height={84}
                                      className="rounded border border-slate-600"
                                    />
                                  )}
                                </div>
                                
                                <div className="quantum-card-info-small">
                                  <h5 className="quantum-card-title-small">{card.name}</h5>
                                  <div className="quantum-card-quantities">
                                    <span className="quantum-quantity-deck">
                                      {deckCard.quantity}x
                                    </span>
                                  </div>
                                  
                                  <div className="quantum-card-actions-small">
                                    <Button
                                      onClick={() => handleUpdateQuantity(card.id, deckCard.quantity + 1, category)}
                                      size="sm"
                                      variant="outline"
                                      className="quantum-button-secondary"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                    
                                    <Button
                                      onClick={() => handleUpdateQuantity(card.id, Math.max(0, deckCard.quantity - 1), category)}
                                      size="sm"
                                      variant="outline"
                                      className="quantum-button-secondary"
                                      disabled={deckCard.quantity <= 1}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    
                                    <Button
                                      onClick={() => handleRemoveCard(card.id, category)}
                                      size="sm"
                                      variant="outline"
                                      className="quantum-button-danger"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Adicionar à Coleção */}
      <Dialog open={!!showAddToCollection} onOpenChange={() => setShowAddToCollection(null)}>
        <DialogContent className="quantum-modal">
          <DialogHeader>
            <DialogTitle className="quantum-modal-title">
              <BookOpen className="w-5 h-5 text-cyan-400 mr-2" />
              Adicionar à Coleção
            </DialogTitle>
          </DialogHeader>
          
          <div className="quantum-modal-content">
            <p className="text-slate-300 mb-4">
              Selecione uma coleção para adicionar a carta "{selectedCardForCollection?.name}"
            </p>
            
            <div className="quantum-collections-list">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`quantum-collection-item ${
                    isCardInCollection(selectedCardForCollection?.id, collection.id) 
                      ? 'quantum-collection-item-has-card' 
                      : ''
                  }`}
                >
                  <div className="quantum-collection-info">
                    <h4 className="font-medium text-white">{collection.name}</h4>
                    <p className="text-sm text-slate-400">
                      {collection.cards.length} cartas
                      {isCardInCollection(selectedCardForCollection?.id, collection.id) && (
                        <span className="text-green-400 ml-2">
                          ({getCardQuantityInCollection(selectedCardForCollection?.id, collection.id)}x)
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="quantum-collection-actions">
                    {isCardInCollection(selectedCardForCollection?.id, collection.id) ? (
                      <Badge variant="secondary" className="quantum-badge-success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Já possui
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => handleAddCardToCollection(selectedCardForCollection, collection.id)}
                        size="sm"
                        className="quantum-button-primary"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="quantum-modal-footer">
            <Button
              onClick={() => setShowAddToCollection(null)}
              variant="outline"
              className="quantum-button-secondary"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notificação */}
      {notification.visible && (
        <div className={`quantum-notification quantum-notification-${notification.type}`}>
          <div className="quantum-notification-content">
            {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4" />}
            {notification.type === 'info' && <Info className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckBuilderEnhanced; 