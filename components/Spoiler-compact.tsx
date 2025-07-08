"use client"

// Declaração global para evitar erros de tipo implícito
declare global {
  interface Function {
    __brand: 'typed';
  }
}

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Sparkles, Plus, Edit, Trash, Eye, EyeOff, Save, X, Upload, Image as ImageIcon, AlertTriangle, Pencil, Search, SortDesc } from "lucide-react"
import ImageUploader from "./ImageUploader"
import BatchUploader from "./BatchUploader"
import CardPreview from "./CardPreview"
import EditCardModal from "./EditCardModal"
import QuickEditModal from "./QuickEditModal"
import { loadSpoilerCards, saveSpoilerCards, addSpoilerCard, addSpoilerCards, removeSpoilerCard } from "@/utils/storage"
import type { MTGCard } from '@/types/mtg'

// Interface local para cartas de spoiler
interface SpoilerCard extends Partial<MTGCard> {
  set?: string;
  set_name?: string;
  spoilerSource?: string;
  isNew?: boolean;
  releaseDate?: string;
  // Estendendo image_uris para incluir propriedades adicionais
  image_uris?: {
    normal: string;
    small?: string;
    art_crop?: string;
    large?: string;
    png?: string;
  };
}

interface SpoilerProps {
  isAdmin?: boolean
}

