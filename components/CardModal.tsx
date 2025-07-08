"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Plus, Bookmark, ExternalLink, X } from "lucide-react"
import "../styles/modal-fix.css"
import CardViewOptions from "./CardViewOptions"
import DeckSelector from "./DeckSelector"
import CollectionDeckUsage from "./CollectionDeckUsage"
import { useCardModal } from "../contexts/CardModalContext"
import { useAppContext } from "../contexts/AppContext"
import type { MTGCard } from "@/types/mtg"

// Componentes auxiliares para lidar com as chamadas assíncronas
const QuantidadeAsync = React.memo(({ cardId }: { cardId: string }) => {
  const [quantidade, setQuantidade] = useState<number>(0);
  const { quantidadeNaColecao } = useCardModal();
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchQuantidade = async () => {
      try {
        const qtd = await quantidadeNaColecao(cardId);
        if (isMounted) {
          setQuantidade(qtd);
        }
      } catch (error) {
        console.error('Erro ao buscar quantidade:', error);
      }
    };
    
    fetchQuantidade();
    
    return () => {
      isMounted = false;
    };
  }, [cardId, quantidadeNaColecao]);
  
  return <>{quantidade}x</>;
});
QuantidadeAsync.displayName = 'QuantidadeAsync';

// Botão para adicionar carta à coleção
const AdicionarCartaButton = React.memo(({ card }: { card: MTGCard }) => {
  const [quantidade, setQuantidade] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Adicionar à Coleção");
  const timeoutRefs = React.useRef<NodeJS.Timeout[]>([]);
  
  const { quantidadeNaColecao, adicionarCarta, mostrarCartasNaColecao, atualizarPesquisa } = useCardModal();
  
  // Limpar todos os timeouts quando o componente for desmontado
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchQuantidade = async () => {
      try {
        const qtd = await quantidadeNaColecao(card.id);
        if (isMounted) {
          setQuantidade(qtd);
          if (qtd > 0) {
            setButtonText(`Adicionar à Coleção (${qtd}x)`);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar quantidade:', error);
      }
    };
    
    fetchQuantidade();
    
    return () => {
      isMounted = false;
    };
  }, [card.id, quantidadeNaColecao]);
  
  const handleClick = async () => {
    if (loading) return; // Prevenir cliques múltiplos
    
    try {
      setLoading(true);
      await adicionarCarta(card);
      
      // Feedback visual
      setButtonText("Adicionada à Coleção!");
      
      // Atualizar a quantidade
      const novaQtd = await quantidadeNaColecao(card.id);
      
      // Usar ref para rastrear timeouts
      const timeoutId = setTimeout(() => {
        setQuantidade(novaQtd);
        setButtonText(`Adicionar à Coleção (${novaQtd}x)`);
        setLoading(false);
      }, 1500);
      timeoutRefs.current.push(timeoutId);
      
      // Se não estamos mostrando cartas na coleção, atualize a pesquisa
      if (!mostrarCartasNaColecao) {
        const updateTimeoutId = setTimeout(async () => {
          try {
            await atualizarPesquisa();
          } catch (error) {
            console.error('Erro ao atualizar pesquisa:', error);
          }
        }, 2000);
        timeoutRefs.current.push(updateTimeoutId);
      }
    } catch (error) {
      console.error('Erro ao adicionar carta:', error);
      setButtonText("Erro ao adicionar");
      
      const errorTimeoutId = setTimeout(() => {
        setButtonText("Adicionar à Coleção");
        setLoading(false);
      }, 1500);
      timeoutRefs.current.push(errorTimeoutId);
    }
  };
  
  return (
    <Button 
      onClick={handleClick}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700"
    >
      <Plus className="w-4 h-4 mr-2" />
      {buttonText}
    </Button>
  );
});
AdicionarCartaButton.displayName = 'AdicionarCartaButton';

// Botão para adicionar carta ao deck
const AdicionarAoDeckButton = React.memo(({ card }: { card: MTGCard }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Adicionar ao Deck");
  const { adicionarAoDeck } = useCardModal();
  const timeoutRefs = React.useRef<NodeJS.Timeout[]>([]);
  
  // Limpar todos os timeouts quando o componente for desmontado
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);
  
  const handleClick = async () => {
    if (loading) return; // Prevenir cliques múltiplos
    
    try {
      setLoading(true);
      if (adicionarAoDeck) {
        await adicionarAoDeck(card);
      }
      
      // Feedback visual
      setButtonText("Adicionada ao Deck!");
      
      const timeoutId = setTimeout(() => {
        setButtonText("Adicionar ao Deck");
        setLoading(false);
      }, 1500);
      timeoutRefs.current.push(timeoutId);
    } catch (error) {
      console.error('Erro ao adicionar carta ao deck:', error);
      setButtonText("Erro ao adicionar");
      
      const errorTimeoutId = setTimeout(() => {
        setButtonText("Adicionar ao Deck");
        setLoading(false);
      }, 1500);
      timeoutRefs.current.push(errorTimeoutId);
    }
  };
  
  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700"
    >
      <Bookmark className="w-4 h-4 mr-2" />
      {buttonText}
    </Button>
  );
});
AdicionarAoDeckButton.displayName = 'AdicionarAoDeckButton';

