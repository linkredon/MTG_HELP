"use client"

import { useState, useMemo } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { useCardModal } from '@/contexts/CardModalContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Image,
  Star,
  BookOpen,
  Download,
  Share2,
  Settings,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import '../styles/deck-viewer-compact.css'
import '../styles/modal-fix.css'
import '../styles/filtros-fix.css'
import '../styles/dropdown-z-fix.css'
import '../styles/deck-builder-enhanced.css'
import '../styles/dropdown-fixes-enhanced.css'
import '../styles/deck-importer-enhanced.css'
import '../styles/modal-fix-enhanced.css'
import '../styles/quantum-interface.css'
import DeckBuilderEnhanced from './DeckBuilder-enhanced'

export default function ConstrutorDecksEnhanced() {
  const { 
    decks, 
    collections,
    criarDeck, 
    editarDeck, 
    deletarDeck, 
    duplicarDeck,
    adicionarCartaAoDeck,
    removerCartaDoDeck,
    atualizarQuantidadeNoDeck,
    adicionarCartaAColecao,
    criarColecao
  } = useAppContext()
  const cardModalContext = useCardModal()
  
  // Estados locais para UI
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'viewer' | 'builder' | 'importer'>('list')
  const [isCreatingDeck, setIsCreatingDeck] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showAddToCollection, setShowAddToCollection] = useState<string | null>(null)
  const [selectedCardForCollection, setSelectedCardForCollection] = useState<any>(null)
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
    description: '',
    addToCollection: false,
    selectedCollection: '',
    newCollectionName: ''
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

      // Se marcou para adicionar na coleção
      if (newDeckData.addToCollection) {
        if (newDeckData.selectedCollection === 'new' && newDeckData.newCollectionName.trim()) {
          // Criar nova coleção
          const collectionId = await criarColecao({
            name: newDeckData.newCollectionName,
            description: `Coleção criada a partir do deck ${newDeckData.name}`,
            cards: []
          })
          showNotification('success', `Deck criado e nova coleção "${newDeckData.newCollectionName}" criada!`)
        } else if (newDeckData.selectedCollection) {
          showNotification('success', 'Deck criado e adicionado à coleção selecionada!')
        }
      }

      setNewDeckData({ 
        name: '', 
        format: 'Standard', 
        colors: [], 
        description: '',
        addToCollection: false,
        selectedCollection: '',
        newCollectionName: ''
      })
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
      showNotification('error', 'Erro ao duplicar deck')
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

  // Função para adicionar carta à coleção
  const handleAddCardToCollection = async (card: any, collectionId: string) => {
    try {
      await adicionarCartaAColecao(collectionId, {
        card: card,
        quantity: 1,
        condition: 'NM',
        isFoil: false
      })
      setShowAddToCollection(null)
      setSelectedCardForCollection(null)
      showNotification('success', 'Carta adicionada à coleção!')
    } catch (error) {
      showNotification('error', 'Erro ao adicionar carta à coleção')
    }
  }

  // Função para verificar se uma carta está na coleção
  const isCardInCollection = (cardId: string, collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId)
    if (!collection) return false
    return collection.cards.some((cc: any) => cc.card?.id === cardId)
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
      <div className="quantum-container">
        <div className="quantum-header">
          <Button
            onClick={() => {
              setSelectedDeck(null)
              setViewMode('list')
            }}
            variant="ghost"
            className="quantum-button-secondary"
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            Voltar aos Decks
          </Button>
          <Button
            onClick={() => setViewMode('builder')}
            className="quantum-button-primary"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Editar Deck
          </Button>
        </div>
        
        <div className="quantum-content">
          {/* Aqui vai o componente DeckViewer */}
          <div className="quantum-card">
            <CardHeader>
              <CardTitle>Visualizador de Deck</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Componente DeckViewer será integrado aqui</p>
            </CardContent>
          </div>
        </div>
      </div>
    )
  }

  // Se estiver construindo/editando um deck
  if (viewMode === 'builder') {
    return (
      <div className="quantum-container">
        <div className="quantum-header">
          <Button
            onClick={() => {
              setSelectedDeck(null)
              setViewMode('list')
            }}
            variant="ghost"
            className="quantum-button-secondary"
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            Voltar aos Decks
          </Button>
          <Button
            onClick={() => setViewMode('viewer')}
            className="quantum-button-primary"
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar Deck
          </Button>
        </div>
        
        <div className="quantum-content">
          {/* Componente DeckBuilder melhorado */}
          <DeckBuilderEnhanced 
            deckId={selectedDeck}
            onSave={(deckId) => {
              showNotification('success', 'Deck salvo com sucesso!');
              setSelectedDeck(deckId);
              setViewMode('list');
            }}
            onCancel={() => {
              setSelectedDeck(null);
              setViewMode('list');
            }}
          />
        </div>
      </div>
    )
  }

  // Se estiver importando deck
  if (viewMode === 'importer') {
    return (
      <div className="quantum-container">
        <div className="quantum-header">
          <Button
            onClick={() => setViewMode('list')}
            variant="ghost"
            className="quantum-button-secondary"
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            Voltar aos Decks
          </Button>
        </div>
        
        <div className="quantum-content">
          {/* Aqui vai o componente DeckImporter */}
          <div className="quantum-card">
            <CardHeader>
              <CardTitle>Importar Deck</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Componente DeckImporter será integrado aqui</p>
            </CardContent>
          </div>
        </div>
      </div>
    )
  }

  // Lista principal de decks
  return (
    <div className="quantum-container">
      {/* Header */}
      <div className="quantum-header">
        <div className="quantum-header-left">
          <h1 className="quantum-title">
            <Hammer className="w-6 h-6 mr-3" />
            Construtor de Decks
          </h1>
          <p className="quantum-subtitle">
            Crie, edite e gerencie seus decks de Magic
          </p>
        </div>
        
        <div className="quantum-header-right">
          <Button
            onClick={() => setViewMode('importer')}
            variant="outline"
            className="quantum-button-secondary"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Deck
          </Button>
          <Button
            onClick={() => setIsCreatingDeck(true)}
            className="quantum-button-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Deck
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="quantum-filters">
        <div className="quantum-search">
          <Search className="w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar decks..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="quantum-input"
          />
        </div>
        
        <div className="quantum-filter-controls">
          <Select value={formatFilter} onValueChange={setFormatFilter}>
            <SelectTrigger className="quantum-select">
              <SelectValue placeholder="Formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Formatos</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Modern">Modern</SelectItem>
              <SelectItem value="Pioneer">Pioneer</SelectItem>
              <SelectItem value="Legacy">Legacy</SelectItem>
              <SelectItem value="Vintage">Vintage</SelectItem>
              <SelectItem value="Commander">Commander</SelectItem>
              <SelectItem value="Limited">Limited</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="quantum-select">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="date">Data</SelectItem>
              <SelectItem value="cards">Número de Cartas</SelectItem>
              <SelectItem value="format">Formato</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            variant="outline"
            size="sm"
            className="quantum-button-secondary"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Lista de Decks */}
      <div className="quantum-content">
        {filteredDecks.length === 0 ? (
          <div className="quantum-empty-state">
            <Package className="w-16 h-16 text-slate-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Nenhum deck encontrado</h3>
            <p className="text-slate-400 mb-6">
              {searchFilter || formatFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Crie seu primeiro deck para começar'}
            </p>
            {!searchFilter && formatFilter === 'all' && (
              <Button
                onClick={() => setIsCreatingDeck(true)}
                className="quantum-button-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Deck
              </Button>
            )}
          </div>
        ) : (
          <div className="quantum-grid">
            {filteredDecks.map((deck) => (
              <Card key={deck.id} className="quantum-card hover:quantum-card-hover">
                <CardHeader className="quantum-card-header">
                  <div className="quantum-card-title">
                    <h3 className="font-semibold text-white">{deck.name}</h3>
                    <Badge variant="secondary" className="quantum-badge">
                      {deck.format}
                    </Badge>
                  </div>
                  
                  <div className="quantum-card-actions">
                    <Button
                      onClick={() => {
                        setSelectedDeck(deck.id)
                        setViewMode('viewer')
                      }}
                      variant="ghost"
                      size="sm"
                      className="quantum-button-icon"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedDeck(deck.id)
                        setViewMode('builder')
                      }}
                      variant="ghost"
                      size="sm"
                      className="quantum-button-icon"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDuplicateDeck(deck.id)}
                      variant="ghost"
                      size="sm"
                      className="quantum-button-icon"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(deck.id)}
                      variant="ghost"
                      size="sm"
                      className="quantum-button-icon text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="quantum-card-content">
                  <div className="quantum-card-stats">
                    <div className="quantum-stat">
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">
                        {deck.cards.reduce((sum, c) => sum + c.quantity, 0)} cartas
                      </span>
                    </div>
                    
                    {deck.colors && deck.colors.length > 0 && (
                      <div className="quantum-colors">
                        {deck.colors.map((color) => (
                          <div
                            key={color}
                            className={`w-3 h-3 rounded-full ${
                              color === 'W' ? 'bg-yellow-400' :
                              color === 'U' ? 'bg-blue-500' :
                              color === 'B' ? 'bg-gray-800' :
                              color === 'R' ? 'bg-red-500' :
                              color === 'G' ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {deck.description && (
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                      {deck.description}
                    </p>
                  )}
                  
                  <div className="quantum-card-footer">
                    <span className="text-xs text-slate-500">
                      Criado em {new Date(deck.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação de Deck */}
      <Dialog open={isCreatingDeck} onOpenChange={setIsCreatingDeck}>
        <DialogContent className="quantum-modal">
          <DialogHeader>
            <DialogTitle className="quantum-modal-title">
              <Zap className="w-5 h-5 text-cyan-400 mr-2" />
              Criar Novo Deck
            </DialogTitle>
          </DialogHeader>
          
          <div className="quantum-modal-content">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="quantum-tabs">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="collection">Adicionar à Coleção</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="quantum-tab-content">
                <div className="quantum-form-group">
                  <label className="quantum-label">Nome do Deck *</label>
                  <Input
                    value={newDeckData.name}
                    onChange={(e) => setNewDeckData({...newDeckData, name: e.target.value})}
                    placeholder="Digite o nome do deck"
                    className="quantum-input"
                  />
                </div>
                
                <div className="quantum-form-group">
                  <label className="quantum-label">Formato</label>
                  <Select 
                    value={newDeckData.format} 
                    onValueChange={(value) => setNewDeckData({...newDeckData, format: value})}
                  >
                    <SelectTrigger className="quantum-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Modern">Modern</SelectItem>
                      <SelectItem value="Pioneer">Pioneer</SelectItem>
                      <SelectItem value="Legacy">Legacy</SelectItem>
                      <SelectItem value="Vintage">Vintage</SelectItem>
                      <SelectItem value="Commander">Commander</SelectItem>
                      <SelectItem value="Limited">Limited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="quantum-form-group">
                  <label className="quantum-label">Cores</label>
                  <div className="quantum-colors-selector">
                    {['W', 'U', 'B', 'R', 'G'].map((color) => (
                      <Button
                        key={color}
                        onClick={() => {
                          const newColors = newDeckData.colors.includes(color)
                            ? newDeckData.colors.filter(c => c !== color)
                            : [...newDeckData.colors, color]
                          setNewDeckData({...newDeckData, colors: newColors})
                        }}
                        variant={newDeckData.colors.includes(color) ? "default" : "outline"}
                        size="sm"
                        className={`quantum-color-button ${
                          color === 'W' ? 'quantum-color-white' :
                          color === 'U' ? 'quantum-color-blue' :
                          color === 'B' ? 'quantum-color-black' :
                          color === 'R' ? 'quantum-color-red' :
                          'quantum-color-green'
                        }`}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="quantum-form-group">
                  <label className="quantum-label">Descrição (Opcional)</label>
                  <Textarea
                    value={newDeckData.description}
                    onChange={(e) => setNewDeckData({...newDeckData, description: e.target.value})}
                    placeholder="Descreva seu deck..."
                    className="quantum-textarea"
                    rows={3}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="collection" className="quantum-tab-content">
                <div className="quantum-form-group">
                  <label className="quantum-label">
                    <input
                      type="checkbox"
                      checked={newDeckData.addToCollection}
                      onChange={(e) => setNewDeckData({...newDeckData, addToCollection: e.target.checked})}
                      className="quantum-checkbox"
                    />
                    Adicionar cartas do deck à coleção
                  </label>
                </div>
                
                {newDeckData.addToCollection && (
                  <div className="quantum-form-group">
                    <label className="quantum-label">Selecionar Coleção</label>
                    <Select 
                      value={newDeckData.selectedCollection} 
                      onValueChange={(value) => setNewDeckData({...newDeckData, selectedCollection: value})}
                    >
                      <SelectTrigger className="quantum-select">
                        <SelectValue placeholder="Escolha uma coleção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Criar Nova Coleção</SelectItem>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {newDeckData.addToCollection && newDeckData.selectedCollection === 'new' && (
                  <div className="quantum-form-group">
                    <label className="quantum-label">Nome da Nova Coleção</label>
                    <Input
                      value={newDeckData.newCollectionName}
                      onChange={(e) => setNewDeckData({...newDeckData, newCollectionName: e.target.value})}
                      placeholder="Digite o nome da nova coleção"
                      className="quantum-input"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="quantum-modal-footer">
            <Button
              onClick={() => setIsCreatingDeck(false)}
              variant="outline"
              className="quantum-button-secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateDeck}
              className="quantum-button-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Deck
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="quantum-modal">
          <DialogHeader>
            <DialogTitle className="quantum-modal-title text-red-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          
          <div className="quantum-modal-content">
            <p className="text-slate-300">
              Tem certeza que deseja excluir este deck? Esta ação não pode ser desfeita.
            </p>
          </div>
          
          <div className="quantum-modal-footer">
            <Button
              onClick={() => setShowDeleteConfirm(null)}
              variant="outline"
              className="quantum-button-secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleDeleteDeck(showDeleteConfirm!)}
              className="quantum-button-danger"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Deck
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
            {notification.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {notification.type === 'info' && <Info className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  )
} 