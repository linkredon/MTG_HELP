"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAppContext } from "@/contexts/AppContext"
import { Plus, Target, Users } from "lucide-react"
import type { MTGCard } from '@/types/mtg'

interface DeckSelectorProps {
  card?: MTGCard
  onAddToDeck?: (deckId: string, quantity: number, category: 'mainboard' | 'sideboard' | 'commander') => void
  onCreateDeck?: () => void
  className?: string
  showCreateDeck?: boolean
  defaultQuantity?: number
  showCategorySelect?: boolean
}

export default function DeckSelector({
  card,
  onAddToDeck,
  onCreateDeck,
  className = "",
  showCreateDeck = true,
  defaultQuantity = 1,
  showCategorySelect = true
}: DeckSelectorProps) {
  const { decks, criarDeck, adicionarCartaAoDeck } = useAppContext()
  const [selectedDeck, setSelectedDeck] = useState<string>("")
  const [quantity, setQuantity] = useState(defaultQuantity)
  const [category, setCategory] = useState<'mainboard' | 'sideboard' | 'commander'>('mainboard')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newDeckData, setNewDeckData] = useState({
    name: '',
    format: 'Standard',
    colors: [] as string[],
    description: '',
    isPublic: false,
    tags: [] as string[]
  })

  const handleAddToDeck = () => {
    if (!selectedDeck || !card) return
    
    if (onAddToDeck) {
      onAddToDeck(selectedDeck, quantity, category)
    } else {
      adicionarCartaAoDeck(selectedDeck, card, category, quantity)
    }
    
    // Reset form
    setQuantity(defaultQuantity)
  }

  const handleCreateDeck = () => {
    if (!newDeckData.name.trim()) return
    
    const deckToCreate = {
      ...newDeckData,
      cards: card ? [{ card, quantity, category }] : []
    }
    
    criarDeck(deckToCreate)
    setShowCreateForm(false)
    setNewDeckData({
      name: '',
      format: 'Standard',
      colors: [],
      description: '',
      isPublic: false,
      tags: []
    })
    
    if (onCreateDeck) {
      onCreateDeck()
    }
  }

  const formats = ['Standard', 'Modern', 'Legacy', 'Vintage', 'Commander', 'Pioneer', 'Historic', 'Pauper']
  const colors = [
    { code: 'W', name: 'Branco', color: 'bg-yellow-100' },
    { code: 'U', name: 'Azul', color: 'bg-blue-100' },
    { code: 'B', name: 'Preto', color: 'bg-gray-100' },
    { code: 'R', name: 'Vermelho', color: 'bg-red-100' },
    { code: 'G', name: 'Verde', color: 'bg-green-100' }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Seletor de Deck Existente */}
      {decks.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Adicionar a Deck Existente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedDeck} onValueChange={setSelectedDeck}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                <SelectValue placeholder="Selecione um deck..." />
              </SelectTrigger>
              <SelectContent>
                {decks.map(deck => (
                  <SelectItem key={deck.id} value={deck.id}>
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3" />
                      <span>{deck.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {deck.format}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {deck.cards.reduce((sum, c) => sum + c.quantity, 0)} cartas
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Quantidade</label>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              
              {showCategorySelect && (
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Categoria</label>
                  <Select value={category} onValueChange={(value: 'mainboard' | 'sideboard' | 'commander') => setCategory(value)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mainboard">Deck Principal</SelectItem>
                      <SelectItem value="sideboard">Sideboard</SelectItem>
                      <SelectItem value="commander">Commander</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button
              onClick={handleAddToDeck}
              disabled={!selectedDeck}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar ao Deck
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Criar Novo Deck */}
      {showCreateDeck && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Criar Novo Deck</CardTitle>
          </CardHeader>
          <CardContent>
            {!showCreateForm ? (
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Deck
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nome do Deck</label>
                  <Input
                    value={newDeckData.name}
                    onChange={(e) => setNewDeckData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do deck..."
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Formato</label>
                  <Select 
                    value={newDeckData.format} 
                    onValueChange={(value) => setNewDeckData(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map(format => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">Cores do Deck</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(color => (
                      <Button
                        key={color.code}
                        size="sm"
                        variant={newDeckData.colors.includes(color.code) ? "default" : "outline"}
                        onClick={() => {
                          setNewDeckData(prev => ({
                            ...prev,
                            colors: prev.colors.includes(color.code)
                              ? prev.colors.filter(c => c !== color.code)
                              : [...prev.colors, color.code]
                          }))
                        }}
                        className={`text-xs ${
                          newDeckData.colors.includes(color.code)
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "border-gray-600 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {color.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Descrição (opcional)</label>
                  <Textarea
                    value={newDeckData.description}
                    onChange={(e) => setNewDeckData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do deck..."
                    rows={2}
                    className="bg-gray-700/50 border-gray-600 text-white resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateDeck}
                    disabled={!newDeckData.name.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Criar Deck
                  </Button>
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informação de Decks Vazios */}
      {decks.length === 0 && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="text-center py-6">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-500" />
            <p className="text-gray-400 text-sm">
              Você ainda não criou nenhum deck
            </p>
            {showCreateDeck && (
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                size="sm"
                className="mt-3 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Plus className="w-3 h-3 mr-2" />
                Criar Primeiro Deck
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
