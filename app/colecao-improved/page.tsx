"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAppContext } from "@/contexts/AppContext";
import { useCardModal } from "@/contexts/CardModalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import QuantityControl from "@/components/QuantityControl";
import { getImageUrl } from "@/utils/imageService";
import { searchCardsWithTranslation } from "@/utils/scryfallService";
import { cardMatchesSearchTerm } from "@/utils/translationService";
import { MTGCard } from "@/types/mtg";
import {
  Search,
  Library,
  Star,
  Filter,
  RefreshCw,
  Plus,
  Minus,
  Download,
  CheckCircle,
  AlertCircle,
  Package,
  PieChart,
  Info,
  Grid,
  List,
  Heart,
  ChevronDown,
  X,
  Eye,
} from "lucide-react";

// Importar estilos personalizados
import "@/styles/collection-improved.css";

export default function ColecaoImproved() {
  // Contextos
  const { currentCollection, adicionarCarta, removerCarta, getQuantidadeNaColecao } = useAppContext();
  const { openModal } = useCardModal();

  // Estados para navegação entre tabs da coleção
  const [activeTab, setActiveTab] = useState<string>("search");
  
  // Estados para pesquisa
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<MTGCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<MTGCard | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Estados para visualização
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [highlightCollection, setHighlightCollection] = useState(true);
  
  // Estados para filtros
  const [rarityFilter, setRarityFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cmcFilter, setCmcFilter] = useState("");
  
  // Estados para coleção
  const [collectionSearch, setCollectionSearch] = useState("");
  const [collectionSort, setCollectionSort] = useState<"name" | "rarity" | "cmc" | "quantity">("name");
  const [collectionSortDirection, setCollectionSortDirection] = useState<"asc" | "desc">("asc");
  const [collectionRarityFilter, setCollectionRarityFilter] = useState("all");
  const [collectionColorFilter, setCollectionColorFilter] = useState("all");
  
  // Estado para notificações
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: "success" | "error";
    message: string;
  }>({ visible: false, type: "success", message: "" });

  // Função para mostrar notificação
  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ visible: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  // Função para pesquisar cartas
  const searchCards = useCallback(async () => {
    if (!searchTerm.trim() && rarityFilter === "all" && colorFilter === "all" && typeFilter === "all" && !cmcFilter) {
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Construir query para Scryfall
      let queryParts = [];

      if (searchTerm.trim()) queryParts.push(searchTerm.trim());
      if (rarityFilter !== "all") queryParts.push(`rarity:${rarityFilter}`);
      if (typeFilter !== "all") queryParts.push(`type:${typeFilter}`);
      if (cmcFilter) {
        const cmcNumber = parseInt(cmcFilter);
        if (!isNaN(cmcNumber)) {
          queryParts.push(`cmc=${cmcNumber}`);
        }
      }
      if (colorFilter !== "all") {
        if (colorFilter === "colorless") {
          queryParts.push(`is:colorless`);
        } else {
          queryParts.push(`color:${colorFilter}`);
        }
      }

      const query = queryParts.join(" ");

      // Fazer requisição para Scryfall
      const response = await searchCardsWithTranslation(query);

      if (!response.ok) {
        if (response.status === 404) {
          setSearchResults([]);
          setSearchError("Nenhuma carta encontrada com os filtros especificados");
        } else {
          throw new Error(`Erro na API: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      setSearchResults(data.data || []);

      if (data.data && data.data.length === 0) {
        setSearchError("Nenhuma carta encontrada com os filtros especificados");
      }
    } catch (error) {
      console.error("Erro ao pesquisar cartas:", error);
      setSearchError("Erro ao pesquisar cartas. Tente novamente.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, rarityFilter, colorFilter, typeFilter, cmcFilter]);

  // Função para limpar pesquisa
  const clearSearch = () => {
    setSearchTerm("");
    setRarityFilter("all");
    setColorFilter("all");
    setTypeFilter("all");
    setCmcFilter("");
    setSearchResults([]);
    setSearchError(null);
    setSelectedCard(null);
  };

  // Pesquisar quando os termos mudam
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.length >= 3) {
        searchCards();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, searchCards]);

  // Função para adicionar carta à coleção
  const addCardToCollection = useCallback((card: MTGCard, quantity: number = 1) => {
    try {
      for (let i = 0; i < quantity; i++) {
        adicionarCarta(card);
      }
      showNotification("success", `${quantity}x ${card.name} adicionada à coleção!`);
    } catch (error) {
      console.error("Erro ao adicionar carta:", error);
      showNotification("error", "Erro ao adicionar carta à coleção");
    }
  }, [adicionarCarta, showNotification]);

  // Função para selecionar uma carta
  const handleSelectCard = (card: MTGCard) => {
    setSelectedCard(card);
    setQuantity(1);
  };

  // Função para ver detalhes da carta
  const viewCardDetails = (card: MTGCard) => {
    openModal(card);
  };

  // Filtrar e ordenar as cartas da coleção
  const filteredCollectionCards = React.useMemo(() => {
    if (!currentCollection || !currentCollection.cards) return [];
    let filtered = currentCollection.cards;

    // Filtro por busca
    if (collectionSearch.trim()) {
      const searchTerm = collectionSearch.trim();
      filtered = filtered.filter(c => cardMatchesSearchTerm(c.card, searchTerm));
    }

    // Filtro por raridade
    if (collectionRarityFilter !== "all") {
      filtered = filtered.filter(c => c.card.rarity === collectionRarityFilter);
    }

    // Filtro por cor
    if (collectionColorFilter !== "all") {
      if (collectionColorFilter === "colorless") {
        filtered = filtered.filter(c => !c.card.color_identity || c.card.color_identity.length === 0);
      } else {
        filtered = filtered.filter(c => c.card.color_identity && c.card.color_identity.includes(collectionColorFilter));
      }
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (collectionSort) {
        case "name":
          comparison = a.card.name.localeCompare(b.card.name);
          break;
        case "rarity":
          const rarityOrder = { common: 1, uncommon: 2, rare: 3, mythic: 4 };
          comparison = (rarityOrder[a.card.rarity as keyof typeof rarityOrder] || 0) - 
                      (rarityOrder[b.card.rarity as keyof typeof rarityOrder] || 0);
          break;
        case "cmc":
          comparison = (a.card.cmc || 0) - (b.card.cmc || 0);
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
      }
      
      return collectionSortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    currentCollection, 
    collectionSearch, 
    collectionRarityFilter, 
    collectionColorFilter, 
    collectionSort, 
    collectionSortDirection
  ]);

  // Função para alternar direção de ordenação
  const toggleSortDirection = (sortType: typeof collectionSort) => {
    if (collectionSort === sortType) {
      setCollectionSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setCollectionSort(sortType);
      setCollectionSortDirection("asc");
    }
  };

  // Obter cor da carta baseada na raridade
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "text-gray-300 bg-gray-700/50";
      case "uncommon":
        return "text-green-300 bg-green-900/20";
      case "rare":
        return "text-yellow-300 bg-yellow-900/20";
      case "mythic":
        return "text-orange-300 bg-orange-900/20";
      default:
        return "text-gray-300 bg-gray-700/50";
    }
  };

  // Obter URL da imagem
  const getCardImage = (card: MTGCard): string => {
    return getImageUrl(card, "normal");
  };

  // Componente para exibir uma carta nos resultados de pesquisa
  const SearchResultCard = ({ card }: { card: MTGCard }) => {
    const quantityInCollection = getQuantidadeNaColecao(card.id);
    const isSelected = selectedCard && selectedCard.id === card.id;
    const imageUrl = getCardImage(card);

    return (
      <div
        className={`card-list-item cursor-pointer ${isSelected ? "card-item-selected" : ""}`}
        onClick={() => handleSelectCard(card)}
      >
        {quantityInCollection > 0 && highlightCollection && (
          <Badge
            className="absolute top-2 right-2 z-10 bg-blue-600/90 backdrop-blur-sm border border-blue-500/30"
          >
            {quantityInCollection}x
          </Badge>
        )}
        <div className="card-image-container">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={card.name}
              className="card-image"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <span className="text-sm text-gray-500">{card.set_name}</span>
            </div>
          )}
        </div>
        <div className="card-info">
          <div className="card-name text-white">{card.name}</div>
          <div className="card-meta">
            <span>{card.set_name}</span>
            <span className={`card-badge ${getRarityColor(card.rarity)}`}>
              {card.rarity.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Componente para exibir uma carta na coleção
  const CollectionCard = ({ card, quantity }: { card: MTGCard; quantity: number }) => {
    const imageUrl = getCardImage(card);

    return (
      <div className="card-list-item">
        <Badge
          className="absolute top-2 right-2 z-10 bg-blue-600/90 backdrop-blur-sm border border-blue-500/30"
        >
          {quantity}x
        </Badge>
        <div className="card-image-container">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={card.name}
              className="card-image"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <span className="text-sm text-gray-500">{card.set_name}</span>
            </div>
          )}
        </div>
        <div className="card-info">
          <div className="card-name text-white">{card.name}</div>
          <div className="card-meta">
            <span>{card.set_code.toUpperCase()}</span>
            <span className={`card-badge ${getRarityColor(card.rarity)}`}>
              {card.rarity.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-black/70 flex items-center justify-center gap-2 transition-opacity duration-200">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              viewCardDetails(card);
            }}
          >
            <Eye className="w-4 h-4 mr-1" /> Ver
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              removerCarta(card);
              showNotification("success", `1x ${card.name} removida da coleção`);
            }}
          >
            <Minus className="w-4 h-4 mr-1" /> Remover
          </Button>
        </div>
      </div>
    );
  };

  // Componente para exibir a carta selecionada
  const SelectedCardView = () => {
    if (!selectedCard) return null;

    const imageUrl = getCardImage(selectedCard);
    const quantityInCollection = getQuantidadeNaColecao(selectedCard.id);

    return (
      <Card className="card-details border-gray-700/50 bg-gray-800/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Coluna da imagem */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="aspect-[63/88] rounded-lg overflow-hidden border border-gray-600">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={selectedCard.name}
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <span className="text-gray-500">Sem imagem</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 hover:bg-gray-700"
                  onClick={() => viewCardDetails(selectedCard)}
                >
                  <Info className="w-4 h-4 mr-2" />
                  Ver detalhes completos
                </Button>
              </div>
            </div>

            {/* Coluna das informações */}
            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedCard.name}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {selectedCard.set_name} ({selectedCard.set_code.toUpperCase()})
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {selectedCard.type_line}
                  </Badge>
                  <Badge className={getRarityColor(selectedCard.rarity)}>
                    {selectedCard.rarity.charAt(0).toUpperCase() + selectedCard.rarity.slice(1)}
                  </Badge>
                </div>

                {quantityInCollection > 0 && (
                  <div className="mb-4">
                    <Badge className="bg-blue-600 text-white">
                      {quantityInCollection}x na coleção
                    </Badge>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Adicionar à coleção</h3>
                
                <div className="flex flex-wrap items-center gap-3">
                  <QuantityControl
                    initialValue={quantity}
                    onChange={(value) => setQuantity(value)}
                    showPresets={true}
                  />
                </div>
              </div>

              {/* Texto da carta */}
              {selectedCard.oracle_text && (
                <div className="mt-4 p-3 bg-gray-900/70 rounded-lg border border-gray-700">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedCard.oracle_text}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Componentes de estatísticas da coleção
  const CollectionStats = () => {
    if (!currentCollection || !currentCollection.cards) {
      return (
        <div className="text-center p-8 bg-gray-800/50 border border-gray-700 rounded-lg">
          <Library className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-medium text-white mb-2">Coleção não disponível</h3>
          <p className="text-gray-400 mb-6">
            Não foi possível carregar os dados da coleção.
          </p>
        </div>
      );
    }
    
    const totalCards = currentCollection.cards.reduce((sum, card) => sum + card.quantity, 0);
    const uniqueCards = currentCollection.cards.length;
    const uniqueSets = new Set(currentCollection.cards.map(c => c.card.set_code)).size;

    // Cálculo da distribuição por raridade
    const rarityDistribution = currentCollection.cards.reduce((acc, card) => {
      const rarity = card.card.rarity;
      if (!acc[rarity]) acc[rarity] = 0;
      acc[rarity] += card.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Cores mais frequentes
    const colorCounts = currentCollection.cards.reduce((acc, card) => {
      (card.card.color_identity || []).forEach(color => {
        if (!acc[color]) acc[color] = 0;
        acc[color] += card.quantity;
      });
      
      // Contar cartas incolores
      if (!card.card.color_identity || card.card.color_identity.length === 0) {
        if (!acc["C"]) acc["C"] = 0;
        acc["C"] += card.quantity;
      }
      
      return acc;
    }, {} as Record<string, number>);

    // Ordenar cores por quantidade
    const topColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 mx-auto mb-2 text-blue-400" />
              <h3 className="text-2xl font-bold text-white">{totalCards}</h3>
              <p className="text-gray-400">Total de cartas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-6 text-center">
              <Library className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <h3 className="text-2xl font-bold text-white">{uniqueCards}</h3>
              <p className="text-gray-400">Cartas únicas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">{uniqueSets}</h3>
              <p className="text-gray-400">Coleções diferentes</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white">Distribuição por Raridade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["common", "uncommon", "rare", "mythic"].map((rarity) => {
                  const count = rarityDistribution[rarity] || 0;
                  const percentage = totalCards > 0 ? (count / totalCards) * 100 : 0;
                  
                  let barColor = "";
                  switch (rarity) {
                    case "common": barColor = "bg-gray-400"; break;
                    case "uncommon": barColor = "bg-green-400"; break;
                    case "rare": barColor = "bg-yellow-400"; break;
                    case "mythic": barColor = "bg-orange-400"; break;
                  }
                  
                  return (
                    <div key={rarity} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{rarity}</span>
                        <span>{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-2 ${barColor} rounded-full`} 
                          style={{ width: `${Math.max(percentage, 1)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white">Cores Mais Frequentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topColors.map(([color, count]) => {
                  const percentage = totalCards > 0 ? (count / totalCards) * 100 : 0;
                  
                  let colorName = "";
                  let barColor = "";
                  
                  switch (color) {
                    case "W": 
                      colorName = "Branco"; 
                      barColor = "bg-yellow-200"; 
                      break;
                    case "U": 
                      colorName = "Azul"; 
                      barColor = "bg-blue-500"; 
                      break;
                    case "B": 
                      colorName = "Preto"; 
                      barColor = "bg-gray-800"; 
                      break;
                    case "R": 
                      colorName = "Vermelho"; 
                      barColor = "bg-red-500"; 
                      break;
                    case "G": 
                      colorName = "Verde"; 
                      barColor = "bg-green-500"; 
                      break;
                    case "C": 
                      colorName = "Incolor"; 
                      barColor = "bg-gray-400"; 
                      break;
                  }
                  
                  return (
                    <div key={color} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{colorName} ({color})</span>
                        <span>{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-2 ${barColor} rounded-full`} 
                          style={{ width: `${Math.max(percentage, 1)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="collection-container p-4 space-y-6 animate-in fade-in duration-300">
      {/* Notificação */}
      {notification.visible && (
        <div 
          className={`notification ${
            notification.type === "success" 
              ? "notification-success" 
              : "notification-error"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white" />
          )}
          <span className="text-white">{notification.message}</span>
        </div>
      )}

      <h1 className="text-3xl font-bold text-white">Minha Coleção</h1>
      
      {/* Navegação de Tabs */}
      <div className="collection-tabs">
        <button
          onClick={() => setActiveTab("search")}
          className={`tab-button ${activeTab === "search" ? "active" : ""}`}
        >
          <Search className="w-4 h-4" />
          Pesquisar
        </button>
        <button
          onClick={() => setActiveTab("collection")}
          className={`tab-button ${activeTab === "collection" ? "active" : ""}`}
        >
          <Library className="w-4 h-4" />
          Coleção ({currentCollection?.cards?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`tab-button ${activeTab === "stats" ? "active" : ""}`}
        >
          <PieChart className="w-4 h-4" />
          Estatísticas
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === "search" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Coluna de Filtros */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Pesquisar Cartas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Barra de pesquisa */}
                <div className="search-bar">
                  <Input
                    type="text"
                    placeholder="Nome da carta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <Search className="search-icon w-4 h-4" />
                </div>

                {/* Opções de visualização */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="highlightCollection"
                      checked={highlightCollection}
                      onChange={() => setHighlightCollection(!highlightCollection)}
                      className="rounded border-gray-600 bg-gray-900"
                    />
                    <label htmlFor="highlightCollection" className="text-sm text-gray-300">
                      Destacar cartas na coleção
                    </label>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-gray-600 hover:bg-gray-700"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    Filtros
                    <ChevronDown className={`w-3 h-3 ml-1 transform transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </Button>
                </div>

                {/* Filtros colapsáveis */}
                <div className={`filter-container ${showFilters ? "block" : "hidden"}`}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Raridade
                      </label>
                      <select
                        value={rarityFilter}
                        onChange={(e) => setRarityFilter(e.target.value)}
                        className="w-full rounded-md bg-gray-900/50 border-gray-600 text-white p-2 text-sm"
                      >
                        <option value="all">Todas</option>
                        <option value="common">Comum</option>
                        <option value="uncommon">Incomum</option>
                        <option value="rare">Rara</option>
                        <option value="mythic">Mítica</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Cor
                      </label>
                      <select
                        value={colorFilter}
                        onChange={(e) => setColorFilter(e.target.value)}
                        className="w-full rounded-md bg-gray-900/50 border-gray-600 text-white p-2 text-sm"
                      >
                        <option value="all">Todas</option>
                        <option value="W">Branco (W)</option>
                        <option value="U">Azul (U)</option>
                        <option value="B">Preto (B)</option>
                        <option value="R">Vermelho (R)</option>
                        <option value="G">Verde (G)</option>
                        <option value="colorless">Incolor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Tipo
                      </label>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full rounded-md bg-gray-900/50 border-gray-600 text-white p-2 text-sm"
                      >
                        <option value="all">Todos</option>
                        <option value="creature">Criatura</option>
                        <option value="instant">Mágica Instantânea</option>
                        <option value="sorcery">Feitiço</option>
                        <option value="enchantment">Encantamento</option>
                        <option value="artifact">Artefato</option>
                        <option value="planeswalker">Planeswalker</option>
                        <option value="land">Terreno</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Custo de Mana
                      </label>
                      <Input
                        type="number"
                        placeholder="Ex: 3"
                        value={cmcFilter}
                        onChange={(e) => setCmcFilter(e.target.value)}
                        min="0"
                        className="bg-gray-900/50 border-gray-600 text-white"
                      />
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={searchCards}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Pesquisando...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Pesquisar
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={clearSearch}
                        variant="outline"
                        className="border-gray-600 hover:bg-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card selecionado */}
            {selectedCard && <SelectedCardView />}
          </div>

          {/* Coluna de Resultados */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div>
                {searchResults.length > 0 && (
                  <span className="text-gray-300">
                    {searchResults.length} resultado{searchResults.length !== 1 && "s"}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`border-gray-600 ${
                    viewMode === "grid" ? "bg-gray-700" : "bg-transparent"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`border-gray-600 ${
                    viewMode === "list" ? "bg-gray-700" : "bg-transparent"
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {searchError ? (
              <div className="text-center p-8 bg-gray-800/50 border border-gray-700 rounded-lg">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p className="text-red-400 mb-4">{searchError}</p>
                <Button onClick={searchCards} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            ) : isSearching ? (
              <div className="text-center p-8 bg-gray-800/50 border border-gray-700 rounded-lg">
                <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
                <p className="text-gray-300">Pesquisando cartas...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center p-8 bg-gray-800/50 border border-gray-700 rounded-lg">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-medium text-white mb-2">Pesquise por cartas</h3>
                <p className="text-gray-400 mb-6">
                  Digite o nome da carta ou use os filtros para encontrar cartas específicas
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={() => setSearchTerm("Lightning Bolt")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Exemplo: Lightning Bolt
                  </Button>
                </div>
              </div>
            ) : (
              <div className="card-list">
                {searchResults.map((card) => (
                  <SearchResultCard key={card.id} card={card} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "collection" && (
        <div className="space-y-6">
          {/* Filtros da coleção */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="search-bar">
                  <Input
                    type="text"
                    placeholder="Buscar na coleção..."
                    value={collectionSearch}
                    onChange={(e) => setCollectionSearch(e.target.value)}
                    className="search-input"
                  />
                  <Search className="search-icon w-4 h-4" />
                </div>
                
                <select
                  value={collectionRarityFilter}
                  onChange={(e) => setCollectionRarityFilter(e.target.value)}
                  className="rounded-md bg-gray-900/50 border-gray-600 text-white p-2"
                >
                  <option value="all">Todas raridades</option>
                  <option value="common">Comum</option>
                  <option value="uncommon">Incomum</option>
                  <option value="rare">Rara</option>
                  <option value="mythic">Mítica</option>
                </select>
                
                <select
                  value={collectionColorFilter}
                  onChange={(e) => setCollectionColorFilter(e.target.value)}
                  className="rounded-md bg-gray-900/50 border-gray-600 text-white p-2"
                >
                  <option value="all">Todas cores</option>
                  <option value="W">Branco (W)</option>
                  <option value="U">Azul (U)</option>
                  <option value="B">Preto (B)</option>
                  <option value="R">Vermelho (R)</option>
                  <option value="G">Verde (G)</option>
                  <option value="colorless">Incolor</option>
                </select>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={`flex-1 border-gray-600 ${
                      collectionSort === "name" ? "bg-gray-700" : ""
                    }`}
                    onClick={() => toggleSortDirection("name")}
                  >
                    Nome {collectionSort === "name" && (collectionSortDirection === "asc" ? "↑" : "↓")}
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex-1 border-gray-600 ${
                      collectionSort === "rarity" ? "bg-gray-700" : ""
                    }`}
                    onClick={() => toggleSortDirection("rarity")}
                  >
                    Raridade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de cartas da coleção */}
          {filteredCollectionCards.length === 0 ? (
            <div className="text-center p-8 bg-gray-800/50 border border-gray-700 rounded-lg">
              <Library className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-medium text-white mb-2">Coleção vazia</h3>
              <p className="text-gray-400 mb-6">
                Você ainda não adicionou nenhuma carta à sua coleção.
              </p>
              <Button
                onClick={() => setActiveTab("search")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Pesquisar Cartas
              </Button>
            </div>
          ) : (
            <div className="card-list">
              {filteredCollectionCards.map((item) => (
                <CollectionCard 
                  key={item.card.id} 
                  card={item.card} 
                  quantity={item.quantity} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "stats" && (currentCollection ? <CollectionStats /> : (
        <div className="text-center p-8 bg-gray-800/50 border border-gray-700 rounded-lg">
          <Library className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-medium text-white mb-2">Coleção não disponível</h3>
          <p className="text-gray-400 mb-6">
            Selecione ou crie uma coleção para ver as estatísticas.
          </p>
        </div>
      ))}
    </div>
  );
}
