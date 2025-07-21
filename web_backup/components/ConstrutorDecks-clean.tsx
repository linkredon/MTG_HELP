"use client"

import { useState, useEffect } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import DeckBuilder from '@/components/DeckBuilder'
import DeckImporter from '@/components/DeckImporter'
import dynamic from 'next/dynamic'
import { 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Save, 
  Search, 
  FileText,
  Download,
  Upload,
  Calendar,
  Tag,
  Grid,
  List,
  Filter,
  Eye,
  X,
  Check,
  Package
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
      const newDeckId = await duplicarDeck(deckId)
      showNotification('success', 'Deck duplicado com sucesso!')
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
      showNotification('success', 'Deck removido com sucesso!')
    } catch (error) {
      showNotification('error', 'Erro ao remover deck')
    }
  }

  const toggleColor = (colorSymbol: string) => {
    setNewDeckData(prev => ({
      ...prev,
      colors: prev.colors.includes(colorSymbol)
        ? prev.colors.filter(c => c !== colorSymbol)
        : [...prev.colors, colorSymbol]
    }))
  }

  // Se estiver visualizando um deck
  if (viewMode === 'viewer' && selectedDeck) {
    return (
      <div className="p-8 text-center bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-2">Visualizador de Deck</h2>
        <p className="text-gray-400">Use o ConstrutorDecks.tsx para acessar o visualizador completo.</p>
        <Button onClick={() => {
          setSelectedDeck(null)
          setViewMode('list')
        }} className="mt-4">
          Voltar aos Decks
        </Button>
      </div>
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
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Notificação */}
      {notification.visible && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg text-card-foreground bg-gray-800/80 backdrop-blur-xl shadow-2xl overflow-hidden border-0 ${
          notification.type === 'success' ? 'border-green-500/30' :
          notification.type === 'error' ? 'border-red-500/30' : 'border-blue-500/30'
        } text-white border`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Construtor de Decks
        </h1>
        <p className="text-gray-400 text-lg">
          Crie, edite e gerencie seus decks de Magic: The Gathering
        </p>
      </div>

      {/* Ações Rápidas */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Criar Novo Deck</h4>
              <Button
                onClick={() => setIsCreatingDeck(true)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar do Zero
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Importar Lista de Deck</h4>
              <DeckImporter 
                onImportSuccess={() => showNotification('success', 'Deck importado com sucesso!')}
                onImportError={(error: string) => showNotification('error', `Erro ao importar deck: ${error}`)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criação de Deck */}
      {isCreatingDeck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Criar Novo Deck</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Deck *
                </label>
                <Input
                  value={newDeckData.name}
                  onChange={(e) => setNewDeckData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Aggro Vermelho"
                  className="bg-gray-900/50 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Formato
                </label>
                <Select 
                  value={newDeckData.format} 
                  onValueChange={(value) => setNewDeckData(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Standard" className="text-white hover:bg-gray-700">Standard</SelectItem>
                    <SelectItem value="Pioneer" className="text-white hover:bg-gray-700">Pioneer</SelectItem>
                    <SelectItem value="Modern" className="text-white hover:bg-gray-700">Modern</SelectItem>
                    <SelectItem value="Legacy" className="text-white hover:bg-gray-700">Legacy</SelectItem>
                    <SelectItem value="Vintage" className="text-white hover:bg-gray-700">Vintage</SelectItem>
                    <SelectItem value="Commander" className="text-white hover:bg-gray-700">Commander</SelectItem>
                    <SelectItem value="Pauper" className="text-white hover:bg-gray-700">Pauper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cores
                </label>
                <div className="flex gap-2">
                  {['W', 'U', 'B', 'R', 'G'].map(color => (
                    <Button
                      key={color}
                      variant={newDeckData.colors.includes(color) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleColor(color)}
                      className={`w-8 h-8 p-0 ${
                        newDeckData.colors.includes(color)
                          ? color === 'W' ? 'bg-yellow-200 text-gray-900' :
                            color === 'U' ? 'bg-blue-500' :
                            color === 'B' ? 'bg-gray-900 text-white' :
                            color === 'R' ? 'bg-red-500' :
                            'bg-green-500'
                          : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <Textarea
                  value={newDeckData.description}
                  onChange={(e) => setNewDeckData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional do deck..."
                  className="bg-gray-900/50 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateDeck}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Criar Deck
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingDeck(false)
                    setNewDeckData({ name: '', format: 'Standard', colors: [], description: '' })
                  }}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Decks */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Meus Decks ({decks.length})</h2>
        </div>

        {decks.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-medium text-white mb-2">Nenhum deck criado</h3>
              <p className="text-gray-400 mb-6">
                Crie seu primeiro deck para começar a construir
              </p>
              <Button
                onClick={() => setIsCreatingDeck(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Card key={deck.id} className="bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-1">{deck.name}</h3>
                      <p className="text-gray-400 text-sm">{deck.description || 'Sem descrição'}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {deck.cards.length} cartas
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-1">
                      {deck.colors && deck.colors.map((color) => (
                        <div
                          key={color}
                          className={`w-5 h-5 rounded-full border-2 border-gray-600 ${
                            color === 'W' ? 'bg-yellow-100' :
                            color === 'U' ? 'bg-blue-500' :
                            color === 'B' ? 'bg-gray-900' :
                            color === 'R' ? 'bg-red-500' :
                            color === 'G' ? 'bg-green-500' :
                            'bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{deck.format}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDeck(deck.id)
                        setViewMode('viewer')
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDeck(deck.id)
                        setViewMode('builder')
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateDeck(deck.id)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteDeck(deck.id)}
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
