"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Plus, Search, Filter, RefreshCw, X, Crown, Shield, Sword } from "lucide-react"
import { getImageUrl } from "../utils/imageService"
import { searchCardsWithTranslation } from "../utils/scryfallService"
import type { MTGCard } from "@/types/mtg"

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

interface CardSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onAddCard: (card: MTGCard, category: 'mainboard' | 'sideboard' | 'commander', quantity?: number) => void
  currentCommander?: MTGCard | null
  hasPartnerCommander?: boolean
}

export default function CardSearchModal({ 
  isOpen, 
  onClose, 
  onAddCard, 
  currentCommander,
  hasPartnerCommander = false
}: CardSearchModalProps) {
  // Estados para busca de cartas
  const [busca, setBusca] = useState("")
  const [raridade, setRaridade] = useState("all")
  const [tipo, setTipo] = useState("all")
  const [subtipo, setSubtipo] = useState("all")
  const [supertipo, setSupertipo] = useState("all")
  const [cmc, setCmc] = useState("")
  const [foil, setFoil] = useState("all")
  const [oracleText, setOracleText] = useState("")
  const [manaColors, setManaColors] = useState<string[]>([])
  const [ordenacaoBusca, setOrdenacaoBusca] = useState("name")
  const [direcaoOrdenacaoBusca, setDirecaoOrdenacaoBusca] = useState("asc")
  const [resultadoPesquisa, setResultadoPesquisa] = useState<MTGCard[]>([])
  const [carregandoPesquisa, setCarregandoPesquisa] = useState(false)
  const [erroPesquisa, setErroPesquisa] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<MTGCard | null>(null)
  const [showAddOptions, setShowAddOptions] = useState(false)
  const [addQuantity, setAddQuantity] = useState(1)
  
  // Função para pesquisar cartas
  const pesquisarCartas = async () => {
    if (!busca.trim() && raridade === "all" && tipo === "all" && 
        subtipo === "all" && supertipo === "all" && !cmc && 
        !oracleText && manaColors.length === 0 && foil === "all") {
      setErroPesquisa("Por favor, defina pelo menos um filtro para pesquisar")
      return
    }
    
    setCarregandoPesquisa(true)
    setErroPesquisa(null)
    
    try {
      let queryParts: string[] = []
      
      if (busca.trim()) queryParts.push(busca.trim())
      if (raridade !== "all") queryParts.push(`rarity:${raridade}`)
      if (tipo !== "all") queryParts.push(`type:${tipo}`)
      if (subtipo !== "all") queryParts.push(`type:${subtipo}`)
      if (supertipo !== "all") queryParts.push(`is:${supertipo}`)
      if (cmc) {
        const cmcNumber = parseInt(cmc)
        if (!isNaN(cmcNumber)) {
          queryParts.push(`cmc=${cmcNumber}`)
        }
      }
      if (foil === "foil") queryParts.push("is:foil")
      if (foil === "nonfoil") queryParts.push("-is:foil")
      if (oracleText.trim()) queryParts.push(`oracle:"${oracleText.trim()}"`)
      if (manaColors.length > 0) {
        queryParts.push(`colors:${manaColors.join("")}`)
      }
      
      const query = queryParts.join(" ")
      
      const response = await searchCardsWithTranslation(query, ordenacaoBusca, direcaoOrdenacaoBusca)
      
      if (!response.ok) {
        if (response.status === 404) {
          setResultadoPesquisa([])
          setErroPesquisa("Nenhuma carta encontrada com os filtros especificados")
        } else {
          throw new Error(`Erro na API: ${response.status}`)
        }
        return
      }
      
      const data = await response.json()
      setResultadoPesquisa(data.data || [])
      
      if (data.data && data.data.length === 0) {
        setErroPesquisa("Nenhuma carta encontrada com os filtros especificados")
      }
      
    } catch (error) {
      console.error("Erro ao pesquisar cartas:", error)
      setErroPesquisa("Erro ao pesquisar cartas. Tente novamente.")
      setResultadoPesquisa([])
    } finally {
      setCarregandoPesquisa(false)
    }
  }
  
  // Função para limpar filtros
  const limparFiltros = () => {
    setBusca("")
    setRaridade("all")
    setTipo("all")
    setSubtipo("all")
    setSupertipo("all")
    setCmc("")
    setFoil("all")
    setOracleText("")
    setManaColors([])
    setResultadoPesquisa([])
    setErroPesquisa(null)
  }
  
  // Função para pesquisar ao pressionar Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      pesquisarCartas()
    }
  }
  
  // Função para toggle de cor de mana
  const toggleManaCor = (cor: string) => {
    setManaColors(prev => 
      prev.includes(cor) 
        ? prev.filter(c => c !== cor)
        : [...prev, cor]
    )
  }
  
  // Effect para pesquisar automaticamente quando o termo de busca muda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (busca.trim() && busca.length >= 3) {
        pesquisarCartas()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [busca])
  
  // Função para verificar se uma carta pode ser commander
  const canBeCommander = (card: MTGCard): boolean => {
    // Deve ser lendária
    if (!card.type_line?.toLowerCase().includes('legendary')) {
      return false
    }
    
    // Se já tem um commander e não é parceiro, não pode adicionar outro
    if (currentCommander && !card.type_line?.toLowerCase().includes('partner')) {
      return false
    }
    
    // Se já tem parceiro e esta carta não é parceiro, não pode adicionar
    if (hasPartnerCommander && !card.type_line?.toLowerCase().includes('partner')) {
      return false
    }
    
    return true
  }
  
  // Função para adicionar carta ao deck
  const handleAddCard = (card: MTGCard, category: 'mainboard' | 'sideboard' | 'commander') => {
    if (category === 'commander') {
      // Verificar se pode ser commander
      if (!canBeCommander(card)) {
        alert('Esta carta não pode ser commander. Apenas cartas lendárias podem ser commander.')
        return
      }
      
      // Se já tem commander e não é parceiro, perguntar se quer substituir
      if (currentCommander && !card.type_line?.toLowerCase().includes('partner')) {
        if (!confirm(`Você já tem um commander: ${currentCommander.name}. Deseja substituí-lo por ${card.name}?`)) {
          return
        }
      }
    }
    
    onAddCard(card, category, addQuantity)
    setSelectedCard(null)
    setShowAddOptions(false)
    setAddQuantity(1)
  }
  
  // Função para abrir opções de adição
  const openAddOptions = (card: MTGCard) => {
    setSelectedCard(card)
    setShowAddOptions(true)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="quantum-card max-w-6xl max-h-[90vh] overflow-hidden z-50">
        <DialogHeader>
          <DialogTitle className="quantum-card-title flex justify-between items-center">
            <span>Buscar Cartas para Adicionar ao Deck</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-1 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Filtros de Busca */}
          <div className="border-b border-cyan-500/20 pb-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <div className="relative">
                <Search className="absolute left-2 top-1.5 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nome da carta..."
                  className="pl-8"
                />
              </div>
              
              <Select value={raridade} onValueChange={setRaridade}>
                <SelectTrigger>
                  <SelectValue placeholder="Raridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="common">Comum</SelectItem>
                  <SelectItem value="uncommon">Incomum</SelectItem>
                  <SelectItem value="rare">Rara</SelectItem>
                  <SelectItem value="mythic">Mítica</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="creature">Criatura</SelectItem>
                  <SelectItem value="artifact">Artefato</SelectItem>
                  <SelectItem value="enchantment">Encantamento</SelectItem>
                  <SelectItem value="instant">Instantâneo</SelectItem>
                  <SelectItem value="sorcery">Feitiço</SelectItem>
                  <SelectItem value="planeswalker">Planeswalker</SelectItem>
                  <SelectItem value="land">Terreno</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder="CMC"
                value={cmc}
                onChange={(e) => setCmc(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Cores de Mana */}
            <div className="flex gap-2 mb-3">
              {coresMana.map((cor) => (
                <Button
                  key={cor}
                  size="sm"
                  variant={manaColors.includes(cor) ? "default" : "outline"}
                  onClick={() => toggleManaCor(cor)}
                  className="w-8 h-8 p-0"
                >
                  {cor}
                </Button>
              ))}
            </div>
            
            {/* Botões de Ação */}
            <div className="flex gap-2">
              <Button onClick={pesquisarCartas} disabled={carregandoPesquisa}>
                <Search className="w-4 h-4 mr-2" />
                {carregandoPesquisa ? 'Pesquisando...' : 'Pesquisar'}
              </Button>
              <Button variant="outline" onClick={limparFiltros}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
          
          {/* Resultados da Pesquisa */}
          <div className="flex-1 overflow-y-auto">
            {erroPesquisa && (
              <div className="text-red-500 mb-4 p-3 bg-red-500/10 rounded">
                {erroPesquisa}
              </div>
            )}
            
            {resultadoPesquisa.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {resultadoPesquisa.map((card) => (
                  <div key={card.id} className="relative group">
                    <div className="aspect-[63/88] bg-gray-800/80 rounded-md overflow-hidden shadow-md">
                      {getImageUrl(card) ? (
                        <img
                          src={getImageUrl(card)}
                          alt={card.name || 'Card'}
                          className="w-full h-full object-cover cursor-pointer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                          {card.name || 'Unknown Card'}
                        </div>
                      )}
                      
                      <div className="absolute top-1 right-1 bg-green-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md cursor-pointer hover:bg-green-500"
                           onClick={() => openAddOptions(card)}>
                        <Plus className="w-3 h-3" />
                      </div>
                      

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Modal de Opções de Adição */}
        {showAddOptions && selectedCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="quantum-card p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Adicionar {selectedCard.name}</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddOptions(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Quantidade */}
                <div>
                  <label className="block text-sm font-medium mb-2">Quantidade</label>
                  <Input
                    type="number"
                    min="1"
                    max="99"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                </div>
                
                {/* Opções de Adição */}
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => handleAddCard(selectedCard, 'mainboard')}
                  >
                    <Sword className="w-4 h-4 mr-2" />
                    Adicionar ao Main Deck
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full justify-start" 
                    onClick={() => handleAddCard(selectedCard, 'sideboard')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Adicionar ao Sideboard
                  </Button>
                  
                  {canBeCommander(selectedCard) && (
                    <Button 
                      variant="outline"
                      className="w-full justify-start text-yellow-400 border-yellow-400 hover:bg-yellow-400/10" 
                      onClick={() => handleAddCard(selectedCard, 'commander')}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Adicionar como Commander
                    </Button>
                  )}
                </div>
                
                {/* Informações sobre Commander */}
                {selectedCard.type_line?.toLowerCase().includes('legendary') && (
                  <div className="text-xs text-gray-400 p-2 bg-gray-800/50 rounded">
                    <p>✓ Esta carta pode ser commander (é lendária)</p>
                    {selectedCard.type_line?.toLowerCase().includes('partner') && (
                      <p>✓ Esta carta tem "Partner" - pode ser usado com outro commander parceiro</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 