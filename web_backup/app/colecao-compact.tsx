"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SimpleSelect from "@/components/SimpleSelect"
import { Textarea } from "@/components/ui/textarea"
import { useCardModal } from "@/contexts/CardModalContext"
import { useAppContext } from "@/contexts/AppContext"
import CardViewOptions from "@/components/CardViewOptions"
import CardList from "@/components/CardList"
import CardListWithFavorites from "@/components/CardListWithFavorites"
import SearchCardList from "@/components/SearchCardList"
import EnhancedSearchCardList from "@/components/EnhancedSearchCardList"
import { translatePtToEn, cardMatchesSearchTerm } from '@/utils/translationService'
import { getImageUrl, getDoubleFacedImageUrls } from '@/utils/imageService'
import { searchCardsWithTranslation, getAllPrintsByNameWithTranslation } from '@/utils/scryfallService'
import ExpandableCardGrid from '@/components/ExpandableCardGrid'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, Library, Plus, Minus, Download, AlertCircle, Save, Upload, Copy, Grid3X3, Settings, User, Clock, Bookmark, Heart, Trash2, Star, Filter, Eye, EyeOff, RefreshCw, ExternalLink, Package, Edit3, FileText, History, Check, Info, ListChecks, CheckCircle } from "lucide-react"
import ImportCollectionModal from "@/components/ImportCollectionModal"
import CollectionCompletion from "@/components/CollectionCompletion"
import "@/styles/palette.css"
import "@/styles/card-search-enhanced.css"
import "@/styles/filtros-fix.css"
import "@/styles/dropdown-z-fix.css"
import "@/styles/ambient-glow.css"
import CollectionBox from "@/components/CollectionBox"

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

import type { MTGCard, UserCollection, CollectionCard } from '@/types/mtg';

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

