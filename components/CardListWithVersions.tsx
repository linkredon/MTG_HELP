"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Plus, AlertCircle } from 'lucide-react';
import CardList from '@/components/CardList';
import type { MTGCard } from '@/types/mtg';

interface CollectionCard {
  card: MTGCard;
  quantity: number;
  condition: string;
  foil: boolean;
}

interface CardListWithVersionsProps {
  collectionCards: CollectionCard[];
  onRemoveCard: (card: MTGCard) => void;
  onAddCard: (card: MTGCard) => void;
  className?: string;
}

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
  setName: (card: any): string => {
    try {
      if (!card) return 'Coleção desconhecida';
      return card.set_name || 'Coleção desconhecida';
    } catch (e) {
      console.warn('Erro ao acessar set_name', e);
      return 'Coleção desconhecida';
    }
  }
};

const CardListWithVersions: React.FC<CardListWithVersionsProps> = ({
  collectionCards,
  onRemoveCard,
  onAddCard,
  className = ''
}) => {
  const [cartasComVersoesVisiveis, setCartasComVersoesVisiveis] = useState<Record<string, boolean>>({});

  // Função para alternar a visibilidade das versões alternativas de uma carta
  const toggleVersoesAlternativas = (cardId: string) => {
    const isCurrentlyExpanded = cartasComVersoesVisiveis[cardId];
    
    setCartasComVersoesVisiveis(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));

    // Scroll para o topo quando abrir o box de outras versões
    if (!isCurrentlyExpanded) {
      setTimeout(() => {
        const element = document.querySelector(`[data-card-name="${cardId}"]`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  };

  // Componente para exibir versões alternativas de uma carta
  const VersoesAlternativas = ({ cardId }: { cardId: string }) => {
    const [alternativas, setAlternativas] = useState<MTGCard[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [cardOriginal, setCardOriginal] = useState<MTGCard | null>(null);
    
    // Função para verificar se uma carta está na coleção
    const verificarQuantidadeNaColecao = (card: MTGCard): number => {
      const cardNaColecao = collectionCards.find(c => c.card.id === card.id);
      return cardNaColecao ? cardNaColecao.quantity : 0;
    };

    React.useEffect(() => {
      const buscarAlternativas = async () => {
        try {
          setCarregando(true);
          setErro(null);

          // Primeiro, buscar a carta original para obter o nome do oráculo
          const cardOriginalObj = collectionCards.find(c => c.card.id === cardId);
          if (!cardOriginalObj) {
            throw new Error("Carta original não encontrada na coleção");
          }
          
          setCardOriginal(cardOriginalObj.card);
          
          // Usar o nome da carta como parâmetro de busca para obter todas as impressões
          const nome = encodeURIComponent(`!"${cardOriginalObj.card.name}"`);
          const url = `https://api.scryfall.com/cards/search?q=${nome}&unique=prints&order=released`;
          
          console.log("URL de busca de versões:", url);
          
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`Erro ao buscar alternativas: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.data && Array.isArray(data.data)) {
            // Filtramos a carta original pelo ID
            setAlternativas(data.data.filter((card: MTGCard) => card.id !== cardId));
            console.log("Alternativas encontradas:", data.data.length);
          } else {
            setAlternativas([]);
          }
        } catch (error) {
          console.error("Erro ao buscar versões alternativas:", error);
          setErro("Não foi possível carregar versões alternativas. Tente novamente.");
        } finally {
          setCarregando(false);
        }
      };
      
      buscarAlternativas();
    }, [cardId, collectionCards]);

    // Calcular estatísticas das versões
    const totalVersions = alternativas.length + 1; // +1 para incluir a carta original
    const versionsOwned = alternativas.filter(card => verificarQuantidadeNaColecao(card) > 0).length + 1; // +1 para a carta original
    const percentOwned = Math.round((versionsOwned / totalVersions) * 100);

    if (carregando) {
      return (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-300">Buscando versões alternativas...</span>
        </div>
      );
    }

    if (erro) {
      return (
        <div className="text-red-400 text-sm flex items-center gap-2 py-3 bg-red-500/10 px-3 rounded">
          <AlertCircle className="w-4 h-4" />
          <div>
            <p>{erro}</p>
            <button 
              onClick={() => toggleVersoesAlternativas(cardId)} 
              className="text-blue-400 hover:underline text-xs mt-1"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    if (alternativas.length === 0) {
      return (
        <div className="text-gray-300 text-sm py-3 bg-gray-700/50 px-3 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <div>
            <p>Não foram encontradas outras versões desta carta.</p>
            <p className="text-gray-400 text-xs mt-1">Esta pode ser a única impressão disponível.</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-4 bg-gray-700/30 p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-medium text-white mb-1">
              {cardOriginal?.name} - {alternativas.length + 1} Versões Disponíveis
            </h4>
            <p className="text-xs text-gray-400">
              Você possui {versionsOwned} de {totalVersions} versões ({percentOwned}%)
            </p>
          </div>
          <div className="h-2 w-full sm:w-32 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                percentOwned === 100 ? "bg-green-500" :
                percentOwned > 60 ? "bg-blue-500" : 
                percentOwned > 30 ? "bg-yellow-500" : "bg-red-500"
              }`} 
              style={{ width: `${percentOwned}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {alternativas.map((card) => {
            const quantidadeNaColecao = verificarQuantidadeNaColecao(card);
            return (
              <div 
                key={card.id} 
                className={`bg-gray-800 rounded p-2 ${
                  quantidadeNaColecao > 0 
                    ? "border-2 border-green-500/50" 
                    : "border border-gray-600/30"
                }`}
              >
                <div className="relative">
                  {quantidadeNaColecao > 0 && (
                    <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center z-10 border-2 border-gray-800">
                      {quantidadeNaColecao}x
                    </div>
                  )}
                  
                  {card.image_uris?.small ? (
                    <img
                      src={card.image_uris.small}
                      alt={card.name}
                      className="w-full rounded"
                      crossOrigin="anonymous"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (card.image_uris?.art_crop) {
                          target.src = card.image_uris.art_crop;
                        } else {
                          // Fallback para CDN alternativo
                          const setCode = encodeURIComponent(card.set_code);
                          const collectorNumber = encodeURIComponent(card.collector_number);
                          target.src = `https://cards.scryfall.io/small/${setCode}/${collectorNumber}.jpg`;
                        }
                      }}
                    />
                  ) : card.card_faces?.[0]?.image_uris?.small ? (
                    <img
                      src={card.card_faces[0].image_uris.small}
                      alt={card.name}
                      className="w-full rounded"
                      crossOrigin="anonymous"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (card.card_faces?.[0]?.image_uris?.art_crop) {
                          target.src = card.card_faces[0].image_uris.art_crop;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs text-center">Sem imagem</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <div className="text-xs text-gray-300 font-medium">
                    {safeCardAccess.setName(card)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {safeCardAccess.setCode(card)} • #{card.collector_number}
                  </div>
                  <div className="text-xs text-gray-500">
                    {card.released_at ? new Date(card.released_at).getFullYear() : ""}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant={quantidadeNaColecao > 0 ? "outline" : "ghost"}
                  onClick={() => {
                    // Adiciona a carta à coleção
                    onAddCard(card);
                  }}
                  className={`w-full mt-2 h-7 text-xs ${
                    quantidadeNaColecao > 0 
                      ? "text-green-500 border-green-500/30 hover:bg-green-900/10" 
                      : "text-green-400 hover:text-green-300 hover:bg-green-900/20"
                  }`}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {quantidadeNaColecao > 0 ? "Adicionar outra" : "Adicionar"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Lista principal de cartas */}
      <CardList
        cards={collectionCards.map(cc => cc.card)}
        showActionButton={true}
        actionButtonLabel="Remover"
        onActionButtonClick={onRemoveCard}
      />
      
      {/* Botões para ver versões alternativas (adicionados na parte inferior de cada carta) */}
      <div className="mt-4 space-y-2">
        {collectionCards.map((collectionCard) => (
          <div key={collectionCard.card.id} data-card-name={collectionCard.card.id} className="flex justify-between items-center bg-gray-800/30 p-2 rounded border border-gray-700">
            <span className="text-sm text-gray-300">{collectionCard.card.name}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleVersoesAlternativas(collectionCard.card.id)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 h-7"
            >
              {cartasComVersoesVisiveis[collectionCard.card.id] ? (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Ocultar versões
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Ver versões
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
      
      {/* Exibição das versões alternativas quando necessário */}
      {Object.entries(cartasComVersoesVisiveis)
        .filter(([cardId, visible]) => visible)
        .map(([cardId]) => (
          <div key={cardId} className="mt-6 border-t border-gray-600 pt-6">
            <VersoesAlternativas cardId={cardId} />
          </div>
        ))}
    </div>
  );
};

export default CardListWithVersions;
