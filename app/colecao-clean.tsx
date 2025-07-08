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
import { Search, Library, Plus, Minus, Download, AlertCircle, Save, Upload, Copy, Grid3X3, Settings, User, Clock, Bookmark, Heart, Trash2, Star, Filter, Eye, EyeOff, RefreshCw, ExternalLink, Package, Edit3, ArrowUpDown } from "lucide-react"
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
  const { currentCollection = { cards: [] }, adicionarCarta, removerCarta, setCurrentCollection } = useAppContext();
  
  // Garantir que currentCollection seja do tipo UserCollection e não UserCollection[]
  const collection: UserCollection = Array.isArray(currentCollection) 
    ? (currentCollection[0] || { cards: [], id: '', name: '', description: '', createdAt: '', updatedAt: '', isPublic: false })
    : (currentCollection as UserCollection);
  
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
    const cartasNaColecao = collection.cards.map(c => c.card.name).slice(0, 5);
    const todasSugestoes = [...cartasPopulares, ...cartasNaColecao];
    return Array.from(new Set(todasSugestoes));
  }, [collection.cards]);

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
    let filtered = collection.cards;

    // Filtro por nome/busca
    if (buscaColecao.trim()) {
      const searchTerm = buscaColecao.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.card.name.toLowerCase().includes(searchTerm) ||
        (item.card.oracle_text && item.card.oracle_text.toLowerCase().includes(searchTerm))
      );
    }

    // Filtro por raridade
    if (filtroRaridadeColecao !== "all") {
      filtered = filtered.filter(item => 
        safeCardAccess.rarity(item.card) === filtroRaridadeColecao
      );
    }

    // Filtro por cor
    if (filtroCorColecao !== "all") {
      filtered = filtered.filter(item => {
        const colors = safeCardAccess.colorIdentity(item.card);
        return filtroCorColecao === "colorless" 
          ? colors.length === 0 
          : colors.includes(filtroCorColecao);
      });
    }

    // Ordenação
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (ordenacao) {
        case 'name':
          comparison = a.card.name.localeCompare(b.card.name);
          break;
        case 'rarity':
          const rarityOrder = { common: 0, uncommon: 1, rare: 2, mythic: 3, special: 4, bonus: 5 };
          const rarityA = safeCardAccess.rarity(a.card);
          const rarityB = safeCardAccess.rarity(b.card);
          comparison = (rarityOrder[rarityA as keyof typeof rarityOrder] || 0) - 
                      (rarityOrder[rarityB as keyof typeof rarityOrder] || 0);
          break;
        case 'cmc':
          comparison = safeCardAccess.cmc(a.card) - safeCardAccess.cmc(b.card);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'date':
          // Assumindo que há um campo de data adicionado
          const dateA = new Date(a.card.released_at || '2000-01-01').getTime();
          const dateB = new Date(b.card.released_at || '2000-01-01').getTime();
          comparison = dateA - dateB;
          break;
      }
      
      return direcaoOrdenacao === 'asc' ? comparison : -comparison;
    });
  }, [collection.cards, buscaColecao, filtroRaridadeColecao, filtroCorColecao, ordenacao, direcaoOrdenacao]);

  // Função para pesquisar cartas na API Scryfall
  const pesquisarCartas = useCallback(async () => {
    if (!busca.trim() && !mostrarFiltrosAvancados) {
      setErroPesquisa("Digite um termo de busca ou use filtros avançados");
      return;
    }

    setCarregandoPesquisa(true);
    setErroPesquisa(null);
    
    try {
      // Construir a query para a API Scryfall
      let query = busca.trim();
      
      // Adicionar filtros avançados se estiverem ativos
      if (mostrarFiltrosAvancados) {
        if (raridade !== "all") query += ` r:${raridade}`;
        if (tipo !== "all") query += ` t:${tipo}`;
        if (subtipo !== "all") query += ` t:${subtipo}`;
        if (supertipo !== "all") query += ` t:${supertipo}`;
        if (cmc) query += ` cmc${cmc}`;
        if (foil !== "all") query += ` is:${foil}`;
        if (oracleText) query += ` o:"${oracleText}"`;
        if (manaColors.length > 0) {
          query += ` c:${manaColors.join('')}`;
        }
      }
      
      // Adicionar filtro para mostrar apenas cartas na coleção
      if (mostrarCartasNaColecao) {
        const cardIds = collection.cards.map(c => c.card.id);
        if (cardIds.length > 0) {
          // Limitar a 50 IDs para não exceder limites da URL
          const limitedIds = cardIds.slice(0, 50);
          query += ` (${limitedIds.map(id => `id:${id}`).join(' OR ')})`;
        } else {
          setErroPesquisa("Sua coleção está vazia");
          setCarregandoPesquisa(false);
          return;
        }
      }
      
      // Fazer a requisição à API
      const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.object === "error") {
        setErroPesquisa(data.details);
        setResultadoPesquisa([]);
      } else {
        setResultadoPesquisa(data.data || []);
        setAllCards(data.data || []);
      }
    } catch (error) {
      console.error("Erro na pesquisa:", error);
      setErroPesquisa("Erro ao buscar cartas. Verifique sua conexão ou tente novamente mais tarde.");
      setResultadoPesquisa([]);
    } finally {
      setCarregandoPesquisa(false);
    }
  }, [busca, mostrarFiltrosAvancados, raridade, tipo, subtipo, supertipo, cmc, foil, oracleText, manaColors, mostrarCartasNaColecao, collection.cards, setAllCards]);

  // Função para alternar a seleção de cor no filtro
  const toggleManaColor = useCallback((color: string) => {
    setManaColors(prev => {
      if (prev.includes(color)) {
        return prev.filter(c => c !== color);
      } else {
        return [...prev, color];
      }
    });
  }, []);

  // Função para exportar a coleção atual
  const exportarColecao = useCallback(() => {
    exportCollectionToCSV(collection);
    showNotification('success', 'Coleção exportada com sucesso!');
  }, [collection, exportCollectionToCSV, showNotification]);

  // Função para importar coleção de um arquivo CSV
  const importarColecao = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        // Pular o cabeçalho
        const dataLines = lines.slice(1);
        
        // Processar cada linha
        const importedCards: CollectionCard[] = [];
        
        for (const line of dataLines) {
          if (!line.trim()) continue;
          
          const [name, set, quantity, foilStatus, condition] = line.split(',');
          
          // Buscar a carta correspondente
          const matchingCard = allCards.find(c => 
            c.name.toLowerCase() === name.toLowerCase() && 
            c.set_code.toLowerCase() === set.toLowerCase()
          );
          
          if (matchingCard) {
            importedCards.push({
              card: matchingCard,
              quantity: parseInt(quantity) || 1,
              condition: condition || 'Near Mint',
              foil: foilStatus.toLowerCase() === 'foil'
            });
          }
        }
        
        // Atualizar a coleção
        if (importedCards.length > 0) {
          setCurrentCollection((prevCollection: any) => {
            // Se prevCollection é um array, atualizamos o primeiro item ou criamos um novo array
            if (Array.isArray(prevCollection)) {
              // Verificar se o primeiro item existe e é um objeto válido
              const firstItem = prevCollection[0];
              const updatedCollection = firstItem ? {
                ...firstItem,
                cards: firstItem.cards || []
              } : { 
                cards: [], id: '', name: '', description: '', createdAt: '', updatedAt: '', isPublic: false 
              };
              
              // Criar um novo array com o item atualizado na primeira posição
              const result = [
                {
                  ...updatedCollection,
                  cards: [...updatedCollection.cards, ...importedCards],
                  updatedAt: new Date().toISOString()
                }
              ];
              
              // Adicionar os itens restantes do array original, se houver
              if (prevCollection.length > 1) {
                for (let i = 1; i < prevCollection.length; i++) {
                  result.push(prevCollection[i]);
                }
              }
              
              return result;
            } 
            // Se não é um array, criamos um novo array com o item atualizado
            else {
              // Garantir que updatedCollection seja um objeto válido
              // Verificar se prevCollection é um objeto válido
              let updatedCollection;
              if (prevCollection && typeof prevCollection === 'object') {
                updatedCollection = {
                  id: prevCollection.id || '',
                  name: prevCollection.name || '',
                  description: prevCollection.description || '',
                  createdAt: prevCollection.createdAt || '',
                  updatedAt: prevCollection.updatedAt || '',
                  isPublic: prevCollection.isPublic || false,
                  cards: prevCollection.cards || []
                };
              } else {
                updatedCollection = { 
                  cards: [], id: '', name: '', description: '', createdAt: '', updatedAt: '', isPublic: false 
                };
              }
              
              return [{
                ...updatedCollection,
                cards: [...updatedCollection.cards, ...importedCards],
                updatedAt: new Date().toISOString()
              }];
            }
          });
          
          showNotification('success', `Importadas ${importedCards.length} cartas para a coleção!`);
        } else {
          showNotification('error', 'Nenhuma carta foi importada. Verifique o formato do arquivo.');
        }
      } catch (error) {
        console.error("Erro ao importar coleção:", error);
        showNotification('error', 'Erro ao importar coleção. Verifique o formato do arquivo.');
      }
    };
    
    reader.readAsText(file);
  }, [allCards, collection, setCurrentCollection, showNotification]);

  // Renderização do componente
  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Cabeçalho da página */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Sua Coleção MTG</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie suas cartas, pesquise novas adições e veja estatísticas
          </p>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportarColecao}
            className="flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => document.getElementById('importFile')?.click()}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importar</span>
            <input
              id="importFile"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={importarColecao}
            />
          </Button>
        </div>
      </div>
      
      {/* Notificação */}
      {notification.visible && (
        <div className={`mb-4 p-3 rounded-md ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
          notification.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'error' && <AlertCircle className="w-4 h-4" />}
            <p>{notification.message}</p>
          </div>
        </div>
      )}
      
      {/* Barra de pesquisa rápida */}
      <div className="relative mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Busca rápida (nome de carta, artista, texto...)"
              value={buscaRapida}
              onChange={(e) => {
                setBuscaRapida(e.target.value);
                setMostrarSugestoes(e.target.value.length > 0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  buscarRapido(buscaRapida);
                }
              }}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <Button onClick={() => buscarRapido(buscaRapida)}>Buscar</Button>
        </div>
        
        {/* Sugestões de busca */}
        {mostrarSugestoes && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sugestões</div>
              <div className="flex flex-wrap gap-1">
                {sugestoesBusca.filter(s => 
                  s.toLowerCase().includes(buscaRapida.toLowerCase())
                ).slice(0, 5).map((sugestao, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => {
                      setBuscaRapida(sugestao);
                      buscarRapido(sugestao);
                    }}
                  >
                    {sugestao}
                  </Badge>
                ))}
              </div>
            </div>
            
            {historicoMensagens.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Buscas recentes</div>
                <div className="flex flex-wrap gap-1">
                  {historicoMensagens.slice(0, 5).map((item, i) => (
                    <Badge 
                      key={i} 
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => {
                        setBuscaRapida(item);
                        buscarRapido(item);
                      }}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Tabs principais */}
      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pesquisa" className="flex items-center gap-1">
            <Search className="w-4 h-4" />
            Pesquisar
          </TabsTrigger>
          <TabsTrigger value="colecao" className="flex items-center gap-1">
            <Library className="w-4 h-4" />
            Coleção ({collection.cards.length})
          </TabsTrigger>
          <TabsTrigger value="estatisticas" className="flex items-center gap-1">
            <Grid3X3 className="w-4 h-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>
        
        {/* Conteúdo da tab Pesquisa */}
        <TabsContent value="pesquisa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Pesquisar Cartas
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
                  className="text-xs"
                >
                  {mostrarFiltrosAvancados ? (
                    <><EyeOff className="w-3 h-3 mr-1" /> Ocultar Filtros</>
                  ) : (
                    <><Eye className="w-3 h-3 mr-1" /> Mostrar Filtros</>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Campo de busca principal */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome da carta, texto, artista..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') pesquisarCartas();
                    }}
                    className="flex-1"
                  />
                  <Button onClick={pesquisarCartas}>Buscar</Button>
                </div>
                
                {/* Filtros avançados */}
                {mostrarFiltrosAvancados && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Raridade</label>
                      <Select value={raridade} onValueChange={setRaridade}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a raridade" />
                        </SelectTrigger>
                        <SelectContent>
                          {raridades.map(r => (
                            <SelectItem key={r} value={r}>
                              {r === 'all' ? 'Todas' : r.charAt(0).toUpperCase() + r.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Tipo</label>
                      <Select value={tipo} onValueChange={setTipo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipos.map(t => (
                            <SelectItem key={t} value={t}>
                              {t === 'all' ? 'Todos' : t.charAt(0).toUpperCase() + t.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Subtipo</label>
                      <Select value={subtipo} onValueChange={setSubtipo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o subtipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {subtipos.map(t => (
                            <SelectItem key={t} value={t}>
                              {t === 'all' ? 'Todos' : t.charAt(0).toUpperCase() + t.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Supertipo</label>
                      <Select value={supertipo} onValueChange={setSupertipo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o supertipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {supertipos.map(t => (
                            <SelectItem key={t} value={t}>
                              {t === 'all' ? 'Todos' : t.charAt(0).toUpperCase() + t.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">CMC</label>
                      <Input
                        placeholder="Ex: =3, >2, <5"
                        value={cmc}
                        onChange={(e) => setCmc(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Foil</label>
                      <Select value={foil} onValueChange={setFoil}>
                        <SelectTrigger>
                          <SelectValue placeholder="Foil ou não" />
                        </SelectTrigger>
                        <SelectContent>
                          {foils.map(f => (
                            <SelectItem key={f} value={f}>
                              {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="text-sm font-medium mb-1 block">Texto do Oráculo</label>
                      <Textarea
                        placeholder="Texto que aparece na carta..."
                        value={oracleText}
                        onChange={(e) => setOracleText(e.target.value)}
                      />
                    </div>
                    
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="text-sm font-medium mb-1 block">Cores</label>
                      <div className="flex flex-wrap gap-2">
                        {coresMana.map(cor => (
                          <Button
                            key={cor}
                            variant={manaColors.includes(cor) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleManaColor(cor)}
                            className={`w-8 h-8 p-0 rounded-full ${
                              cor === 'W' ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' :
                              cor === 'U' ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' :
                              cor === 'B' ? 'bg-gray-800 hover:bg-gray-900 text-gray-100' :
                              cor === 'R' ? 'bg-red-100 hover:bg-red-200 text-red-800' :
                              cor === 'G' ? 'bg-green-100 hover:bg-green-200 text-green-800' :
                              'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            } ${manaColors.includes(cor) ? '!ring-2 ring-offset-2' : ''}`}
                          >
                            {cor}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 lg:col-span-3 flex items-center">
                      <input
                        type="checkbox"
                        id="mostrarCartasNaColecao"
                        checked={mostrarCartasNaColecao}
                        onChange={(e) => setMostrarCartasNaColecao(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="mostrarCartasNaColecao" className="text-sm">
                        Mostrar apenas cartas que já estão na minha coleção
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Resultados da pesquisa */}
                <div className="mt-6">
                  {carregandoPesquisa ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Buscando cartas...</p>
                    </div>
                  ) : erroPesquisa ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{erroPesquisa}</p>
                    </div>
                  ) : resultadoPesquisa.length > 0 ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">
                          {resultadoPesquisa.length} cartas encontradas
                        </h3>
                        <CardViewOptions />
                      </div>
                      
                      <SearchCardList 
                        cards={resultadoPesquisa}
                        onCardClick={openModal}
                        onAddCard={adicionarMultiplasCartas}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Faça uma busca para encontrar cartas</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da tab Coleção */}
        <TabsContent value="colecao">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Library className="w-5 h-5" />
                  Sua Coleção
                </div>
                <div className="flex items-center gap-2">
                  <Select value={ordenacao} onValueChange={(val) => setOrdenacao(val as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nome</SelectItem>
                      <SelectItem value="rarity">Raridade</SelectItem>
                      <SelectItem value="cmc">CMC</SelectItem>
                      <SelectItem value="quantity">Quantidade</SelectItem>
                      <SelectItem value="date">Data de lançamento</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDirecaoOrdenacao(d => d === 'asc' ? 'desc' : 'asc')}
                  >
                    {direcaoOrdenacao === 'asc' ? (
                      <ArrowUpDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 transform rotate-180" />
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filtros da coleção */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Filtrar por nome ou texto..."
                      value={buscaColecao}
                      onChange={(e) => setBuscaColecao(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={filtroRaridadeColecao} onValueChange={setFiltroRaridadeColecao}>
                      <SelectTrigger className="w-[130px]">
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
                    
                    <Select value={filtroCorColecao} onValueChange={setFiltroCorColecao}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Cor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="W">Branco</SelectItem>
                        <SelectItem value="U">Azul</SelectItem>
                        <SelectItem value="B">Preto</SelectItem>
                        <SelectItem value="R">Vermelho</SelectItem>
                        <SelectItem value="G">Verde</SelectItem>
                        <SelectItem value="colorless">Incolor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Lista de cartas na coleção */}
                <div className="mt-6">
                  {cartasFiltradas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Sua coleção está vazia ou nenhuma carta corresponde aos filtros</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">
                          {cartasFiltradas.length} cartas na coleção
                        </h3>
                        <CardViewOptions />
                      </div>
                      
                      <CardList 
                        cards={cartasFiltradas.map(item => item.card)}
                        quantities={cartasFiltradas.map(item => item.quantity)}
                        onCardClick={openModal}
                        onAddCard={(card) => adicionarCarta(card)}
                        onRemoveCard={(card) => {
                          // Se recebemos uma string ID, precisamos encontrar a carta correspondente
                          if (typeof card === 'string') {
                            // Encontrar a carta na coleção atual usando o ID
                            const cardObj = cartasFiltradas.find(item => item.card.id === card)?.card;
                            if (cardObj) {
                              removerCarta(cardObj);
                            }
                          } else {
                            // Se já é um objeto MTGCard, podemos passar diretamente
                            removerCarta(card);
                          }
                        }}
                        showQuantity={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da tab Estatísticas */}
        <TabsContent value="estatisticas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" />
                Estatísticas da Coleção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Total de cartas */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total de cartas</div>
                  <div className="text-2xl font-bold mt-1">
                    {collection.cards.reduce((acc, item) => acc + item.quantity, 0)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {collection.cards.length} cartas únicas
                  </div>
                </div>
                
                {/* Distribuição por raridade */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Raridades</div>
                  <div className="flex gap-2 mt-2">
                    {['common', 'uncommon', 'rare', 'mythic'].map(r => {
                      const count = collection.cards.filter(
                        item => safeCardAccess.rarity(item.card) === r
                      ).length;
                      
                      return (
                        <div key={r} className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </div>
                          <div className="text-lg font-semibold mt-1">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Distribuição por cor */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Cores</div>
                  <div className="flex gap-2 mt-2">
                    {coresMana.map(cor => {
                      const count = collection.cards.filter(item => 
                        safeCardAccess.colorIdentity(item.card).includes(cor)
                      ).length;
                      
                      return (
                        <div key={cor} className="flex-1">
                          <div className={`text-center rounded-full w-6 h-6 mx-auto flex items-center justify-center ${
                            cor === 'W' ? 'bg-yellow-100 text-yellow-800' :
                            cor === 'U' ? 'bg-blue-100 text-blue-800' :
                            cor === 'B' ? 'bg-gray-800 text-gray-100' :
                            cor === 'R' ? 'bg-red-100 text-red-800' :
                            cor === 'G' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {cor}
                          </div>
                          <div className="text-center text-sm mt-1">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Distribuição por CMC */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Curva de Mana</div>
                  <div className="h-32 flex items-end gap-1 mt-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(cmcValue => {
                      const count = collection.cards.filter(item => 
                        Math.floor(safeCardAccess.cmc(item.card)) === cmcValue
                      ).length;
                      
                      const maxCount = Math.max(...[0, 1, 2, 3, 4, 5, 6, 7].map(c => 
                        collection.cards.filter(item => 
                          Math.floor(safeCardAccess.cmc(item.card)) === c
                        ).length
                      ));
                      
                      const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      
                      return (
                        <div key={cmcValue} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-blue-500 rounded-t"
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="text-xs mt-1">{cmcValue}{cmcValue === 7 ? '+' : ''}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Distribuição por tipo */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tipos</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['creature', 'instant', 'sorcery', 'artifact', 'enchantment', 'planeswalker', 'land'].map(t => {
                      const count = collection.cards.filter(item => 
                        safeCardAccess.typeLine(item.card).toLowerCase().includes(t)
                      ).length;
                      
                      return (
                        <div key={t} className="flex justify-between">
                          <span className="text-xs">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                          <span className="text-xs font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Coleções mais representadas */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Principais Coleções</div>
                  <div className="space-y-2 mt-2">
                    {Object.entries(
                      collection.cards.reduce((acc, item) => {
                        const setName = safeCardAccess.setName(item.card);
                        acc[setName] = (acc[setName] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([setName, count]) => (
                        <div key={setName} className="flex justify-between">
                          <span className="text-xs truncate">{setName}</span>
                          <span className="text-xs font-medium">{count}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}