export default function ColecaoCompact({
  allCards,
  setAllCards,
  exportCollectionToCSV,
}: ColecaoProps) {
  // Usar o contexto global para coleção
  const {
    collections,
    currentCollection,
    currentCollectionId,
    setCurrentCollectionId,
    createCollection,
    deleteCollection,
    duplicateCollection,
    adicionarCarta,
    removerCarta,
    updateCollection
  } = useAppContext();
  
  const [editingCollection, setEditingCollection] = useState<UserCollection | null>(null);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState<string | null>(null);
  
  // Estados para navegação entre tabs da coleção - apenas Pesquisa, Coleção e Estatísticas
  const [tab, setTab] = useState<string>("pesquisa")
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false)
  const [mostrarCartasNaColecao, setMostrarCartasNaColecao] = useState(false)

  const initialState: {
    busca: string;
    raridade: string;
    tipo: string;
    subtipo: string;
    supertipo: string;
    cmc: string;
    foil: string;
    oracleText: string;
    manaColors: string[];
  } = {
    busca: "",
    raridade: "all",
    tipo: "all",
    subtipo: "all",
    supertipo: "all",
    cmc: "",
    foil: "all",
    oracleText: "",
    manaColors: [],
  };

  type State = typeof initialState;
  type Action =
    | { type: 'SET_FIELD'; field: keyof State; value: any }
    | { type: 'TOGGLE_MANA_COLOR'; color: string }
    | { type: 'RESET_FILTERS' };

  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case 'SET_FIELD':
        return { ...state, [action.field]: action.value };
      case 'TOGGLE_MANA_COLOR':
        return {
          ...state,
          manaColors: state.manaColors.includes(action.color)
            ? state.manaColors.filter(c => c !== action.color)
            : [...state.manaColors, action.color],
        };
      case 'RESET_FILTERS':
        return initialState;
      default:
        return state;
    }
  }

  const [filters, dispatch] = useReducer(reducer, initialState);

  const setBusca = (value: string) => dispatch({ type: 'SET_FIELD', field: 'busca', value });
  const setRaridade = (value: string) => dispatch({ type: 'SET_FIELD', field: 'raridade', value });
  const setTipo = (value: string) => dispatch({ type: 'SET_FIELD', field: 'tipo', value });
  const setSubtipo = (value: string) => dispatch({ type: 'SET_FIELD', field: 'subtipo', value });
  const setSupertipo = (value: string) => dispatch({ type: 'SET_FIELD', field: 'supertipo', value });
  const setCmc = (value: string) => dispatch({ type: 'SET_FIELD', field: 'cmc', value });
  const setFoil = (value: string) => dispatch({ type: 'SET_FIELD', field: 'foil', value });
  const setOracleText = (value: string) => dispatch({ type: 'SET_FIELD', field: 'oracleText', value });
  const toggleManaCor = (color: string) => dispatch({ type: 'TOGGLE_MANA_COLOR', color });
  
  // Estados para ordenação e filtros da coleção
  const [ordenacao, setOrdenacao] = useState<'name' | 'rarity' | 'cmc' | 'quantity' | 'date'>('name')
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<'asc' | 'desc'>('asc')
  const [filtroRaridadeColecao, setFiltroRaridadeColecao] = useState("all")
  const [filtroCorColecao, setFiltroCorColecao] = useState("all")
  const [buscaColecao, setBuscaColecao] = useState("")
  
  // Estados para ordenação da busca
  const [ordenacaoBusca, setOrdenacaoBusca] = useState<'name' | 'set' | 'rarity' | 'released'>('name')
  const [direcaoOrdenacaoBusca, setDirecaoOrdenacaoBusca] = useState<'asc' | 'desc'>('asc')
  
  const [resultadoPesquisa, setResultadoPesquisa] = useState<MTGCard[]>([])
  const [carregandoPesquisa, setCarregandoPesquisa] = useState(false)
  const [erroPesquisa, setErroPesquisa] = useState<string | null>(null)
  
  // Estados para paginação
  const [paginacaoInfo, setPaginacaoInfo] = useState<{
    hasMore: boolean;
    totalCards: number | null;
    nextPageUrl: string | null;
    currentPage: number;
  }>({
    hasMore: false,
    totalCards: null,
    nextPageUrl: null,
    currentPage: 1
  });
  const [carregandoProximaPagina, setCarregandoProximaPagina] = useState(false);
  
  // Estados para busca rápida e histórico
  const [buscaRapida, setBuscaRapida] = useState("")
  const [historicoMensagens, setHistoricoMensagens] = useState<string[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [mostrarHistorico, setMostrarHistorico] = useState(false)
  const [pesquisasSalvas, setPesquisasSalvas] = useState<string[]>([])
  const [nomePesquisaSalva, setNomePesquisaSalva] = useState("")
  const [mostrarModalSalvar, setMostrarModalSalvar] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)

  // Sugestões de busca com base no histórico e cartas populares
  const sugestoesBusca = useMemo(() => {
    const cartasPopulares = ['Lightning Bolt', 'Counterspell', 'Sol Ring', 'Swords to Plowshares', 'Dark Ritual'];
    const cartasNaColecao = currentCollection && currentCollection.cards ? 
      currentCollection.cards.map((c: CollectionCard) => c.card.name).slice(0, 5) : [];
    const todasSugestoes = [...cartasPopulares, ...cartasNaColecao];
    return Array.from(new Set(todasSugestoes));
  }, [currentCollection]);

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
    
    // Mostrar o histórico após adicionar um novo termo
    setMostrarHistorico(true);
    
    // Mostrar notificação
    showNotification('info', `Pesquisando por "${termo}"...`);
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
    if (!currentCollection || !currentCollection.cards) return [];
    let filtered: CollectionCard[] = currentCollection.cards;

    // Filtro por nome/busca
    if (buscaColecao.trim()) {
      const searchTerm = buscaColecao.trim();
      filtered = filtered.filter(c => cardMatchesSearchTerm(c.card, searchTerm));
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
  }, [currentCollection, buscaColecao, filtroRaridadeColecao, filtroCorColecao, ordenacao, direcaoOrdenacao]);

  // Função para alternar direção da ordenação
  const toggleOrdenacao = useCallback((novaOrdenacao: typeof ordenacao) => {
    if (ordenacao === novaOrdenacao) {
      setDirecaoOrdenacao(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacao(novaOrdenacao);
      setDirecaoOrdenacao('asc');
    }
  }, [ordenacao]);

  // Função para lidar com mudanças de ordenação na busca
  const handleSortChange = useCallback((mode: string, direction: string) => {
    console.log(`Mudança de ordenação: ${mode} ${direction}`);
    setOrdenacaoBusca(mode as 'name' | 'set' | 'rarity' | 'released');
    setDirecaoOrdenacaoBusca(direction as 'asc' | 'desc');
    
    // Refazer a pesquisa com a nova ordenação
    setTimeout(() => pesquisarCartas(), 100);
  }, []);


  // Função para pesquisar cartas
  const pesquisarCartas = async () => {
    // Se não há filtros, não pesquisa
    if (!filters.busca.trim() && filters.raridade === "all" && filters.tipo === "all" &&
        filters.subtipo === "all" && filters.supertipo === "all" && !filters.cmc &&
        !filters.oracleText && filters.manaColors.length === 0 && filters.foil === "all") {
      setErroPesquisa("Por favor, defina pelo menos um filtro para pesquisar")
      return
    }
    
    // Adicionar ao histórico se houver termo de busca
    if (filters.busca.trim()) {
      setHistoricoMensagens(prev => {
        const novoHistorico = [filters.busca.trim(), ...prev.filter(h => h !== filters.busca.trim())].slice(0, 10);
        return novoHistorico;
      });
    }
    
    setCarregandoPesquisa(true)
    setErroPesquisa(null)
    
    try {
      // Construir query para Scryfall
      let queryParts: string[] = []
      
      if (filters.busca.trim()) queryParts.push(filters.busca.trim())
      if (filters.raridade !== "all") queryParts.push(`rarity:${filters.raridade}`)
      if (filters.tipo !== "all") queryParts.push(`type:${filters.tipo}`)
      if (filters.subtipo !== "all") queryParts.push(`type:${filters.subtipo}`)
      if (filters.supertipo !== "all") queryParts.push(`is:${filters.supertipo}`)
      if (filters.cmc) {
        const cmcNumber = parseInt(filters.cmc)
        if (!isNaN(cmcNumber)) {
          queryParts.push(`cmc=${cmcNumber}`)
        }
      }
      if (filters.foil === "foil") queryParts.push("is:foil")
      if (filters.foil === "nonfoil") queryParts.push("-is:foil")
      if (filters.oracleText.trim()) queryParts.push(`oracle:"${filters.oracleText.trim()}"`)
      if (filters.manaColors.length > 0) {
        queryParts.push(`colors:${filters.manaColors.join("")}`)
      }
      
      const query = queryParts.join(" ")
      console.log("Query construída:", query)
      console.log("Ordenação busca:", ordenacaoBusca, direcaoOrdenacaoBusca)
      
      // Fazer requisição para Scryfall usando o serviço com tradução
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
      
      // Atualizar informações de paginação
      setPaginacaoInfo({
        hasMore: data.has_more || false,
        totalCards: data.total_cards || null,
        nextPageUrl: data.next_page || null,
        currentPage: 1
      });
      
      if (data.data && data.data.length === 0) {
        setErroPesquisa("Nenhuma carta encontrada com os filtros especificados")
      }
      
    } catch (error) {
      console.error("Erro ao pesquisar cartas:", error)
      setErroPesquisa("Erro ao pesquisar cartas. Tente novamente.")
      setResultadoPesquisa([])
      setPaginacaoInfo({
        hasMore: false,
        totalCards: null,
        nextPageUrl: null,
        currentPage: 1
      });
    } finally {
      setCarregandoPesquisa(false)
    }
  }

  // Função para carregar próxima página
  const carregarProximaPagina = async () => {
    if (!paginacaoInfo.nextPageUrl || carregandoProximaPagina) return;
    
    setCarregandoProximaPagina(true);
    
    try {
      const response = await fetch(paginacaoInfo.nextPageUrl);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Adicionar as novas cartas aos resultados existentes
      setResultadoPesquisa(prev => [...prev, ...(data.data || [])]);
      
      // Atualizar informações de paginação
      setPaginacaoInfo(prev => ({
        hasMore: data.has_more || false,
        totalCards: data.total_cards || prev.totalCards,
        nextPageUrl: data.next_page || null,
        currentPage: prev.currentPage + 1
      }));
      
    } catch (error) {
      console.error("Erro ao carregar próxima página:", error);
      setNotification({
        type: 'error',
        message: 'Erro ao carregar mais cartas. Tente novamente.',
        visible: true
      });
      
      setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }));
      }, 3000);
    } finally {
      setCarregandoProximaPagina(false);
    }
  };

  // Função para limpar filtros
  const limparFiltros = () => {
    dispatch({ type: 'RESET_FILTERS' });
    setResultadoPesquisa([])
    setErroPesquisa(null)
    setPaginacaoInfo({
      hasMore: false,
      totalCards: null,
      nextPageUrl: null,
      currentPage: 1
    });
  }

  // Função para pesquisar ao pressionar Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      pesquisarCartas()
    }
  }

  // Função para toggle de cor de mana

  // Effect para pesquisar automaticamente quando o termo de busca muda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.busca.trim() && filters.busca.length >= 3) {
        pesquisarCartas()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [filters.busca])
  
  // Effect para carregar pesquisas salvas do localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('savedSearches');
    if (savedSearches) {
      try {
        setPesquisasSalvas(JSON.parse(savedSearches));
      } catch (e) {
        console.error('Erro ao carregar pesquisas salvas:', e);
      }
    }
  }, [])
  
  // Função para salvar uma pesquisa
  const salvarPesquisa = () => {
    if (!nomePesquisaSalva.trim()) return;
    
    // Construir query para salvar
    let queryParts: string[] = []
    
    if (filters.busca.trim()) queryParts.push(filters.busca.trim())
    if (filters.raridade !== "all") queryParts.push(`rarity:${filters.raridade}`)
    if (filters.tipo !== "all") queryParts.push(`type:${filters.tipo}`)
    if (filters.subtipo !== "all") queryParts.push(`type:${filters.subtipo}`)
    if (filters.supertipo !== "all") queryParts.push(`is:${filters.supertipo}`)
    if (filters.cmc) queryParts.push(`cmc=${filters.cmc}`)
    if (filters.foil === "foil") queryParts.push("is:foil")
    if (filters.foil === "nonfoil") queryParts.push("-is:foil")
    if (filters.oracleText.trim()) queryParts.push(`oracle:"${filters.oracleText.trim()}"`)
    if (filters.manaColors.length > 0) queryParts.push(`colors:${filters.manaColors.join("")}`)
    
    const query = queryParts.join(" ")
    
    // Salvar pesquisa com nome e query
    const novaPesquisa = `${nomePesquisaSalva}: ${query}`;
    const novasPesquisas = [...pesquisasSalvas, novaPesquisa];
    setPesquisasSalvas(novasPesquisas);
    localStorage.setItem('savedSearches', JSON.stringify(novasPesquisas));
    
    // Fechar modal e limpar campo
    setMostrarModalSalvar(false);
    setNomePesquisaSalva('');
    
    // Mostrar notificação
    showNotification('success', `Pesquisa "${nomePesquisaSalva}" salva com sucesso!`);
  }
  
  // Função para carregar uma pesquisa salva
  const carregarPesquisaSalva = (pesquisa: string) => {
    const [nome, query] = pesquisa.split(': ');
    
    // Limpar filtros atuais
    dispatch({ type: 'RESET_FILTERS' });
    
    // Processar a query e configurar os filtros
    const partes = query.split(' ');
    
    partes.forEach(parte => {
      if (!parte.includes(':') && !parte.includes('=')) {
        // É um termo de busca simples
        setBusca(parte);
      } else if (parte.startsWith('rarity:')) {
        setRaridade(parte.replace('rarity:', ''));
      } else if (parte.startsWith('type:')) {
        // Verificar se é um subtipo ou tipo principal
        const tipoValor = parte.replace('type:', '');
        if (subtipos.includes(tipoValor)) {
          setSubtipo(tipoValor);
        } else {
          setTipo(tipoValor);
        }
      } else if (parte.startsWith('is:')) {
        const valor = parte.replace('is:', '');
        if (valor === 'foil') {
          setFoil('foil');
        } else {
          setSupertipo(valor);
        }
      } else if (parte.startsWith('-is:foil')) {
        setFoil('nonfoil');
      } else if (parte.startsWith('cmc=')) {
        setCmc(parte.replace('cmc=', ''));
      } else if (parte.startsWith('oracle:')) {
        setOracleText(parte.replace('oracle:', '').replace(/"/g, ''));
      } else if (parte.startsWith('colors:')) {
        const cores = parte.replace('colors:', '').split('');
        cores.forEach(cor => {
          if (coresMana.includes(cor)) {
            toggleManaCor(cor);
          }
        });
      }
    });
    
    // Executar a pesquisa
    setTimeout(() => pesquisarCartas(), 100);
    
    // Mostrar notificação
    showNotification('info', `Pesquisa "${nome}" carregada!`);
  }
  
  // Função para remover uma pesquisa salva
  const removerPesquisaSalva = (index: number) => {
    const novasPesquisas = [...pesquisasSalvas];
    const pesquisaRemovida = novasPesquisas[index].split(': ')[0];
    novasPesquisas.splice(index, 1);
    setPesquisasSalvas(novasPesquisas);
    localStorage.setItem('savedSearches', JSON.stringify(novasPesquisas));
    
    // Mostrar notificação
    showNotification('info', `Pesquisa "${pesquisaRemovida}" removida!`);
  }

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
    <div className="quantum-compact relative">
      <div className="ambient-glow pointer-events-none"></div>
      {/* Notificação */}
      {notification.visible && (
        <div className={`quantum-notification ${
          notification.type === 'success' ? 'quantum-notification-success' :
          notification.type === 'error' ? 'quantum-notification-error' : 'quantum-notification-info'
        }`}>
          {notification.message}
        </div>
      )}
      
      {/* Modal de importação */}
      <ImportCollectionModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(importedCount) => {
          showNotification('success', `Importação concluída! ${importedCount} cartas adicionadas à coleção.`);
        }}
      />
      
      {/* Modal de Completar Coleção */}
      <CollectionCompletion
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
      />

      {/* Busca Rápida */}
      <div className="quantum-card-dense mb-2 card-glow card-glow-blue">
        <div className="p-2">
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
              className="quantum-field"
            />
            <Search className="absolute right-2 top-2 w-4 h-4 text-gray-400" />
            
            {/* Sugestões */}
            {mostrarSugestoes && buscaRapida.length > 0 && (
              <div className="absolute top-full mt-1 w-full rounded-sm bg-gray-900/90 backdrop-blur-sm shadow-md overflow-hidden border border-gray-700/50 z-10">
                {sugestoesBusca
                  .filter(s => s.toLowerCase().includes(buscaRapida.toLowerCase()))
                  .slice(0, 5)
                  .map((sugestao, index) => (
                    <button
                      key={index}
                      onClick={() => buscarRapido(sugestao)}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-gray-800/80 transition-colors"
                    >
                      {sugestao}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegação de Tabs - Organizada horizontalmente */}
      <div className="quantum-card-dense bg-blue-900/20 border border-blue-500/30 mb-2 card-glow card-glow-purple">
        <div className="p-2">
          <div className="flex flex-row gap-2 justify-between">
            <div className="flex flex-row gap-2">
              <button
                onClick={() => {
                  setTab("pesquisa")
                  setBusca("")
                  setErroPesquisa(null)
                  setResultadoPesquisa([])
                }}
                className={`quantum-btn compact ${tab === "pesquisa" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"}`}
                style={{ minWidth: '100px' }}
              >
                <Search className="w-3 h-3 mr-1" />
                Pesquisar
              </button>
              <button
                onClick={() => {
                  setTab("colecao")
                  setBusca("")
                }}
                className={`quantum-btn compact ${tab === "colecao" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"}`}
                style={{ minWidth: '100px' }}
              >
                <Library className="w-3 h-3 mr-1" />
                Coleção ({collections?.length || 0})
              </button>
              <button
                onClick={() => setTab("estatisticas")}
                className={`quantum-btn compact ${tab === "estatisticas" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"}`}
                style={{ minWidth: '100px' }}
              >
                <Star className="w-3 h-3 mr-1" />
                Estatísticas
              </button>
            </div>
            <div className="flex flex-row gap-2">
              {tab === "pesquisa" && (
                <button
                  onClick={() => setMostrarModalSalvar(true)}
                  className="quantum-btn compact bg-purple-600 text-white"
                  style={{ minWidth: '100px' }}
                  disabled={!filters.busca.trim() && filters.raridade === "all" && filters.tipo === "all" &&
                    filters.subtipo === "all" && filters.supertipo === "all" && !filters.cmc &&
                    !filters.oracleText && filters.manaColors.length === 0 && filters.foil === "all"}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Salvar
                </button>
              )}
              <button
                onClick={() => setMostrarHistorico(!mostrarHistorico)}
                className={`quantum-btn compact ${mostrarHistorico ? "bg-green-600 text-white" : "bg-gray-700 text-gray-200"}`}
                style={{ minWidth: '100px' }}
              >
                <History className="w-3 h-3 mr-1" />
                Histórico
              </button>
            </div>
          </div>
          
          {/* Histórico de pesquisas */}
          {mostrarHistorico && (
            <div className="mt-3 p-3 bg-green-900/20 rounded-md border border-green-500/30 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-white flex items-center gap-1">
                  <History className="w-3 h-3 text-green-400" />
                  Pesquisas recentes
                </h4>
                {pesquisasSalvas.length > 0 && (
                  <Badge className="bg-purple-700 text-white cursor-default">Salvas: {pesquisasSalvas.length}</Badge>
                )}
              </div>
              
              {/* Pesquisas recentes */}
              {historicoMensagens.length > 0 ? (
                <div className="flex flex-wrap gap-1 mb-3">
                  {historicoMensagens.map((termo, index) => (
                    <Badge 
                      key={index} 
                      className="bg-green-700 hover:bg-green-600 cursor-pointer text-white px-2 py-0.5 text-xs"
                      onClick={() => buscarRapido(termo)}
                    >
                      {termo}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300 italic text-xs mb-3">Nenhuma pesquisa recente. Faça uma busca para começar!</p>
              )}
              
              {/* Pesquisas salvas */}
              {pesquisasSalvas.length > 0 && (
                <>
                  <div className="border-t border-green-500/30 pt-2 mt-2">
                    <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                      <Save className="w-3 h-3 text-purple-400" />
                      Pesquisas salvas
                    </h4>
                    <div className="space-y-1">
                      {pesquisasSalvas.map((pesquisa, index) => {
                        const [nome] = pesquisa.split(': ');
                        return (
                          <div key={index} className="flex justify-between items-center bg-gray-800/50 rounded px-2 py-1">
                            <span className="text-xs text-gray-200">{nome}</span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => carregarPesquisaSalva(pesquisa)}
                                className="p-1 rounded hover:bg-gray-700/50"
                              >
                                <Search className="w-3 h-3 text-cyan-400" />
                              </button>
                              <button 
                                onClick={() => removerPesquisaSalva(index)}
                                className="p-1 rounded hover:bg-gray-700/50"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {tab === "pesquisa" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Coluna 1: Filtros */}
          <div className="lg:col-span-1">
            <div className="quantum-card-dense p-2">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-3 h-3 text-cyan-400" />
                <h3 className="text-sm font-medium text-white">Filtros</h3>
              </div>
              
              <div className="space-y-2">
                {/* Busca por nome */}
                <div>
                  <label className="quantum-label">Nome</label>
                  <Input
                    type="text"
                    placeholder="Ex: Lightning Bolt"
                    value={filters.busca}
                    onChange={(e) => setBusca(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="quantum-field-sm"
                  />
                </div>

                {/* Filtros básicos */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="quantum-label">Raridade</label>
                    <SimpleSelect 
                      value={filters.raridade} 
                      onChange={setRaridade}
                      options={raridades.map(r => ({
                        value: r,
                        label: r === "all" ? "Todas" : capitalize(r)
                      }))}
                    />
                  </div>

                  <div>
                    <label className="quantum-label">Tipo</label>
                    <SimpleSelect 
                      value={filters.tipo} 
                      onChange={setTipo}
                      options={tipos.map(t => ({
                        value: t,
                        label: t === "all" ? "Todos" : capitalize(t)
                      }))}
                    />
                  </div>
                </div>

                {/* Botão para mostrar filtros avançados */}
                <Button
                  variant="outline"
                  onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
                  className="quantum-btn w-full text-xs h-7"
                  size="sm"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  {mostrarFiltrosAvancados ? "Ocultar" : "Mais"} Filtros
                </Button>

                {/* Filtros avançados */}
                {mostrarFiltrosAvancados && (
                  <div className="space-y-2 pt-2 border-t border-gray-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="quantum-label">Subtipo</label>
                        <SimpleSelect 
                          value={filters.subtipo} 
                          onChange={setSubtipo}
                          options={subtipos.map(st => ({
                            value: st,
                            label: st === "all" ? "Todos" : capitalize(st)
                          }))}
                        />
                      </div>

                      <div>
                        <label className="quantum-label">CMC</label>
                        <Input
                          type="number"
                          placeholder="Ex: 3"
                          value={filters.cmc}
                          onChange={(e) => setCmc(e.target.value)}
                          className="quantum-field-sm h-7"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="quantum-label">Supertipo</label>
                        <SimpleSelect 
                          value={filters.supertipo} 
                          onChange={setSupertipo}
                          options={supertipos.map(st => ({
                            value: st,
                            label: st === "all" ? "Todos" : capitalize(st)
                          }))}
                        />
                      </div>

                      <div>
                        <label className="quantum-label">Foil</label>
                        <SimpleSelect 
                          value={filters.foil} 
                          onChange={setFoil}
                          options={foils.map(f => ({
                            value: f,
                            label: f === "all" ? "Todas" : f === "foil" ? "Foil" : "Normal"
                          }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="quantum-label">Texto Oracle</label>
                      <Textarea
                        placeholder="Ex: exile target creature"
                        value={filters.oracleText}
                        onChange={(e) => setOracleText(e.target.value)}
                        className="quantum-field-sm"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="quantum-label">Cores</label>
                      <div className="flex flex-wrap gap-1">
                        {coresMana.map(cor => (
                          <Button
                            key={cor}
                            variant={filters.manaColors.includes(cor) ? "default" : "outline"}
                            onClick={() => toggleManaCor(cor)}
                            className={`w-6 h-6 p-0 text-xs ${
                              filters.manaColors.includes(cor)
                                ? cor === 'W' ? 'bg-yellow-200 text-gray-900' :
                                  cor === 'U' ? 'bg-blue-500' :
                                  cor === 'B' ? 'bg-gray-900 text-white border-gray-600' :
                                  cor === 'R' ? 'bg-red-500' :
                                  cor === 'G' ? 'bg-green-500' :
                                  'bg-gray-400'
                                : 'border-gray-600 text-gray-300'
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
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={pesquisarCartas}
                    disabled={carregandoPesquisa}
                    className="quantum-btn flex-1 compact primary"
                    size="sm"
                  >
                    {carregandoPesquisa ? (
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Search className="w-3 h-3 mr-1" />
                    )}
                    Buscar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={limparFiltros}
                    className="quantum-btn"
                    size="sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Opções de visualização */}
                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    id="mostrarCartasNaColecao"
                    checked={mostrarCartasNaColecao}
                    onChange={(e) => setMostrarCartasNaColecao(e.target.checked)}
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="mostrarCartasNaColecao" className="text-xs text-gray-400">
                    Destacar cartas na coleção
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2-4: Resultados */}
          <div className="lg:col-span-3">
            <div className="quantum-card-dense p-2">
              {erroPesquisa ? (
                <div className="text-center py-4">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <p className="text-red-400 text-sm">{erroPesquisa}</p>
                  <Button onClick={pesquisarCartas} variant="outline" className="quantum-btn mt-2">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Tentar Novamente
                  </Button>
                </div>
              ) : carregandoPesquisa ? (
                <div className="text-center py-4">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
                  <p className="text-gray-400 text-sm">Pesquisando cartas...</p>
                </div>
              ) : resultadoPesquisa.length > 0 ? (
                <EnhancedSearchCardList
                    cards={resultadoPesquisa}
                    collection={currentCollection?.cards || []}
                    onAddCard={adicionarCarta}
                    searchResults={{
                      hasMore: paginacaoInfo.hasMore,
                      nextPage: carregarProximaPagina,
                      totalCards: paginacaoInfo.totalCards || undefined,
                      currentPage: paginacaoInfo.currentPage,
                      isLoadingMore: carregandoProximaPagina
                    }}
                    onSortChange={handleSortChange}
                    currentSort={{
                      mode: ordenacaoBusca,
                      direction: direcaoOrdenacaoBusca
                    }}
                  />
              ) : (
                <div className="text-center py-4">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                  <h3 className="text-sm font-medium text-white mb-1">Pesquise por cartas</h3>
                  <p className="text-gray-400 text-xs mb-3">
                    Use os filtros ao lado para encontrar cartas específicas
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button onClick={() => setBusca("Lightning Bolt")} className="quantum-btn text-xs h-7">
                      Lightning Bolt
                    </Button>
                    <Button onClick={() => setRaridade("mythic")} className="quantum-btn text-xs h-7">
                      Cartas Míticas
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "colecao" && (
        <div className="space-y-2">
          {/* Grid de Coleções */}
          <div className="quantum-card-dense p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-white">Minhas Coleções</h2>
                </div>
                <Button onClick={() => createCollection("Nova Coleção")} className="quantum-btn compact primary">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Nova Coleção
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {collections.map(col => (
                <CollectionBox
                  key={col.id}
                  collection={col}
                  onSelect={setCurrentCollectionId}
                  onDelete={deleteCollection}
                  onEdit={(id) => setEditingCollection(collections.find(c => c.id === id) || null)}
                  onDuplicate={duplicateCollection}
                  onSetBackground={setShowBackgroundSelector}
                  isActive={currentCollectionId === col.id}
                />
              ))}
            </div>
          </div>

          {/* Modal de Edição de Coleção */}
          {/* Modal para salvar pesquisa */}
      <Dialog open={mostrarModalSalvar} onOpenChange={setMostrarModalSalvar}>
        <DialogContent className="quantum-card-dense fixed-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-4 h-4 text-purple-400" />
              Salvar Pesquisa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="search-name" className="quantum-label">Nome da pesquisa</label>
              <Input
                id="search-name"
                value={nomePesquisaSalva}
                onChange={(e) => setNomePesquisaSalva(e.target.value)}
                placeholder="Ex: Criaturas Vermelhas"
                className="quantum-field"
              />
            </div>
            <div>
              <label className="quantum-label">Filtros atuais</label>
              <div className="bg-gray-800/50 rounded p-2 text-xs text-gray-300 max-h-24 overflow-y-auto">
                {filters.busca.trim() && <div><span className="text-cyan-400">Busca:</span> {filters.busca}</div>}
                {filters.raridade !== "all" && <div><span className="text-cyan-400">Raridade:</span> {filters.raridade}</div>}
                {filters.tipo !== "all" && <div><span className="text-cyan-400">Tipo:</span> {filters.tipo}</div>}
                {filters.subtipo !== "all" && <div><span className="text-cyan-400">Subtipo:</span> {filters.subtipo}</div>}
                {filters.supertipo !== "all" && <div><span className="text-cyan-400">Supertipo:</span> {filters.supertipo}</div>}
                {filters.cmc && <div><span className="text-cyan-400">CMC:</span> {filters.cmc}</div>}
                {filters.foil !== "all" && <div><span className="text-cyan-400">Foil:</span> {filters.foil}</div>}
                {filters.oracleText.trim() && <div><span className="text-cyan-400">Texto Oracle:</span> {filters.oracleText}</div>}
                {filters.manaColors.length > 0 && <div><span className="text-cyan-400">Cores:</span> {filters.manaColors.join(", ")}</div>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarModalSalvar(false)}>Cancelar</Button>
            <Button 
              onClick={salvarPesquisa}
              disabled={!nomePesquisaSalva.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!editingCollection} onOpenChange={(isOpen) => !isOpen && setEditingCollection(null)}>
            <DialogContent className="quantum-card-dense fixed-modal" aria-describedby="edit-collection-description">
              <DialogHeader>
                <DialogTitle>Editar Coleção</DialogTitle>
                <DialogDescription id="edit-collection-description">
                  Edite o nome e descrição da sua coleção.
                </DialogDescription>
              </DialogHeader>
              {editingCollection && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="collection-name" className="quantum-label">Nome</label>
                    <Input
                      id="collection-name"
                      value={editingCollection.name}
                      onChange={(e) => setEditingCollection({ ...editingCollection, name: e.target.value })}
                      className="quantum-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="collection-description" className="quantum-label">Descrição</label>
                    <Textarea
                      id="collection-description"
                      value={editingCollection.description}
                      onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                      className="quantum-field"
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingCollection(null)}>Cancelar</Button>
                <Button onClick={() => {
                  if (editingCollection) {
                    updateCollection(editingCollection.id, {
                      name: editingCollection.name,
                      description: editingCollection.description
                    });
                    setEditingCollection(null);
                  }
                }}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!showBackgroundSelector} onOpenChange={(isOpen) => !isOpen && setShowBackgroundSelector(null)}>
            <DialogContent className="quantum-card-dense overflow-hidden border border-cyan-500/20 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-lg focus:outline-none fixed-modal card-selector-modal z-[10000]">
              <DialogHeader>
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <DialogTitle className="text-lg font-medium text-cyan-400">Escolher Imagem de Fundo</DialogTitle>
                  </div>
                  <Button
                    onClick={() => setShowBackgroundSelector(null)}
                    className="h-7 w-7 p-0 rounded-full bg-gray-800/60 hover:bg-gray-700/60 border-none"
                  >
                    <Plus className="h-3.5 w-3.5 text-gray-400 rotate-45" />
                  </Button>
                </div>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto p-1 quantum-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {collections.find(c => c.id === showBackgroundSelector)?.cards.map(card => (
                    <div
                      key={card.card.id}
                      className="relative cursor-pointer rounded-md overflow-hidden transition-all hover:scale-[1.03] group ring-1 ring-gray-700 hover:ring-cyan-400"
                      onClick={() => {
                        const imageUrl = card.card.image_uris?.art_crop || card.card.image_uris?.normal;
                        if (imageUrl && showBackgroundSelector) {
                          updateCollection(showBackgroundSelector, { backgroundImage: imageUrl });
                        }
                      }}
                    >
                      <Image
                        src={card.card.image_uris?.small || '/placeholder.png'}
                        alt={card.card.name}
                        width={146}
                        height={204}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                        <p className="text-xs text-white truncate">{card.card.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter className="pt-4 border-t border-cyan-500/20">
                <Button variant="outline" className="quantum-btn compact" onClick={() => {
                  if (showBackgroundSelector) {
                    updateCollection(showBackgroundSelector, { backgroundImage: undefined });
                  }
                  setShowBackgroundSelector(null);
                }}>Usar Padrão</Button>
                <Button className="quantum-btn primary compact" onClick={() => setShowBackgroundSelector(null)}>Concluído</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {!currentCollection ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhuma coleção selecionada. Crie uma para começar.</p>
            </div>
          ) : (
            <>
              {/* Header da Coleção */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="quantum-title">{currentCollection.name}</h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsCompletionModalOpen(true)}
                    className="quantum-btn compact bg-purple-600 hover:bg-purple-700"
                    size="sm"
                    disabled={!currentCollection}
                  >
                    <ListChecks className="w-3 h-3 mr-1" />
                    Completar
                  </Button>
                  <Button
                    onClick={() => setIsImportModalOpen(true)}
                    className="quantum-btn compact bg-cyan-600 hover:bg-cyan-700"
                    size="sm"
                    disabled={!currentCollection}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Importar
                  </Button>
                  <Button
                    onClick={() => exportCollectionToCSV(currentCollection)}
                    className="quantum-btn compact"
                    size="sm"
                    disabled={!currentCollection}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Exportar
                  </Button>
                </div>
              </div>

              {/* Filtros da Coleção */}
              <div className="quantum-card-dense p-2 mb-2 filtros-colecao">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    placeholder="Buscar na coleção..."
                    value={buscaColecao}
                    onChange={(e) => setBuscaColecao(e.target.value)}
                    className="quantum-field-sm h-7"
                  />
                  <div className="flex gap-2">
                    <SimpleSelect
                      value={filtroRaridadeColecao}
                      onChange={setFiltroRaridadeColecao}
                      options={[
                        { value: "all", label: "Todas" },
                        { value: "common", label: "Comum" },
                        { value: "uncommon", label: "Incomum" },
                        { value: "rare", label: "Rara" },
                        { value: "mythic", label: "Mítica" }
                      ]}
                      placeholder="Raridade"
                      className="flex-1"
                    />
                    <SimpleSelect
                      value={filtroCorColecao}
                      onChange={setFiltroCorColecao}
                      options={[
                        { value: "all", label: "Todas" },
                        { value: "W", label: "Branco" },
                        { value: "U", label: "Azul" },
                        { value: "B", label: "Preto" },
                        { value: "R", label: "Vermelho" },
                        { value: "G", label: "Verde" },
                        { value: "colorless", label: "Incolor" }
                      ]}
                      placeholder="Cor"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      onClick={() => toggleOrdenacao('name')}
                      className="quantum-btn compact flex-1"
                      size="sm"
                    >
                      Nome {ordenacao === 'name' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleOrdenacao('rarity')}
                      className="quantum-btn compact flex-1"
                      size="sm"
                    >
                      Raridade {ordenacao === 'rarity' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleOrdenacao('date')}
                      className="quantum-btn compact flex-1"
                      size="sm"
                    >
                      Data {ordenacao === 'date' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleOrdenacao('cmc')}
                      className="quantum-btn compact flex-1"
                      size="sm"
                    >
                      CMC {ordenacao === 'cmc' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lista de Cartas da Coleção */}
              <div className="quantum-card-dense p-2">
                {cartasFiltradas.length === 0 ? (
                  <div className="text-center py-4">
                    <Library className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                    <h3 className="text-sm font-medium text-white mb-1">Coleção vazia</h3>
                    <p className="text-gray-400 text-xs mb-3">
                      Adicione cartas à sua coleção pesquisando na aba "Pesquisar"
                    </p>
                    <Button
                      onClick={() => setTab("pesquisa")}
                      className="quantum-btn primary"
                    >
                      <Search className="w-3 h-3 mr-1" />
                      Pesquisar Cartas
                    </Button>
                  </div>
                ) : (
                  <ExpandableCardGrid
                    collectionCards={cartasFiltradas}
                    onAddCard={adicionarCarta}
                    onRemoveCard={(card) => {
                      if (typeof card === 'string') {
                        // Se for string (ID), encontrar a carta correspondente
                        const cardObj = currentCollection?.cards.find(c => c.card.id === card)?.card;
                        if (cardObj) removerCarta(cardObj);
                      } else {
                        // Se for objeto MTGCard, usar diretamente
                        removerCarta(card);
                      }
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "estatisticas" && (
        <div className="space-y-2">
          {!currentCollection ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Selecione uma coleção para ver as estatísticas.</p>
            </div>
          ) : (
            <>
              {/* Estatísticas da Coleção */}
              <div className="quantum-grid-3">
                <div className="quantum-card-dense p-3 text-center">
                  <Library className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">{currentCollection.cards.length}</h3>
                  <p className="text-gray-400 text-xs">Cartas únicas</p>
                </div>
                
                <div className="quantum-card-dense p-3 text-center">
                  <Package className="w-5 h-5 mx-auto mb-1 text-green-400" />
                  <h3 className="text-lg font-bold text-white">
                    {currentCollection.cards.reduce((sum, c: CollectionCard) => sum + c.quantity, 0)}
                  </h3>
                  <p className="text-gray-400 text-xs">Total de cartas</p>
                </div>
                
                <div className="quantum-card-dense p-3 text-center">
                  <Star className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">
                    {new Set(currentCollection.cards.map((c: CollectionCard) => c.card.set_code)).size}
                  </h3>
                  <p className="text-gray-400 text-xs">Coleções diferentes</p>
                </div>
              </div>

              {/* Distribuição por Raridade */}
              <div className="quantum-card-dense p-3">
                <h3 className="quantum-card-title text-sm font-medium mb-2">Distribuição por Raridade</h3>
                <div className="space-y-2">
                  {(['common', 'uncommon', 'rare', 'mythic'] as const).map(rarity => {
                    const count = currentCollection.cards.filter((c: CollectionCard) => c.card.rarity === rarity).length;
                    const percentage = currentCollection.cards.length > 0
                      ? (count / currentCollection.cards.length * 100).toFixed(1)
                      : '0';
                    
                    return (
                      <div key={rarity} className="flex justify-between items-center">
                        <span className={`text-xs font-medium ${getRarityColor(rarity)}`}>
                          {capitalize(rarity)}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-24 bg-gray-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                rarity === 'common' ? 'bg-gray-400' :
                                rarity === 'uncommon' ? 'bg-green-400' :
                                rarity === 'rare' ? 'bg-yellow-400' :
                                'bg-orange-400'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-gray-300 text-xs w-6 text-right">
                            {count}
                          </span>
                          <span className="text-gray-500 text-xs w-10 text-right">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top 5 Coleções */}
              <div className="quantum-card-dense p-3">
                <h3 className="quantum-card-title text-sm font-medium mb-2">Top 5 Coleções por Cartas</h3>
                <div className="space-y-1">
                  {Object.entries(
                    currentCollection.cards.reduce((acc, card: CollectionCard) => {
                      const setName = card.card.set_name;
                      acc[setName] = (acc[setName] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([setName, count], index) => (
                      <div key={setName} className="flex justify-between items-center py-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 text-xs w-4">{index + 1}.</span>
                          <span className="text-white text-xs">{setName}</span>
                        </div>
                        <span className="quantum-microtag">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
