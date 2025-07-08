"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Search, CheckCircle, AlertCircle, ListChecks, Download, Upload, Grid3X3, List, Filter, ArrowUpDown, SortAsc, SortDesc, Clock, Monitor, Trash, Printer } from "lucide-react"
import "@/styles/mtg-print.css"
import { useAppContext } from "@/contexts/AppContext"
import SimpleSelect from "./SimpleSelect"
import { Switch } from "./ui/switch"
import PrintModal from "./PrintModal"
import type { MTGCard, UserCollection, CollectionCard } from '@/types/mtg'

interface CollectionCompletionProps {
  isOpen: boolean
  onClose: () => void
}

// Lista de códigos de edições digitais para filtrar
const DIGITAL_SET_CODES = [
  'med', 'me2', 'me3', 'me4', 'vma', 'tpr', 'pz1', 'pz2', 'pmei',
  'akr', 'klr', 'j21', 'y22', 'y23', 'slx', 'htr', 'htr17', 'htr18', 'htr19',
  'mtga', 'ana', 'anb', 'xln', 'rix', 'dom', 'grn', 'rna', 'war', 'eld', 'thb',
  'iko', 'znr', 'khm', 'stx', 'afr', 'mid', 'vow', 'neo', 'snc', 'dmu', 'bro',
  'one', 'mom', 'woe', 'lci', 'ltr', 'who'
];

