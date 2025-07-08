"use client"

import '../styles/contrast-improvements.css'
import React, { useState, useMemo } from 'react';
import '../styles/moxfield.css';
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

interface DeckViewerComponentProps {
  deckId: string;
  onClose: () => void;
  onEdit?: () => void;
}

const DeckViewerComponent: React.FC<DeckViewerComponentProps> = ({ deckId, onClose, onEdit }) => {
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

  // Handlers
  const handleSaveEdit = () => {
    editarDeck(deckId, editedDeck);
    setEditMode(false);
  };

  const handleDuplicateDeck = () => {
    const newDeckId = duplicarDeck(deckId);
    // Opcional: navegar para o novo deck
  };

  const handleDeleteDeck = () => {
    deletarDeck(deckId);
    onClose();
  };

  const handleExportDeck = () => {
    let deckText = `${deck.name}\n${deck.format}\n\n`;
    
    const mainboard = deck.cards.filter(c => c.category === 'mainboard');
    const sideboard = deck.cards.filter(c => c.category === 'sideboard');
    const commander = deck.cards.filter(c => c.category === 'commander');
    
    if (commander.length > 0) {
      deckText += "Commander:\n";
      commander.forEach(card => {
        deckText += `${card.quantity} ${card.card.name}\n`;
      });
      deckText += "\n";
    }
    
    if (mainboard.length > 0) {
      deckText += "Mainboard:\n";
      mainboard.forEach(card => {
        deckText += `${card.quantity} ${card.card.name}\n`;
      });
      deckText += "\n";
    }
    
    if (sideboard.length > 0) {
      deckText += "Sideboard:\n";
      sideboard.forEach(card => {
        deckText += `${card.quantity} ${card.card.name}\n`;
      });
    }
    
    const blob = new Blob([deckText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.replace(/[^a-z0-9]/gi, '_')}_deck.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const maxManaCurve = Math.max(...Object.values(stats.manaCurve));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-3">
                {editMode ? (
                  <Input
                    value={editedDeck.name}
                    onChange={(e) => setEditedDeck(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold bg-transparent border-0 px-0 text-white"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white">{deck.name}</h1>
                )}
                
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  {deck.format}
                </Badge>
                
                {deck.colors.length > 0 && (
                  <div className="flex gap-1">
                    {deck.colors.map(color => (
                      <div 
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 text-xs flex items-center justify-center font-bold ${
                          color === 'W' ? 'bg-yellow-100 text-gray-900 border-yellow-300' :
                          color === 'U' ? 'bg-blue-500 text-white border-blue-300' :
                          color === 'B' ? 'bg-gray-900 text-white border-gray-400' :
                          color === 'R' ? 'bg-red-500 text-white border-red-300' :
                          'bg-green-500 text-white border-green-300'
                        }`}
                      >
                        {color}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setEditMode(false)}
                    className="border-gray-600 text-gray-300"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                    <Edit3 className="w-4 h-4 mr-1" />
                    Editar Info
                  </Button>
                  {onEdit && (
                    <Button size="sm" onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
                      <Package className="w-4 h-4 mr-1" />
                      Editar Deck
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={handleExportDeck}>
                    <Download className="w-4 h-4 mr-1" />
                    Exportar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDuplicateDeck}>
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicar
                  </Button>
                  
                  <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-lg text-card-foreground bg-gray-800/80 backdrop-blur-xl shadow-2xl overflow-hidden border-0">
                      <DialogHeader>
                        <DialogTitle className="text-white">Confirmar Exclusão</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-gray-300">
                          Tem certeza que deseja excluir o deck "{deck.name}"? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="border-gray-600 text-gray-300"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={handleDeleteDeck}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Excluir Deck
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar esquerda - Estatísticas */}
          <div className="lg:col-span-3 space-y-4">
            {/* Stats básicas */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-gray-900/50 rounded">
                    <div className="text-2xl font-bold text-blue-400">{stats.mainboard}</div>
                    <div className="text-xs text-gray-400">Mainboard</div>
                  </div>
                  {stats.sideboard > 0 && (
                    <div className="text-center p-2 bg-gray-900/50 rounded">
                      <div className="text-2xl font-bold text-green-400">{stats.sideboard}</div>
                      <div className="text-xs text-gray-400">Sideboard</div>
                    </div>
                  )}
                  {stats.commander > 0 && (
                    <div className="text-center p-2 bg-gray-900/50 rounded">
                      <div className="text-2xl font-bold text-yellow-400">{stats.commander}</div>
                      <div className="text-xs text-gray-400">Commander</div>
                    </div>
                  )}
                  <div className="text-center p-2 bg-gray-900/50 rounded">
                    <div className="text-2xl font-bold text-purple-400">{stats.unique}</div>
                    <div className="text-xs text-gray-400">Únicas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curva de Mana */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Curva de Mana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(cmc => {
                    const count = stats.manaCurve[cmc] || 0;
                    const percentage = maxManaCurve > 0 ? (count / maxManaCurve) * 100 : 0;
                    
                    return (
                      <div key={cmc} className="flex items-center gap-2 text-sm">
                        <div className="w-6 text-gray-400 text-xs">{cmc === 7 ? '7+' : cmc}</div>
                        <div className="flex-1 bg-gray-900/50 rounded-full h-4 relative overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {count}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Descrição */}
            {(editMode || deck.description) && (
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Descrição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode ? (
                    <Textarea
                      value={editedDeck.description}
                      onChange={(e) => setEditedDeck(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do deck..."
                      className="bg-gray-900/50 border-gray-600 text-white"
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                      {deck.description || 'Sem descrição'}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Conteúdo principal - Lista de cartas */}
          <div className="lg:col-span-9 space-y-4">
            {/* Controles de visualização */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        onClick={() => setViewMode('grid')}
                        className="h-8"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === 'spoiler' ? 'default' : 'outline'}
                        onClick={() => setViewMode('spoiler')}
                        className="h-8"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Select value={filterCategory} onValueChange={(value: any) => setFilterCategory(value)}>
                      <SelectTrigger className="w-40 h-8 bg-gray-900/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all" className="text-white hover:bg-gray-700">Todas</SelectItem>
                        <SelectItem value="mainboard" className="text-white hover:bg-gray-700">Mainboard</SelectItem>
                        {stats.sideboard > 0 && (
                          <SelectItem value="sideboard" className="text-white hover:bg-gray-700">Sideboard</SelectItem>
                        )}
                        {stats.commander > 0 && (
                          <SelectItem value="commander" className="text-white hover:bg-gray-700">Commander</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar cartas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64 h-8 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de cartas */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredCards.map((deckCard, index) => (
                  <div
                    key={`${deckCard.card.id}-${index}`}
                    className="relative group cursor-pointer"
                    onClick={() => openModal(deckCard.card)}
                  >
                    <div className="aspect-[2.5/3.5] relative overflow-hidden rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
                      <Image
                        src={getImageUrl(deckCard.card)}
                        alt={deckCard.card.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.66vw"
                      />
                      
                      {/* Quantity badge */}
                      <div className="absolute top-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {deckCard.quantity}
                      </div>
                      
                      {/* Category badge */}
                      <div className={`absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded ${
                        deckCard.category === 'commander' ? 'bg-yellow-600/80 text-white' :
                        deckCard.category === 'sideboard' ? 'bg-green-600/80 text-white' :
                        'bg-blue-600/80 text-white'
                      }`}>
                        {deckCard.category === 'commander' ? 'CMD' :
                         deckCard.category === 'sideboard' ? 'SB' : 'MB'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="p-0">
                  <div className="space-y-0 divide-y divide-gray-700">
                    {filteredCards.map((deckCard, index) => (
                      <div
                        key={`${deckCard.card.id}-${index}`}
                        className="flex items-center gap-4 p-4 hover:bg-gray-700/30 transition-colors cursor-pointer"
                        onClick={() => openModal(deckCard.card)}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-12 h-16 relative rounded border border-gray-600 overflow-hidden">
                            <Image
                              src={getImageUrl(deckCard.card)}
                              alt={deckCard.card.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">{deckCard.card.name}</h3>
                          <p className="text-sm text-gray-400">{deckCard.card.type_line}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              CMC {deckCard.card.cmc || 0}
                            </Badge>
                            {deckCard.card.mana_cost && (
                              <span className="text-xs text-gray-400">{deckCard.card.mana_cost}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className={`${
                              deckCard.category === 'commander' ? 'border-yellow-500 text-yellow-400' :
                              deckCard.category === 'sideboard' ? 'border-green-500 text-green-400' :
                              'border-blue-500 text-blue-400'
                            }`}
                          >
                            {deckCard.category === 'commander' ? 'Commander' :
                             deckCard.category === 'sideboard' ? 'Sideboard' : 'Mainboard'}
                          </Badge>
                          
                          <div className="text-white font-medium min-w-[2rem] text-center">
                            {deckCard.quantity}x
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {filteredCards.length === 0 && (
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">
                    {searchTerm ? 'Nenhuma carta encontrada com os filtros aplicados' : 'Nenhuma carta neste deck'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckViewerComponent;
