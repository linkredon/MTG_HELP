"use client"

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Info } from 'lucide-react';
import { useCardModal } from '@/contexts/CardModalContext';
import { safeCardAccess } from '@/components/CardModal';
import type { MTGCard } from '@/types/mtg';
import { getImageUrl } from '@/utils/imageService';

interface CardListProps {
  cards: MTGCard[];
  className?: string;
  showActionButton?: boolean;
  actionButtonLabel?: string;
  onActionButtonClick?: (card: MTGCard) => void;
}

// Função utilitária para obter a imagem da carta com fallback
const getCardImage = (card: MTGCard, size: 'small' | 'normal' = 'normal'): string => {
  return getImageUrl(card, size);
};

const CardList: React.FC<CardListProps> = ({
  cards,
  className = '',
  showActionButton = true,
  actionButtonLabel = 'Adicionar',
  onActionButtonClick,
}) => {
  const { openModal, visualizationType, quantidadeNaColecao } = useCardModal();
  
  // Componente interno para exibir a quantidade de cartas - Sempre renderiza para evitar problemas de DOM
  const QuantidadeBadge = React.memo(({ cardId }: { cardId: string }) => {
    const [quantity, setQuantity] = React.useState<number>(0);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    
    React.useEffect(() => {
      let isMounted = true;
      
      const fetchQuantity = async () => {
        try {
          setIsLoading(true);
          const qty = await quantidadeNaColecao(cardId);
          if (isMounted) {
            setQuantity(qty);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Erro ao buscar quantidade:', error);
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      
      fetchQuantity();
      
      return () => {
        isMounted = false;
      };
    }, [cardId]);
    
    // Sempre renderiza o container para manter estabilidade do DOM
    return (
      <div className="absolute top-1 right-1 z-10">
        {!isLoading && quantity > 0 && (
          <Badge className="bg-blue-500 text-white">
            {quantity}x
          </Badge>
        )}
      </div>
    );
  });
  QuantidadeBadge.displayName = 'QuantidadeBadge';
  
  // Componente para o texto do botão de ação - Sempre renderiza para estabilidade
  const ActionButtonLabel = React.memo(({ cardId, label }: { cardId: string, label: string }) => {
    const [quantity, setQuantity] = React.useState<number>(0);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    
    React.useEffect(() => {
      let isMounted = true;
      
      const fetchQuantity = async () => {
        try {
          setIsLoading(true);
          const qty = await quantidadeNaColecao(cardId);
          if (isMounted) {
            setQuantity(qty);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Erro ao buscar quantidade para botão:', error);
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      
      fetchQuantity();
      
      return () => {
        isMounted = false;
      };
    }, [cardId]);
    
    // Sempre renderiza com conteúdo, mesmo durante loading
    if (isLoading) {
      return <>{label}</>;
    }
    
    return <>{quantity > 0 ? `${label} (${quantity}x)` : label}</>;
  });
  ActionButtonLabel.displayName = 'ActionButtonLabel';
  
  // Componente para a badge na visualização de lista - Sempre renderiza container
  const ListViewQuantidadeBadge = React.memo(({ cardId }: { cardId: string }) => {
    const [quantity, setQuantity] = React.useState<number>(0);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    
    React.useEffect(() => {
      let isMounted = true;
      
      const fetchQuantity = async () => {
        try {
          setIsLoading(true);
          const qty = await quantidadeNaColecao(cardId);
          if (isMounted) {
            setQuantity(qty);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Erro ao buscar quantidade para badge na lista:', error);
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      
      fetchQuantity();
      
      return () => {
        isMounted = false;
      };
    }, [cardId]);
    
    // Sempre renderiza um container para manter a estrutura do DOM
    return (
      <div className="mx-2">
        {!isLoading && quantity > 0 && (
          <Badge className="bg-blue-600">{quantity}x</Badge>
        )}
      </div>
    );
  });
  ListViewQuantidadeBadge.displayName = 'ListViewQuantidadeBadge';
  
  // Componente para a badge na visualização detalhada - Sempre renderiza container
  const DetailedViewQuantidadeBadge = React.memo(({ cardId }: { cardId: string }) => {
    const [quantity, setQuantity] = React.useState<number>(0);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    
    React.useEffect(() => {
      let isMounted = true;
      
      const fetchQuantity = async () => {
        try {
          setIsLoading(true);
          const qty = await quantidadeNaColecao(cardId);
          if (isMounted) {
            setQuantity(qty);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Erro ao buscar quantidade para badge detalhada:', error);
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      
      fetchQuantity();
      
      return () => {
        isMounted = false;
      };
    }, [cardId]);
    
    // Sempre renderiza um container para manter a estrutura do DOM
    return (
      <div className="mb-2">
        {!isLoading && quantity > 0 && (
          <Badge className="bg-blue-600">{quantity}x</Badge>
        )}
      </div>
    );
  });
  DetailedViewQuantidadeBadge.displayName = 'DetailedViewQuantidadeBadge';
  
  // Renderização em grid (visualização padrão)
  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const cardImage = getCardImage(card, 'small');
        // Usar key única e estável baseada no ID da carta
        const cardKey = `grid-${card.id}`;
        
        return (
          <div key={cardKey} className="relative">
            {/* Badge de quantidade - sempre renderiza o container */}
            <QuantidadeBadge cardId={card.id} />
            
            <div 
              className="cursor-pointer rounded-lg overflow-hidden flex flex-col border border-gray-700 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/20 transition-all"
              onClick={() => openModal(card)}
            >
              {cardImage ? (
                <div className="aspect-[63/88] overflow-hidden bg-gray-900 flex items-center justify-center">
                  <img
                    src={cardImage}
                    alt={card.name}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className="aspect-[63/88] bg-gray-800 flex items-center justify-center text-center p-2">
                  <span className="text-xs text-gray-400">{card.name}</span>
                </div>
              )}
              
              {showActionButton && (
                <Button
                  size="sm"
                  variant="ghost" 
                  className="bg-gray-800 hover:bg-blue-600 text-white rounded-none h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onActionButtonClick) {
                      onActionButtonClick(card);
                    }
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <ActionButtonLabel cardId={card.id} label={actionButtonLabel} />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
  
  // Renderização em lista
  const renderListView = () => (
    <div className="space-y-2">
      {cards.map((card) => {
        const cardImage = getCardImage(card, 'small');
        // Usar key única e estável baseada no ID da carta
        const cardKey = `list-${card.id}`;
        
        return (
          <div 
            key={cardKey}
            className="flex items-center bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-lg overflow-hidden cursor-pointer transition-all"
            onClick={() => openModal(card)}
          >
            {/* Imagem pequena da carta */}
            <div className="h-16 w-12 bg-gray-900 flex-shrink-0">
              {cardImage ? (
                <img
                  src={cardImage}
                  alt={card.name}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-900">
                  <span className="text-xs text-gray-500">Sem imagem</span>
                </div>
              )}
            </div>
            
            {/* Informações da carta */}
            <div className="flex-grow p-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium">{card.name}</h3>
                  <p className="text-xs text-gray-400">{safeCardAccess.typeLine(card)}</p>
                </div>
                {card.mana_cost && (
                  <div className="text-xs text-gray-400">{card.mana_cost}</div>
                )}
              </div>
            </div>
            
            {/* Badge e ações */}
            <div className="flex items-center pr-2">
              <ListViewQuantidadeBadge cardId={card.id} />
              
              {showActionButton && (
                <Button
                  size="sm"
                  variant="outline" 
                  className="h-7 border-gray-600 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onActionButtonClick) {
                      onActionButtonClick(card);
                    }
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {actionButtonLabel}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
  
  // Renderização em detalhes
  const renderDetailsView = () => (
    <div className="space-y-4">
      {cards.map((card) => {
        const cardImage = getCardImage(card);
        // Usar key única e estável baseada no ID da carta
        const cardKey = `details-${card.id}`;
        
        return (
          <Card 
            key={cardKey}
            className="bg-gray-800 border-gray-700 hover:border-blue-500 cursor-pointer transition-all"
          >
            <div className="flex p-4" onClick={() => openModal(card)}>
              {/* Imagem da carta */}
              <div className="w-[120px] flex-shrink-0">
                {cardImage ? (
                  <img
                    src={cardImage}
                    alt={card.name}
                    className="w-full rounded-lg"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full aspect-[63/88] bg-gray-900 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-500">Sem imagem</span>
                  </div>
                )}
              </div>
              
              {/* Informações detalhadas */}
              <div className="ml-4 flex-grow">
                <div className="flex justify-between">
                  <h3 className="font-medium">{card.name}</h3>
                  {card.mana_cost && (
                    <div className="text-sm text-gray-300">{card.mana_cost}</div>
                  )}
                </div>
                
                <p className="text-sm text-gray-400 mt-1">{safeCardAccess.typeLine(card)}</p>
                
                {card.oracle_text && (
                  <div className="bg-gray-900/50 rounded-md p-2 mt-2">
                    <p className="text-xs line-clamp-3">{card.oracle_text}</p>
                  </div>
                )}
                
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <div>
                    <span>{safeCardAccess.setName(card)} ({safeCardAccess.setCode(card)})</span>
                  </div>
                  
                  {(card.power && card.toughness) && (
                    <div>
                      <span className="text-gray-300">{card.power}/{card.toughness}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quantidade e botões */}
              <div className="flex flex-col items-center justify-center ml-4 gap-2">
                <DetailedViewQuantidadeBadge cardId={card.id} />
                
                <Button 
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full border-gray-600 hover:bg-blue-600/20 hover:border-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(card);
                  }}
                >
                  <Info className="h-4 w-4" />
                </Button>
                
                {showActionButton && (
                  <Button
                    size="sm"
                    variant="outline" 
                    className="h-8 border-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onActionButtonClick) {
                        onActionButtonClick(card);
                      }
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {actionButtonLabel}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
  
  return (
    <div className={className}>
      {visualizationType === 'grid' && renderGridView()}
      {visualizationType === 'list' && renderListView()}
      {visualizationType === 'details' && renderDetailsView()}
    </div>
  );
};

export default CardList;