export default function CollectionCompletion({ isOpen, onClose }: CollectionCompletionProps) {
  const { collections, currentCollection } = useAppContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<MTGCard[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedType, setSelectedType] = useState("")
  const [targetCardCount, setTargetCardCount] = useState(4)
  const [ordenacao, setOrdenacao] = useState<'name' | 'rarity' | 'cmc' | 'set' | 'collected' | 'released'>('name')
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<'asc' | 'desc'>('asc')
  const [allSets, setAllSets] = useState<{code: string, name: string}[]>([])
  const [excludeDigital, setExcludeDigital] = useState(true)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<{
    completed: {card: MTGCard, have: number, need: number}[],
    missing: {card: MTGCard, have: number, need: number}[],
    allCards: MTGCard[],
    progress: number
  }>({
    completed: [],
    missing: [],
    allCards: [],
    progress: 0
  })
  
  // Lista de tipos comuns para seleção rápida
  const commonTypes = [
    "Elf", "Goblin", "Zombie", "Angel", "Dragon", "Vampire", "Wizard", 
    "Warrior", "Human", "Beast", "Spirit", "Sliver", "Merfolk", "Dinosaur"
  ]
  
  // Verificar se uma carta está na coleção
  const isCardInCollection = (card: MTGCard): {inCollection: boolean, quantity: number, missing: number} => {
    if (!currentCollection) return { inCollection: false, quantity: 0, missing: targetCardCount }
    
    const collectionCard = currentCollection.cards.find(c => 
      c.card.name === card.name && c.card.set === card.set
    )
    
    const quantity = collectionCard?.quantity || 0
    const missing = Math.max(0, targetCardCount - quantity)
    
    return {
      inCollection: quantity >= targetCardCount,
      quantity,
      missing
    }
  }
  
  // Carregar todas as coleções disponíveis
  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch('https://api.scryfall.com/sets')
        if (response.ok) {
          const data = await response.json()
          setAllSets(data.data.map((set: any) => ({
            code: set.code,
            name: set.name
          })))
        }
      } catch (error) {
        console.error('Erro ao carregar coleções:', error)
      }
    }
    
    fetchSets()
  }, [])
  
  // Função para buscar cartas na API Scryfall
  const searchCards = async () => {
    if (!selectedType.trim()) return
    
    setIsSearching(true)
    try {
      // Construir query para buscar cartas com o tipo específico
      // Adicionamos prints:all para garantir que todas as impressões sejam incluídas
      let query = `type:${selectedType} prints:all`
      
      // Adicionar exclusão de edições digitais se necessário
      if (excludeDigital) {
        // Adicionar exclusão para cada código de edição digital
        DIGITAL_SET_CODES.forEach(code => {
          query += ` -e:${code}`
        })
        // Excluir também cartas que só existem digitalmente
        query += " -is:digital"
      }
      
      console.log("Query de busca:", query)
      
      const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=released&unique=prints`)
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Processar os resultados para garantir que temos todas as variações de arte
      let allResults = data.data || []
      
      // Se houver mais páginas, buscar todas
      let nextPage = data.next_page
      while (nextPage) {
        const nextResponse = await fetch(nextPage)
        if (nextResponse.ok) {
          const nextData = await nextResponse.json()
          allResults = [...allResults, ...(nextData.data || [])]
          nextPage = nextData.next_page
        } else {
          break
        }
      }
      
      setSearchResults(allResults)
      
      // Analisar automaticamente após a busca
      analyzeCollection(allResults)
    } catch (error) {
      console.error("Erro ao buscar cartas:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }
  
  // Função para analisar a coleção atual em relação às cartas encontradas
  const analyzeCollection = (cards: MTGCard[]) => {
    if (!currentCollection || cards.length === 0) return
    
    const completed: {card: MTGCard, have: number, need: number}[] = []
    const missing: {card: MTGCard, have: number, need: number}[] = []
    
    // Para cada carta encontrada, verificar se está na coleção e quantas cópias temos
    for (const card of cards) {
      // Verificar se a carta está na coleção atual
      const collectionCard = currentCollection.cards.find(c => 
        c.card.name === card.name && c.card.set === card.set
      )
      const haveCount = collectionCard?.quantity || 0
      const needCount = targetCardCount
      
      if (haveCount >= needCount) {
        completed.push({ card, have: haveCount, need: needCount })
      } else {
        missing.push({ card, have: haveCount, need: needCount })
      }
    }
    
    // Calcular progresso
    const totalNeeded = cards.length * targetCardCount
    const totalHave = completed.reduce((sum, item) => sum + item.have, 0) + 
                      missing.reduce((sum, item) => sum + item.have, 0)
    
    const progress = totalNeeded > 0 ? Math.min(100, Math.round((totalHave / totalNeeded) * 100)) : 0
    
    setAnalysisResults({
      completed,
      missing,
      allCards: cards,
      progress
    })
  }
  
  // Função para alternar direção da ordenação
  const toggleOrdenacao = (novaOrdenacao: typeof ordenacao) => {
    if (ordenacao === novaOrdenacao) {
      setDirecaoOrdenacao(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenacao(novaOrdenacao)
      setDirecaoOrdenacao('asc')
    }
  }
  
  // Ordenar cartas com base nos critérios selecionados
  const cartasOrdenadas = useMemo(() => {
    if (!analysisResults.allCards.length) return []
    
    return [...analysisResults.allCards].sort((a, b) => {
      let comparison = 0
      
      switch (ordenacao) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'rarity':
          const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'mythic': 4 }
          comparison = (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0) - 
                      (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0)
          break
        case 'cmc':
          comparison = (a.cmc || 0) - (b.cmc || 0)
          break
        case 'set':
          // Usar o nome completo da coleção para ordenação
          const aSetName = a.set_name || ''
          const bSetName = b.set_name || ''
          
          // Primeiro ordenar por nome da coleção
          comparison = aSetName.localeCompare(bSetName)
          
          // Se forem da mesma coleção, ordenar por número da carta
          if (comparison === 0 && a.collector_number && b.collector_number) {
            const aNum = parseInt(a.collector_number) || 0
            const bNum = parseInt(b.collector_number) || 0
            comparison = aNum - bNum
          }
          break
        case 'collected':
          const aInCollection = isCardInCollection(a)
          const bInCollection = isCardInCollection(b)
          comparison = aInCollection.quantity - bInCollection.quantity
          break
        case 'released':
          const aDate = a.released_at ? new Date(a.released_at).getTime() : 0
          const bDate = b.released_at ? new Date(b.released_at).getTime() : 0
          comparison = aDate - bDate
          break
      }
      
      return direcaoOrdenacao === 'asc' ? comparison : -comparison
    })
  }, [analysisResults.allCards, ordenacao, direcaoOrdenacao, currentCollection, targetCardCount])
  
  // Agrupar cartas por nome para mostrar estatísticas
  const cardsByName = useMemo(() => {
    const groups: Record<string, {
      total: number,
      collected: number,
      variants: MTGCard[]
    }> = {};
    
    analysisResults.allCards.forEach(card => {
      if (!groups[card.name]) {
        groups[card.name] = {
          total: 0,
          collected: 0,
          variants: []
        };
      }
      
      groups[card.name].total++;
      groups[card.name].variants.push(card);
      
      const { inCollection } = isCardInCollection(card);
      if (inCollection) {
        groups[card.name].collected++;
      }
    });
    
    return groups;
  }, [analysisResults.allCards, currentCollection, targetCardCount]);
  
  // Exportar lista de cartas faltantes
  const exportMissingCards = () => {
    if (analysisResults.missing.length === 0) return
    
    const csvContent = [
      ['Name', 'Set', 'Quantity', 'Have', 'Need'],
      ...analysisResults.missing.map(item => [
        item.card.name,
        item.card.set_name || '',
        (item.need - item.have).toString(),
        item.have.toString(),
        item.need.toString()
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `missing_cards.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }
  
  // Limpar tudo
  const clearAll = () => {
    setSearchResults([])
    setAnalysisResults({
      completed: [],
      missing: [],
      allCards: [],
      progress: 0
    })
  }
  
  // Estatísticas de variantes
  const variantStats = useMemo(() => {
    const totalVariants = analysisResults.allCards.length;
    const uniqueCards = Object.keys(cardsByName).length;
    const collectedVariants = analysisResults.completed.length;
    
    return {
      totalVariants,
      uniqueCards,
      collectedVariants,
      averageVariantsPerCard: uniqueCards > 0 ? (totalVariants / uniqueCards).toFixed(1) : '0'
    };
  }, [analysisResults, cardsByName]);
  
  return (
    <>
      {isPrintModalOpen && (
        <PrintModal 
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          missingCards={analysisResults.missing}
        />
      )}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="quantum-card-dense fixed-modal max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-cyan-400" />
              Completar Coleção
            </DialogTitle>
          </DialogHeader>
        
        <div className="flex flex-col h-[calc(80vh-120px)]">
          {/* Controles superiores */}
          <div className="space-y-4 mb-4">
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <SimpleSelect
                  value={selectedType}
                  onChange={setSelectedType}
                  options={[
                    { value: "", label: "Selecione um tipo..." },
                    ...commonTypes.map(type => ({ value: type.toLowerCase(), label: type }))
                  ]}
                  placeholder="Selecione um tipo"
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Cópias:</span>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  value={targetCardCount}
                  onChange={(e) => setTargetCardCount(parseInt(e.target.value) || 1)}
                  className="quantum-field-sm w-16"
                />
              </div>
              <Button 
                onClick={searchCards}
                className="quantum-btn compact bg-cyan-600 hover:bg-cyan-700"
                disabled={!selectedType || isSearching}
              >
                {isSearching ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-1">⟳</span> Buscando...
                  </span>
                ) : (
                  <>
                    <Search className="w-3 h-3 mr-1" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
            
            {/* Opções de filtro */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="exclude-digital" 
                  checked={excludeDigital}
                  onCheckedChange={setExcludeDigital}
                />
                <label 
                  htmlFor="exclude-digital" 
                  className="text-xs text-gray-300 flex items-center cursor-pointer"
                >
                  <Monitor className="w-3 h-3 mr-1 text-gray-400" />
                  Excluir edições digitais
                </label>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-7 w-7 p-0 ${viewMode === 'grid' ? 'bg-gray-700' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-7 w-7 p-0 ${viewMode === 'list' ? 'bg-gray-700' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Chips de tipos comuns */}
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pb-1">
              {commonTypes.map(type => (
                <Badge 
                  key={type}
                  className={`cursor-pointer ${selectedType === type.toLowerCase() ? 'bg-cyan-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => {
                    setSelectedType(type.toLowerCase());
                    setTimeout(() => searchCards(), 100);
                  }}
                >
                  {type}
                </Badge>
              ))}
            </div>
            
            {/* Barra de progresso e controles */}
            {analysisResults.allCards.length > 0 && (
              <div className="bg-gray-800/50 p-3 rounded-md border border-cyan-500/20">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">Progresso:</span>
                    <span className="text-sm font-medium text-cyan-400">{analysisResults.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {analysisResults.completed.length} completas / {analysisResults.missing.length} faltantes
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-cyan-400"
                    style={{ width: `${analysisResults.progress}%` }}
                  />
                </div>
                
                {/* Estatísticas de variantes */}
                <div className="grid grid-cols-4 gap-2 mt-2 text-center">
                  <div className="bg-gray-800/70 rounded p-1">
                    <div className="text-xs text-gray-400">Cartas Únicas</div>
                    <div className="text-sm text-white font-medium">{variantStats.uniqueCards}</div>
                  </div>
                  <div className="bg-gray-800/70 rounded p-1">
                    <div className="text-xs text-gray-400">Variantes</div>
                    <div className="text-sm text-white font-medium">{variantStats.totalVariants}</div>
                  </div>
                  <div className="bg-gray-800/70 rounded p-1">
                    <div className="text-xs text-gray-400">Coletadas</div>
                    <div className="text-sm text-white font-medium">{variantStats.collectedVariants}</div>
                  </div>
                  <div className="bg-gray-800/70 rounded p-1">
                    <div className="text-xs text-gray-400">Média/Carta</div>
                    <div className="text-sm text-white font-medium">{variantStats.averageVariantsPerCard}</div>
                  </div>
                </div>
                
                {/* Opções de ordenação */}
                <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-gray-700 max-h-16 overflow-y-auto">
                  <span className="text-xs text-gray-400 mr-1 flex items-center">
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                    Ordenar por:
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-6 text-xs px-2 ${ordenacao === 'name' ? 'bg-gray-700' : ''}`}
                    onClick={() => toggleOrdenacao('name')}
                  >
                    Nome {ordenacao === 'name' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-6 text-xs px-2 ${ordenacao === 'rarity' ? 'bg-gray-700' : ''}`}
                    onClick={() => toggleOrdenacao('rarity')}
                  >
                    Raridade {ordenacao === 'rarity' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-6 text-xs px-2 ${ordenacao === 'cmc' ? 'bg-gray-700' : ''}`}
                    onClick={() => toggleOrdenacao('cmc')}
                  >
                    CMC {ordenacao === 'cmc' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-6 text-xs px-2 ${ordenacao === 'set' ? 'bg-gray-700' : ''}`}
                    onClick={() => toggleOrdenacao('set')}
                  >
                    Coleção {ordenacao === 'set' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-6 text-xs px-2 ${ordenacao === 'released' ? 'bg-gray-700' : ''}`}
                    onClick={() => toggleOrdenacao('released')}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Lançamento {ordenacao === 'released' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-6 text-xs px-2 ${ordenacao === 'collected' ? 'bg-gray-700' : ''}`}
                    onClick={() => toggleOrdenacao('collected')}
                  >
                    Coletadas {ordenacao === 'collected' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Conteúdo principal - Grid ou Lista */}
          <div className="flex-1 overflow-y-auto pr-1 quantum-scrollbar">
            {analysisResults.allCards.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {cartasOrdenadas.map((card, index) => {
                    const { inCollection, quantity, missing } = isCardInCollection(card);
                    const hasAtLeastOne = quantity > 0;
                    
                    return (
                      <div 
                        key={`${card.id}-${index}`} 
                        className={`relative rounded-lg overflow-hidden transition-all hover:scale-[1.03] ${
                          inCollection ? 'ring-2 ring-green-500' : hasAtLeastOne ? 'ring-2 ring-cyan-800' : 'ring-1 ring-gray-700'
                        }`}
                      >
                        <div className="relative">
                          <Image
                            src={card.image_uris?.normal || '/placeholder.png'}
                            alt={card.name}
                            width={265}
                            height={370}
                            className={`w-full h-auto ${!hasAtLeastOne ? 'grayscale' : ''}`}
                          />
                          
                          {/* Indicador de cópias faltantes - Degradê vertical na metade direita */}
                          {hasAtLeastOne && !inCollection && (
                            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-cyan-800/80 to-transparent flex items-center justify-center">
                              <div className="text-4xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                -{missing}
                              </div>
                            </div>
                          )}
                          
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-white truncate">{card.name}</span>
                              <Badge className={inCollection ? 'bg-green-600' : hasAtLeastOne ? 'bg-cyan-800' : 'bg-gray-600'}>
                                {quantity}/{targetCardCount}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-400 truncate">{card.set_name}</span>
                              <span className="text-xs text-gray-400">{card.collector_number}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  {cartasOrdenadas.map((card, index) => {
                    const { inCollection, quantity, missing } = isCardInCollection(card);
                    const hasAtLeastOne = quantity > 0;
                    
                    return (
                      <div 
                        key={`${card.id}-${index}`}
                        className={`flex items-center gap-2 p-2 rounded-md ${
                          inCollection ? 'bg-green-900/20' : hasAtLeastOne ? 'bg-cyan-950/30' : 'bg-gray-800/50'
                        }`}
                      >
                        <div className="w-8 h-8 relative flex-shrink-0">
                          <Image
                            src={card.image_uris?.art_crop || '/placeholder.png'}
                            alt={card.name}
                            fill
                            className={`rounded-md object-cover ${!hasAtLeastOne ? 'grayscale' : ''}`}
                          />
                          {hasAtLeastOne && !inCollection && (
                            <div className="absolute inset-0 bg-gradient-to-l from-cyan-800/80 to-transparent flex items-center justify-center">
                              <span className="text-xs font-bold text-white">-{missing}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-white">{card.name}</span>
                            <Badge className={inCollection ? 'bg-green-600' : hasAtLeastOne ? 'bg-cyan-800' : 'bg-gray-600'}>
                              {quantity}/{targetCardCount}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">{card.set_name} #{card.collector_number}</span>
                            {inCollection ? (
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            ) : hasAtLeastOne ? (
                              <span className="text-xs text-cyan-600 font-bold">Faltam {missing}</span>
                            ) : (
                              <span className="text-xs text-gray-400">Não coletada</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <ListChecks className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <h3 className="text-lg font-medium text-white mb-2">Selecione um tipo para começar</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Escolha um tipo de carta (como "Elfo" ou "Goblin") e clique em "Buscar" para ver todas as artes disponíveis.
                  As cartas que você já possui aparecerão coloridas, enquanto as que faltam estarão em preto e branco.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="mt-4 pt-2 border-t border-gray-700">
          {analysisResults.missing.length > 0 && (
            <>
              <Button 
                onClick={exportMissingCards}
                variant="outline"
                className="mr-2"
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar CSV
              </Button>
              <Button 
                onClick={() => setIsPrintModalOpen(true)}
                variant="outline"
                className="mr-auto bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-400 border-cyan-800/50"
              >
                <Printer className="w-4 h-4 mr-1" />
                Imprimir Proxies
              </Button>
            </>
          )}
          <Button variant="outline" onClick={clearAll} disabled={analysisResults.allCards.length === 0}>
            <Trash className="w-4 h-4 mr-1" />
            Limpar
          </Button>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}