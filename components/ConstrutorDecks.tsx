"use client"

import { useState, useMemo } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DeckImporter from './DeckImporter'
import DeckViewerComponent from './DeckViewerComponent'
import DeckBuilder from './DeckBuilder'
import CompactConstructor from './ConstrutorDecks-compact'

import { 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Save, 
  Search, 
  Filter, 
  BarChart3,
  Shuffle,
  Target,
  Zap,
  Users,
  Calendar,
  Eye,
  Upload,
  Package,
  Hammer,
  Sparkles,
  Award,
  TrendingUp
} from "lucide-react"

export default function ConstrutorDecks() {
  const { decks, criarDeck, editarDeck, deletarDeck, duplicarDeck } = useAppContext()
  
  // Estados locais para UI
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'viewer' | 'builder'>('list')
  const [isCreatingDeck, setIsCreatingDeck] = useState(false)
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

  // Função para mostrar notificações
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, visible: true })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }))
    }, 3000)
  }

  // Função para criar novo deck
  const handleCreateDeck = () => {
    if (!newDeckData.name.trim()) {
      showNotification('error', 'Nome do deck é obrigatório')
      return
    }

    const deckId = criarDeck({
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
  }

  const handleDuplicateDeck = (deckId: string) => {
    const newDeckId = duplicarDeck(deckId)
    showNotification('success', 'Deck duplicado com sucesso!')
  }

  const handleDeleteDeck = (deckId: string) => {
    deletarDeck(deckId)
    if (selectedDeck === deckId) {
      setSelectedDeck(null)
      setViewMode('list')
    }
    showNotification('success', 'Deck deletado com sucesso!')
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
      <DeckViewerComponent 
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
    <div className="mtg-section">
      {/* Notification */}
      {notification.visible && (
        <div className={`mtg-notification mtg-notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Hero Section */}
      <div className="mtg-card text-center mb-8">
        <div className="mtg-card-header justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-700 flex items-center justify-center mb-6 mx-auto shadow-xl">
            <Hammer className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="mtg-section-title">Deck Builder Profissional</h1>
        <p className="mtg-section-subtitle">
          Construa, teste e otimize seus decks com ferramentas avançadas de análise e estatísticas
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="mtg-status mtg-status-success">
            <Package className="w-3 h-3" />
            {decks.length} deck{decks.length !== 1 ? 's' : ''} criado{decks.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mtg-card mb-8">
        <div className="mtg-card-header">
          <Zap className="mtg-card-icon" />
          <div className="mtg-card-content">
            <h3 className="mtg-card-title">Ações Rápidas</h3>
            <p className="mtg-card-description">Comece a construir seu próximo deck</p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="mtg-grid-2">
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Criar Novo Deck</h4>
              <button
                onClick={() => setIsCreatingDeck(true)}
                className="quantum-btn quantum-btn-primary w-full"
              >
                <Plus className="w-4 h-4" />
                <span>Criar do Zero</span>
              </button>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Importar Lista</h4>
              <DeckImporter 
                onImportSuccess={() => showNotification('success', 'Deck importado com sucesso!')}
                onImportError={(error: string) => showNotification('error', `Erro ao importar deck: ${error}`)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Deck Modal */}
      {isCreatingDeck && (
        <div className="mtg-modal-backdrop">
          <div className="mtg-modal">
            <div className="mtg-card">
              <div className="mtg-card-header">
                <Sparkles className="mtg-card-icon" />
                <div className="mtg-card-content">
                  <h3 className="mtg-card-title">Criar Novo Deck</h3>
                  <p className="mtg-card-description">Configure as informações básicas do seu deck</p>
                </div>
              </div>
              <div className="px-6 pb-6 space-y-6">
                <div>
                  <label className="mtg-label">Nome do Deck *</label>
                  <Input
                    value={newDeckData.name}
                    onChange={(e) => setNewDeckData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Aggro Vermelho"
                    className="mtg-input"
                  />
                </div>

                <div>
                  <label className="mtg-label">Formato</label>
                  <Select 
                    value={newDeckData.format} 
                    onValueChange={(value) => setNewDeckData(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger className="mtg-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="mtg-dropdown">
                      <SelectItem value="Standard" className="mtg-dropdown-item">Standard</SelectItem>
                      <SelectItem value="Pioneer" className="mtg-dropdown-item">Pioneer</SelectItem>
                      <SelectItem value="Modern" className="mtg-dropdown-item">Modern</SelectItem>
                      <SelectItem value="Legacy" className="mtg-dropdown-item">Legacy</SelectItem>
                      <SelectItem value="Vintage" className="mtg-dropdown-item">Vintage</SelectItem>
                      <SelectItem value="Commander" className="mtg-dropdown-item">Commander</SelectItem>
                      <SelectItem value="Pauper" className="mtg-dropdown-item">Pauper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mtg-label">Cores</label>
                  <div className="flex gap-3">
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
                          const newColors = newDeckData.colors.includes(color)
                            ? newDeckData.colors.filter(c => c !== color)
                            : [...newDeckData.colors, color]
                          setNewDeckData(prev => ({ ...prev, colors: newColors }))
                        }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold transition-all ${
                          newDeckData.colors.includes(color)
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

                <div>
                  <label className="mtg-label">Descrição (Opcional)</label>
                  <Textarea
                    value={newDeckData.description}
                    onChange={(e) => setNewDeckData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva a estratégia do seu deck..."
                    className="mtg-textarea"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateDeck}
                    className="quantum-btn quantum-btn-primary flex-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Criar Deck</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingDeck(false)
                      setNewDeckData({ name: '', format: 'Standard', colors: [], description: '' })
                    }}
                    className="quantum-btn quantum-btn-compact"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mtg-card mb-8">
        <div className="mtg-card-header">
          <Filter className="mtg-card-icon" />
          <div className="mtg-card-content">
            <h3 className="mtg-card-title">Filtros e Busca</h3>
            <p className="mtg-card-description">Encontre rapidamente o deck que você procura</p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="mtg-grid-3 gap-4">
            <div>
              <label className="mtg-label">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Nome do deck..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="mtg-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="mtg-label">Formato</label>
              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger className="mtg-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="mtg-dropdown">
                  <SelectItem value="all" className="mtg-dropdown-item">Todos os Formatos</SelectItem>
                  <SelectItem value="Standard" className="mtg-dropdown-item">Standard</SelectItem>
                  <SelectItem value="Pioneer" className="mtg-dropdown-item">Pioneer</SelectItem>
                  <SelectItem value="Modern" className="mtg-dropdown-item">Modern</SelectItem>
                  <SelectItem value="Legacy" className="mtg-dropdown-item">Legacy</SelectItem>
                  <SelectItem value="Vintage" className="mtg-dropdown-item">Vintage</SelectItem>
                  <SelectItem value="Commander" className="mtg-dropdown-item">Commander</SelectItem>
                  <SelectItem value="Pauper" className="mtg-dropdown-item">Pauper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mtg-label">Ordenar por</label>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-') as [typeof sortBy, typeof sortOrder]
                setSortBy(field)
                setSortOrder(order)
              }}>
                <SelectTrigger className="mtg-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="mtg-dropdown">
                  <SelectItem value="date-desc" className="mtg-dropdown-item">Mais Recente</SelectItem>
                  <SelectItem value="date-asc" className="mtg-dropdown-item">Mais Antigo</SelectItem>
                  <SelectItem value="name-asc" className="mtg-dropdown-item">Nome A-Z</SelectItem>
                  <SelectItem value="name-desc" className="mtg-dropdown-item">Nome Z-A</SelectItem>
                  <SelectItem value="cards-desc" className="mtg-dropdown-item">Mais Cartas</SelectItem>
                  <SelectItem value="cards-asc" className="mtg-dropdown-item">Menos Cartas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Deck List */}
      <div className="space-y-6">
        {filteredDecks.length === 0 ? (
          <div className="mtg-card text-center py-12">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchFilter || formatFilter !== 'all' ? 'Nenhum deck encontrado' : 'Nenhum deck criado ainda'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchFilter || formatFilter !== 'all' 
                ? 'Tente ajustar os filtros para encontrar o que procura'
                : 'Comece criando seu primeiro deck personalizado'
              }
            </p>
            {!searchFilter && formatFilter === 'all' && (
              <button
                onClick={() => setIsCreatingDeck(true)}
                className="quantum-btn quantum-btn-primary"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeiro Deck</span>
              </button>
            )}
          </div>
        ) : (
          <div className="mtg-grid gap-6">
            {filteredDecks.map(deck => {
              const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0)
              const colorCount = deck.colors?.length || 0
              
              return (
                <div key={deck.id} className="mtg-card mtg-card-interactive">
                  <div className="mtg-card-header">
                    <div className="flex-1">
                      <h3 className="mtg-card-title">{deck.name}</h3>
                      <p className="mtg-card-description">
                        {deck.description || 'Deck sem descrição'}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="mtg-badge mtg-badge-primary">{deck.format}</span>
                        <span className="mtg-badge mtg-badge-secondary">
                          {totalCards} carta{totalCards !== 1 ? 's' : ''}
                        </span>
                        {colorCount > 0 && (
                          <span className="mtg-badge mtg-badge-accent">
                            {colorCount} cor{colorCount !== 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedDeck(deck.id)
                          setViewMode('viewer')
                        }}
                        className="quantum-btn quantum-btn-compact"
                        title="Visualizar deck"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDeck(deck.id)
                          setViewMode('builder')
                        }}
                        className="quantum-btn quantum-btn-compact"
                        title="Editar deck"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateDeck(deck.id)}
                        className="quantum-btn quantum-btn-compact"
                        title="Duplicar deck"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeck(deck.id)}
                        className="quantum-btn quantum-btn-compact text-red-400 hover:text-red-300"
                        title="Deletar deck"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Statistics Summary */}
      {decks.length > 0 && (
        <div className="mtg-card">
          <div className="mtg-card-header">
            <BarChart3 className="mtg-card-icon" />
            <div className="mtg-card-content">
              <h3 className="mtg-card-title">Estatísticas dos Decks</h3>
              <p className="mtg-card-description">Resumo da sua coleção de decks</p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="mtg-grid">
              <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400">{decks.length}</div>
                <div className="text-sm text-slate-400">Total de Decks</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">
                  {decks.reduce((sum, deck) => sum + deck.cards.reduce((cardSum, card) => cardSum + card.quantity, 0), 0)}
                </div>
                <div className="text-sm text-slate-400">Total de Cartas</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">
                  {new Set(decks.map(d => d.format)).size}
                </div>
                <div className="text-sm text-slate-400">Formatos Diferentes</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round(decks.reduce((sum, deck) => 
                    sum + deck.cards.reduce((cardSum, card) => cardSum + card.quantity, 0), 0
                  ) / decks.length)}
                </div>
                <div className="text-sm text-slate-400">Média de Cartas</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
