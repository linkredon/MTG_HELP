"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCardModal } from "@/contexts/CardModalContext"
import { useAppContext } from "@/contexts/AppContext"
import CardViewOptions from "@/components/CardViewOptions"
import CardList from "@/components/CardList"
import SearchCardList from "@/components/SearchCardList"
import ExpandableCardGrid from '@/components/ExpandableCardGrid'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, Library, Plus, Minus, Download, AlertCircle, Save, Upload, Copy, Grid3X3, Settings, User, Clock, Bookmark, Heart, Trash2, Star, Filter, Eye, EyeOff, RefreshCw, ExternalLink, Package, Edit3 } from "lucide-react"
import "@/styles/palette.css"

// Função utilitária para seguramente acessar propriedades de cartas
const safeCardAccess = {
  setCode: (card: any): string => {
    try {
      if (!card) return 'N/A';
      if (card.set_code === undefined || card.set_code === null) return 'N/A';
      if (typeof card.set_code !== 'string') return String(card.set_code);
      return card.set_code.toUpperCase();
    } catch (e) {
      console.warn('Erro ao acessar set_code', e);
      return 'N/A';
    }
  },
  rarity: (card: any): string => {
    try {
      if (!card) return 'comum';
      return card.rarity || 'comum';
    } catch (e) {
      console.warn('Erro ao acessar rarity', e);
      return 'comum';
    }
  },
  typeLine: (card: any): string => {
    try {
      if (!card) return 'Tipo não especificado';
      return card.type_line || 'Tipo não especificado';
    } catch (e) {
      console.warn('Erro ao acessar type_line', e);
      return 'Tipo não especificado';
    }
  },
  setName: (card: any): string => {
    try {
      if (!card) return 'Coleção desconhecida';
      return card.set_name || 'Coleção desconhecida';
    } catch (e) {
      console.warn('Erro ao acessar set_name', e);
      return 'Coleção desconhecida';
    }
  },
  colorIdentity: (card: any): string[] => {
    try {
      if (!card) return [];
      if (!card.color_identity || !Array.isArray(card.color_identity)) return [];
      return card.color_identity;
    } catch (e) {
      console.warn('Erro ao acessar color_identity', e);
      return [];
    }
  },
  imageUris: (card: any): any => {
    try {
      if (!card) return null;
      return card.image_uris || null;
    } catch (e) {
      console.warn('Erro ao acessar image_uris', e);
      return null;
    }
  },
  cmc: (card: any): number => {
    try {
      if (!card) return 0;
      if (card.cmc === undefined || card.cmc === null) return 0;
      return Number(card.cmc) || 0;
    } catch (e) {
      console.warn('Erro ao acessar cmc', e);
      return 0;
    }
  }
}

// Tipos essenciais para coleção
interface MTGCard {
  id: string
  name: string
  set_name: string
  set_code: string
  collector_number: string
  rarity: string
  mana_cost?: string
  cmc: number
  type_line: string
  oracle_text?: string
  power?: string
  toughness?: string
  artist: string
  lang: string
  released_at: string
  color_identity: string[]
  foil: boolean
  nonfoil: boolean
  prints_search_uri: string
  image_uris?: {
    normal: string
    small?: string
    art_crop?: string
  }
  card_faces?: Array<{
    name: string
    mana_cost?: string
    type_line: string
    oracle_text?: string
    power?: string
    toughness?: string
    image_uris?: {
      normal: string
      small?: string
      art_crop?: string
    }
  }>
}

interface CollectionCard {
  card: MTGCard
  quantity: number
  condition: string
  foil: boolean
}

interface UserCollection {
  id: string
  name: string
  description: string
  cards: CollectionCard[]
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

interface ColecaoProps {
  allCards: MTGCard[]
  setAllCards: (cards: MTGCard[]) => void
  exportCollectionToCSV: (collection: UserCollection) => void
}

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

export default function Colecao({
  allCards,
  setAllCards,
  exportCollectionToCSV,
}: ColecaoProps) {
  // Usar o contexto global para coleção
  const { currentCollection, adicionarCarta, removerCarta } = useAppContext();
  
  // Estados para navegação entre tabs da coleção - apenas Pesquisa, Coleção e Estatísticas
  const [tab, setTab] = useState<string>("pesquisa")
  const [busca, setBusca] = useState("")
  const [raridade, setRaridade] = useState("all")
  const [tipo, setTipo] = useState("all")
  const [subtipo, setSubtipo] = useState("all")
  const [supertipo, setSupertipo] = useState("all")
  const [cmc, setCmc] = useState("")
  const [foil, setFoil] = useState("all")
  const [oracleText, setOracleText] = useState("")
  const [manaColors, setManaColors] = useState<string[]>([])
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false)
  const [mostrarCartasNaColecao, setMostrarCartasNaColecao] = useState(false)
  
