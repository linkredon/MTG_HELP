"use client"

import React, { useState, useMemo } from 'react';
import '../styles/moxfield.css';
import '../styles/deck-viewer-compact.css';
import '../styles/deck-builder-enhanced.css';
import '../styles/deck-viewer-enhanced.css';
import EnhancedCardDisplay from './EnhancedCardDisplay';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { translatePtToEn, cardMatchesSearchTerm } from '@/utils/translationService';
import { getImageUrl } from '@/utils/imageService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCardModal } from '@/contexts/CardModalContext';
import { 
  ArrowLeft, Edit3, Save, X, Plus, Minus, Eye, Copy, 
  Download, Settings, Trash2, Package, Target,
  Grid3X3, List, Search, Filter,
  PieChart, BarChart3, FileText
} from 'lucide-react';
import Image from 'next/image';
import type { MTGCard } from '@/types/mtg';

interface DeckViewerProps {
  deckId: string;
  onClose: () => void;
  onEdit?: () => void;
}

const DeckViewer: React.FC<DeckViewerProps> = ({ deckId, onClose, onEdit }) => {
  const { decks, editarDeck, deletarDeck, duplicarDeck, atualizarQuantidadeNoDeck, removerCartaDoDeck, adicionarCartaAoDeck } = useAppContext();
  const { openModal } = useCardModal();
  
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'spoiler'>('grid');
  const [filterCategory, setFilterCategory] = useState<'all' | 'mainboard' | 'sideboard' | 'commander'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const deck = decks.find(d => d.id === deckId);
  
  // Debug: Verificar se o deck tem backgroundImage
  console.log('🎨 [DeckViewer] Background Image Debug:', {
    deckId,
    deckName: deck?.name,
    backgroundImage: deck?.backgroundImage,
    hasBackgroundImage: !!deck?.backgroundImage,
    allDecks: decks.map(d => ({ id: d.id, name: d.name, backgroundImage: d.backgroundImage }))
  });
  
  // Debug: Verificar o estilo aplicado
  const backgroundStyle = {
    backgroundImage: deck?.backgroundImage ? `url(${deck.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: deck?.backgroundImage ? 'transparent' : undefined
  };
  
  console.log('🎨 [DeckViewer] Background Style:', backgroundStyle);
  
  // Debug: Verificar se o deck foi encontrado e suas cartas
  console.log('🔍 [DeckViewer] Debug:', {
    deckId,
    deckFound: !!deck,
    deckName: deck?.name,
    cardsCount: deck?.cards?.length || 0,
    cards: deck?.cards?.slice(0, 3) || [], // Primeiras 3 cartas para debug
  });
  
  const [editedDeck, setEditedDeck] = useState({
    name: deck?.name || '',
    format: deck?.format || 'Standard',
    description: deck?.description || '',
    colors: deck?.colors || [],
    tags: deck?.tags || []
  });

  if (!deck) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Deck não encontrado</p>
      </div>
    );
  }

  // Filtrar cartas
  const filteredCards = useMemo(() => {
    let filtered = deck.cards || [];
    
    // Debug: Verificar estrutura das cartas
    console.log('🔍 [DeckViewer] Estrutura das cartas:', {
      totalCards: filtered.length,
      sampleCard: filtered[0],
      cardsWithCardData: filtered.filter(c => c.card || c.cardData).length,
      cardsWithoutData: filtered.filter(c => !c.card && !c.cardData).length,
      filteredCardsCount: 0 // Será atualizado após o filtro
    });
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(card => card.category === filterCategory);
    }
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(card => {
        const cardData = card.card || card.cardData;
        return cardData && cardMatchesSearchTerm(cardData, searchTerm);
      });
    }
    
    // Atualizar o log com o número final de cartas filtradas
    console.log('🔍 [DeckViewer] Cartas filtradas:', filtered.length);
    
    return filtered;
  }, [deck.cards, filterCategory, searchTerm]);

  // Estatísticas do deck
  const stats = useMemo(() => {
    const mainboard = (deck.cards || []).filter(c => c.category === 'mainboard');
    const sideboard = (deck.cards || []).filter(c => c.category === 'sideboard');
    const commander = (deck.cards || []).filter(c => c.category === 'commander');
    
    const mainboardCount = mainboard.reduce((sum, c) => sum + (c.quantity || 0), 0);
    const sideboardCount = sideboard.reduce((sum, c) => sum + (c.quantity || 0), 0);
    const commanderCount = commander.reduce((sum, c) => sum + (c.quantity || 0), 0);
    
    const manaCurve: Record<number, number> = {};
    mainboard.forEach(card => {
      const cardData = card.card || card.cardData;
      const cmc = cardData?.cmc || 0;
      const cmcKey = cmc >= 7 ? 7 : cmc;
      manaCurve[cmcKey] = (manaCurve[cmcKey] || 0) + (card.quantity || 0);
    });
    
    return {
      mainboard: mainboardCount,
      sideboard: sideboardCount,
      commander: commanderCount,
      total: mainboardCount + sideboardCount + commanderCount,
      unique: (deck.cards || []).length,
      manaCurve
    };
  }, [deck.cards]);

  const handleSave = () => {
    editarDeck(deckId, {
      name: editedDeck.name,
      format: editedDeck.format,
      description: editedDeck.description,
      colors: editedDeck.colors,
      tags: editedDeck.tags
    });
    setEditMode(false);
  };

  const handleDelete = () => {
    deletarDeck(deckId);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDuplicate = () => {
    duplicarDeck(deckId, `${deck.name} (Cópia)`);
  };

  const handleUpdateQuantity = (cardId: string, category: 'mainboard' | 'sideboard' | 'commander', newQuantity: number) => {
    atualizarQuantidadeNoDeck(deckId, cardId, newQuantity, category);
  };

  const handleRemoveCard = (cardId: string, category: 'mainboard' | 'sideboard' | 'commander') => {
    removerCartaDoDeck(deckId, cardId, category);
  };
  
  // Função para mover cartas entre seções do deck
  const handleMoveCard = (cardId: string, fromCategory: 'mainboard' | 'sideboard' | 'commander', toCategory: 'mainboard' | 'sideboard' | 'commander') => {
    // Encontrar a carta no deck
    const card = deck.cards.find(c => c.card?.id === cardId && c.category === fromCategory);
    if (!card) return;
    
    // Verificar se a carta já existe na categoria de destino
    const existingCard = deck.cards.find(c => c.card?.id === cardId && c.category === toCategory);
    
    if (existingCard) {
      // Se já existe, aumentar a quantidade e remover da categoria original
      atualizarQuantidadeNoDeck(deckId, cardId, existingCard.quantity + card.quantity, toCategory);
      removerCartaDoDeck(deckId, cardId, fromCategory);
    } else {
      // Se não existe, adicionar à nova categoria e remover da original
      adicionarCartaAoDeck(deckId, card.card, toCategory, card.quantity);
      removerCartaDoDeck(deckId, cardId, fromCategory);
    }
  };

  const exportDeckList = () => {
    const mainboard = deck.cards.filter(c => c.category === 'mainboard');
    const sideboard = deck.cards.filter(c => c.category === 'sideboard');
    const commander = deck.cards.filter(c => c.category === 'commander');
    
    let exportText = `// ${deck.name}\n// Formato: ${deck.format}\n\n`;
    
    if (commander.length > 0) {
      exportText += "Commander:\n";
      commander.forEach(deckCard => {
        exportText += `${deckCard.quantity} ${deckCard.card?.name || 'Unknown Card'}\n`;
      });
      exportText += "\n";
    }
    
    if (mainboard.length > 0) {
      exportText += "Main Deck:\n";
      mainboard.forEach(deckCard => {
        exportText += `${deckCard.quantity} ${deckCard.card?.name || 'Unknown Card'}\n`;
      });
      exportText += "\n";
    }
    
    if (sideboard.length > 0) {
      exportText += "Sideboard:\n";
      sideboard.forEach(deckCard => {
        exportText += `${deckCard.quantity} ${deckCard.card?.name || 'Unknown Card'}\n`;
      });
    }
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="min-h-[calc(100vh-80px)] p-0 m-0 relative overflow-hidden"
      style={backgroundStyle}
    >
      {/* Background blur overlay */}
      {deck.backgroundImage && (
        <>
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            style={{ zIndex: 1 }}
          />
          {/* Debug: Elemento para verificar se a imagem carregou */}
          <div 
            className="absolute inset-0 opacity-0"
            style={{ 
              zIndex: 0,
              backgroundImage: `url(${deck.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        </>
      )}
      
      {/* Content container */}
      <div className="relative z-10 min-h-full bg-black/20 backdrop-blur-sm rounded-lg m-2">
      {/* Header compacto */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-cyan-500/30 shadow-lg">
        <div className="flex items-center justify-between gap-2 p-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="quantum-btn compact"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar
            </button>
            
            <h2 className="text-md font-bold text-cyan-400 truncate ml-2">{deck.name}</h2>
            <span className="quantum-badge primary text-xs">{deck.format}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button className="quantum-btn compact" onClick={handleDuplicate}>
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button className="quantum-btn compact" onClick={() => setEditMode(true)}>
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button className="quantum-btn compact" onClick={exportDeckList}>
              <Download className="w-3.5 h-3.5" />
            </button>
            <button className="quantum-btn compact" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        </div>
        
        {/* Filtros compactos */}
        <div className="flex flex-wrap items-center gap-1 mx-2 mb-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2 top-1.5 w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar cartas..." 
              className="quantum-input pl-8 h-7 py-0 text-sm"
            />
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => setFilterCategory('all')}
              className={`quantum-btn compact ${filterCategory === 'all' ? 'primary' : ''}`}
            >
              Todas
            </button>
            <button 
              onClick={() => setFilterCategory('mainboard')}
              className={`quantum-btn compact ${filterCategory === 'mainboard' ? 'primary' : ''}`}
            >
              Main ({stats.mainboard})
            </button>
            {stats.sideboard > 0 && (
              <button 
                onClick={() => setFilterCategory('sideboard')}
                className={`quantum-btn compact ${filterCategory === 'sideboard' ? 'primary' : ''}`}
              >
                Side ({stats.sideboard})
              </button>
            )}
            {stats.commander > 0 && (
              <button 
                onClick={() => setFilterCategory('commander')}
                className={`quantum-btn compact ${filterCategory === 'commander' ? 'primary' : ''}`}
              >
                Cmd ({stats.commander})
              </button>
            )}
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`quantum-btn compact ${viewMode === 'grid' ? 'secondary' : ''}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setViewMode('spoiler')}
              className={`quantum-btn compact ${viewMode === 'spoiler' ? 'secondary' : ''}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={editMode} onOpenChange={setEditMode}>
        <DialogContent className="quantum-card">
          <DialogHeader>
            <h2 className="quantum-card-title">Editar Deck</h2>
          </DialogHeader>
          <div className="space-y-3">
            <div className="quantum-form-group">
              <label className="quantum-label" htmlFor="name">Nome do Deck</label>
              <input 
                id="name"
                type="text" 
                className="quantum-input"
                value={editedDeck.name}
                onChange={(e) => setEditedDeck({...editedDeck, name: e.target.value})}
              />
            </div>
            
            <div className="quantum-form-group">
              <label className="quantum-label" htmlFor="format">Formato</label>
              <Select 
                value={editedDeck.format}
                onValueChange={(value) => setEditedDeck({...editedDeck, format: value})}
              >
                <SelectTrigger className="quantum-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Modern">Modern</SelectItem>
                  <SelectItem value="Commander">Commander</SelectItem>
                  <SelectItem value="Pioneer">Pioneer</SelectItem>
                  <SelectItem value="Legacy">Legacy</SelectItem>
                  <SelectItem value="Vintage">Vintage</SelectItem>
                  <SelectItem value="Pauper">Pauper</SelectItem>
                  <SelectItem value="Limited">Limited</SelectItem>
                  <SelectItem value="Historic">Historic</SelectItem>
                  <SelectItem value="Brawl">Brawl</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="quantum-form-group">
              <label className="quantum-label" htmlFor="description">Descrição</label>
              <Textarea 
                id="description"
                className="quantum-textarea"
                value={editedDeck.description}
                onChange={(e) => setEditedDeck({...editedDeck, description: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button className="quantum-btn" onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
              <Button className="quantum-btn primary" onClick={handleSave}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Layout reorganizado - 2 colunas */}
      <div className="grid grid-cols-12 gap-4 p-2">
        {/* Coluna principal - Visualização */}
        <div className="col-span-12 sm:col-span-8" style={{ maxHeight: 'calc(100vh - 140px)', overflow: 'auto' }}>
          <div className="quantum-card-dense mb-4">
            <div className="flex justify-between items-center border-b border-cyan-500/20 p-2">
              <div>
                <span className="text-sm font-semibold text-cyan-400">Visualização do Deck</span>
                <div className="text-xs text-gray-400 mt-1">
                  <span className="text-cyan-400">{stats.unique}</span> cartas únicas • <span className="text-cyan-400">{stats.total}</span> total
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-md">Main: {stats.mainboard}</div>
                {stats.sideboard > 0 && (
                  <div className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded-md">Side: {stats.sideboard}</div>
                )}
                {stats.commander > 0 && (
                  <div className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-md">Cmd: {stats.commander}</div>
                )}
              </div>
            </div>
            
            <EnhancedCardDisplay 
              cards={filteredCards} 
              viewMode={viewMode}
              onCardClick={openModal}
              onMoveCard={handleMoveCard}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveCard={handleRemoveCard}
            />
          </div>
        </div>

        {/* Coluna direita - Estatísticas */}
        <div className="col-span-12 sm:col-span-4 space-y-4" style={{ maxHeight: 'calc(100vh - 140px)', overflow: 'auto' }}>
          <ManaCurveDisplay manaCurve={stats.manaCurve} />
          <TypeDistributionDisplay cards={deck.cards.filter(c => c.category === 'mainboard')} />

          {deck.description && (
            <div className="quantum-card-dense">
              <div className="flex justify-between items-center border-b border-cyan-500/20 p-1">
                <span className="text-xs font-semibold text-cyan-400">Descrição</span>
              </div>
              <div className="p-2 text-xs text-gray-300">{deck.description}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Confirmação de Deleção */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="quantum-card">
          <DialogHeader>
            <h2 className="quantum-card-title text-red-400">Excluir Deck</h2>
          </DialogHeader>
          <div>
            <p className="text-sm text-gray-300 mb-4">
              Tem certeza que deseja excluir o deck <strong>{deck.name}</strong>? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <Button className="quantum-btn" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button className="quantum-btn primary" style={{background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444'}} onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
                Excluir Permanentemente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

// O componente DeckCardsList foi removido pois não é mais necessário

// O componente VisualCardDisplay foi substituído pelo EnhancedCardDisplay

// Componente para curva de mana
const ManaCurveDisplay: React.FC<{ manaCurve: Record<number, number> }> = ({ manaCurve }) => {
  const maxCount = Math.max(...Object.values(manaCurve), 1);
  const totalCards = Object.values(manaCurve).reduce((sum, count) => sum + count, 0);
  
  return (
    <Card className="bg-gray-800/40 border border-gray-700 shadow-md">
      <CardHeader className="p-3 border-b border-gray-700 bg-gray-800/70">
        <CardTitle className="text-gray-200 text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Curva de Mana
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex items-end justify-between gap-1 h-20">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(cmc => {
            const count = manaCurve[cmc] || 0;
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={cmc} className="flex flex-col items-center flex-1">
                <div className="text-xs text-gray-400 mb-1 h-3">
                  {count > 0 && count}
                </div>
                <div className="w-full bg-gray-700/50 rounded-t relative" style={{ height: '50px' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-blue-600/70 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {cmc === 7 ? '7+' : cmc}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-2 text-center">
          <div className="text-xs text-gray-400">
            Média: {totalCards > 0 ? (
              Object.entries(manaCurve).reduce((sum, [cmc, count]) => sum + (Number(cmc) * count), 0) / totalCards
            ).toFixed(1) : '0.0'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para distribuição de tipos
const TypeDistributionDisplay: React.FC<{ cards: any[] }> = ({ cards }) => {
  const typeDistribution = useMemo(() => {
    const types: Record<string, number> = {};
    
    cards.forEach((deckCard) => {
      const typeLine = deckCard.card?.type_line?.toLowerCase() || '';
      let mainType = 'Other';
      
      if (typeLine.includes('creature')) mainType = 'Creature';
      else if (typeLine.includes('instant')) mainType = 'Instant';
      else if (typeLine.includes('sorcery')) mainType = 'Sorcery';
      else if (typeLine.includes('artifact')) mainType = 'Artifact';
      else if (typeLine.includes('enchantment')) mainType = 'Enchantment';
      else if (typeLine.includes('planeswalker')) mainType = 'Planeswalker';
      else if (typeLine.includes('land')) mainType = 'Land';
      
      types[mainType] = (types[mainType] || 0) + deckCard.quantity;
    });
    
    return Object.entries(types).sort(([,a], [,b]) => b - a);
  }, [cards]);

  const total = typeDistribution.reduce((sum, [, count]) => sum + count, 0);
  
  const typeColors: Record<string, string> = {
    'Creature': 'bg-green-600/70',
    'Instant': 'bg-blue-600/70',
    'Sorcery': 'bg-red-600/70',
    'Artifact': 'bg-slate-400/70',
    'Enchantment': 'bg-yellow-600/70',
    'Planeswalker': 'bg-purple-600/70',
    'Land': 'bg-emerald-700/70',
    'Other': 'bg-gray-500/70'
  };

  if (typeDistribution.length === 0) return null;

  return (
    <Card className="bg-gray-800/40 border border-gray-700 shadow-md">
      <CardHeader className="p-3 border-b border-gray-700 bg-gray-800/70">
        <CardTitle className="text-gray-200 text-base flex items-center gap-2">
          <PieChart className="w-4 h-4" />
          Tipos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {typeDistribution.map(([type, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={type} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${typeColors[type]}`}></div>
                <span className="text-gray-300">{type}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-700/70 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${typeColors[type]} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-400 text-xs w-6 text-right">{count}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default DeckViewer;
