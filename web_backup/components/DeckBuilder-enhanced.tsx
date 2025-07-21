"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Plus, Bookmark, ExternalLink, X, Info, Layers, Palette, Search, Filter, RefreshCw, Trash2, Edit3, Save, Eye, EyeOff, Grid3X3, List, PlusCircle, MinusCircle, ArrowUpDown, ArrowUp, ArrowDown, Settings, Package } from "lucide-react"
import { useCardModal } from "../contexts/CardModalContext"
import { useAppContext } from "../contexts/AppContext"
import { getImageUrl } from "../utils/imageService"
import CardSearchModal from "./CardSearchModal"
import type { MTGCard } from "@/types/mtg"
import "../styles/deck-builder-enhanced.css"

// Constantes para filtros
const raridades = ["all", "common", "uncommon", "rare", "mythic", "special", "bonus"]
const tipos = [
  "all", "creature", "artifact", "enchantment", "instant", "sorcery", 
  "planeswalker", "land", "token", "artifact creature", "enchantment creature"
]
const subtipos = [
  "all", "elf", "goblin", "zombie", "angel", "dragon", "vampire", "wizard", 
  "warrior", "human", "beast", "spirit", "sliver", "merfolk", "dinosaur", 
  "giant", "elemental", "knight", "soldier", "rogue", "cleric"
]
const supertipos = ["all", "legendary", "basic", "snow", "world", "ongoing"]
const foils = ["all", "foil", "nonfoil"]
const coresMana = ["W", "U", "B", "R", "G", "C"]

interface DeckBuilderEnhancedProps {
  deckId?: string
}

