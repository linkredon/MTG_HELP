"use client"

import React, { useState, useMemo } from 'react';
import '../styles/moxfield.css';
import '../styles/deck-viewer-compact.css';
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
  const { decks, editarDeck, deletarDeck, duplicarDeck, atualizarQuantidadeNoDeck, removerCartaDoDeck } = useAppContext();
  const { openModal } = useCardModal();
  
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'spoiler'>('grid');
  const [filterCategory, setFilterCategory] = useState<'all' | 'mainboard' | 'sideboard' | 'commander'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const deck = decks.find(d => d.id === deckId);
  
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
    let filtered = deck.cards;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(card => card.category === filterCategory);
    }
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(card => cardMatchesSearchTerm(card.card, searchTerm));
    }
    
    return filtered;
  }, [deck.cards, filterCategory, searchTerm]);

  // Estatísticas do deck
  const stats = useMemo(() => {
    const mainboard = deck.cards.filter(c => c.category === 'mainboard');
    const sideboard = deck.cards.filter(c => c.category === 'sideboard');
    const commander = deck.cards.filter(c => c.category === 'commander');
    
    const mainboardCount = mainboard.reduce((sum, c) => sum + c.quantity, 0);
    const sideboardCount = sideboard.reduce((sum, c) => sum + c.quantity, 0);
    const commanderCount = commander.reduce((sum, c) => sum + c.quantity, 0);
    
    const manaCurve: Record<number, number> = {};
    mainboard.forEach(card => {
      const cmc = card.card.cmc || 0;
      const cmcKey = cmc >= 7 ? 7 : cmc;
      manaCurve[cmcKey] = (manaCurve[cmcKey] || 0) + card.quantity;
    });
    
    return {
      mainboard: mainboardCount,
      sideboard: sideboardCount,
      commander: commanderCount,
      total: mainboardCount + sideboardCount + commanderCount,
      unique: deck.cards.length,
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

  const exportDeckList = () => {
    const mainboard = deck.cards.filter(c => c.category === 'mainboard');
    const sideboard = deck.cards.filter(c => c.category === 'sideboard');
    const commander = deck.cards.filter(c => c.category === 'commander');
    
    let exportText = `// ${deck.name}\n// Formato: ${deck.format}\n\n`;
    
    if (commander.length > 0) {
      exportText += "Commander:\n";
      commander.forEach(deckCard => {
        exportText += `${deckCard.quantity} ${deckCard.card.name}\n`;
      });
      exportText += "\n";
    }
    
    if (mainboard.length > 0) {
      exportText += "Main Deck:\n";
      mainboard.forEach(deckCard => {
        exportText += `${deckCard.quantity} ${deckCard.card.name}\n`;
      });
      exportText += "\n";
    }
    
    if (sideboard.length > 0) {
      exportText += "Sideboard:\n";
      sideboard.forEach(deckCard => {
        exportText += `${deckCard.quantity} ${deckCard.card.name}\n`;
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
    <div className="quantum-card min-h-[calc(100vh-80px)] p-0 m-0">
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

      {/* Layout compacto - 3 colunas */}
      <div className="grid grid-cols-12 gap-2 p-2">
        {/* Coluna esquerda - Lista de cartas */}
        <div className="col-span-12 sm:col-span-3 space-y-2" style={{ maxHeight: 'calc(100vh - 140px)', overflow: 'auto' }}>
          <div className="quantum-card-dense">
            <div className="text-xs text-center p-1 border-b border-cyan-500/20 mb-2">
              <span className="text-cyan-400">{stats.unique}</span> cartas únicas • <span className="text-cyan-400">{stats.total}</span> total
            </div>
            
            <DeckCardsList 
              cards={filteredCards} 
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveCard={handleRemoveCard}
              onCardClick={openModal}
            />
          </div>
        </div>

        {/* Coluna central - Visualização */}
        <div className="col-span-12 sm:col-span-6" style={{ maxHeight: 'calc(100vh - 140px)', overflow: 'auto' }}>
          <div className="quantum-card-dense">
            <VisualCardDisplay 
              cards={filteredCards} 
              viewMode={viewMode}
              onCardClick={openModal}
            />
          </div>
        </div>

        {/* Coluna direita - Estatísticas */}
        <div className="col-span-12 sm:col-span-3 space-y-2" style={{ maxHeight: 'calc(100vh - 140px)', overflow: 'auto' }}>
          <div className="quantum-card-dense">
            <div className="flex justify-between items-center border-b border-cyan-500/20 p-1">
              <span className="text-xs font-semibold text-cyan-400">Distribuição</span>
            </div>
            <div className="p-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Main Deck</span>
                <span className="text-white font-mono">{stats.mainboard}</span>
              </div>
              {stats.commander > 0 && (
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">Commander</span>
                  <span className="text-white font-mono">{stats.commander}</span>
                </div>
              )}
              {stats.sideboard > 0 && (
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">Sideboard</span>
                  <span className="text-white font-mono">{stats.sideboard}</span>
                </div>
              )}
              <div className="h-px bg-gradient-to-r from-cyan-500/20 via-cyan-400/40 to-cyan-500/20 my-1"></div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Total</span>
                <span className="text-cyan-400 font-mono font-bold">{stats.total}</span>
              </div>
            </div>
          </div>

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
  );
};

// Componente para lista de cartas
const DeckCardsList: React.FC<{
  cards: any[];
  onUpdateQuantity: (cardId: string, category: any, newQuantity: number) => void;
  onRemoveCard: (cardId: string, category: any) => void;
  onCardClick: (card: MTGCard) => void;
}> = ({ cards, onUpdateQuantity, onRemoveCard, onCardClick }) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-8 h-8 mx-auto mb-2 text-gray-500" />
        <p className="text-gray-400 text-sm">Nenhuma carta encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {cards.map((deckCard) => (
        <div 
          key={`${deckCard.card.id}-${deckCard.category}`}
          className="flex items-center p-2 bg-gray-800/40 rounded border border-gray-700 hover:bg-gray-700/40 transition-colors group"
        >
          <div className="w-8 h-11 bg-gray-900 rounded overflow-hidden flex-shrink-0 mr-3">
            {getImageUrl(deckCard.card, 'small') ? (
              <Image
                src={getImageUrl(deckCard.card, 'small')}
                alt={deckCard.card.name}
                width={32}
                height={44}
                className="object-cover cursor-pointer"
                onClick={() => onCardClick(deckCard.card)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                {deckCard.card.set_code}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div 
              className="text-sm text-gray-200 font-medium truncate cursor-pointer hover:text-blue-400" 
              onClick={() => onCardClick(deckCard.card)}
            >
              {deckCard.card.name}
            </div>
            <div className="text-xs text-gray-400">{deckCard.card.type_line}</div>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-300 w-6 text-center">{deckCard.quantity}</span>
            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUpdateQuantity(deckCard.card.id, deckCard.category, deckCard.quantity - 1)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUpdateQuantity(deckCard.card.id, deckCard.category, deckCard.quantity + 1)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveCard(deckCard.card.id, deckCard.category)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para visualização das cartas
const VisualCardDisplay: React.FC<{
  cards: any[];
  viewMode: 'grid' | 'spoiler';
  onCardClick: (card: MTGCard) => void;
}> = ({ cards, viewMode, onCardClick }) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-70" />
        <p className="text-gray-400 text-sm">Nenhuma carta para exibir</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {cards.map((deckCard) => (
          <div key={`${deckCard.card.id}-${deckCard.category}`} className="relative group">
            <div className="aspect-[63/88] bg-gray-800/80 rounded-md overflow-hidden shadow-md">
              {getImageUrl(deckCard.card) ? (
                <Image
                  src={getImageUrl(deckCard.card)}
                  alt={deckCard.card.name}
                  fill
                  className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => onCardClick(deckCard.card)}
                  sizes="120px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                  {deckCard.card.name}
                </div>
              )}
              
              <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                {deckCard.quantity}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium truncate">{deckCard.card.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((deckCard) => (
        <div 
          key={`${deckCard.card.id}-${deckCard.category}`} 
          className="flex gap-3 p-3 bg-gray-800/40 rounded border border-gray-700 hover:bg-gray-700/40 transition-colors"
        >
          <div className="w-16 h-22 bg-gray-800 rounded overflow-hidden flex-shrink-0">
            {getImageUrl(deckCard.card, 'normal') ? (
              <Image
                src={getImageUrl(deckCard.card, 'normal')}
                alt={deckCard.card.name}
                width={64}
                height={88}
                className="object-cover cursor-pointer"
                onClick={() => onCardClick(deckCard.card)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
                {deckCard.card.name}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-gray-100 font-bold cursor-pointer hover:text-blue-400" onClick={() => onCardClick(deckCard.card)}>
                {deckCard.card.name}
              </h3>
              <Badge className="bg-blue-600/30 text-blue-200 border-0 text-xs">
                {deckCard.quantity}x
              </Badge>
            </div>
            
            <p className="text-gray-300 text-sm">{deckCard.card.type_line}</p>
            <p className="text-gray-400 text-xs">{deckCard.card.set_name}</p>
            
            {deckCard.card.oracle_text && (
              <div className="mt-2 p-2 bg-gray-800/70 rounded text-gray-300 text-xs">
                {deckCard.card.oracle_text.substring(0, 200)}
                {deckCard.card.oracle_text.length > 200 && '...'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

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
      const typeLine = deckCard.card.type_line?.toLowerCase() || '';
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
