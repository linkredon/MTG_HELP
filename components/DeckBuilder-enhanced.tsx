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
  BookOpen, Star, CheckCircle, AlertTriangle, ArrowLeft,
  Heart, Crown, Zap, Shield, Sword, Edit3, Copy, Trash2,
  PieChart, BarChart3, FileText, Play, Pause, RotateCcw
} from 'lucide-react';
import Image from 'next/image';
import type { MTGCard } from '@/types/mtg';

interface DeckBuilderEnhancedProps {
  deckId?: string;
  onSave?: (deckId: string) => void;
  onCancel?: () => void;
}

const getCardImage = (card: MTGCard, size: 'small' | 'normal' = 'small'): string => {
  if (!card) {
    console.warn('getCardImage: card é undefined ou null');
    return '';
  }
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
    criarColecao,
    editarDeck,
    deletarDeck,
    duplicarDeck,
    criarDeck,
    carregarCartasDoDeck,
    calculateDeckStats
  } = useAppContext();
  
  const cardModalContext = useCardModal();
  
  // Estados locais
  const [currentDeck, setCurrentDeck] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MTGCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
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

  // Estados para visualização e edição
  const [showDeckViewer, setShowDeckViewer] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deckStats, setDeckStats] = useState<any>(null);

  // Debounce para busca
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Função para mostrar notificações
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Carregar deck atual
  useEffect(() => {
    console.log('🔄 Carregando deck atual:', { deckId, decksCount: decks.length });
    
    if (deckId) {
      const deck = decks.find(d => d.id === deckId);
      console.log('📊 Deck encontrado:', deck);
      
      if (deck) {
        console.log('✅ Deck carregado com sucesso:', {
          id: deck.id,
          name: deck.name,
          cardsCount: deck.cards?.length || 0,
          cards: deck.cards
        });
        setCurrentDeck(deck);
        calculateDeckStats(deck);
        
        // Carregar cartas do deck se estiver autenticado
        if (deck.cards?.length === 0) {
          console.log('📤 Carregando cartas do deck...');
          carregarCartasDoDeck(deckId).then(cards => {
            console.log('📊 Cartas carregadas:', cards);
            if (cards.length > 0) {
              const updatedDeck = { ...deck, cards };
              setCurrentDeck(updatedDeck);
              const stats = calculateDeckStats(updatedDeck);
              setDeckStats(stats);
            }
          });
        }
      } else {
        console.error('❌ Deck não encontrado para ID:', deckId);
      }
    } else {
      console.log('🆕 Criando novo deck...');
      // Criar novo deck
      const newDeck = {
        id: 'new',
        name: 'Novo Deck',
        format: 'Standard',
        colors: [],
        cards: [],
        description: ''
      };
      console.log('✅ Novo deck criado:', newDeck);
      setCurrentDeck(newDeck);
    }
  }, [deckId, decks, carregarCartasDoDeck]);

  // Cleanup do timeout quando componente for desmontado
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Buscar cartas com tratamento de erro melhorado e debounce
  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    
    try {
      const results = await searchCardsWithTranslation(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar cartas:', error);
      
      // Determinar o tipo de erro para mostrar mensagem apropriada
      let errorMessage = 'Erro na busca. Verifique sua conexão e tente novamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('abort')) {
          errorMessage = 'Tempo limite excedido. Tente novamente.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message.includes('API do Scryfall')) {
          errorMessage = error.message;
        }
      }
      
      setSearchError(errorMessage);
      showNotification('error', 'Erro ao buscar cartas. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Função com debounce para busca
  const handleSearchWithDebounce = useCallback((term: string) => {
    // Limpar timeout anterior se existir
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Se o termo estiver vazio, limpar resultados imediatamente
    if (!term.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    // Criar novo timeout para debounce
    const newTimeout = setTimeout(() => {
      handleSearch(term);
    }, 500); // 500ms de debounce

    setSearchTimeout(newTimeout);
  }, [handleSearch, searchTimeout]);

  // Adicionar carta ao deck
  const handleAddCard = async (card: MTGCard, category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard', quantity: number = 1) => {
    console.log('🔄 Iniciando adição de carta ao deck:', {
      card: card?.name || 'Unknown Card',
      category,
      quantity,
      deckId: currentDeck?.id,
      deckName: currentDeck?.name,
      isNewDeck: currentDeck?.id === 'new'
    });

    if (!currentDeck) {
      console.error('❌ Deck atual não encontrado');
      showNotification('error', 'Deck não encontrado');
      return;
    }

    // Se é um deck novo, criar primeiro
    if (currentDeck.id === 'new') {
      console.log('🆕 Criando deck antes de adicionar carta...');
      try {
        const newDeckData = {
          name: currentDeck.name,
          description: currentDeck.description,
          format: currentDeck.format,
          colors: currentDeck.colors,
          cards: [],
          isPublic: false,
          tags: []
        };
        
        const newDeckId = await criarDeck(newDeckData);
        console.log('✅ Deck criado com ID:', newDeckId);
        
        // Atualizar o deck atual com o novo ID
        setCurrentDeck(prev => ({ ...prev, id: newDeckId }));
        
        // Agora adicionar a carta
        await adicionarCartaAoDeck(newDeckId, card, category, quantity);
        console.log('✅ Carta adicionada ao novo deck!');
        showNotification('success', `${card?.name || 'Carta'} adicionada ao deck!`);
        
        // Recalcular estatísticas
        console.log('📊 Recalculando estatísticas...');
        const updatedDeck = { ...currentDeck, id: newDeckId };
        const stats = calculateDeckStats(updatedDeck);
        setDeckStats(stats);
        console.log('✅ Estatísticas recalculadas');
      } catch (error) {
        console.error('❌ Erro ao criar deck:', error);
        showNotification('error', `Erro ao criar deck: ${error.message || 'Erro desconhecido'}`);
      }
      return;
    }

    try {
      console.log('📤 Chamando adicionarCartaAoDeck...');
      await adicionarCartaAoDeck(currentDeck.id, card, category, quantity);
      console.log('✅ Carta adicionada com sucesso!');
              showNotification('success', `${card?.name || 'Carta'} adicionada ao deck!`);
      
      // Recalcular estatísticas
      console.log('📊 Recalculando estatísticas...');
      const updatedDeck = { ...currentDeck };
      const stats = calculateDeckStats(updatedDeck);
      setDeckStats(stats);
      console.log('✅ Estatísticas recalculadas');
    } catch (error) {
      console.error('❌ Erro ao adicionar carta ao deck:', error);
      showNotification('error', `Erro ao adicionar carta: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Remover carta do deck
  const handleRemoveCard = async (cardId: string, category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard') => {
    if (!currentDeck) return;

    try {
      await removerCartaDoDeck(currentDeck.id, cardId, category);
      showNotification('success', 'Carta removida do deck!');
      // Recalcular estatísticas
      const updatedDeck = { ...currentDeck };
      const stats = calculateDeckStats(updatedDeck);
      setDeckStats(stats);
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
      // Recalcular estatísticas
      const updatedDeck = { ...currentDeck };
      const stats = calculateDeckStats(updatedDeck);
      setDeckStats(stats);
    } catch (error) {
      showNotification('error', 'Erro ao atualizar quantidade');
    }
  };

  // Mover carta entre seções
  const handleMoveCard = async (cardId: string, fromCategory: 'mainboard' | 'sideboard' | 'commander', toCategory: 'mainboard' | 'sideboard' | 'commander') => {
    if (!currentDeck) return;

    try {
      const card = (currentDeck.cards ?? []).find((c: any) => {
        if (!c) return false;
        let cardIdToCheck = '';
        if (c.cardData && c.cardData.id) {
          cardIdToCheck = c.cardData.id;
        } else if (c.card && c.card.id) {
          cardIdToCheck = c.card.id;
        } else if (c.id) {
          cardIdToCheck = c.id;
        }
        return cardIdToCheck === cardId && c.category === fromCategory;
      });
      
      if (!card) return;
      
      const existingCard = (currentDeck.cards ?? []).find((c: any) => {
        if (!c) return false;
        let cardIdToCheck = '';
        if (c.cardData && c.cardData.id) {
          cardIdToCheck = c.cardData.id;
        } else if (c.card && c.card.id) {
          cardIdToCheck = c.card.id;
        } else if (c.id) {
          cardIdToCheck = c.id;
        }
        return cardIdToCheck === cardId && c.category === toCategory;
      });
      
      if (existingCard) {
        await atualizarQuantidadeNoDeck(currentDeck.id, cardId, existingCard.quantity + card.quantity, toCategory);
        await removerCartaDoDeck(currentDeck.id, cardId, fromCategory);
      } else {
        // Obter o objeto da carta para adicionar
        const cardToAdd = card.card || card.cardData || card;
        await adicionarCartaAoDeck(currentDeck.id, cardToAdd, toCategory, card.quantity);
        await removerCartaDoDeck(currentDeck.id, cardId, fromCategory);
      }
      
      showNotification('success', 'Carta movida com sucesso!');
      // Recalcular estatísticas
      const updatedDeck = { ...currentDeck };
      const stats = calculateDeckStats(updatedDeck);
      setDeckStats(stats);
    } catch (error) {
      showNotification('error', 'Erro ao mover carta');
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
    return (collection.cards ?? []).some((cc: any) => {
      // Verificar se cc é válido
      if (!cc) return false;
      
      // Tentar diferentes estruturas para obter o ID da carta
      let cardIdToCheck = '';
      
      if (cc.card && cc.card.id) {
        cardIdToCheck = cc.card.id;
      } else if (cc.id) {
        cardIdToCheck = cc.id;
      } else if (cc.cardData && cc.cardData.id) {
        cardIdToCheck = cc.cardData.id;
      }
      
      return cardIdToCheck === cardId;
    });
  };

  // Verificar se uma carta está no deck
  const isCardInDeck = (cardId: string, category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard') => {
    if (!currentDeck) return false;
    return (currentDeck.cards ?? []).some((dc: any) => {
      // Verificar se dc é válido
      if (!dc) return false;
      
      // Tentar diferentes estruturas para obter o ID da carta
      let cardIdToCheck = '';
      
      if (dc.cardData && dc.cardData.id) {
        cardIdToCheck = dc.cardData.id;
      } else if (dc.card && dc.card.id) {
        cardIdToCheck = dc.card.id;
      } else if (dc.id) {
        cardIdToCheck = dc.id;
      }
      
      return cardIdToCheck === cardId && dc.category === category;
    });
  };

  // Obter quantidade da carta no deck
  const getCardQuantityInDeck = (cardId: string, category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard') => {
    if (!currentDeck) return 0;
    const deckCard = (currentDeck.cards ?? []).find((dc: any) => {
      // Verificar se dc é válido
      if (!dc) return false;
      
      // Tentar diferentes estruturas para obter o ID da carta
      let cardIdToCheck = '';
      
      if (dc.cardData && dc.cardData.id) {
        cardIdToCheck = dc.cardData.id;
      } else if (dc.card && dc.card.id) {
        cardIdToCheck = dc.card.id;
      } else if (dc.id) {
        cardIdToCheck = dc.id;
      }
      
      return cardIdToCheck === cardId && dc.category === category;
    });
    return deckCard ? (deckCard.quantity || 1) : 0;
  };

  // Obter quantidade da carta na coleção
  const getCardQuantityInCollection = (cardId: string, collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return 0;
    const collectionCard = (collection.cards ?? []).find((cc: any) => {
      // Verificar se cc é válido
      if (!cc) return false;
      
      // Tentar diferentes estruturas para obter o ID da carta
      let cardIdToCheck = '';
      
      if (cc.card && cc.card.id) {
        cardIdToCheck = cc.card.id;
      } else if (cc.id) {
        cardIdToCheck = cc.id;
      } else if (cc.cardData && cc.cardData.id) {
        cardIdToCheck = cc.cardData.id;
      }
      
      return cardIdToCheck === cardId;
    });
    return collectionCard ? (collectionCard.quantity || 1) : 0;
  };

  // Função utilitária para garantir que deck.cards sempre seja um array
  const safeDeckCards = (deck: any) => Array.isArray(deck?.cards) ? deck.cards : [];

  // Funções de gerenciamento do deck
  const handleSaveDeck = async () => {
    if (!currentDeck) return;
    
    try {
      await onSave?.(currentDeck.id);
      showNotification('success', 'Deck salvo com sucesso!');
    } catch (error) {
      showNotification('error', 'Erro ao salvar deck');
    }
  };

  const handleDuplicateDeck = async () => {
    if (!currentDeck) return;
    
    try {
      await duplicarDeck(currentDeck.id, `${currentDeck.name} (Cópia)`);
      showNotification('success', 'Deck duplicado com sucesso!');
    } catch (error) {
      showNotification('error', 'Erro ao duplicar deck');
    }
  };

  const handleDeleteDeck = async () => {
    if (!currentDeck) return;
    
    try {
      await deletarDeck(currentDeck.id);
      showNotification('success', 'Deck deletado com sucesso!');
      onCancel?.();
    } catch (error) {
      showNotification('error', 'Erro ao deletar deck');
    }
  };

  const exportDeckList = () => {
    if (!currentDeck) return;
    
    const mainboard = (currentDeck.cards ?? []).filter((c: any) => c.category === 'mainboard');
    const sideboard = (currentDeck.cards ?? []).filter((c: any) => c.category === 'sideboard');
    const commander = (currentDeck.cards ?? []).filter((c: any) => c.category === 'commander');
    
    let exportText = `// ${currentDeck.name}\n// Formato: ${currentDeck.format}\n\n`;
    
    if (commander.length > 0) {
      exportText += "Commander:\n";
      commander.forEach((deckCard: any) => {
        const cardName = deckCard.cardData?.name || deckCard.card?.name || deckCard.name || 'Unknown Card';
        const quantity = deckCard.quantity || 1;
        exportText += `${quantity} ${cardName}\n`;
      });
      exportText += "\n";
    }
    
    if (mainboard.length > 0) {
      exportText += "Main Deck:\n";
      mainboard.forEach((deckCard: any) => {
        const cardName = deckCard.cardData?.name || deckCard.card?.name || deckCard.name || 'Unknown Card';
        const quantity = deckCard.quantity || 1;
        exportText += `${quantity} ${cardName}\n`;
      });
      exportText += "\n";
    }
    
    if (sideboard.length > 0) {
      exportText += "Sideboard:\n";
      sideboard.forEach((deckCard: any) => {
        const cardName = deckCard.cardData?.name || deckCard.card?.name || deckCard.name || 'Unknown Card';
        const quantity = deckCard.quantity || 1;
        exportText += `${quantity} ${cardName}\n`;
      });
    }
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDeck.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Lista do deck exportada!');
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
      {/* Header Melhorado */}
      <div className="quantum-header">
        <div className="quantum-header-left">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="quantum-button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Decks
          </Button>
          
          <div className="quantum-deck-info">
            <h1 className="quantum-title">
              <Target className="w-6 h-6 mr-3" />
              {currentDeck.name}
            </h1>
            <p className="quantum-subtitle">
              Construtor de Deck - {currentDeck.format}
            </p>
          </div>
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
          
          {/* Botão de teste temporário */}
          <Button
            onClick={() => {
              console.log('🧪 Teste: Adicionando carta de teste...');
              const testCard = {
                id: 'test-card-1',
                name: 'Lightning Bolt',
                type_line: 'Instant',
                set_name: 'Core Set 2021',
                rarity: 'common',
                cmc: 1
              };
              handleAddCard(testCard, 'mainboard', 1);
            }}
            variant="outline"
            className="quantum-button-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Teste
          </Button>
          
          <Button
            onClick={() => setShowDeckViewer(true)}
            variant="outline"
            className="quantum-button-secondary"
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          
          <Button
            onClick={handleSaveDeck}
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
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
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
                      handleSearchWithDebounce(e.target.value);
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
                ) : searchError ? (
                  <div className="quantum-error-state">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Erro na busca</h3>
                    <p className="text-slate-400 mb-4">{searchError}</p>
                    <Button
                      onClick={() => handleSearch(searchTerm)}
                      className="quantum-button-primary"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tentar Novamente
                    </Button>
                  </div>
                ) : searchResults.length > 0 ? (
                                      <div className={`quantum-cards-grid ${viewMode === 'list' ? 'quantum-cards-list' : ''}`}>
                      {searchResults.filter(card => card && card.id).map((card) => (
                      <Card key={card?.id || 'unknown'} className="quantum-card quantum-card-search">
                        <CardContent className="quantum-card-content">
                          <div className="quantum-card-image">
                            {getCardImage(card) && (
                              <Image
                                src={getCardImage(card)}
                                alt={card?.name || 'Card'}
                                width={120}
                                height={168}
                                className="rounded-lg border border-slate-600"
                              />
                            )}
                          </div>
                          
                          <div className="quantum-card-info">
                            <h4 className="quantum-card-title">{card?.name || 'Unknown Card'}</h4>
                            <p className="quantum-card-set">{card.set_name}</p>
                            <p className="quantum-card-type">{card.type_line}</p>
                            
                            <div className="quantum-card-stats">
                              <Badge variant="secondary" className="quantum-badge">
                                {card.rarity}
                              </Badge>
                              {isCardInDeck(card?.id || '') && (
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
                                  setShowAddToCollection(card?.id || '');
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

          {/* Aba da Coleção - Layout Melhorado */}
          <TabsContent value="collection" className="quantum-tab-content">
            <div className="quantum-collection-section">
              <div className="quantum-collection-header">
                <div className="quantum-header-info">
                  <h3 className="quantum-section-title">
                    <Library className="w-5 h-5 mr-2" />
                    Minha Coleção
                  </h3>
                  <p className="quantum-section-subtitle">
                    Adicione cartas da sua coleção ao deck
                  </p>
                </div>
                
                <div className="quantum-collection-stats">
                  <Badge variant="secondary" className="quantum-badge">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {(collections ?? []).length} coleções
                  </Badge>
                </div>
              </div>

              {(collections ?? []).length === 0 ? (
                <div className="quantum-empty-state">
                  <Library className="w-16 h-16 text-slate-500 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Nenhuma coleção encontrada</h3>
                  <p className="text-slate-400">Crie uma coleção para começar</p>
                </div>
              ) : (
                <div className="quantum-collections-grid">
                  {(collections ?? []).map((collection) => (
                    <Card key={collection.id} className="quantum-card quantum-collection-card">
                      <CardHeader className="quantum-card-header">
                        <div className="quantum-collection-header-info">
                          <div className="quantum-collection-title">
                            <h4 className="font-semibold text-white">{collection.name}</h4>
                            <div className="quantum-collection-badges">
                              <Badge variant="secondary" className="quantum-badge">
                                {(collection.cards ?? []).length} cartas
                              </Badge>
                              {(collection.cards ?? []).length > 0 && (
                                <Badge variant="outline" className="quantum-badge-info">
                                  <Star className="w-3 h-3 mr-1" />
                                  Ativa
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="quantum-card-content">
                        {(collection.cards ?? []).length === 0 ? (
                          <div className="quantum-collection-empty">
                            <Package className="w-8 h-8 text-slate-500 mb-2" />
                            <p className="text-sm text-slate-400">Coleção vazia</p>
                          </div>
                        ) : (
                          <div className="quantum-collection-cards">
                            {(collection.cards ?? []).slice(0, 6).filter(collectionCard => collectionCard && collectionCard.card).map((collectionCard: any) => {
                              const card = collectionCard.card;
                              const inDeck = isCardInDeck(card?.id || '');
                              const deckQuantity = getCardQuantityInDeck(card?.id || '');
                              
                              return (
                                <div key={card?.id || 'unknown'} className="quantum-collection-card-item">
                                  <div className="quantum-card-image-small">
                                    {getCardImage(card, 'small') && (
                                      <Image
                                        src={getCardImage(card, 'small')}
                                        alt={card?.name || 'Card'}
                                        width={60}
                                        height={84}
                                        className="rounded border border-slate-600 hover:border-cyan-400 transition-colors"
                                      />
                                    )}
                                  </div>
                                  
                                  <div className="quantum-card-info-small">
                                    <h5 className="quantum-card-title-small">{card?.name || 'Unknown Card'}</h5>
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
                                        title="Adicionar ao deck"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {(collection.cards ?? []).length > 6 && (
                          <div className="quantum-collection-more">
                            <span className="text-sm text-slate-400">
                              +{(collection.cards ?? []).length - 6} mais cartas
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
                    {safeDeckCards(currentDeck).reduce((sum: number, c: any) => sum + c.quantity, 0)} cartas
                  </Badge>
                </div>
              </div>

              {safeDeckCards(currentDeck).length === 0 ? (
                <div className="quantum-empty-state">
                  <Target className="w-16 h-16 text-slate-500 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Deck vazio</h3>
                  <p className="text-slate-400">Adicione cartas para começar a construir seu deck</p>
                </div>
              ) : (
                <div className="quantum-deck-cards">
                  {['mainboard', 'sideboard', 'commander'].map((category) => {
                    const categoryCards = safeDeckCards(currentDeck).filter((c: any) => c.category === category);
                    if (categoryCards.length === 0) return null;

                    return (
                      <div key={category} className="quantum-deck-category">
                        <h4 className="quantum-category-title">
                          {category === 'mainboard' ? 'Deck Principal' :
                           category === 'sideboard' ? 'Sideboard' : 'Commander'}
                        </h4>
                        
                        <div className="quantum-category-cards">
                          {categoryCards.map((deckCard: any) => {
                            // Tentar diferentes estruturas para obter a carta
                            let card = deckCard.cardData || deckCard.card;
                            
                            // Verificar se card é válido
                            if (!card) {
                              console.warn('Card é undefined no deckCard:', deckCard);
                              return null;
                            }
                            
                            return (
                              <div key={`${card?.id || 'unknown'}-${category}`} className="quantum-deck-card-item">
                                <div className="quantum-card-image-small">
                                  {getCardImage(card, 'small') && (
                                    <Image
                                      src={getCardImage(card, 'small')}
                                      alt={card?.name || 'Card'}
                                      width={60}
                                      height={84}
                                      className="rounded border border-slate-600"
                                    />
                                  )}
                                </div>
                                
                                <div className="quantum-card-info-small">
                                  <h5 className="quantum-card-title-small">{card?.name || 'Unknown Card'}</h5>
                                  <div className="quantum-card-quantities">
                                    <span className="quantum-quantity-deck">
                                      {deckCard.quantity}x
                                    </span>
                                  </div>
                                  
                                  <div className="quantum-card-actions-small">
                                    <Button
                                      onClick={() => handleUpdateQuantity(card?.id || '', deckCard.quantity + 1, category)}
                                      size="sm"
                                      variant="outline"
                                      className="quantum-button-secondary"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                    
                                    <Button
                                      onClick={() => handleUpdateQuantity(card?.id || '', Math.max(0, deckCard.quantity - 1), category)}
                                      size="sm"
                                      variant="outline"
                                      className="quantum-button-secondary"
                                      disabled={deckCard.quantity <= 1}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    
                                    <Button
                                      onClick={() => handleRemoveCard(card?.id || '', category)}
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

          {/* Aba de Estatísticas */}
          <TabsContent value="stats" className="quantum-tab-content">
            <div className="quantum-stats-section">
              <div className="quantum-stats-header">
                <h3 className="quantum-section-title">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Estatísticas do Deck
                </h3>
              </div>

              {deckStats ? (
                <div className="quantum-stats-grid">
                  <Card className="quantum-card quantum-stats-card">
                    <CardHeader>
                      <CardTitle className="quantum-stats-title">
                        <Target className="w-4 h-4 mr-2" />
                        Resumo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="quantum-stats-summary">
                        <div className="quantum-stat-item">
                          <span className="quantum-stat-label">Total de Cartas:</span>
                          <span className="quantum-stat-value">{deckStats.total}</span>
                        </div>
                        <div className="quantum-stat-item">
                          <span className="quantum-stat-label">Deck Principal:</span>
                          <span className="quantum-stat-value">{deckStats.mainboard}</span>
                        </div>
                        <div className="quantum-stat-item">
                          <span className="quantum-stat-label">Sideboard:</span>
                          <span className="quantum-stat-value">{deckStats.sideboard}</span>
                        </div>
                        <div className="quantum-stat-item">
                          <span className="quantum-stat-label">Commander:</span>
                          <span className="quantum-stat-value">{deckStats.commander}</span>
                        </div>
                        <div className="quantum-stat-item">
                          <span className="quantum-stat-label">Cartas Únicas:</span>
                          <span className="quantum-stat-value">{deckStats.unique}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="quantum-card quantum-stats-card">
                    <CardHeader>
                      <CardTitle className="quantum-stats-title">
                        <PieChart className="w-4 h-4 mr-2" />
                        Curva de Mana
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="quantum-mana-curve">
                        {Object.entries(deckStats.manaCurve).map(([cmc, count]) => (
                          <div key={cmc} className="quantum-mana-bar">
                            <span className="quantum-mana-cmc">{cmc}</span>
                            <div className="quantum-mana-bar-container">
                              <div 
                                className="quantum-mana-bar-fill"
                                style={{ width: `${(count / Math.max(...Object.values(deckStats.manaCurve))) * 100}%` }}
                              />
                            </div>
                            <span className="quantum-mana-count">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="quantum-empty-state">
                  <BarChart3 className="w-16 h-16 text-slate-500 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Sem estatísticas</h3>
                  <p className="text-slate-400">Adicione cartas ao deck para ver as estatísticas</p>
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
              {(collections ?? []).map((collection) => (
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
                      {(collection.cards ?? []).length} cartas
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

      {/* Modal de Confirmação de Deletar */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="quantum-modal">
          <DialogHeader>
            <DialogTitle className="quantum-modal-title">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          
          <div className="quantum-modal-content">
            <p className="text-slate-300 mb-4">
              Tem certeza que deseja deletar o deck "{currentDeck.name}"? Esta ação não pode ser desfeita.
            </p>
          </div>
          
          <div className="quantum-modal-footer">
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              variant="outline"
              className="quantum-button-secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteDeck}
              className="quantum-button-danger"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Deletar Deck
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