export default function DeckBuilderEnhanced({ deckId }: DeckBuilderEnhancedProps) {
  const { openModal } = useCardModal()
  const { decks, editarDeck, deletarDeck } = useAppContext()
  
  // Estado do deck
  const [deck, setDeck] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Estados para visualização (igual ao EnhancedCardDisplay)
  const [viewMode, setViewMode] = useState<'grid' | 'spoiler'>('grid')
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados para busca de cartas
  const [showSearchModal, setShowSearchModal] = useState(false)
  
  // Estados para edição do deck
  const [editingDeck, setEditingDeck] = useState({
    name: '',
    format: '',
    description: '',
    colors: [] as string[],
    tags: [] as string[]
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Estados para modais
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [moveCardData, setMoveCardData] = useState<{
    cardId: string
    fromCategory: 'mainboard' | 'sideboard' | 'commander'
    toCategory: 'mainboard' | 'sideboard' | 'commander'
    cardName: string
    currentQuantity: number
  } | null>(null)
  
  // Carregar deck
  useEffect(() => {
    if (deckId) {
      const foundDeck = decks.find(d => d.id === deckId)
      if (foundDeck) {
        setDeck(foundDeck)
        setEditingDeck({
          name: foundDeck.name || '',
          format: foundDeck.format || '',
          description: foundDeck.description || '',
          colors: foundDeck.colors || [],
          tags: foundDeck.tags || []
        })
      }
    }
  }, [deckId, decks])
  

  
  // Função para adicionar carta ao deck com validação de commander
  const handleAddCardToDeck = (card: MTGCard, category: 'mainboard' | 'sideboard' | 'commander', quantity: number = 1) => {
    if (!deck) return
    
    // Validação especial para commander
    if (category === 'commander') {
      // Verificar se é lendária
      if (!card.type_line?.toLowerCase().includes('legendary')) {
        alert('Apenas cartas lendárias podem ser commander.')
        return
      }
      
      // Verificar se já tem commander
      const existingCommander = deck.cards?.find((deckCard: any) => {
        const cardData = deckCard.card || deckCard.cardData
        return deckCard.category === 'commander' && cardData?.id !== card.id
      })
      
      if (existingCommander) {
        const existingCardData = existingCommander.card || existingCommander.cardData
        const hasPartner = existingCardData?.type_line?.toLowerCase().includes('partner')
        const newCardHasPartner = card.type_line?.toLowerCase().includes('partner')
        
        // Se o commander atual tem partner e a nova carta também tem partner, pode adicionar
        if (hasPartner && newCardHasPartner) {
          // OK - pode ter dois commanders parceiros
        } else {
          // Perguntar se quer substituir
          if (!confirm(`Você já tem um commander: ${existingCardData?.name}. Deseja substituí-lo por ${card.name}?`)) {
            return
          }
        }
      }
    }
    
    const existingCard = deck.cards?.find((deckCard: any) => {
      const cardData = deckCard.card || deckCard.cardData
      return cardData?.id === card.id && deckCard.category === category
    })
    
    if (existingCard) {
      const updatedCards = deck.cards.map((deckCard: any) => {
        const cardData = deckCard.card || deckCard.cardData
        if (cardData?.id === card.id && deckCard.category === category) {
          return { ...deckCard, quantity: deckCard.quantity + quantity }
        }
        return deckCard
      })
      setDeck({ ...deck, cards: updatedCards })
      setHasUnsavedChanges(true)
    } else {
      const newCard = {
        card: card,
        quantity: quantity,
        category: category
      }
          const updatedCards = [...(deck.cards || []), newCard]
    setDeck({ ...deck, cards: updatedCards })
    setHasUnsavedChanges(true)
    }
  }
  
  // Função para abrir modal da carta
  const handleCardClick = (card: MTGCard) => {
    openModal(card)
  }
  
  // Função para mover carta entre categorias
  const handleMoveCard = (cardId: string, fromCategory: 'mainboard' | 'sideboard' | 'commander', toCategory: 'mainboard' | 'sideboard' | 'commander') => {
    if (!deck) return
    
    const updatedCards = deck.cards.map((deckCard: any) => {
      const cardData = deckCard.card || deckCard.cardData
      if (cardData?.id === cardId && deckCard.category === fromCategory) {
        return { ...deckCard, category: toCategory }
      }
      return deckCard
    })
    setDeck({ ...deck, cards: updatedCards })
    setHasUnsavedChanges(true)
  }

  // Função para abrir modal de mover carta
  const handleMoveCardWithQuantity = (cardId: string, fromCategory: 'mainboard' | 'sideboard' | 'commander', toCategory: 'mainboard' | 'sideboard' | 'commander', cardName: string, currentQuantity: number) => {
    setMoveCardData({
      cardId,
      fromCategory,
      toCategory,
      cardName,
      currentQuantity
    })
    setShowMoveModal(true)
  }

  // Função para executar o movimento com quantidade
  const executeMoveCard = (quantity: number) => {
    if (!moveCardData || !deck) return
    
    const { cardId, fromCategory, toCategory } = moveCardData
    
    // Sempre cria uma nova entrada na categoria de destino com a quantidade especificada
    const updatedCards = deck.cards.map((deckCard: any) => {
      const cardData = deckCard.card || deckCard.cardData
      if (cardData?.id === cardId && deckCard.category === fromCategory) {
        return { ...deckCard, quantity: deckCard.quantity - quantity }
      }
      return deckCard
    }).filter((deckCard: any) => deckCard.quantity > 0)
    
    // Adiciona a nova entrada na categoria de destino
    const sourceCard = deck.cards.find((deckCard: any) => {
      const cardData = deckCard.card || deckCard.cardData
      return cardData?.id === cardId && deckCard.category === fromCategory
    })
    
    if (sourceCard) {
      const newCard = {
        ...sourceCard,
        category: toCategory,
        quantity: quantity
      }
      updatedCards.push(newCard)
    }
    
    setDeck({ ...deck, cards: updatedCards })
    
    setHasUnsavedChanges(true)
    setShowMoveModal(false)
    setMoveCardData(null)
  }
  
  // Função para atualizar quantidade
  const handleUpdateQuantity = (cardId: string, category: 'mainboard' | 'sideboard' | 'commander', newQuantity: number) => {
    if (!deck) return
    
    const updatedCards = deck.cards.map((deckCard: any) => {
      const cardData = deckCard.card || deckCard.cardData
      if (cardData?.id === cardId && deckCard.category === category) {
        return { ...deckCard, quantity: newQuantity }
      }
      return deckCard
    }).filter((deckCard: any) => deckCard.quantity > 0)
    setDeck({ ...deck, cards: updatedCards })
    setHasUnsavedChanges(true)
  }
  
  // Função para remover carta
  const handleRemoveCard = (cardId: string, category: 'mainboard' | 'sideboard' | 'commander') => {
    if (!deck) return
    
    const updatedCards = deck.cards.filter((deckCard: any) => {
      const cardData = deckCard.card || deckCard.cardData
      return !(cardData?.id === cardId && deckCard.category === category)
    })
    setDeck({ ...deck, cards: updatedCards })
    setHasUnsavedChanges(true)
  }
  
  // Função para salvar deck
  const handleSaveDeck = async () => {
    if (!deck) return
    
    try {
      await editarDeck(deck.id, deck)
      setIsEditing(false)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Erro ao salvar deck:', error)
    }
  }
  
  // Função para deletar deck
  const handleDeleteDeck = async () => {
    if (!deck) return
    
    try {
      await deletarDeck(deck.id)
    } catch (error) {
      console.error('Erro ao deletar deck:', error)
    }
  }
  
  // Obter commander atual
  const currentCommander = useMemo(() => {
    if (!deck?.cards) return null
    const commanderCard = deck.cards.find((deckCard: any) => deckCard.category === 'commander')
    if (commanderCard) {
      return commanderCard.card || commanderCard.cardData
    }
    return null
  }, [deck?.cards])
  
  // Verificar se tem commander parceiro
  const hasPartnerCommander = useMemo(() => {
    if (!currentCommander) return false
    return currentCommander.type_line?.toLowerCase().includes('partner')
  }, [currentCommander])
  
  // Calcular estatísticas do deck
  const deckStats = useMemo(() => {
    if (!deck?.cards) return { totalCards: 0, manaCurve: {}, colors: {} }
    
    const stats = {
      totalCards: 0,
      manaCurve: {} as Record<number, number>,
      colors: {} as Record<string, number>
    }
    
    deck.cards.forEach((deckCard: any) => {
      const cardData = deckCard.card || deckCard.cardData
      if (cardData) {
        stats.totalCards += deckCard.quantity
        
        const cmc = cardData.cmc || 0
        stats.manaCurve[cmc] = (stats.manaCurve[cmc] || 0) + deckCard.quantity
        
        if (cardData.color_identity) {
          cardData.color_identity.forEach((color: string) => {
            stats.colors[color] = (stats.colors[color] || 0) + deckCard.quantity
          })
        }
      }
    })
    
    return stats
  }, [deck?.cards])
  
  // Filtrar cartas do deck
  const filteredCards = useMemo(() => {
    let filtered = deck?.cards || []
    if (filterCategory !== 'all') {
      filtered = filtered.filter((card: any) => card.category === filterCategory)
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter((card: any) => {
        const cardData = card.card || card.cardData
        return cardData && cardData.name?.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }
    return filtered
  }, [deck?.cards, filterCategory, searchTerm])
  
  // Funções auxiliares para EnhancedCardDisplay
  const getCardData = (deckCard: any) => {
    return deckCard.card || deckCard.cardData || deckCard;
  };

  const getCardId = (deckCard: any) => {
    const cardData = getCardData(deckCard);
    return cardData?.id || deckCard.id;
  };

  const getCardName = (deckCard: any) => {
    const cardData = getCardData(deckCard);
    return cardData?.name || 'Unknown Card';
  };

  const getCardImageUrl = (deckCard: any, size: 'small' | 'normal' | 'large' = 'normal') => {
    const cardData = getCardData(deckCard);
    return getImageUrl(cardData, size);
  };
  
  if (!deck) {
    return <div className="p-6">Deck não encontrado</div>
  }
  
  // Agrupar cartas por categoria
  const cardsByCategory = {
    mainboard: filteredCards.filter(card => card.category === 'mainboard'),
    sideboard: filteredCards.filter(card => card.category === 'sideboard'),
    commander: filteredCards.filter(card => card.category === 'commander')
  };
  
  // Renderizar seções separadas para cada categoria
  const renderCategorySection = (title: string, categoryCards: any[], categoryClass: string) => {
    if (categoryCards.length === 0) return null;
    
    return (
      <div className="mb-6">
        <div className={`text-sm font-medium mb-2 pb-1 border-b ${categoryClass}`}>
          {title} ({categoryCards.reduce((sum, card) => sum + card.quantity, 0)} cartas)
        </div>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categoryCards.map((deckCard) => {
              const cardData = getCardData(deckCard);
              const cardId = getCardId(deckCard);
              const cardName = getCardName(deckCard);
              const imageUrl = getCardImageUrl(deckCard);
              
              return (
                <div key={`${cardId}-${deckCard.category}`} className="relative group">
                  <div className="aspect-[63/88] bg-gray-800/80 rounded-md overflow-hidden shadow-md">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={cardName}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handleCardClick(cardData)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                        {cardName}
                      </div>
                    )}
                    
                    <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                      {deckCard.quantity}
                    </div>
                    
                    {isEditing && (
                      <div className="absolute top-1 right-1 bg-black/70 rounded p-1 flex gap-1">
                        {deckCard.category !== 'mainboard' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveCardWithQuantity(cardId, deckCard.category, 'mainboard', cardName, deckCard.quantity);
                            }}
                            className="w-6 h-6 rounded bg-green-600/70 hover:bg-green-500 text-white flex items-center justify-center text-xs"
                            title="Mover para Main Deck"
                          >
                            M
                          </button>
                        )}
                        {deckCard.category !== 'sideboard' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveCardWithQuantity(cardId, deckCard.category, 'sideboard', cardName, deckCard.quantity);
                            }}
                            className="w-6 h-6 rounded bg-purple-600/70 hover:bg-purple-500 text-white flex items-center justify-center text-xs"
                            title="Mover para Sideboard"
                          >
                            S
                          </button>
                        )}
                        {deckCard.category !== 'commander' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveCardWithQuantity(cardId, deckCard.category, 'commander', cardName, deckCard.quantity);
                            }}
                            className="w-6 h-6 rounded bg-yellow-600/70 hover:bg-yellow-500 text-white flex items-center justify-center text-xs"
                            title="Mover para Commander"
                          >
                            C
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCard(cardId, deckCard.category);
                          }}
                          className="w-6 h-6 rounded bg-red-600/70 hover:bg-red-500 text-white flex items-center justify-center text-xs"
                          title="Remover carta"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {categoryCards.map((deckCard) => {
              const cardData = getCardData(deckCard);
              const cardId = getCardId(deckCard);
              const cardName = getCardName(deckCard);
              const imageUrl = getCardImageUrl(deckCard, 'normal');
              
              return (
                <div 
                  key={`${cardId}-${deckCard.category}`} 
                  className="flex gap-3 p-3 bg-gray-800/40 rounded border border-gray-700 hover:bg-gray-700/40 transition-colors group"
                >
                  <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={cardName}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handleCardClick(cardData)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
                        {cardName}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm truncate">{cardName}</h4>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {cardData.set_name} ({cardData.set_code?.toUpperCase()})
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {cardData.type_line}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditing && (
                      <>
                        <button
                          onClick={() => handleUpdateQuantity(cardId, deckCard.category, Math.max(0, deckCard.quantity - 1))}
                          className="w-6 h-6 rounded bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm">{deckCard.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(cardId, deckCard.category, deckCard.quantity + 1)}
                          className="w-6 h-6 rounded bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </>
                    )}
                    {!isEditing && (
                      <Badge variant="secondary">{deckCard.quantity}x</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="quantum-card min-h-[calc(100vh-80px)] p-0 m-0">
      {/* Header compacto */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-cyan-500/30 shadow-lg">
        <div className="flex items-center justify-between gap-2 p-2">
          <div className="flex items-center gap-2">
            <h2 className="text-md font-bold text-cyan-400 truncate">{deck.name}</h2>
            <span className="quantum-badge primary text-xs">{deck.format}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button className="quantum-btn compact" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            </button>
            <button className="quantum-btn compact" onClick={() => setShowSearchModal(true)}>
              <Search className="w-3.5 h-3.5" />
            </button>
            <button className="quantum-btn compact" onClick={() => setViewMode(viewMode === 'grid' ? 'spoiler' : 'grid')}>
              {viewMode === 'grid' ? <List className="w-3.5 h-3.5" /> : <Grid3X3 className="w-3.5 h-3.5" />}
            </button>
            <button className="quantum-btn compact" onClick={() => setShowEditModal(true)}>
              <Settings className="w-3.5 h-3.5" />
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
              Main ({cardsByCategory.mainboard.reduce((sum, card) => sum + card.quantity, 0)})
            </button>
            {cardsByCategory.sideboard.length > 0 && (
              <button 
                onClick={() => setFilterCategory('sideboard')}
                className={`quantum-btn compact ${filterCategory === 'sideboard' ? 'primary' : ''}`}
              >
                Side ({cardsByCategory.sideboard.reduce((sum, card) => sum + card.quantity, 0)})
              </button>
            )}
            {cardsByCategory.commander.length > 0 && (
              <button 
                onClick={() => setFilterCategory('commander')}
                className={`quantum-btn compact ${filterCategory === 'commander' ? 'primary' : ''}`}
              >
                Cmd ({cardsByCategory.commander.reduce((sum, card) => sum + card.quantity, 0)})
              </button>
            )}
          </div>
        </div>
        

      </div>
      
      {/* Layout reorganizado - 2 colunas */}
      <div className="grid grid-cols-12 gap-4 p-2">
        {/* Coluna principal - Visualização do Deck */}
        <div className="col-span-12 sm:col-span-8" style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto', position: 'relative' }}>
          <div className="quantum-card-dense mb-4">
            <div className="flex justify-between items-center border-b border-cyan-500/20 p-2">
              <div>
                <span className="text-sm font-semibold text-cyan-400">Visualização do Deck</span>
                <div className="text-xs text-gray-400 mt-1">
                  <span className="text-cyan-400">{filteredCards.length}</span> cartas únicas • <span className="text-cyan-400">{deckStats.totalCards}</span> total
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-md">Main: {cardsByCategory.mainboard.reduce((sum, card) => sum + card.quantity, 0)}</div>
                {cardsByCategory.sideboard.length > 0 && (
                  <div className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded-md">Side: {cardsByCategory.sideboard.reduce((sum, card) => sum + card.quantity, 0)}</div>
                )}
                {cardsByCategory.commander.length > 0 && (
                  <div className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-md">Cmd: {cardsByCategory.commander.reduce((sum, card) => sum + card.quantity, 0)}</div>
                )}
              </div>
            </div>
            
            {/* Renderizar cartas usando EnhancedCardDisplay */}
            {filteredCards.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-70" />
                <p className="text-gray-400 text-sm">Nenhuma carta para exibir</p>
              </div>
            ) : (
              <div className="p-2">
                {renderCategorySection("Main Deck", cardsByCategory.mainboard, "text-green-400 border-green-500/30")}
                {renderCategorySection("Sideboard", cardsByCategory.sideboard, "text-purple-400 border-purple-500/30")}
                {renderCategorySection("Commander", cardsByCategory.commander, "text-yellow-400 border-yellow-500/30")}
              </div>
            )}
          </div>
          

        </div>
        
        {/* Coluna direita - Estatísticas */}
        <div className="col-span-12 sm:col-span-4 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
          <div className="quantum-card-dense">
            <div className="flex justify-between items-center border-b border-cyan-500/20 p-1">
              <span className="text-xs font-semibold text-cyan-400">Curva de Mana</span>
            </div>
            <div className="p-2 space-y-1">
              {Object.entries(deckStats.manaCurve).map(([cmc, count]) => (
                <div key={cmc} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4">{cmc}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(count / Math.max(...Object.values(deckStats.manaCurve), 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-300 w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="quantum-card-dense">
            <div className="flex justify-between items-center border-b border-cyan-500/20 p-1">
              <span className="text-xs font-semibold text-cyan-400">Cores</span>
            </div>
            <div className="p-2 space-y-1">
              {Object.entries(deckStats.colors).map(([color, count]) => (
                <div key={color} className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">{color}</span>
                  <span className="text-xs text-cyan-400 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
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
      
      {/* Botões de Ação */}
      {(isEditing || hasUnsavedChanges) && (
        <div className="fixed bottom-4 right-4 flex gap-2 z-50">
          <button className="quantum-btn" onClick={() => {
            setIsEditing(false)
            setHasUnsavedChanges(false)
          }}>
            Cancelar
          </button>
          <button className="quantum-btn primary" onClick={handleSaveDeck}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Deck
          </button>
        </div>
      )}
      
      {/* Modal de Edição do Deck */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="quantum-card">
          <DialogHeader>
            <DialogTitle className="quantum-card-title">Editar Informações do Deck</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="quantum-form-group">
              <label className="quantum-label" htmlFor="name">Nome</label>
              <input 
                id="name"
                type="text"
                className="quantum-input"
                value={editingDeck.name}
                onChange={(e) => setEditingDeck({ ...editingDeck, name: e.target.value })}
              />
            </div>
            
            <div className="quantum-form-group">
              <label className="quantum-label" htmlFor="format">Formato</label>
              <input 
                id="format"
                type="text"
                className="quantum-input"
                value={editingDeck.format}
                onChange={(e) => setEditingDeck({ ...editingDeck, format: e.target.value })}
              />
            </div>
            
            <div className="quantum-form-group">
              <label className="quantum-label" htmlFor="description">Descrição</label>
              <Textarea 
                id="description"
                className="quantum-textarea"
                value={editingDeck.description}
                onChange={(e) => setEditingDeck({ ...editingDeck, description: e.target.value })}
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button className="quantum-btn" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button className="quantum-btn primary" onClick={() => {
                setDeck({ ...deck, ...editingDeck })
                setShowEditModal(false)
              }}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="quantum-card">
          <DialogHeader>
            <DialogTitle className="quantum-card-title text-red-400">Excluir Deck</DialogTitle>
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
              <Button className="quantum-btn primary" style={{background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444'}} onClick={handleDeleteDeck}>
                <Trash2 className="w-4 h-4" />
                Excluir Permanentemente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Busca de Cartas */}
      <CardSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onAddCard={handleAddCardToDeck}
        currentCommander={currentCommander}
        hasPartnerCommander={hasPartnerCommander}
      />

      {/* Modal de Mover Carta */}
      <Dialog open={showMoveModal} onOpenChange={setShowMoveModal}>
        <DialogContent className="quantum-card max-w-md">
          <DialogHeader>
            <DialogTitle className="quantum-card-title">Mover Carta</DialogTitle>
          </DialogHeader>
          {moveCardData && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-300 mb-2">
                  Mover <strong className="text-cyan-400">{moveCardData.cardName}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  De: <span className="text-cyan-400">{moveCardData.fromCategory === 'mainboard' ? 'Main Deck' : moveCardData.fromCategory === 'sideboard' ? 'Sideboard' : 'Commander'}</span>
                  <br />
                  Para: <span className="text-cyan-400">{moveCardData.toCategory === 'mainboard' ? 'Main Deck' : moveCardData.toCategory === 'sideboard' ? 'Sideboard' : 'Commander'}</span>
                </p>
              </div>
              
              <div className="space-y-3">
                <label className="quantum-label">Quantidade a mover:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const newQuantity = Math.max(1, (moveCardData.currentQuantity || 1) - 1)
                      setMoveCardData({ ...moveCardData, currentQuantity: newQuantity })
                    }}
                    className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={moveCardData.currentQuantity}
                    value={moveCardData.currentQuantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1
                      const clampedValue = Math.max(1, Math.min(value, moveCardData.currentQuantity))
                      setMoveCardData({ ...moveCardData, currentQuantity: clampedValue })
                    }}
                    className="quantum-input text-center w-16"
                  />
                  <button
                    onClick={() => {
                      const newQuantity = Math.min(moveCardData.currentQuantity, moveCardData.currentQuantity + 1)
                      setMoveCardData({ ...moveCardData, currentQuantity: newQuantity })
                    }}
                    className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-400">
                    de {moveCardData.currentQuantity} total
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  className="quantum-btn" 
                  onClick={() => {
                    setShowMoveModal(false)
                    setMoveCardData(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  className="quantum-btn primary" 
                  onClick={() => executeMoveCard(moveCardData.currentQuantity)}
                >
                  Mover {moveCardData.currentQuantity} {moveCardData.currentQuantity === 1 ? 'carta' : 'cartas'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 