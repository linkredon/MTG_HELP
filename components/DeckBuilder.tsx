"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useCardModal } from '@/contexts/CardModalContext';
import SearchCardList from '@/components/SearchCardList';
import DeckImporter from '@/components/DeckImporter';
import { 
  Search, Plus, Minus, X, Save, Settings, Target, 
  Library, Download, RefreshCw, AlertCircle, Loader2,
  Grid3X3, List, Filter, Package, Eye, Info
} from 'lucide-react';
import Image from 'next/image';
import type { MTGCard } from '@/types/mtg';

// Componente interno para exibir cartas da coleção
interface CollectionDisplayProps {
  searchTerm: string;
  raridade: string;
  tipo: string;
  onAddCard: (card: MTGCard, category?: 'mainboard' | 'sideboard' | 'commander', quantity?: number) => void;
  currentDeck: any;
  currentCollection: any;
}

const CollectionDisplay: React.FC<CollectionDisplayProps> = ({ 
  searchTerm, 
  raridade, 
  tipo, 
  onAddCard, 
  currentDeck, 
  currentCollection 
}) => {
  const [addingCard, setAddingCard] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());

  // Enhanced onAddCard with visual feedback
  const handleAddCard = async (card: MTGCard, zone: 'mainboard' | 'sideboard' | 'commander', quantity: number) => {
    try {
      setAddingCard(card.id);
      await onAddCard(card, zone, quantity);
      
      // Visual feedback for successful addition
      setRecentlyAdded(prev => new Set(prev.add(card.id)));
      setTimeout(() => {
        setRecentlyAdded(prev => {
          const newSet = new Set(prev);
          newSet.delete(card.id);
          return newSet;
        });
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao adicionar carta:', error);
    } finally {
      setAddingCard(null);
    }
  };
  // Filtrar cartas da coleção
  const filteredCards = useMemo(() => {
    let filtered = currentCollection.cards;

    // Filtro por nome com suporte a tradução PT-BR para EN
    if (searchTerm.trim()) {
      filtered = filtered.filter((collectionCard: any) => 
        cardMatchesSearchTerm(collectionCard.card, searchTerm)
      );
    }

    // Filtro por raridade
    if (raridade !== 'all') {
      filtered = filtered.filter((collectionCard: any) => 
        collectionCard.card.rarity === raridade
      );
    }

    // Filtro por tipo
    if (tipo !== 'all') {
      filtered = filtered.filter((collectionCard: any) => 
        collectionCard.card.type_line.toLowerCase().includes(tipo)
      );
    }

    return filtered;
  }, [currentCollection.cards, searchTerm, raridade, tipo]);

  if (filteredCards.length === 0) {
    return (
      <div className="mtg-card text-center py-12">
        <Library className="w-16 h-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-medium text-white mb-2">Nenhuma carta encontrada</h3>
        <p className="text-slate-400">
          {searchTerm.trim() || raridade !== 'all' || tipo !== 'all' 
            ? 'Tente ajustar os filtros' 
            : 'Sua coleção está vazia'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredCards.map((collectionCard: any) => {
        const card = collectionCard.card;
        const inDeck = currentDeck.cards.find((dc: any) => dc.card.id === card.id);
        const isRecentlyAdded = recentlyAdded.has(card.id);
        
        return (
          <div 
            key={card.id} 
            className={`mtg-card-mini transition-all duration-200 ${
              isRecentlyAdded ? 'border-green-500/70 shadow-lg shadow-green-500/20 scale-105' : ''
            }`}
          >
            <div className="p-4">
              <div className="flex gap-3">
                {/* Imagem da carta */}
                <div className="flex-shrink-0">
                  {getCardImage(card) && (
                    <div className="relative">
                      <Image
                        src={getCardImage(card)}
                        alt={card.name}
                        width={60}
                        height={84}
                        className="rounded-lg border border-slate-600"
                      />
                      {isRecentlyAdded && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Plus className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Informações da carta */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-sm truncate mb-1" title={card.name}>
                    {card.name}
                  </h4>
                  <p className="text-xs text-slate-400 mb-1 truncate" title={card.set_name}>
                    {card.set_name}
                  </p>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2" title={card.type_line}>
                    {card.type_line}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mtg-badge mtg-badge-secondary text-xs">
                      {collectionCard.quantity}x coleção
                    </span>
                    {inDeck && (
                      <span className="mtg-badge mtg-badge-success text-xs">
                        {inDeck.quantity}x deck
                      </span>
                    )}
                  </div>
                  
                  {/* Botões de adicionar */}
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() => handleAddCard(card, 'mainboard', 1)}
                      disabled={addingCard === card.id}
                      className={`h-7 px-3 text-xs rounded-lg transition-all flex items-center gap-1 ${
                        recentlyAdded.has(card.id) 
                          ? 'bg-green-500 hover:bg-green-600 text-white shadow-md scale-105' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {addingCard === card.id ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                      <span className="hidden sm:inline">Principal</span>
                      <span className="sm:hidden">Main</span>
                    </button>
                    <button
                      onClick={() => handleAddCard(card, 'sideboard', 1)}
                      disabled={addingCard === card.id}
                      className={`h-7 px-3 text-xs rounded-lg transition-all flex items-center gap-1 ${
                        recentlyAdded.has(card.id)
                          ? 'border-green-500 text-green-400 bg-green-900/20 shadow-md scale-105'
                          : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                      } border`}
                    >
                      {addingCard === card.id ? (
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                      Side
                    </button>
                    {currentDeck.format === 'Commander' && (
                      <button
                        onClick={() => handleAddCard(card, 'commander', 1)}
                        disabled={addingCard === card.id}
                        className={`h-7 px-3 text-xs rounded-lg transition-all flex items-center gap-1 ${
                          recentlyAdded.has(card.id)
                            ? 'border-yellow-400 text-yellow-300 bg-yellow-900/30 shadow-md scale-105'
                            : 'border-yellow-600 text-yellow-400 hover:bg-yellow-900/20'
                        } border`}
                      >
                        {addingCard === card.id ? (
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        Cmd
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface DeckBuilderProps {
  deckId?: string; // Para editar deck existente
  onSave?: (deckId: string) => void;
  onCancel?: () => void;
}

// Função para obter imagem da carta
const getCardImage = (card: MTGCard, size: 'small' | 'normal' = 'small'): string => {
  return getImageUrl(card, size);
};

const DeckBuilder: React.FC<DeckBuilderProps> = ({ deckId, onSave, onCancel }) => {
  const { decks, criarDeck, editarDeck, adicionarCartaAoDeck, removerCartaDoDeck, atualizarQuantidadeNoDeck, currentCollection } = useAppContext();
  const { openModal } = useCardModal();
  
  const existingDeck = deckId ? decks.find(d => d.id === deckId) : null;
  
  // Estados do deck sendo construído/editado
  const [deckInfo, setDeckInfo] = useState({
    name: existingDeck?.name || '',
    format: existingDeck?.format || 'Standard',
    description: existingDeck?.description || '',
    colors: existingDeck?.colors || [],
    tags: existingDeck?.tags || [],
    isPublic: existingDeck?.isPublic || false
  });
  
  // Estados de busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [raridade, setRaridade] = useState('all');
  const [tipo, setTipo] = useState('all');
  const [cmc, setCmc] = useState('');
  const [manaColors, setManaColors] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<MTGCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Estados de visualização
  const [activeTab, setActiveTab] = useState<'search' | 'collection' | 'deck'>('search');
  const [deckViewCategory, setDeckViewCategory] = useState<'all' | 'mainboard' | 'sideboard' | 'commander'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Obter deck atual (seja novo ou existente)
  const currentDeck = existingDeck || { id: 'temp', cards: [], ...deckInfo, createdAt: '', lastModified: '' };
  
  // Filtrar cartas do deck por categoria
  const filteredDeckCards = useMemo(() => {
    if (deckViewCategory === 'all') return currentDeck.cards;
    return currentDeck.cards.filter(card => card.category === deckViewCategory);
  }, [currentDeck.cards, deckViewCategory]);
  
  // Estatísticas do deck
  const deckStats = useMemo(() => {
    const mainboard = currentDeck.cards.filter(c => c.category === 'mainboard');
    const sideboard = currentDeck.cards.filter(c => c.category === 'sideboard');
    const commander = currentDeck.cards.filter(c => c.category === 'commander');
    
    const mainboardCount = mainboard.reduce((sum, c) => sum + c.quantity, 0);
    const sideboardCount = sideboard.reduce((sum, c) => sum + c.quantity, 0);
    const commanderCount = commander.reduce((sum, c) => sum + c.quantity, 0);
    
    return {
      mainboard: mainboardCount,
      sideboard: sideboardCount,
      commander: commanderCount,
      total: mainboardCount + sideboardCount + commanderCount,
      unique: currentDeck.cards.length
    };
  }, [currentDeck.cards]);
  
  // Buscar cartas na API Scryfall
  const searchCards = useCallback(async () => {
    if (!searchTerm.trim() && raridade === 'all' && tipo === 'all' && !cmc && manaColors.length === 0) {
      setSearchError('Por favor, defina pelo menos um filtro para pesquisar');
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      let queryParts = [];
      
      if (searchTerm.trim()) queryParts.push(encodeURIComponent(searchTerm.trim()));
      if (raridade !== 'all') queryParts.push(`rarity:${raridade}`);
      if (tipo !== 'all') queryParts.push(`type:${tipo}`);
      if (cmc) queryParts.push(`cmc:${cmc}`);
      if (manaColors.length > 0) {
        const colorQuery = manaColors.map(c => `c:${c}`).join('');
        queryParts.push(colorQuery);
      }
      
      const query = queryParts.join('+');
      
      // Usar o serviço de tradução para busca na API
      const response = await searchCardsWithTranslation(query);
      const data = await response.json();
      
      if (response.ok && data.data) {
        setSearchResults(data.data);
        setSearchError(null);
      } else {
        setSearchResults([]);
        setSearchError(data.details || 'Nenhuma carta encontrada');
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error);
      setSearchResults([]);
      setSearchError('Erro ao pesquisar cartas. Verifique sua conexão.');
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, raridade, tipo, cmc, manaColors]);
  
  // Adicionar carta ao deck
  const handleAddCardToDeck = useCallback((card: MTGCard, category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard', quantity = 1) => {
    if (existingDeck) {
      adicionarCartaAoDeck(existingDeck.id, card, category, quantity);
    } else {
      // Para deck novo, gerenciar estado local
      // TODO: Implementar lógica para deck temporário
      console.log('Adicionando carta ao deck temporário:', card.name);
    }
  }, [existingDeck, adicionarCartaAoDeck]);
  
  // Remover carta do deck
  const handleRemoveCardFromDeck = useCallback((cardId: string, category: 'mainboard' | 'sideboard' | 'commander') => {
    if (existingDeck) {
      removerCartaDoDeck(existingDeck.id, cardId, category);
    }
  }, [existingDeck, removerCartaDoDeck]);
  
  // Atualizar quantidade no deck
  const handleUpdateQuantity = useCallback((cardId: string, category: 'mainboard' | 'sideboard' | 'commander', newQuantity: number) => {
    if (existingDeck) {
      atualizarQuantidadeNoDeck(existingDeck.id, cardId, newQuantity, category);
    }
  }, [existingDeck, atualizarQuantidadeNoDeck]);
  
  // Salvar deck
  const handleSaveDeck = useCallback(() => {
    if (!deckInfo.name.trim()) {
      alert('Por favor, digite um nome para o deck');
      return;
    }
    
    if (existingDeck) {
      editarDeck(existingDeck.id, deckInfo);
      if (onSave) onSave(existingDeck.id);
    } else {
      const newDeckId = criarDeck({
        name: deckInfo.name,
        format: deckInfo.format,
        description: deckInfo.description,
        colors: deckInfo.colors,
        cards: [],
        isPublic: deckInfo.isPublic,
        tags: deckInfo.tags
      });
      if (onSave) onSave(newDeckId);
    }
  }, [deckInfo, existingDeck, editarDeck, criarDeck, onSave]);
  
  // Limpar filtros de busca
  const clearSearchFilters = useCallback(() => {
    setSearchTerm('');
    setRaridade('all');
    setTipo('all');
    setCmc('');
    setManaColors([]);
    setSearchResults([]);
    setSearchError(null);
  }, []);
  
  return (
    <div className="mtg-section">
      {/* Header Section */}
      <div className="mtg-card text-center mb-8">
        <div className="mtg-card-header justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center mb-6 mx-auto shadow-xl">
            <Target className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="mtg-section-title">
          {existingDeck ? `Editando: ${existingDeck.name}` : 'Deck Builder Pro'}
        </h1>
        <p className="mtg-section-subtitle">
          {existingDeck ? 'Faça alterações no seu deck com ferramentas avançadas' : 'Crie e personalize seu deck com ferramentas profissionais'}
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="mtg-status mtg-status-info">
            <Package className="w-3 h-3" />
            {deckStats.total} cartas no deck
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mtg-card mb-8">
        <div className="mtg-card-header">
          <Settings className="mtg-card-icon" />
          <div className="mtg-card-content flex-1">
            <h3 className="mtg-card-title">Ações do Deck</h3>
            <p className="mtg-card-description">Gerencie e configure seu deck</p>
          </div>
          <div className="flex items-center gap-3">
            <DeckImporter 
              onImportSuccess={() => {/* TODO: Refresh deck list */}}
              onImportError={(error) => console.error(error)}
            />
            
            <Button
              onClick={handleSaveDeck}
              disabled={!deckInfo.name.trim()}
              className="quantum-btn compact primary"
            >
              <Save className="w-4 h-4" />
              <span>{existingDeck ? 'Salvar Alterações' : 'Salvar Deck'}</span>
            </Button>
            
            {onCancel && (
              <Button onClick={onCancel} className="quantum-btn compact">
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Informações do Deck */}
      <div className="mtg-card mb-8">
        <div className="mtg-card-header">
          <Info className="mtg-card-icon" />
          <div className="mtg-card-content">
            <h3 className="mtg-card-title">Configurações do Deck</h3>
            <p className="mtg-card-description">Defina as informações básicas do seu deck</p>
          </div>
        </div>
        <div className="px-6 pb-6 space-y-6">
          <div className="mtg-grid-2">
            <div>
              <label className="mtg-label">Nome do Deck *</label>
              <Input
                value={deckInfo.name}
                onChange={(e) => setDeckInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do deck..."
                className="mtg-input"
              />
            </div>
            
            <div>
              <label className="mtg-label">Formato</label>
              <Select value={deckInfo.format} onValueChange={(value) => setDeckInfo(prev => ({ ...prev, format: value }))}>
                <SelectTrigger className="mtg-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="mtg-dropdown">
                  {['Standard', 'Pioneer', 'Modern', 'Legacy', 'Vintage', 'Commander', 'Historic', 'Pauper', 'Brawl', 'Casual'].map(format => (
                    <SelectItem key={format} value={format} className="mtg-dropdown-item">{format}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="mtg-label">Descrição</label>
            <Textarea
              value={deckInfo.description}
              onChange={(e) => setDeckInfo(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a estratégia do seu deck..."
              className="mtg-textarea"
              rows={3}
            />
          </div>
          
          <div>
            <label className="mtg-label">Cores do Deck</label>
            <div className="flex flex-wrap gap-3">
              {[
                { color: 'W', name: 'Branco', bg: 'from-yellow-400 to-orange-500' },
                { color: 'U', name: 'Azul', bg: 'from-blue-500 to-cyan-600' },
                { color: 'B', name: 'Preto', bg: 'from-gray-700 to-gray-900' },
                { color: 'R', name: 'Vermelho', bg: 'from-red-500 to-orange-600' },
                { color: 'G', name: 'Verde', bg: 'from-green-500 to-emerald-600' }
              ].map(({ color, name, bg }) => (
                <button
                  key={color}
                  onClick={() => {
                    setDeckInfo(prev => ({
                      ...prev,
                      colors: prev.colors.includes(color)
                        ? prev.colors.filter(c => c !== color)
                        : [...prev.colors, color]
                    }));
                  }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold transition-all ${
                    deckInfo.colors.includes(color)
                      ? `bg-gradient-to-br ${bg} scale-110 ring-2 ring-white/30`
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={name}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Estatísticas do Deck */}
      <div className="mtg-grid gap-6 mb-8">
        <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-xl border border-blue-500/30">
          <div className="text-3xl font-bold text-blue-400 mb-2">{deckStats.total}</div>
          <div className="text-slate-300 font-medium">Total de Cartas</div>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-xl border border-green-500/30">
          <div className="text-3xl font-bold text-green-400 mb-2">{deckStats.mainboard}</div>
          <div className="text-slate-300 font-medium">Deck Principal</div>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-xl border border-purple-500/30">
          <div className="text-3xl font-bold text-purple-400 mb-2">{deckStats.sideboard}</div>
          <div className="text-slate-300 font-medium">Sideboard</div>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 rounded-xl border border-yellow-500/30">
          <div className="text-3xl font-bold text-yellow-400 mb-2">{deckStats.commander}</div>
          <div className="text-slate-300 font-medium">Commander</div>
        </div>
      </div>
      
      {/* Tabs principais */}
      <div className="mtg-card mb-8">
        <div className="px-6 pt-6 pb-2">
          <div className="mtg-tabs">
            <button
              onClick={() => setActiveTab('search')}
              className={`mtg-tab ${activeTab === 'search' ? 'mtg-tab-active' : ''}`}
            >
              <Search className="w-4 h-4" />
              <span>Buscar Cartas</span>
            </button>
            
            <button
              onClick={() => setActiveTab('collection')}
              className={`mtg-tab ${activeTab === 'collection' ? 'mtg-tab-active' : ''}`}
            >
              <Library className="w-4 h-4" />
              <span>Da Coleção</span>
            </button>
            
            <button
              onClick={() => setActiveTab('deck')}
              className={`mtg-tab ${activeTab === 'deck' ? 'mtg-tab-active' : ''}`}
            >
              <Target className="w-4 h-4" />
              <span>Deck Atual ({deckStats.total})</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Conteúdo das Tabs */}
      {activeTab === 'search' && (
        <div className="mtg-grid-wide gap-8">
          {/* Filtros de Busca */}
          <div className="mtg-card">
            <div className="mtg-card-header">
              <Filter className="mtg-card-icon" />
              <div className="mtg-card-content flex-1">
                <h3 className="mtg-card-title">Filtros de Busca</h3>
                <p className="mtg-card-description">Configure os parâmetros para encontrar as cartas perfeitas</p>
              </div>
              <Button
                onClick={clearSearchFilters}
                variant="outline"
                className="quantum-btn compact"
                title="Limpar filtros"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-6 pb-6 space-y-6">
              <div>
                <label className="mtg-label">Nome da carta</label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchCards()}
                  placeholder="Digite o nome da carta..."
                  className="mtg-input"
                />
              </div>
              
              <div>
                <label className="mtg-label">Raridade</label>
                <Select value={raridade} onValueChange={setRaridade}>
                  <SelectTrigger className="mtg-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="mtg-dropdown">
                    <SelectItem value="all" className="mtg-dropdown-item">Todas</SelectItem>
                    <SelectItem value="common" className="mtg-dropdown-item">Comum</SelectItem>
                    <SelectItem value="uncommon" className="mtg-dropdown-item">Incomum</SelectItem>
                    <SelectItem value="rare" className="mtg-dropdown-item">Rara</SelectItem>
                    <SelectItem value="mythic" className="mtg-dropdown-item">Mítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="mtg-label">Tipo</label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="mtg-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="mtg-dropdown">
                    <SelectItem value="all" className="mtg-dropdown-item">Todos</SelectItem>
                    <SelectItem value="creature" className="mtg-dropdown-item">Criatura</SelectItem>
                    <SelectItem value="instant" className="mtg-dropdown-item">Instantâneo</SelectItem>
                    <SelectItem value="sorcery" className="mtg-dropdown-item">Feitiço</SelectItem>
                    <SelectItem value="artifact" className="mtg-dropdown-item">Artefato</SelectItem>
                    <SelectItem value="enchantment" className="mtg-dropdown-item">Encantamento</SelectItem>
                    <SelectItem value="planeswalker" className="mtg-dropdown-item">Planeswalker</SelectItem>
                    <SelectItem value="land" className="mtg-dropdown-item">Terreno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="mtg-label">CMC (Custo Convertido de Mana)</label>
                <Input
                  value={cmc}
                  onChange={(e) => setCmc(e.target.value)}
                  placeholder="Ex: 3, <=2, >=4"
                  className="mtg-input"
                />
              </div>
              
              <div>
                <label className="mtg-label">Cores</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { color: 'W', name: 'Branco', bg: 'from-yellow-400 to-orange-500' },
                    { color: 'U', name: 'Azul', bg: 'from-blue-500 to-cyan-600' },
                    { color: 'B', name: 'Preto', bg: 'from-gray-700 to-gray-900' },
                    { color: 'R', name: 'Vermelho', bg: 'from-red-500 to-orange-600' },
                    { color: 'G', name: 'Verde', bg: 'from-green-500 to-emerald-600' }
                  ].map(({ color, name, bg }) => (
                    <button
                      key={color}
                      onClick={() => {
                        setManaColors(prev => 
                          prev.includes(color) 
                            ? prev.filter(c => c !== color)
                            : [...prev, color]
                        );
                      }}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold transition-all ${
                        manaColors.includes(color)
                          ? `bg-gradient-to-br ${bg} scale-110 ring-2 ring-white/30`
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      title={name}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button 
                className="quantum-btn w-full primary"
                onClick={searchCards}
                disabled={isSearching}
              >
                <Search className="w-4 h-4" />
                <span>{isSearching ? 'Buscando...' : 'Buscar Cartas'}</span>
                {isSearching && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />}
              </Button>
            </div>
          </div>
          
          {/* Resultados da Busca */}
          <div className="mtg-card flex-1">
            <div className="mtg-card-header">
              <Eye className="mtg-card-icon" />
              <div className="mtg-card-content">
                <h3 className="mtg-card-title">
                  Resultados da Busca {searchResults.length > 0 && `(${searchResults.length})`}
                </h3>
                <p className="mtg-card-description">Clique nas cartas para adicioná-las ao seu deck</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="min-h-[400px]">
                {isSearching && (
                  <div className="text-center py-12 text-slate-400">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 opacity-50 animate-spin" />
                    <p>Pesquisando cartas...</p>
                  </div>
                )}
                
                {!isSearching && searchError && (
                  <div className="text-center py-12 text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-red-400" />
                    <p className="text-red-400">{searchError}</p>
                    <Button 
                      onClick={searchCards}
                      className="quantum-btn compact mt-4"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                )}
                
                {!isSearching && !searchError && searchResults.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Use os filtros ao lado para pesquisar cartas</p>
                  </div>
                )}
                
                {!isSearching && !searchError && searchResults.length > 0 && (
                  <SearchCardList 
                    cards={searchResults}
                    onAddCard={(card, quantity) => handleAddCardToDeck(card, 'mainboard', quantity)}
                    className="mb-6"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'collection' && (
        <div className="space-y-6">
          {/* Header da coleção */}
          <div className="mtg-card">
            <div className="mtg-card-header">
              <Library className="mtg-card-icon" />
              <div className="mtg-card-content">
                <h3 className="mtg-card-title">Sua Coleção Pessoal</h3>
                <p className="mtg-card-description">Selecione cartas da sua coleção para adicionar ao deck</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              {/* Estatísticas da coleção */}
              {currentCollection && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-slate-300">
                      <span className="font-semibold text-white">{currentCollection.cards.length}</span> cartas únicas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-300">
                      <span className="font-semibold text-white">
                        {currentCollection.cards.reduce((sum: number, card: any) => sum + card.quantity, 0)}
                      </span> cartas totais
                    </span>
                  </div>
                </div>
              )}
              
              {/* Filtros da coleção */}
              <div className="mtg-grid-3 gap-4">
                <div>
                  <label className="mtg-label">Buscar na coleção</label>
                  <Input
                    placeholder="Nome da carta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mtg-input"
                  />
                </div>
                <div>
                  <label className="mtg-label">Raridade</label>
                  <Select value={raridade} onValueChange={setRaridade}>
                    <SelectTrigger className="mtg-select">
                      <SelectValue placeholder="Raridade" />
                    </SelectTrigger>
                    <SelectContent className="mtg-dropdown">
                      <SelectItem value="all" className="mtg-dropdown-item">Todas</SelectItem>
                      <SelectItem value="common" className="mtg-dropdown-item">Comum</SelectItem>
                      <SelectItem value="uncommon" className="mtg-dropdown-item">Incomum</SelectItem>
                      <SelectItem value="rare" className="mtg-dropdown-item">Rara</SelectItem>
                      <SelectItem value="mythic" className="mtg-dropdown-item">Mítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mtg-label">Tipo</label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger className="mtg-select">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent className="mtg-dropdown">
                      <SelectItem value="all" className="mtg-dropdown-item">Todos</SelectItem>
                      <SelectItem value="creature" className="mtg-dropdown-item">Criatura</SelectItem>
                      <SelectItem value="instant" className="mtg-dropdown-item">Mágica Instantânea</SelectItem>
                      <SelectItem value="sorcery" className="mtg-dropdown-item">Feitiço</SelectItem>
                      <SelectItem value="artifact" className="mtg-dropdown-item">Artefato</SelectItem>
                      <SelectItem value="enchantment" className="mtg-dropdown-item">Encantamento</SelectItem>
                      <SelectItem value="planeswalker" className="mtg-dropdown-item">Planeswalker</SelectItem>
                      <SelectItem value="land" className="mtg-dropdown-item">Terreno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de cartas da coleção */}
          <CollectionDisplay 
            searchTerm={searchTerm}
            raridade={raridade}
            tipo={tipo}
            onAddCard={handleAddCardToDeck}
            currentDeck={currentDeck}
            currentCollection={currentCollection}
          />
        </div>
      )}
      
      {activeTab === 'deck' && (
        <div className="space-y-6">
          {/* Controles do Deck */}
          <div className="mtg-card">
            <div className="mtg-card-header">
              <Package className="mtg-card-icon" />
              <div className="mtg-card-content flex-1">
                <h3 className="mtg-card-title">Visualização do Deck</h3>
                <p className="mtg-card-description">Gerencie as cartas do seu deck atual</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="mtg-label text-xs">Categoria</label>
                  <Select value={deckViewCategory} onValueChange={(value: any) => setDeckViewCategory(value)}>
                    <SelectTrigger className="w-48 mtg-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="mtg-dropdown">
                      <SelectItem value="all" className="mtg-dropdown-item">Todas as cartas</SelectItem>
                      <SelectItem value="mainboard" className="mtg-dropdown-item">Deck Principal</SelectItem>
                      <SelectItem value="sideboard" className="mtg-dropdown-item">Sideboard</SelectItem>
                      <SelectItem value="commander" className="mtg-dropdown-item">Commander</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`h-8 w-8 p-0 rounded transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                    title="Vista em lista"
                  >
                    <List className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`h-8 w-8 p-0 rounded transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                    title="Vista em grade"
                  >
                    <Grid3X3 className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lista de Cartas do Deck */}
          <div className="mtg-card">
            <div className="px-6 pt-6 pb-6">
              {filteredDeckCards.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-white mb-2">Nenhuma carta nesta categoria</h3>
                  <p className="text-sm">Use as abas "Buscar Cartas" ou "Da Coleção" para adicionar cartas ao deck</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                  : 'space-y-3'
                }>
                  {filteredDeckCards.map(deckCard => {
                    const imageUrl = getCardImage(deckCard.card, 'small');
                    
                    if (viewMode === 'grid') {
                      return (
                        <div key={`${deckCard.card.id}-${deckCard.category}`} className="mtg-card-mini">
                          <div className="relative">
                            <div className="aspect-[63/88] bg-slate-900 rounded-lg overflow-hidden mb-2">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={deckCard.card.name}
                                  fill
                                  className="object-cover cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => openModal(deckCard.card)}
                                  sizes="150px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs text-center p-2">
                                  {deckCard.card.name}
                                </div>
                              )}
                            </div>
                            
                            <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                              {deckCard.quantity}
                            </div>
                            
                            <div className="text-xs">
                              <p className="text-white font-medium truncate mb-1" title={deckCard.card.name}>
                                {deckCard.card.name}
                              </p>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                deckCard.category === 'mainboard' ? 'bg-green-500/20 text-green-400' :
                                deckCard.category === 'sideboard' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {deckCard.category === 'mainboard' ? 'Main' :
                                 deckCard.category === 'sideboard' ? 'Side' : 'Cmd'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={`${deckCard.card.id}-${deckCard.category}`} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors group border border-slate-700/30">
                        <div className="w-12 h-16 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={deckCard.card.name}
                              width={48}
                              height={64}
                              className="object-cover cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => openModal(deckCard.card)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs text-slate-500 text-center">{deckCard.card.set_code}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{deckCard.card.name}</h4>
                          <p className="text-slate-400 text-sm truncate">{deckCard.card.type_line}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              deckCard.category === 'mainboard' ? 'bg-green-500/20 text-green-400' :
                              deckCard.category === 'sideboard' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {deckCard.category}
                            </span>
                            <span className="text-slate-500 text-xs">{deckCard.card.set_name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-slate-700 rounded-lg">
                            <button
                              onClick={() => handleUpdateQuantity(deckCard.card.id, deckCard.category, deckCard.quantity - 1)}
                              className="h-8 w-8 p-0 hover:bg-red-600 text-red-400 hover:text-white rounded-l-lg transition-colors flex items-center justify-center"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            
                            <span className="text-white text-sm w-8 text-center bg-slate-800 py-1">{deckCard.quantity}</span>
                            
                            <button
                              onClick={() => handleUpdateQuantity(deckCard.card.id, deckCard.category, deckCard.quantity + 1)}
                              className="h-8 w-8 p-0 hover:bg-green-600 text-green-400 hover:text-white rounded-r-lg transition-colors flex items-center justify-center"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveCardFromDeck(deckCard.card.id, deckCard.category)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors flex items-center justify-center"
                            title="Remover carta"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckBuilder;
