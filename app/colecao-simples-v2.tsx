é"use client"

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/contexts/AppContext';
import { useCardModal } from '@/contexts/CardModalContext';
import { searchCardsWithTranslation } from '@/utils/scryfallService';
import { Search, Grid, List, RefreshCw, X, Filter } from 'lucide-react';
import QuantityControl from '@/components/QuantityControl';
import CompactCardList from '@/components/CompactCardList';
import type { MTGCard } from '@/types/mtg';

interface CollectionSimpleProps {
  // Props se necessárias
}

export default function CollectionSimpleRefined() {
  // Estados
  const [activeTab, setActiveTab] = useState('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MTGCard[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Contextos
  const { currentCollection = { cards: [] }, adicionarCarta } = useAppContext();
  const { openModal } = useCardModal();

  // Função de busca
  const searchCards = async () => {
    if (!searchTerm.trim() || searchTerm.length < 2) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await searchCardsWithTranslation(searchTerm.trim());
      
      if (!response.ok) {
        throw new Error(`Erro na busca: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSearchResults(data.data || []);
      
      if (data.data?.length === 0) {
        setSearchError('Nenhuma carta encontrada');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchError('Erro ao buscar cartas');
    } finally {
      setIsSearching(false);
    }
  };

  // Adicionar carta à coleção
  const handleAddCard = (card: MTGCard, quantity: number = 1) => {
    // Adicionar a carta múltiplas vezes de acordo com a quantidade
    for (let i = 0; i < quantity; i++) {
      adicionarCarta(card);
    }
  };

  // Pesquisar ao pressionar Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchCards();
    }
  };

  // Limpar pesquisa
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchError(null);
  };

  return (
    <div className="collection-simple-refined p-4">
      <Card className="border-gray-700 bg-gray-800/60 backdrop-blur-sm shadow-lg">
        <CardContent className="p-0">
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <div className="border-b border-gray-700">
              <TabsList className="h-12 w-full rounded-none bg-transparent border-b border-gray-700">
                <TabsTrigger 
                  value="search" 
                  className="h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Cartas
                </TabsTrigger>
                <TabsTrigger 
                  value="collection" 
                  className="h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none"
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Minha Coleção
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab de Busca */}
            <TabsContent value="search" className="p-0">
              <div className="p-4 border-b border-gray-700 bg-gray-900/30">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Digite o nome da carta..."
                      className="pl-10 bg-gray-800/70 border-gray-700"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Button 
                    onClick={searchCards} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSearching || searchTerm.length < 2}
                  >
                    {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-gray-700"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                {/* Filtros Avançados (Oculto por padrão) */}
                {showAdvancedFilters && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Conteúdo dos filtros - a ser implementado conforme necessário */}
                    <div className="text-sm text-gray-400">
                      Filtros avançados serão implementados aqui
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Resultados da busca */}
                {isSearching ? (
                  <div className="flex justify-center items-center py-12">
                    <RefreshCw className="h-6 w-6 text-blue-500 animate-spin mr-2" />
                    <span>Buscando cartas...</span>
                  </div>
                ) : searchError ? (
                  <div className="text-center py-12">
                    <p className="text-red-400 mb-2">{searchError}</p>
                    <p className="text-gray-400 text-sm">Tente outro termo de busca</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <CompactCardList
                    cards={searchResults}
                    onAddCard={handleAddCard}
                    showSearch={false}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-2">Digite um termo de busca e pressione Enter</p>
                    <p className="text-gray-500 text-sm">Busque por nome da carta, tipo, ou texto</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab da Coleção */}
            <TabsContent value="collection" className="p-0">
              <div className="p-4 border-b border-gray-700 bg-gray-900/30">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-medium">
                    Minha Coleção: {currentCollection?.cards?.length || 0} cartas únicas
                  </h3>
                  <div className="text-sm text-gray-400">
                    Total: {currentCollection?.cards?.reduce((sum, item) => sum + item.quantity, 0) || 0} cartas
                  </div>
                </div>
              </div>

              <div className="p-6">
                {currentCollection?.cards?.length ? (
                  <CompactCardList
                    cards={currentCollection?.cards?.map(item => item.card) || []}
                    onAddCard={handleAddCard}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-2">Sua coleção está vazia</p>
                    <p className="text-gray-500 text-sm">Use a aba de busca para adicionar cartas</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
