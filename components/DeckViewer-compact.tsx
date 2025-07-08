"use client"

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/contexts/AppContext';
import { useCardModal } from '@/contexts/CardModalContext';
import { 
  Package, 
  BarChart3, 
  PieChart,
  X,
  Edit,
  Copy,
  Download,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  ArrowLeft
} from 'lucide-react';

// Helpers para imagens
const getImageUrl = (card: any, size: 'small' | 'normal' = 'normal') => {
  if (card.image_uris && card.image_uris[size]) {
    return card.image_uris[size];
  }
  if (card.card_faces && card.card_faces[0].image_uris && card.card_faces[0].image_uris[size]) {
    return card.card_faces[0].image_uris[size];
  }
  return null;
};

// Helper para busca
const cardMatchesSearchTerm = (card: any, searchTerm: string) => {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return true;
  
  return card.name.toLowerCase().includes(term) || 
         (card.type_line && card.type_line.toLowerCase().includes(term)) ||
         (card.oracle_text && card.oracle_text.toLowerCase().includes(term));
};

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
              <Edit className="w-3.5 h-3.5" />
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
              <Grid className="w-3.5 h-3.5" />
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
              <select 
                id="format"
                className="quantum-select"
                value={editedDeck.format}
                onChange={(e) => setEditedDeck({...editedDeck, format: e.target.value})}
              >
                <option value="Standard">Standard</option>
                <option value="Modern">Modern</option>
                <option value="Commander">Commander</option>
                <option value="Pioneer">Pioneer</option>
                <option value="Legacy">Legacy</option>
                <option value="Vintage">Vintage</option>
                <option value="Pauper">Pauper</option>
                <option value="Limited">Limited</option>
                <option value="Historic">Historic</option>
                <option value="Brawl">Brawl</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            
            <div className="quantum-form-group">
              <label className="quantum-label" htmlFor="description">Descrição</label>
              <textarea 
                id="description"
                className="quantum-textarea"
                value={editedDeck.description}
                onChange={(e) => setEditedDeck({...editedDeck, description: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <button className="quantum-btn" onClick={() => setEditMode(false)}>
                Cancelar
              </button>
              <button className="quantum-btn primary" onClick={handleSave}>
                Salvar Alterações
              </button>
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
              <button className="quantum-btn" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </button>
              <button className="quantum-btn primary" style={{background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444'}} onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente para lista de cartas - versão compacta
const DeckCardsList: React.FC<{
  cards: any[];
  onUpdateQuantity: (cardId: string, category: any, newQuantity: number) => void;
  onRemoveCard: (cardId: string, category: any) => void;
  onCardClick: (card: any) => void;
}> = ({ cards, onUpdateQuantity, onRemoveCard, onCardClick }) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-4">
        <Package className="w-6 h-6 mx-auto mb-1 text-gray-500" />
        <p className="text-gray-400 text-xs">Nenhuma carta encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {cards.map((deckCard) => (
        <div 
          key={`${deckCard.card.id}-${deckCard.category}`}
          className="flex items-center p-1 rounded bg-black/40 border border-gray-800 hover:border-cyan-800 transition-colors group"
        >
          <div className="w-6 h-8 bg-gray-900 rounded overflow-hidden flex-shrink-0 mr-1.5">
            {getImageUrl(deckCard.card, 'small') ? (
              <Image
                src={getImageUrl(deckCard.card, 'small')}
                alt={deckCard.card.name}
                width={24}
                height={32}
                className="object-cover cursor-pointer"
                onClick={() => onCardClick(deckCard.card)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <span className="text-xs text-gray-400">?</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div 
              className="text-xs text-gray-200 font-medium truncate cursor-pointer hover:text-cyan-400" 
              onClick={() => onCardClick(deckCard.card)}
            >
              {deckCard.card.name}
            </div>
            <div className="text-[10px] text-gray-400">{deckCard.card.type_line?.split(' — ')[0]}</div>
          </div>
          
          <div className="flex items-center gap-0.5">
            <span className="text-xs text-gray-300 w-4 text-center">{deckCard.quantity}</span>
            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onUpdateQuantity(deckCard.card.id, deckCard.category, deckCard.quantity + 1)}
                className="p-0.5 text-xs text-gray-400 hover:text-cyan-400 transition"
              >
                +
              </button>
              <button 
                onClick={() => onUpdateQuantity(deckCard.card.id, deckCard.category, Math.max(0, deckCard.quantity - 1))}
                className="p-0.5 text-xs text-gray-400 hover:text-red-400 transition"
              >
                -
              </button>
              <button 
                onClick={() => onRemoveCard(deckCard.card.id, deckCard.category)}
                className="p-0.5 text-xs text-gray-400 hover:text-red-400 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para visualização das cartas - versão compacta
const VisualCardDisplay: React.FC<{
  cards: any[];
  viewMode: 'grid' | 'spoiler';
  onCardClick: (card: any) => void;
}> = ({ cards, viewMode, onCardClick }) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-6">
        <Package className="w-8 h-8 mx-auto mb-2 text-gray-500 opacity-70" />
        <p className="text-gray-400 text-xs">Nenhuma carta para exibir</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
        {cards.map((deckCard) => (
          <div key={`${deckCard.card.id}-${deckCard.category}`} className="relative group">
            <div className="aspect-[63/88] bg-gray-800/80 rounded overflow-hidden shadow-md">
              {getImageUrl(deckCard.card, 'normal') ? (
                <Image
                  src={getImageUrl(deckCard.card, 'normal')}
                  alt={deckCard.card.name}
                  layout="fill"
                  objectFit="cover"
                  className="cursor-pointer"
                  onClick={() => onCardClick(deckCard.card)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 p-2">
                  <span className="text-xs text-gray-400 text-center">{deckCard.card.name}</span>
                  <span className="text-[10px] text-gray-500 mt-1">{deckCard.card.type_line}</span>
                </div>
              )}
              <div className="absolute top-0.5 left-0.5 bg-black/70 text-[10px] font-mono rounded px-1 text-cyan-400">
                {deckCard.quantity}x
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {cards.map((deckCard) => (
        <div 
          key={`${deckCard.card.id}-${deckCard.category}`} 
          className="flex gap-2 p-1.5 bg-black/40 rounded border border-gray-800 hover:border-cyan-800 transition-colors"
        >
          <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
            {getImageUrl(deckCard.card, 'normal') ? (
              <Image
                src={getImageUrl(deckCard.card, 'normal')}
                alt={deckCard.card.name}
                width={48}
                height={64}
                className="object-cover cursor-pointer"
                onClick={() => onCardClick(deckCard.card)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <span className="text-xs text-gray-400">Sem imagem</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400">{deckCard.quantity}x</span>
              <h4 
                className="text-sm text-white font-medium truncate cursor-pointer hover:text-cyan-400"
                onClick={() => onCardClick(deckCard.card)}
              >
                {deckCard.card.name}
              </h4>
            </div>
            
            <p className="text-xs text-gray-300">{deckCard.card.type_line}</p>
            <p className="text-[10px] text-gray-400">{deckCard.card.set_name} ({deckCard.card.set_code?.toUpperCase()})</p>
            
            {deckCard.card.oracle_text && (
              <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{deckCard.card.oracle_text}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para curva de mana - versão compacta
const ManaCurveDisplay: React.FC<{ manaCurve: Record<number, number> }> = ({ manaCurve }) => {
  const maxCount = Math.max(...Object.values(manaCurve), 1);
  const totalCards = Object.values(manaCurve).reduce((sum, count) => sum + count, 0);
  const averageCmc = totalCards > 0 
    ? Object.entries(manaCurve).reduce((sum, [cmc, count]) => sum + (parseInt(cmc) * count), 0) / totalCards 
    : 0;
  
  return (
    <div className="quantum-card-dense">
      <div className="flex justify-between items-center border-b border-cyan-500/20 p-1">
        <span className="text-xs font-semibold text-cyan-400">Curva de Mana</span>
      </div>
      <div className="p-2">
        <div className="flex items-end justify-between gap-0.5 h-16">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(cmc => (
            <div key={cmc} className="flex-1 flex flex-col items-center">
              <div className="flex-1 w-full flex items-end">
                <div 
                  className="w-full bg-cyan-500/30 hover:bg-cyan-500/50 transition-colors"
                  style={{ 
                    height: `${manaCurve[cmc] ? (manaCurve[cmc] / maxCount) * 100 : 0}%`,
                    minHeight: manaCurve[cmc] ? '1px' : '0'
                  }}
                >
                  {manaCurve[cmc] > 0 && (
                    <div className="text-[8px] text-center text-cyan-400 font-mono">
                      {manaCurve[cmc]}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[8px] mt-1 text-gray-400">{cmc === 7 ? '7+' : cmc}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-1 text-center">
          <div className="text-[10px] text-gray-400">
            Média: <span className="font-mono text-cyan-400">{averageCmc.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para distribuição de tipos - versão compacta
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
    <div className="quantum-card-dense">
      <div className="flex justify-between items-center border-b border-cyan-500/20 p-1">
        <span className="text-xs font-semibold text-cyan-400">Tipos</span>
      </div>
      <div className="p-2 space-y-1">
        {typeDistribution.map(([type, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={type} className="text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">{type}</span>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-[10px]">{percentage.toFixed(0)}%</span>
                  <span className="text-cyan-400 font-mono">{count}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full mt-0.5 overflow-hidden">
                <div 
                  className={`h-full ${typeColors[type] || 'bg-gray-500/70'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeckViewer;
