"use client"

import { useState, useMemo } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { useCardModal } from '@/contexts/CardModalContext'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SimpleSelect from "@/components/SimpleSelect"
import { Textarea } from "@/components/ui/textarea"
import DeckBuilder from '@/components/DeckBuilder'
import DeckViewer from '@/components/DeckViewer'
import DeckImporter from '@/components/DeckImporter'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Save, 
  Search, 
  Filter, 
  BarChart3,
  Target,
  Zap,
  Users,
  Eye,
  Upload,
  Package,
  Hammer,
  X,
  Image
} from "lucide-react"
import '../styles/deck-viewer-compact.css'
import '../styles/modal-fix.css'
import '../styles/filtros-fix.css'
import '../styles/dropdown-z-fix.css'
import '../styles/deck-builder-enhanced.css'
import '../styles/dropdown-fixes-enhanced.css'
import '../styles/deck-importer-enhanced.css'
import '../styles/modal-fix-enhanced.css'

export default function ConstrutorDecks() {
  const { decks, criarDeck, editarDeck, deletarDeck, duplicarDeck } = useAppContext()
  const cardModalContext = useCardModal() // Acessar o contexto do CardModal
  
  // Estados locais para UI
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'viewer' | 'builder'>('list')
  const [isCreatingDeck, setIsCreatingDeck] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    visible: boolean
  }>({ type: 'info', message: '', visible: false })

  // Estados para criação de deck
  const [newDeckData, setNewDeckData] = useState({
    name: '',
    format: 'Standard',
    colors: [] as string[],
    description: ''
  })

  // Estados para filtros e ordenação
  const [searchFilter, setSearchFilter] = useState('')
  const [formatFilter, setFormatFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'cards' | 'format'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Estado para armazenar as cartas de fundo selecionadas manualmente
  const [backgroundCards, setBackgroundCards] = useState<{[deckId: string]: number}>({})
  const [showCardSelector, setShowCardSelector] = useState<string | null>(null)

  // Função para mostrar notificações
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, visible: true })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }))
    }, 3000)
  }

  // Função para criar novo deck
  const handleCreateDeck = async () => {
    if (!newDeckData.name.trim()) {
      showNotification('error', 'Nome do deck é obrigatório')
      return
    }

    try {
      const deckId = await criarDeck({
        name: newDeckData.name,
        format: newDeckData.format,
        colors: newDeckData.colors,
        cards: [],
        isPublic: false,
        tags: [],
        description: newDeckData.description
      })
      setNewDeckData({ name: '', format: 'Standard', colors: [], description: '' })
      setIsCreatingDeck(false)
      showNotification('success', 'Deck criado com sucesso!')
      
      // Ir direto para o builder do novo deck
      setSelectedDeck(deckId)
      setViewMode('builder')
    } catch (error) {
      showNotification('error', 'Erro ao criar deck')
    }
  }

  const handleDuplicateDeck = async (deckId: string) => {
    try {
      const newDeckId = await duplicarDeck(deckId);
      if (newDeckId) {
        console.log('Deck duplicado com sucesso! Novo ID:', newDeckId);
        showNotification('success', 'Deck duplicado com sucesso!');
      } else {
        showNotification('error', 'Falha ao duplicar o deck.');
      }
    } catch (error) {
      showNotification('error', 'Erro ao duplicar deck');
    }
  }

  const handleDeleteDeck = async (deckId: string) => {
    try {
      await deletarDeck(deckId)
      if (selectedDeck === deckId) {
        setSelectedDeck(null)
        setViewMode('list')
      }
      setShowDeleteConfirm(null)
      showNotification('success', 'Deck deletado com sucesso!')
    } catch (error) {
      showNotification('error', 'Erro ao deletar deck')
      setShowDeleteConfirm(null)
    }
  }

  // Filtrar e ordenar decks
  const filteredDecks = useMemo(() => {
    let filtered = decks.filter(deck => {
      const matchesSearch = deck.name.toLowerCase().includes(searchFilter.toLowerCase())
      const matchesFormat = formatFilter === 'all' || deck.format === formatFilter
      return matchesSearch && matchesFormat
    })

    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          break
        case 'cards':
          const aTotal = a.cards.reduce((sum, c) => sum + c.quantity, 0)
          const bTotal = b.cards.reduce((sum, c) => sum + c.quantity, 0)
          comparison = aTotal - bTotal
          break
        case 'format':
          comparison = a.format.localeCompare(b.format)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [decks, searchFilter, formatFilter, sortBy, sortOrder])

  // Se estiver visualizando um deck
  if (viewMode === 'viewer' && selectedDeck) {
    return (
      <DeckViewer
        deckId={selectedDeck}
        onClose={() => {
          setSelectedDeck(null)
          setViewMode('list')
        }}
        onEdit={() => setViewMode('builder')}
      />
    )
  }

  // Se estiver construindo/editando um deck
  if (viewMode === 'builder') {
    return (
      <DeckBuilder 
        deckId={selectedDeck || undefined}
        onSave={(deckId) => {
          showNotification('success', selectedDeck ? 'Deck atualizado com sucesso!' : 'Deck criado com sucesso!')
          setSelectedDeck(deckId)
          setViewMode('list')
        }}
        onCancel={() => {
          setSelectedDeck(null)
          setViewMode('list')
        }}
      />
    )
  }

  return (
    <div className="p-4">
      {/* Notification */}
      {notification.visible && (
        <div className={`fixed top-4 right-4 p-3 rounded-md z-50 shadow-lg text-sm font-medium
          ${notification.type === 'success' ? 'bg-green-600/90 text-white' : 
            notification.type === 'error' ? 'bg-red-600/90 text-white' : 
            'bg-blue-600/90 text-white'}`}>
          {notification.message}
        </div>
      )}

      {/* Header Compacto */}
      <div className="quantum-card-dense p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Construtor de Decks</h2>
            <span className="quantum-badge primary">
              {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsCreatingDeck(true)}
              className="quantum-btn compact primary"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Novo Deck
            </button>
            <DeckImporter 
              onImportSuccess={() => showNotification('success', 'Deck importado com sucesso!')}
              onImportError={(error: string) => showNotification('error', `Erro ao importar deck: ${error}`)}
            />
          </div>
        </div>
      </div>

      {/* Filtros compactos */}
      <div className="quantum-card-dense p-3 mb-4 filtros-colecao">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Buscar deck..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 h-8 text-sm bg-black/40 border-gray-700"
            />
          </div>
          
          <SimpleSelect
            value={formatFilter}
            onChange={setFormatFilter}
            options={[
              { value: "all", label: "Todos os formatos" },
              { value: "Standard", label: "Standard" },
              { value: "Pioneer", label: "Pioneer" },
              { value: "Modern", label: "Modern" },
              { value: "Commander", label: "Commander" },
              { value: "Legacy", label: "Legacy" },
              { value: "Vintage", label: "Vintage" },
              { value: "Pauper", label: "Pauper" }
            ]}
            placeholder="Formato"
          />
          
          <SimpleSelect
            value={`${sortBy}-${sortOrder}`}
            onChange={(value) => {
              const [field, order] = value.split('-') as [typeof sortBy, typeof sortOrder]
              setSortBy(field)
              setSortOrder(order)
            }}
            options={[
              { value: "date-desc", label: "Mais recentes primeiro" },
              { value: "date-asc", label: "Mais antigos primeiro" },
              { value: "name-asc", label: "Nome (A-Z)" },
              { value: "name-desc", label: "Nome (Z-A)" },
              { value: "cards-desc", label: "Mais cartas" },
              { value: "cards-asc", label: "Menos cartas" }
            ]}
            placeholder="Ordenar por"
          />
        </div>
      </div>

      {/* Grid de Decks Compacto */}
      {filteredDecks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredDecks.map(deck => {
            const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);
            const mainboardCards = deck.cards.filter(c => c.category === 'mainboard').reduce((sum, c) => sum + c.quantity, 0);
            const sideboardCards = deck.cards.filter(c => c.category === 'sideboard').reduce((sum, c) => sum + c.quantity, 0);
            
            return (
              <div key={deck.id} className="quantum-card-dense hover-highlight group relative overflow-hidden">
                {deck.cards.length > 0 && (
                  <>
                  {(() => {
                    // Verifica se existe uma seleção manual de carta de fundo
                    const backgroundCardIndex = backgroundCards[deck.id];
                    const cardToUse = backgroundCardIndex !== undefined ? 
                      deck.cards[backgroundCardIndex] : deck.cards[0];
                    
                    // Se não houver carta definida ou se o índice for inválido, usa a primeira
                    if (!cardToUse) return null;
                    
                    // Obtém o URL da imagem com fallbacks
                    const imageUrl = 
                      cardToUse.card.image_uris?.art_crop || 
                      cardToUse.card.image_uris?.normal || 
                      cardToUse.card.card_faces?.[0]?.image_uris?.art_crop ||
                      cardToUse.card.card_faces?.[0]?.image_uris?.normal;
                    
                    // Só renderiza se tiver uma imagem válida
                    if (imageUrl) {
                      return (
                        <div className="absolute inset-0 z-0 opacity-20">
                          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                          <img 
                            src={imageUrl}
                            alt="" 
                            className="w-full h-full object-cover filter blur-sm"
                            onError={(e) => {
                              // Esconde a imagem se der erro ao carregar
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                  </>
                )}
                <div className="p-3 border-b border-cyan-500/20 relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white truncate">{deck.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge className="bg-gray-700/60 text-gray-200 text-[10px] h-4 px-1">
                          {deck.format}
                        </Badge>
                        {deck.colors.length > 0 && (
                          <div className="flex -space-x-1">
                            {deck.colors.map((color) => (
                              <div 
                                key={color}
                                className={`w-4 h-4 rounded-full border border-gray-700 flex items-center justify-center text-[8px] 
                                  ${color === 'W' ? 'bg-yellow-300/80 text-black' : 
                                    color === 'U' ? 'bg-blue-500/80 text-white' : 
                                    color === 'B' ? 'bg-gray-900/80 text-white' : 
                                    color === 'R' ? 'bg-red-500/80 text-white' : 
                                    'bg-green-500/80 text-white'}`
                                }
                              >
                                {color}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setSelectedDeck(deck.id);
                          setViewMode('viewer');
                        }}
                        className="p-1 text-gray-400 hover:text-cyan-400 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedDeck(deck.id);
                          setViewMode('builder');
                        }}
                        className="p-1 text-gray-400 hover:text-cyan-400 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCardSelector(deck.id);
                        }}
                        className="p-1 text-gray-400 hover:text-cyan-400 transition"
                        title="Alterar imagem de fundo"
                      >
                        <Image className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDuplicateDeck(deck.id)}
                        className="p-1 text-gray-400 hover:text-cyan-400 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(deck.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 text-xs text-gray-400 relative z-10">
                  <div className="flex justify-between items-center mb-1">
                    <span>Total:</span>
                    <span className="font-mono text-cyan-400">{totalCards} cartas</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span>Main: {mainboardCards}</span>
                    {sideboardCards > 0 && <span>Side: {sideboardCards}</span>}
                  </div>
                  
                  {deck.description && (
                    <div className="mt-2 border-t border-gray-800 pt-2 line-clamp-2 text-[11px]">
                      {deck.description}
                    </div>
                  )}
                </div>
                
                <div 
                  className="p-2 bg-gradient-to-r from-transparent via-cyan-900/10 to-transparent cursor-pointer relative z-10"
                  onClick={() => {
                    setSelectedDeck(deck.id);
                    setViewMode('viewer');
                  }}
                >
                  <div className="flex justify-center items-center gap-1 text-[11px] text-gray-500 hover:text-cyan-400">
                    <Eye className="w-3 h-3" />
                    <span>Ver detalhes</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="quantum-card-dense py-12 px-4 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {searchFilter || formatFilter !== 'all' ? 'Nenhum deck encontrado' : 'Nenhum deck criado'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {searchFilter || formatFilter !== 'all' 
              ? 'Tente ajustar seus filtros para encontrar o que procura'
              : 'Crie seu primeiro deck para começar'
            }
          </p>
          {!searchFilter && formatFilter === 'all' && (
            <button 
              onClick={() => setIsCreatingDeck(true)}
              className="quantum-btn primary mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Deck
            </button>
          )}
        </div>
      )}
      
      {/* Estatísticas compactas */}
      {decks.length > 0 && (
        <div className="quantum-card-dense mt-4 p-3">
          <div className="flex items-center gap-2 mb-2 border-b border-cyan-500/20 pb-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-medium text-gray-200">Estatísticas Rápidas</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black/40 p-2 rounded text-center">
              <div className="text-lg font-bold text-cyan-400">{decks.length}</div>
              <div className="text-xs text-gray-400">Total de Decks</div>
            </div>
            <div className="bg-black/40 p-2 rounded text-center">
              <div className="text-lg font-bold text-purple-400">
                {decks.reduce((sum, deck) => sum + deck.cards.reduce((cardSum, card) => cardSum + card.quantity, 0), 0)}
              </div>
              <div className="text-xs text-gray-400">Total de Cartas</div>
            </div>
            <div className="bg-black/40 p-2 rounded text-center">
              <div className="text-lg font-bold text-green-400">
                {new Set(decks.map(d => d.format)).size}
              </div>
              <div className="text-xs text-gray-400">Formatos</div>
            </div>
            <div className="bg-black/40 p-2 rounded text-center">
              <div className="text-lg font-bold text-yellow-400">
                {Math.round(decks.reduce((sum, deck) => 
                  sum + deck.cards.reduce((cardSum, card) => cardSum + card.quantity, 0), 0
                ) / Math.max(1, decks.length))}
              </div>
              <div className="text-xs text-gray-400">Média de Cartas</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Criação de Deck */}
      <Dialog 
        open={isCreatingDeck}
        onOpenChange={setIsCreatingDeck}
      >
        <DialogContent
          className="quantum-card fixed-modal creation-modal"
          aria-describedby="create-deck-description"
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-medium text-white">Criar Novo Deck</h2>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <p id="create-deck-description" className="sr-only">
              Preencha os detalhes abaixo para criar um novo deck.
            </p>
            <div className="space-y-2">
              <label className="text-sm text-gray-300" htmlFor="name">Nome do Deck*</label>
              <Input
                id="name"
                value={newDeckData.name}
                onChange={(e) => setNewDeckData({...newDeckData, name: e.target.value})}
                placeholder="Nome do deck..."
                className="bg-black/40 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-300" htmlFor="format">Formato</label>
              <SimpleSelect
                value={newDeckData.format}
                onChange={(value) => setNewDeckData({...newDeckData, format: value})}
                options={[
                  { value: "Standard", label: "Standard" },
                  { value: "Modern", label: "Modern" },
                  { value: "Commander", label: "Commander" },
                  { value: "Pioneer", label: "Pioneer" },
                  { value: "Legacy", label: "Legacy" },
                  { value: "Vintage", label: "Vintage" },
                  { value: "Pauper", label: "Pauper" }
                ]}
                placeholder="Formato"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Cores</label>
              <div className="flex gap-2">
                {[
                  { color: 'W', bg: 'bg-yellow-300/80 text-black' },
                  { color: 'U', bg: 'bg-blue-500/80 text-white' },
                  { color: 'B', bg: 'bg-gray-900/80 text-white' },
                  { color: 'R', bg: 'bg-red-500/80 text-white' },
                  { color: 'G', bg: 'bg-green-500/80 text-white' }
                ].map(({ color, bg }) => (
                  <button
                    key={color}
                    onClick={() => {
                      const newColors = newDeckData.colors.includes(color)
                        ? newDeckData.colors.filter(c => c !== color)
                        : [...newDeckData.colors, color];
                      setNewDeckData({...newDeckData, colors: newColors});
                    }}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition
                      ${newDeckData.colors.includes(color) 
                        ? bg + ' ring-1 ring-white/40' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`
                    }
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-300" htmlFor="description">Descrição (Opcional)</label>
              <Textarea 
                id="description"
                value={newDeckData.description}
                onChange={(e) => setNewDeckData({...newDeckData, description: e.target.value})}
                placeholder="Descreva a estratégia do deck..."
                className="bg-black/40 border-gray-700 h-20 resize-none"
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                onClick={() => setIsCreatingDeck(false)}
                className="quantum-btn"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateDeck}
                className="quantum-btn primary"
                disabled={!newDeckData.name.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Deck
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Confirmação de Deleção */}
      <Dialog 
        open={!!showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
      >
        <DialogContent
          className="quantum-card fixed-modal delete-modal"
          aria-describedby="delete-deck-description"
        >
          <DialogHeader>
            <h2 className="text-lg font-medium text-red-400">Excluir Deck</h2>
          </DialogHeader>
          
          {showDeleteConfirm && (
            <div>
              <p id="delete-deck-description" className="text-sm text-gray-300 mb-4">
                Tem certeza que deseja excluir o deck
                <strong className="text-white"> {decks.find(d => d.id === showDeleteConfirm)?.name}</strong>?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="quantum-btn"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleDeleteDeck(showDeleteConfirm)}
                  className="quantum-btn primary"
                  style={{background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444'}}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Permanentemente
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal de Seleção de Carta de Fundo */}
      <Dialog 
        open={!!showCardSelector}
        onOpenChange={(open) => !open && setShowCardSelector(null)}
      >
        <DialogContent
          className="quantum-card-dense overflow-hidden border border-cyan-500/20 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-lg focus:outline-none fixed-modal card-selector-modal"
          aria-describedby="card-selector-description"
        >
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-cyan-400" />
                <DialogTitle className="text-lg font-medium text-cyan-400">Escolher Imagem de Fundo</DialogTitle>
              </div>
              <Button
                onClick={() => setShowCardSelector(null)}
                className="h-7 w-7 p-0 rounded-full bg-gray-800/60 hover:bg-gray-700/60 border-none"
              >
                <X className="h-3.5 w-3.5 text-gray-400" />
              </Button>
            </div>
          </DialogHeader>
          
          {showCardSelector && (
            <div className="space-y-4">
              <p id="card-selector-description" className="text-sm text-gray-300 border-l-2 border-cyan-500/30 pl-3 py-1 bg-cyan-500/5">
                Selecione uma carta para usar como imagem de fundo para o deck
                <strong className="text-white"> {decks.find(d => d.id === showCardSelector)?.name}</strong>
              </p>
              
              {/* Área rolável para as cartas */}
              <div className="max-h-[50vh] overflow-y-auto pr-1 quantum-scrollbar">
                {/* Grid de seleção de cartas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pb-1">
                  {showCardSelector && decks.find(d => d.id === showCardSelector)?.cards?.map((card, index) => {
                    // Verificar se card e card.card existem
                    if (!card || !card.card) return null;
                    
                    // Obtém o URL da imagem com fallbacks de forma segura
                    let imageUrl = card.card.image_uris?.art_crop || card.card.image_uris?.normal;
                    if (!imageUrl && Array.isArray(card.card.card_faces) && card.card.card_faces.length > 0) {
                      imageUrl = card.card.card_faces[0]?.image_uris?.art_crop || card.card.card_faces[0]?.image_uris?.normal;
                    }

                    const isSelected = showCardSelector ? backgroundCards[showCardSelector] === index : false;

                    return imageUrl ? (
                      <div
                        key={`${card.card.id || index}-${index}`}
                        className={`relative cursor-pointer rounded-md overflow-hidden transition-all hover:scale-[1.03] group ${
                          isSelected ? 'ring-2 ring-cyan-400 scale-[1.03]' : 'ring-1 ring-gray-700'
                        }`}
                        onClick={() => {
                          if (showCardSelector) {
                            setBackgroundCards({
                              ...backgroundCards,
                              [showCardSelector]: index
                            });
                            // Mostrar notificação
                            showNotification('success', `${card.card.name} definida como fundo do deck`);
                          }
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={card.card.name || "Card art"}
                          className="w-full aspect-[4/3] object-cover"
                          loading="lazy"
                          onError={(e) => {
                            // Esconde a imagem se der erro ao carregar
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black to-transparent pt-4 pb-1 px-1">
                          <p className="text-xs text-white truncate">{card.card.name || "Sem nome"}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-cyan-500 rounded-full p-1 shadow-lg">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        )}

                        {/* Botão para visualizar carta em detalhes */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            // Primeiro abre o modal da carta, depois fecha o seletor
                            if (cardModalContext && cardModalContext.openModal) {
                              await cardModalContext.openModal(card.card);
                            }
                            if (showCardSelector) {
                              setTimeout(() => setShowCardSelector(null), 150);
                            }
                          }}
                          className="absolute top-1 left-1 bg-black/60 hover:bg-cyan-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Ver detalhes da carta"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                
                {showCardSelector && decks.find(d => d.id === showCardSelector)?.cards?.length === 0 && (
                  <div className="text-center py-8 bg-black/20 rounded-lg border border-gray-800">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400">Este deck não possui cartas para exibir como fundo.</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between gap-2 mt-4 pt-3 border-t border-cyan-500/20">
                <div className="text-xs text-gray-400">
                  {showCardSelector ? decks.find(d => d.id === showCardSelector)?.cards?.length || 0 : 0} carta(s) disponíveis
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      // Remover a seleção atual (usar a primeira carta como padrão)
                      if (showCardSelector && backgroundCards[showCardSelector] !== undefined) {
                        const newBackgroundCards = {...backgroundCards};
                        delete newBackgroundCards[showCardSelector];
                        setBackgroundCards(newBackgroundCards);
                        showNotification('info', 'Usando imagem padrão para o fundo');
                      }
                      setShowCardSelector(null);
                    }}
                    className="quantum-btn compact"
                    type="button"
                  >
                    Usar Padrão
                  </Button>
                  <Button 
                    onClick={() => setShowCardSelector(null)}
                    className="quantum-btn primary compact"
                    type="button"
                  >
                    Concluído
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