  // Estados para ordenação e filtros da coleção
  const [ordenacao, setOrdenacao] = useState<'name' | 'rarity' | 'cmc' | 'quantity' | 'date'>('name')
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<'asc' | 'desc'>('asc')
  const [filtroRaridadeColecao, setFiltroRaridadeColecao] = useState("all")
  const [filtroCorColecao, setFiltroCorColecao] = useState("all")
  const [buscaColecao, setBuscaColecao] = useState("")
  
  const [resultadoPesquisa, setResultadoPesquisa] = useState<MTGCard[]>([])
  const [carregandoPesquisa, setCarregandoPesquisa] = useState(false)
  const [erroPesquisa, setErroPesquisa] = useState<string | null>(null)
  
  // Estados para busca rápida e histórico
  const [buscaRapida, setBuscaRapida] = useState("")
  const [historicoMensagens, setHistoricoMensagens] = useState<string[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  // Sugestões de busca com base no histórico e cartas populares
  const sugestoesBusca = useMemo(() => {
    const cartasPopulares = ['Lightning Bolt', 'Counterspell', 'Sol Ring', 'Swords to Plowshares', 'Dark Ritual'];
    const cartasNaColecao = currentCollection.cards.map(c => c.card.name).slice(0, 5);
    const todasSugestoes = [...cartasPopulares, ...cartasNaColecao];
    return Array.from(new Set(todasSugestoes));
  }, [currentCollection.cards]);

  // Função para busca rápida (Enter na pesquisa)
  const buscarRapido = useCallback((termo: string) => {
    if (!termo.trim()) return;
    
    setBusca(termo);
    setTab("pesquisa");
    setMostrarSugestoes(false);
    
    // Adicionar ao histórico
    setHistoricoMensagens(prev => {
      const novoHistorico = [termo, ...prev.filter(h => h !== termo)].slice(0, 10);
      return novoHistorico;
    });
  }, []);

  // Estados para notificações/feedback
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false })
  
  // Usando o modal global via contexto
  const { openModal } = useCardModal();

  // Função local para adicionar múltiplas cartas
  const adicionarMultiplasCartas = useCallback((card: MTGCard, quantity: number = 1) => {
    for (let i = 0; i < quantity; i++) {
      adicionarCarta(card);
    }
    
    // Mostrar notificação de sucesso
    showNotification('success', `${quantity}x ${card.name} adicionada${quantity > 1 ? 's' : ''} à coleção!`);
  }, [adicionarCarta]);

  // Função para mostrar notificações
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  // Função melhorada para filtrar e ordenar cartas da coleção
  const cartasFiltradas = useMemo(() => {
    let filtered = currentCollection.cards;

    // Filtro por nome/busca
    if (buscaColecao.trim()) {
      const searchTerm = buscaColecao.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.card.name.toLowerCase().includes(searchTerm) ||
        c.card.set_name.toLowerCase().includes(searchTerm) ||
        c.card.type_line.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por raridade
    if (filtroRaridadeColecao !== "all") {
      filtered = filtered.filter(c => c.card.rarity === filtroRaridadeColecao);
    }

    // Filtro por cor
    if (filtroCorColecao !== "all") {
      if (filtroCorColecao === "colorless") {
        filtered = filtered.filter(c => 
          !c.card.color_identity || c.card.color_identity.length === 0
        );
      } else {
        filtered = filtered.filter(c => 
          c.card.color_identity && c.card.color_identity.includes(filtroCorColecao)
        );
      }
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (ordenacao) {
        case 'name':
          comparison = a.card.name.localeCompare(b.card.name);
          break;
        case 'rarity':
          const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'mythic': 4 };
          comparison = (rarityOrder[a.card.rarity as keyof typeof rarityOrder] || 0) - 
                      (rarityOrder[b.card.rarity as keyof typeof rarityOrder] || 0);
          break;
        case 'cmc':
          comparison = (a.card.cmc || 0) - (b.card.cmc || 0);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'date':
          comparison = new Date(a.card.released_at || '').getTime() - 
                      new Date(b.card.released_at || '').getTime();
          break;
      }
      
      return direcaoOrdenacao === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [currentCollection.cards, buscaColecao, filtroRaridadeColecao, filtroCorColecao, ordenacao, direcaoOrdenacao]);

  // Função para alternar direção da ordenação
  const toggleOrdenacao = useCallback((novaOrdenacao: typeof ordenacao) => {
    if (ordenacao === novaOrdenacao) {
      setDirecaoOrdenacao(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacao(novaOrdenacao);
      setDirecaoOrdenacao('asc');
    }
  }, [ordenacao]);

  // Função para pesquisar cartas
  const pesquisarCartas = async () => {
    // Se não há filtros, não pesquisa
    if (!busca.trim() && raridade === "all" && tipo === "all" && 
        subtipo === "all" && supertipo === "all" && !cmc && 
        !oracleText && manaColors.length === 0 && foil === "all") {
      setErroPesquisa("Por favor, defina pelo menos um filtro para pesquisar")
      return
    }
    
    setCarregandoPesquisa(true)
    setErroPesquisa(null)
    
    try {
      // Construir query para Scryfall
      let queryParts = []
      
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
      console.log("Query construída:", query)
      
      // Fazer requisição para Scryfall
      const response = await fetch(`https://api.scryfall.com/cards/search?q=${query}&order=name&dir=asc&unique=cards&page=1`)
      
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

  // Função para capitalizar primeira letra
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  // Função para obter cor de raridade
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-400'
      case 'uncommon': return 'text-green-400'
      case 'rare': return 'text-yellow-400'
      case 'mythic': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Notificação */}
      {notification.visible && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg text-card-foreground bg-gray-800/80 backdrop-blur-xl shadow-2xl overflow-hidden border-0 ${
          notification.type === 'success' ? 'border-green-500/30' :
          notification.type === 'error' ? 'border-red-500/30' : 'border-blue-500/30'
        } text-white border`}>
          {notification.message}
        </div>
      )}

      {/* Busca Rápida */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Busca rápida de cartas..."
              value={buscaRapida}
              onChange={(e) => {
                setBuscaRapida(e.target.value);
                setMostrarSugestoes(e.target.value.length > 0);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  buscarRapido(buscaRapida);
                }
              }}
              className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 pr-10"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            
            {/* Sugestões */}
            {mostrarSugestoes && buscaRapida.length > 0 && (
              <div className="absolute top-full mt-1 w-full rounded-lg text-card-foreground bg-gray-800/80 backdrop-blur-xl shadow-2xl overflow-hidden border-0 z-10">
                {sugestoesBusca
                  .filter(s => s.toLowerCase().includes(buscaRapida.toLowerCase()))
                  .slice(0, 5)
                  .map((sugestao, index) => (
                    <button
                      key={index}
                      onClick={() => buscarRapido(sugestao)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white text-sm"
                    >
                      {sugestao}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navegação de Tabs - APENAS COLEÇÃO */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={tab === "pesquisa" ? "default" : "outline"}
              onClick={() => {
                setTab("pesquisa")
                setBusca("")
                setErroPesquisa(null)
                setResultadoPesquisa([])
              }}
              className={`flex-1 ${tab === "pesquisa" ? "bg-blue-600 hover:bg-blue-700" : "border-gray-600 text-gray-300 hover:bg-gray-700"}`}
            >
              <Search className="w-4 h-4 mr-2" />
              Pesquisar Cartas
            </Button>
            <Button
              variant={tab === "colecao" ? "default" : "outline"}
              onClick={() => {
                setTab("colecao")
                setBusca("")
              }}
              className={`flex-1 ${tab === "colecao" ? "bg-blue-600 hover:bg-blue-700" : "border-gray-600 text-gray-300 hover:bg-gray-700"}`}
            >
              <Library className="w-4 h-4 mr-2" />
              Minha Coleção ({currentCollection.cards.length})
            </Button>
            <Button
              variant={tab === "estatisticas" ? "default" : "outline"}
              onClick={() => setTab("estatisticas")}
              className={`flex-1 ${tab === "estatisticas" ? "bg-blue-600 hover:bg-blue-700" : "border-gray-600 text-gray-300 hover:bg-gray-700"}`}
            >
              <Star className="w-4 h-4 mr-2" />
              Estatísticas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo das Tabs */}
      {tab === "pesquisa" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Coluna 1: Filtros */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros de Pesquisa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Busca por nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome da Carta
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Lightning Bolt"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                {/* Filtros básicos */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Raridade
                    </label>
                    <Select value={raridade} onValueChange={setRaridade}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {raridades.map(r => (
                          <SelectItem key={r} value={r} className="text-white hover:bg-gray-700">
                            {r === "all" ? "Todas" : capitalize(r)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo
                    </label>
                    <Select value={tipo} onValueChange={setTipo}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {tipos.map(t => (
                          <SelectItem key={t} value={t} className="text-white hover:bg-gray-700">
                            {t === "all" ? "Todos" : capitalize(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botão para mostrar filtros avançados */}
                <Button
                  variant="outline"
                  onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {mostrarFiltrosAvancados ? "Ocultar" : "Mostrar"} Filtros Avançados
                </Button>

                {/* Filtros avançados */}
                {mostrarFiltrosAvancados && (
                  <div className="space-y-4 pt-4 border-t border-gray-600">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Subtipo
                      </label>
                      <Select value={subtipo} onValueChange={setSubtipo}>
                        <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {subtipos.map(st => (
                            <SelectItem key={st} value={st} className="text-white hover:bg-gray-700">
                              {st === "all" ? "Todos" : capitalize(st)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Supertipo
                      </label>
                      <Select value={supertipo} onValueChange={setSupertipo}>
                        <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {supertipos.map(st => (
                            <SelectItem key={st} value={st} className="text-white hover:bg-gray-700">
                              {st === "all" ? "Todos" : capitalize(st)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Custo de Mana Convertido
                      </label>
                      <Input
                        type="number"
                        placeholder="Ex: 3"
                        value={cmc}
                        onChange={(e) => setCmc(e.target.value)}
                        className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Foil
                      </label>
                      <Select value={foil} onValueChange={setFoil}>
                        <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {foils.map(f => (
                            <SelectItem key={f} value={f} className="text-white hover:bg-gray-700">
                              {f === "all" ? "Todas" : f === "foil" ? "Apenas Foil" : "Apenas Normal"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Texto Oracle
                      </label>
                      <Textarea
                        placeholder="Ex: exile target creature"
                        value={oracleText}
                        onChange={(e) => setOracleText(e.target.value)}
                        className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Cores de Mana
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {coresMana.map(cor => (
                          <Button
                            key={cor}
                            variant={manaColors.includes(cor) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleManaCor(cor)}
                            className={`w-8 h-8 p-0 ${
                              manaColors.includes(cor)
                                ? cor === 'W' ? 'bg-yellow-200 text-gray-900' :
                                  cor === 'U' ? 'bg-blue-500' :
                                  cor === 'B' ? 'bg-gray-900 text-white' :
                                  cor === 'R' ? 'bg-red-500' :
                                  cor === 'G' ? 'bg-green-500' :
                                  'bg-gray-400'
                                : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {cor}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={pesquisarCartas}
                    disabled={carregandoPesquisa}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {carregandoPesquisa ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Pesquisar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={limparFiltros}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Opções de visualização */}
                <div className="pt-4 border-t border-gray-600">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mostrarCartasNaColecao"
                      checked={mostrarCartasNaColecao}
                      onChange={(e) => setMostrarCartasNaColecao(e.target.checked)}
                      className="rounded border-gray-600 bg-gray-900"
                    />
                    <label htmlFor="mostrarCartasNaColecao" className="text-sm text-gray-300">
                      Destacar cartas na coleção
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2-4: Resultados */}
          <div className="lg:col-span-3">
            {erroPesquisa ? (
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <p className="text-red-400 mb-4">{erroPesquisa}</p>
                  <Button onClick={pesquisarCartas} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </CardContent>
              </Card>
            ) : carregandoPesquisa ? (
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="text-center py-12">
                  <RefreshCw className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
                  <p className="text-gray-400">Pesquisando cartas...</p>
                </CardContent>
              </Card>
            ) : resultadoPesquisa.length > 0 ? (
              <SearchCardList
                cards={resultadoPesquisa}
                collection={currentCollection.cards}
                onAddCard={adicionarCarta}
                className="mt-4"
              />
            ) : (
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="text-center py-12">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-xl font-medium text-white mb-2">Pesquise por cartas</h3>
                  <p className="text-gray-400 mb-6">
                    Use os filtros ao lado para encontrar cartas específicas
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => setBusca("Lightning Bolt")} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      Exemplo: Lightning Bolt
                    </Button>
                    <Button onClick={() => setRaridade("mythic")} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      Exemplo: Cartas Míticas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === "colecao" && (
        <div className="space-y-6">
          {/* Header da Coleção */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Minha Coleção</h2>
              <p className="text-gray-400">Gerencie suas cartas de Magic: The Gathering</p>
            </div>
            <Button
              onClick={() => exportCollectionToCSV(currentCollection)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          {/* Filtros da Coleção */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Buscar na coleção..."
                  value={buscaColecao}
                  onChange={(e) => setBuscaColecao(e.target.value)}
                  className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                />
                <Select value={filtroRaridadeColecao} onValueChange={setFiltroRaridadeColecao}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                    <SelectValue placeholder="Raridade" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white hover:bg-gray-700">Todas</SelectItem>
                    <SelectItem value="common" className="text-white hover:bg-gray-700">Comum</SelectItem>
                    <SelectItem value="uncommon" className="text-white hover:bg-gray-700">Incomum</SelectItem>
                    <SelectItem value="rare" className="text-white hover:bg-gray-700">Rara</SelectItem>
                    <SelectItem value="mythic" className="text-white hover:bg-gray-700">Mítica</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroCorColecao} onValueChange={setFiltroCorColecao}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                    <SelectValue placeholder="Cor" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white hover:bg-gray-700">Todas</SelectItem>
                    <SelectItem value="W" className="text-white hover:bg-gray-700">Branco</SelectItem>
                    <SelectItem value="U" className="text-white hover:bg-gray-700">Azul</SelectItem>
                    <SelectItem value="B" className="text-white hover:bg-gray-700">Preto</SelectItem>
                    <SelectItem value="R" className="text-white hover:bg-gray-700">Vermelho</SelectItem>
                    <SelectItem value="G" className="text-white hover:bg-gray-700">Verde</SelectItem>
                    <SelectItem value="colorless" className="text-white hover:bg-gray-700">Incolor</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleOrdenacao('name')}
                    className={`flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 ${
                      ordenacao === 'name' ? 'bg-gray-700' : ''
                    }`}
                  >
                    Nome {ordenacao === 'name' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleOrdenacao('rarity')}
                    className={`flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 ${
                      ordenacao === 'rarity' ? 'bg-gray-700' : ''
                    }`}
                  >
                    Raridade {ordenacao === 'rarity' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Cartas da Coleção */}
          {cartasFiltradas.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="text-center py-12">
                <Library className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-medium text-white mb-2">Coleção vazia</h3>
                <p className="text-gray-400 mb-6">
                  Adicione cartas à sua coleção pesquisando na aba "Pesquisar Cartas"
                </p>
                <Button
                  onClick={() => setTab("pesquisa")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Pesquisar Cartas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ExpandableCardGrid
              collectionCards={cartasFiltradas}
              onAddCard={adicionarCarta}
              onRemoveCard={removerCarta}
              className="mt-4"
            />
          )}
        </div>
      )}

      {tab === "estatisticas" && (
        <div className="space-y-6">
          {/* Estatísticas da Coleção */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Estatísticas da Coleção</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="p-6 text-center">
                  <Library className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">{currentCollection.cards.length}</h3>
                  <p className="text-gray-400">Cartas únicas</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="p-6 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <h3 className="text-2xl font-bold text-white">
                    {currentCollection.cards.reduce((sum, c) => sum + c.quantity, 0)}
                  </h3>
                  <p className="text-gray-400">Total de cartas</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="p-6 text-center">
                  <Star className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-2xl font-bold text-white">
                    {new Set(currentCollection.cards.map(c => c.card.set_code)).size}
                  </h3>
                  <p className="text-gray-400">Coleções diferentes</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Distribuição por Raridade */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Distribuição por Raridade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(['common', 'uncommon', 'rare', 'mythic'] as const).map(rarity => {
                  const count = currentCollection.cards.filter(c => c.card.rarity === rarity).length;
                  const percentage = currentCollection.cards.length > 0 
                    ? (count / currentCollection.cards.length * 100).toFixed(1) 
                    : '0';
                  
                  return (
                    <div key={rarity} className="flex justify-between items-center">
                      <span className={`font-medium ${getRarityColor(rarity)}`}>
                        {capitalize(rarity)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              rarity === 'common' ? 'bg-gray-400' :
                              rarity === 'uncommon' ? 'bg-green-400' :
                              rarity === 'rare' ? 'bg-yellow-400' :
                              'bg-orange-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-300 text-sm w-12 text-right">
                          {count}
                        </span>
                        <span className="text-gray-400 text-sm w-12 text-right">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top 10 Coleções */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Top 10 Coleções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(
                  currentCollection.cards.reduce((acc, card) => {
                    const setName = card.card.set_name;
                    acc[setName] = (acc[setName] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([setName, count], index) => (
                    <div key={setName} className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm w-6">#{index + 1}</span>
                        <span className="text-white">{setName}</span>
                      </div>
                      <Badge variant="secondary">{count} cartas</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usando o modal global através do contexto - não precisa mais incluir o CardModal aqui */}
    </div>
  )
}