// Função utilitária para seguramente acessar propriedades de cartas
export const safeCardAccess = {
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
};

// Componente CardModal agora é autônomo e não precisa receber propriedades
// pois usa o contexto CardModalContext
export default function CardModal() {
  // Usando o contexto para acessar o estado e funções do modal
  const { 
    card, 
    isModalOpen: isOpen, 
    closeModal: onClose, 
    quantidadeNaColecao,
    adicionarCarta,
    adicionarAoDeck,
    mostrarCartasNaColecao = true,
    atualizarPesquisa
  } = useCardModal();
  const [visuFavorita, setVisuFavorita] = useState<boolean>(false);

  if (!isOpen || !card) return null;

  // Função para gerar URL da LigaMagic
  const getLigaMagicURL = (card: MTGCard): string => {
    const cardName = card.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `https://www.ligamagic.com.br/?view=cards/card&card=${encodeURIComponent(cardName)}`;
  };

  // Função para gerar URL do Gatherer
  const getGathererURL = (card: MTGCard): string => {
    return `https://gatherer.wizards.com/Pages/Search/Default.aspx?name=+[${encodeURIComponent(card.name)}]`;
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
      modal={true}
    >
      <DialogContent 
        className="quantum-card-dense border border-cyan-500/20 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl shadow-xl fixed-modal card-view-modal"
        onEscapeKeyDown={() => onClose()}
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogHeader className="border-b border-cyan-500/20 pb-3">
          <DialogTitle className="text-xl text-white flex justify-between items-center">
            <span>{card.name}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onClose()}
                className="h-8 w-8 p-1 rounded-full bg-gray-800/60 hover:bg-gray-700/60 text-gray-400 hover:text-white"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto quantum-scrollbar pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {/* Imagem da carta */}
            <div className="flex justify-center">
              {(card.image_uris?.normal) ? (
                <img 
                  src={card.image_uris.normal} 
                  alt={card.name}
                  className="rounded-lg max-h-[80vh] object-contain"
                  crossOrigin="anonymous"
                />
              ) : card.card_faces?.[0]?.image_uris?.normal ? (
                <div className="space-y-4">
                  <img 
                    src={card.card_faces[0].image_uris.normal} 
                    alt={card.name + " (frente)"}
                    className="rounded-lg max-h-[38vh] object-contain"
                    crossOrigin="anonymous"
                  />
                  {card.card_faces[1]?.image_uris?.normal && (
                    <img 
                      src={card.card_faces[1].image_uris.normal} 
                      alt={card.name + " (verso)"}
                      className="rounded-lg max-h-[38vh] object-contain"
                      crossOrigin="anonymous"
                    />
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Imagem não disponível</span>
                </div>
              )}
            </div>

            {/* Informações da carta */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white">{card.name}</h3>
                <p className="text-gray-300">{card.mana_cost}</p>
                <p className="text-sm text-gray-400 mt-1">{safeCardAccess.typeLine(card)}</p>
              </div>

              <div className="bg-gray-700/50 p-3 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{card.oracle_text}</p>
                {(card.power && card.toughness) && (
                  <p className="text-right text-gray-300 mt-2">{card.power}/{card.toughness}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Edição:</span>
                  <p>{safeCardAccess.setName(card)} ({safeCardAccess.setCode(card)})</p>
                </div>
                <div>
                  <span className="text-gray-400">Raridade:</span>
                  <p className="capitalize">{safeCardAccess.rarity(card)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Artista:</span>
                  <p>{card.artist}</p>
                </div>
                <div>
                  <span className="text-gray-400">Colecionador:</span>
                  <p>#{card.collector_number}</p>
                </div>
              </div>

              {/* Na sua coleção */}
              <div className="bg-gray-700/50 p-3 rounded-md">
                <h4 className="text-white font-medium mb-2">Na sua coleção</h4>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Quantidade:</span>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    <QuantidadeAsync cardId={card.id} />
                  </Badge>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col gap-2">
                <AdicionarCartaButton card={card} />

                {adicionarAoDeck && (
                  <AdicionarAoDeckButton card={card} />
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => window.open(getGathererURL(card), '_blank')}
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-600/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver no Gatherer
                  </Button>
                  <Button 
                    onClick={() => window.open(getLigaMagicURL(card), '_blank')}
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-600/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver na LigaMagic
                  </Button>
                </div>
              </div>

              {/* Seletor de Deck */}
              <div className="border-t border-gray-600 pt-4">
                <DeckSelector 
                  card={card}
                  className="w-full"
                  showCreateDeck={true}
                  showCategorySelect={true}
                />
              </div>

              {/* Uso em Decks */}
              <CollectionDeckUsage 
                card={card}
                className="border-t border-gray-600 pt-4"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