export default function Spoiler({ isAdmin = false }: SpoilerProps) {
  // Definir o tipo para o parâmetro prev em todas as funções de atualização de estado
  type SetCardsCallback = (prev: SpoilerCard[]) => SpoilerCard[];
  const [cards, setCards] = useState<SpoilerCard[]>([])
  // Tipando a função setCards para evitar erros de tipo implícito
  const typedSetCards = (callback: (prev: SpoilerCard[]) => SpoilerCard[]) => setCards(callback)
  const [currentSet, setCurrentSet] = useState("Edges of Eternities")
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  const [newCard, setNewCard] = useState<Partial<SpoilerCard>>({
    name: "",
    type_line: "",
    oracle_text: "",
    mana_cost: "",
    image_uris: { normal: "" },
    rarity: "common",
    set: "eoe",
    set_name: "Edges of Eternities",
    isNew: true,
    releaseDate: new Date().toISOString().split('T')[0],
    spoilerSource: ""
  })
  const [isAdminMode, setIsAdminMode] = useState(isAdmin)
  const [activeTab, setActiveTab] = useState("form")
  const [previewCard, setPreviewCard] = useState<SpoilerCard | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<SpoilerCard | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isQuickEditModalOpen, setIsQuickEditModalOpen] = useState(false)
  const [quickEditImageUrl, setQuickEditImageUrl] = useState("")

  const [storageError, setStorageError] = useState<string | null>(null)

  // Carregar cartas do localStorage ao inicializar
  useEffect(() => {
    try {
      const loadedCards = loadSpoilerCards()
      
      // Ordenar as cartas por ordem decrescente (mais recentes primeiro)
      const sortedCards = [...loadedCards].sort((a, b) => {
        // Ordenar por ID (que contém timestamp) ou data de adição
        const idA = a.id ? a.id.split('-')[1] || '0' : '0';
        const idB = b.id ? b.id.split('-')[1] || '0' : '0';
        return parseInt(idB) - parseInt(idA);
      });
      
      setCards(sortedCards)
      setStorageError(null)
    } catch (error) {
      console.error('Erro ao carregar cartas de spoiler:', error)
      setStorageError('Erro ao carregar cartas de spoiler. Algumas imagens podem não estar disponíveis.')
    }
  }, [])

  // Salvar cartas no localStorage quando houver alterações
  useEffect(() => {
    if (cards.length > 0) {
      try {
        const success = saveSpoilerCards(cards)
        if (!success) {
          setStorageError('Aviso: Algumas imagens podem não ter sido salvas devido a limitações de armazenamento.')
        } else {
          setStorageError(null)
        }
      } catch (error) {
        console.error('Erro ao salvar cartas de spoiler:', error)
        setStorageError('Erro ao salvar cartas. Algumas imagens podem não ter sido salvas.')
      }
    }
  }, [cards])

  // Função para adicionar uma nova carta
  const addCard = () => {
    if (!newCard.name && !newCard.image_uris?.normal) {
      alert('Nome ou imagem são obrigatórios')
      return
    }

    const cardToAdd: SpoilerCard = {
      id: `spoiler-${Date.now()}`,
      name: newCard.name || "Carta sem nome",
      type_line: newCard.type_line || "",
      oracle_text: newCard.oracle_text || "",
      mana_cost: newCard.mana_cost || "",
      cmc: calculateCMC(newCard.mana_cost || ""),
      image_uris: { 
        normal: newCard.image_uris?.normal || "",
        large: newCard.image_uris?.normal || "",
        png: newCard.image_uris?.normal || "",
        art_crop: newCard.image_uris?.normal || ""
      },
      rarity: newCard.rarity || "common",
      set: newCard.set || "eoe",
      set_name: newCard.set_name || "Edges of Eternities",
      collector_number: `${cards.length + 1}`,
      isNew: true,
      releaseDate: newCard.releaseDate || new Date().toISOString().split('T')[0],
      spoilerSource: newCard.spoilerSource || ""
    }

    try {
      // Adicionar a carta usando a função de armazenamento
      const success = addSpoilerCard(cardToAdd)
      if (success) {
        setCards((prev: SpoilerCard[]) => [cardToAdd, ...prev])
        setIsAddCardModalOpen(false)
        resetNewCard()
      } else {
        setStorageError('Não foi possível adicionar a carta devido a limitações de armazenamento.')
      }
    } catch (error) {
      console.error('Erro ao adicionar carta:', error)
      setStorageError('Erro ao adicionar carta. Tente novamente com uma imagem menor.')
    }
  }

  // Função para adicionar várias cartas em lote
  const addBatchCards = (batchCards: Partial<SpoilerCard>[]) => {
    const newCards = batchCards.map((card, index) => ({
      id: `spoiler-batch-${Date.now()}-${index}`,
      name: card.name || "Carta sem nome",
      type_line: card.type_line || "",
      oracle_text: card.oracle_text || "",
      mana_cost: card.mana_cost || "",
      cmc: calculateCMC(card.mana_cost || ""),
      image_uris: { 
        normal: card.image_uris?.normal || "",
        large: card.image_uris?.large || card.image_uris?.normal || "",
        png: card.image_uris?.png || card.image_uris?.normal || "",
        art_crop: card.image_uris?.art_crop || card.image_uris?.normal || ""
      },
      rarity: card.rarity || "common",
      set: card.set || "eoe",
      set_name: card.set_name || "Edges of Eternities",
      collector_number: `${cards.length + index + 1}`,
      isNew: true,
      releaseDate: card.releaseDate || new Date().toISOString().split('T')[0],
      spoilerSource: card.spoilerSource || ""
    }))

    try {
      // Adicionar as cartas usando a função de armazenamento
      const success = addSpoilerCards(newCards)
      if (success) {
        setCards(prev => [...newCards, ...prev])
        setIsAddCardModalOpen(false)
      } else {
        setStorageError('Algumas cartas podem não ter sido adicionadas devido a limitações de armazenamento.')
        // Ainda assim, atualizar o estado com as cartas que foram adicionadas
        setCards(prev => [...newCards, ...prev])
        setIsAddCardModalOpen(false)
      }
    } catch (error) {
      console.error('Erro ao adicionar cartas em lote:', error)
      setStorageError('Erro ao adicionar cartas em lote. Tente novamente com menos imagens ou imagens menores.')
    }
  }

  // Função para calcular o CMC a partir do custo de mana
  const calculateCMC = (manaCost: string): number => {
    // Remover chaves e contar os símbolos
    const symbols = manaCost.replace(/[{}]/g, '').split('')
    let cmc = 0
    
    for (const symbol of symbols) {
      if (!isNaN(parseInt(symbol))) {
        cmc += parseInt(symbol)
      } else if (symbol !== 'X' && symbol !== 'Y' && symbol !== 'Z') {
        cmc += 1
      }
    }
    
    return cmc
  }

  // Função para remover uma carta
  const removeCard = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta carta?')) {
      try {
        // Remover a carta usando a função de armazenamento
        const success = removeSpoilerCard(id)
        if (success) {
          setCards(prev => prev.filter(card => card.id !== id))
        } else {
          setStorageError('Erro ao remover a carta do armazenamento.')
          // Ainda assim, atualizar o estado
          setCards(prev => prev.filter(card => card.id !== id))
        }
      } catch (error) {
        console.error('Erro ao remover carta:', error)
        setStorageError('Erro ao remover carta. Tente novamente.')
      }
    }
  }
  
  // Função para abrir o preview da carta
  const openCardPreview = (card: SpoilerCard) => {
    setPreviewCard(card)
    setIsPreviewOpen(true)
  }
  
  // Função para abrir o modal de edição da carta
  const openEditModal = (card: SpoilerCard) => {
    setEditingCard({...card})
    setIsEditModalOpen(true)
  }
  
  // Função para abrir o modal de edição rápida
  const openQuickEditModal = (imageUrl: string) => {
    setQuickEditImageUrl(imageUrl)
    setIsQuickEditModalOpen(true)
  }
  
  // Função para salvar os detalhes da edição rápida
  const saveQuickEditDetails = (cardDetails: Partial<SpoilerCard>) => {
    // Criar uma nova carta com os detalhes fornecidos
    const newCard: SpoilerCard = {
      id: `spoiler-${Date.now()}`,
      name: cardDetails.name || "Carta sem nome",
      type_line: cardDetails.type_line || "",
      oracle_text: cardDetails.oracle_text || "",
      mana_cost: cardDetails.mana_cost || "",
      cmc: calculateCMC(cardDetails.mana_cost || ""),
      image_uris: { 
        normal: cardDetails.image_uris?.normal || "",
        large: cardDetails.image_uris?.normal || "",
        png: cardDetails.image_uris?.normal || "",
        art_crop: cardDetails.image_uris?.normal || ""
      },
      rarity: cardDetails.rarity || "common",
      set: cardDetails.set || "eoe",
      set_name: cardDetails.set_name || "Edges of Eternities",
      collector_number: `${cards.length + 1}`,
      isNew: true,
      releaseDate: new Date().toISOString().split('T')[0],
      spoilerSource: ""
    }
    
    // Adicionar a carta usando a função de armazenamento
    try {
      const success = addSpoilerCard(newCard)
      if (success) {
        // Adicionar a carta no início da lista (ordem decrescente)
        setCards((prev: SpoilerCard[]) => [newCard, ...prev])
      } else {
        setStorageError('Não foi possível adicionar a carta devido a limitações de armazenamento.')
      }
    } catch (error) {
      console.error('Erro ao adicionar carta:', error)
      setStorageError('Erro ao adicionar carta. Tente novamente com uma imagem menor.')
    }
  }
  
  // Função para salvar as alterações na carta
  const saveCardChanges = () => {
    if (!editingCard) return
    
    try {
      // Atualizar a carta na lista
      const updatedCards = cards.map(card => 
        card.id === editingCard.id ? editingCard : card
      )
      
      // Salvar as cartas atualizadas
      const success = saveSpoilerCards(updatedCards)
      if (success) {
        setCards(updatedCards)
        setIsEditModalOpen(false)
        setEditingCard(null)
      } else {
        setStorageError('Erro ao salvar as alterações da carta.')
        // Ainda assim, atualizar o estado
        setCards(updatedCards)
        setIsEditModalOpen(false)
        setEditingCard(null)
      }
    } catch (error) {
      console.error('Erro ao salvar alterações da carta:', error)
      setStorageError('Erro ao salvar alterações da carta. Tente novamente.')
    }
  }

  // Função para resetar o formulário de nova carta
  const resetNewCard = () => {
    setNewCard({
      name: "",
      type_line: "",
      oracle_text: "",
      mana_cost: "",
      image_uris: { normal: "" },
      rarity: "common",
      set: "eoe",
      set_name: "Edges of Eternities",
      isNew: true,
      releaseDate: new Date().toISOString().split('T')[0],
      spoilerSource: ""
    })
    setActiveTab("form")
  }

  // Função para alternar o modo de administração
  const toggleAdminMode = () => {
    // Em um ambiente real, aqui teria autenticação
    setIsAdminMode((prev: boolean) => !prev)
  }

  // Função para lidar com o upload de uma única imagem
  const handleImageUploaded = (imageUrl: string) => {
    setNewCard((prev: Partial<SpoilerCard>) => ({
      ...prev,
      image_uris: { ...prev.image_uris, normal: imageUrl }
    }))
  }
  
  // Função para lidar com o upload de múltiplas imagens
  const handleMultipleImagesUploaded = (imageUrls: string[]) => {
    // Se não houver imagens, não faz nada
    if (imageUrls.length === 0) return
    
    // Se houver apenas uma imagem, usa a função de imagem única
    if (imageUrls.length === 1) {
      handleImageUploaded(imageUrls[0])
      return
    }
    
    // Cria cartas para cada imagem
    const newCards = imageUrls.map((imageUrl, index) => ({
      id: `spoiler-${Date.now()}-${index}`,
      name: newCard.name || `Carta ${index + 1}`,
      type_line: newCard.type_line || "",
      oracle_text: newCard.oracle_text || "",
      mana_cost: newCard.mana_cost || "",
      cmc: calculateCMC(newCard.mana_cost || ""),
      image_uris: { 
        normal: imageUrl,
        large: imageUrl,
        png: imageUrl,
        art_crop: imageUrl
      },
      rarity: newCard.rarity || "common",
      set: newCard.set || "eoe",
      set_name: newCard.set_name || "Edges of Eternities",
      collector_number: `${cards.length + index + 1}`,
      isNew: true,
      releaseDate: newCard.releaseDate || new Date().toISOString().split('T')[0],
      spoilerSource: newCard.spoilerSource || ""
    }))
    
    try {
      // Adicionar as cartas usando a função de armazenamento
      const success = addSpoilerCards(newCards)
      if (success) {
        setCards(prev => [...newCards, ...prev])
        setIsAddCardModalOpen(false)
        resetNewCard()
      } else {
        setStorageError('Algumas imagens podem não ter sido salvas devido a limitações de armazenamento.')
        // Ainda assim, atualizar o estado com as cartas que foram adicionadas
        setCards(prev => [...newCards, ...prev])
        setIsAddCardModalOpen(false)
        resetNewCard()
      }
    } catch (error) {
      console.error('Erro ao adicionar múltiplas imagens:', error)
      setStorageError('Erro ao adicionar múltiplas imagens. Tente novamente com menos imagens ou imagens menores.')
    }
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="quantum-card-dense p-4 mb-4 card-purple">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Spoilers: {currentSet}</h2>
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAdminMode}
              className="text-gray-400 hover:text-white"
            >
              {isAdminMode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {isAdminMode ? "Modo Visualização" : "Modo Admin"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Confira os spoilers mais recentes da próxima coleção de Magic: The Gathering
        </p>
      </div>

      {/* Admin Controls */}
      {isAdminMode && (
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsAddCardModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Carta
            </Button>
            <Button 
              variant="outline"
              className="border-cyan-800/50 text-cyan-400"
              onClick={() => {
                // Garantir que as cartas estejam em ordem decrescente (mais recentes primeiro)
                const sortedCards = [...cards].sort((a, b) => {
                  // Ordenar por ID (que contém timestamp) ou data de adição
                  const idA = a.id ? a.id.split('-')[1] || '0' : '0';
                  const idB = b.id ? b.id.split('-')[1] || '0' : '0';
                  return parseInt(idB) - parseInt(idA);
                });
                setCards(sortedCards);
              }}
            >
              <SortDesc className="w-4 h-4 mr-1" />
              Ordenar por Recentes
            </Button>
          </div>
          <div className="text-xs text-gray-400">
            {cards.length} cartas no spoiler
          </div>
        </div>
      )}
      
      {/* Mensagem de erro de armazenamento */}
      {storageError && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-md flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-200">{storageError}</p>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {cards.map(card => (
          <div 
            key={card.id} 
            className="relative rounded-lg overflow-hidden transition-all hover:scale-[1.03] group cursor-pointer"
            onClick={() => openCardPreview(card)}
          >
            <div className="relative">
              <Image
                src={card.image_uris?.normal || '/placeholder.png'}
                alt={card.name || 'Carta sem nome'}
                width={265}
                height={370}
                className="w-full h-auto"
              />
              {card.isNew && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center h-5 px-2 rounded-md text-[10px] font-medium bg-purple-900/70 text-purple-200">
                    Novo
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white truncate">{card.name}</span>
                  <span className="text-xs text-gray-300">{card.rarity}</span>
                </div>
              </div>
              
              {/* Admin Controls Overlay */}
              {isAdminMode && (
                <div 
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(card);
                    }}
                    className="w-8 h-8 p-0 rounded-full bg-blue-900/50 border-blue-700"
                  >
                    <Pencil className="w-4 h-4 text-blue-400" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCard(card.id || '');
                    }}
                    className="w-8 h-8 p-0 rounded-full"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Card Preview Modal */}
      <CardPreview 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        card={previewCard}
      />
      
      {/* Edit Card Modal */}
      <EditCardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        card={editingCard}
        onSave={saveCardChanges}
      />
      
      {/* Quick Edit Modal */}
      <QuickEditModal
        isOpen={isQuickEditModalOpen}
        onClose={() => setIsQuickEditModalOpen(false)}
        imageUrl={quickEditImageUrl}
        onSave={saveQuickEditDetails}
      />

      {/* Add Card Modal */}
      <Dialog open={isAddCardModalOpen} onOpenChange={setIsAddCardModalOpen}>
        <DialogContent className="quantum-card-dense fixed-modal max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              Adicionar Nova Carta
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="form">Formulário</TabsTrigger>
              <TabsTrigger value="image">Imagem</TabsTrigger>
              <TabsTrigger value="batch">Em Lote</TabsTrigger>
            </TabsList>
            
            <TabsContent value="form" className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nome da Carta</label>
                <Input
                  value={newCard.name}
                  onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                  placeholder="Nome da carta"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Custo de Mana</label>
                <Input
                  value={newCard.mana_cost}
                  onChange={(e) => setNewCard({...newCard, mana_cost: e.target.value})}
                  placeholder="{2}{W}{U}"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Linha de Tipo</label>
                <Input
                  value={newCard.type_line}
                  onChange={(e) => setNewCard({...newCard, type_line: e.target.value})}
                  placeholder="Criatura — Humano Mago"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Texto</label>
                <Textarea
                  value={newCard.oracle_text}
                  onChange={(e) => setNewCard({...newCard, oracle_text: e.target.value})}
                  placeholder="Texto da carta"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-1 block">URL da Imagem</label>
                <Input
                  value={newCard.image_uris?.normal}
                  onChange={(e) => setNewCard({
                    ...newCard, 
                    image_uris: {...(newCard.image_uris || {}), normal: e.target.value}
                  })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Raridade</label>
                <select
                  value={newCard.rarity}
                  onChange={(e) => setNewCard({...newCard, rarity: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-white"
                >
                  <option value="common">Comum</option>
                  <option value="uncommon">Incomum</option>
                  <option value="rare">Rara</option>
                  <option value="mythic">Mítica</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Fonte do Spoiler</label>
                <Input
                  value={newCard.spoilerSource}
                  onChange={(e) => setNewCard({...newCard, spoilerSource: e.target.value})}
                  placeholder="Wizards.com, Twitter, etc."
                />
              </div>
            </TabsContent>
            
            <TabsContent value="image">
              <div className="space-y-4">
                <p className="text-sm text-gray-300">
                  Faça upload de uma ou várias imagens ou cole da área de transferência
                </p>
                
                <ImageUploader 
                  onImageUploaded={handleImageUploaded}
                  onMultipleImagesUploaded={handleMultipleImagesUploaded}
                  onEditDetails={openQuickEditModal}
                />
                
                <p className="text-xs text-gray-400 mt-2">
                  Nota: Imagens grandes podem exceder o limite de armazenamento do navegador.
                  Recomendamos usar imagens menores ou comprimir as imagens antes do upload.
                </p>
                
                {newCard.image_uris?.normal && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-1">Prévia da imagem:</p>
                    <div className="relative w-full h-64 bg-gray-800 rounded-md overflow-hidden">
                      <img 
                        src={newCard.image_uris.normal} 
                        alt="Prévia" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="batch">
              <div className="space-y-4">
                <p className="text-sm text-gray-300">
                  Faça upload de um arquivo JSON contendo múltiplas cartas
                </p>
                
                <BatchUploader onCardsUploaded={addBatchCards} />
                
                <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">Formato esperado:</p>
                  <pre className="text-xs text-gray-300 overflow-x-auto p-2 bg-gray-900 rounded-md">
{`[
  {
    "name": "Nome da Carta",
    "image_uris": {
      "normal": "url_da_imagem"
    },
    "rarity": "rare"
  },
  ...
]`}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4 pt-2 border-t border-gray-700">
            <Button variant="outline" onClick={() => setIsAddCardModalOpen(false)}>Cancelar</Button>
            <Button 
              onClick={addCard}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={activeTab === "batch"}
            >
              <Save className="w-4 h-4 mr-1" />
              Salvar Carta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}