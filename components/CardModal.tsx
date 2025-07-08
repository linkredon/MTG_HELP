"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Plus, Bookmark, ExternalLink, X, Info, Layers, Palette } from "lucide-react"
import "../styles/modal-fix.css"
import "../styles/card-modal-enhanced.css"
import CardViewOptions from "./CardViewOptions"
import DeckSelector from "./DeckSelector-enhanced"
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
      size="sm"
      className="card-modal-button-primary text-xs py-1"
    >
      <Plus className="w-3 h-3 mr-1" />
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
      size="sm"
      className="card-modal-button-primary text-xs py-1"
      style={{ background: 'linear-gradient(135deg, #8000ff, #0099ff) !important' }}
    >
      <Bookmark className="w-3 h-3 mr-1" />
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
        className="card-modal-enhanced quantum-card-dense fixed-modal card-view-modal"
        onEscapeKeyDown={() => onClose()}
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogHeader className="card-modal-header">
          <DialogTitle className="card-modal-title text-xl flex justify-between items-center">
            <span>{card.name}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onClose()}
                className="card-modal-close h-8 w-8 p-1 rounded-full"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto quantum-scrollbar pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
            {/* Imagem da carta */}
            <div className="flex justify-center">
              {(card.image_uris?.normal) ? (
                <img 
                  src={card.image_uris.normal} 
                  alt={card.name}
                  className="card-modal-image max-h-[80vh] object-contain"
                  crossOrigin="anonymous"
                />
              ) : card.card_faces?.[0]?.image_uris?.normal ? (
                <div className="space-y-4">
                  <img 
                    src={card.card_faces[0].image_uris.normal} 
                    alt={card.name + " (frente)"}
                    className="card-modal-image max-h-[38vh] object-contain"
                    crossOrigin="anonymous"
                  />
                  {card.card_faces[1]?.image_uris?.normal && (
                    <img 
                      src={card.card_faces[1].image_uris.normal} 
                      alt={card.name + " (verso)"}
                      className="card-modal-image max-h-[38vh] object-contain"
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
              <div className="card-modal-section">
                <div className="flex items-center gap-1 mb-1">
                  <Info className="w-3 h-3 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">Detalhes da Carta</h3>
                </div>
                <p className="text-cyan-300 font-semibold text-sm">{card.mana_cost}</p>
                <p className="text-xs text-white mt-0.5">{safeCardAccess.typeLine(card)}</p>
              </div>

              <div className="card-modal-section card-modal-oracle">
                <div className="flex items-center gap-1 mb-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <h4 className="text-xs text-white font-semibold">Texto do Oráculo</h4>
                </div>
                <p className="text-sm whitespace-pre-wrap">{card.oracle_text}</p>
                {(card.power && card.toughness) && (
                  <p className="text-right text-cyan-300 mt-1 font-bold">{card.power}/{card.toughness}</p>
                )}
              </div>

              <div className="card-modal-section">
                <div className="flex items-center gap-1 mb-1">
                  <Palette className="w-3 h-3 text-cyan-400" />
                  <h4 className="text-xs text-white font-semibold">Informações da Edição</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <div>
                    <div className="card-modal-label">Edição</div>
                    <div className="card-modal-value">{safeCardAccess.setName(card)} ({safeCardAccess.setCode(card)})</div>
                  </div>
                  <div>
                    <div className="card-modal-label">Raridade</div>
                    <div className="card-modal-value capitalize">{safeCardAccess.rarity(card)}</div>
                  </div>
                  <div>
                    <div className="card-modal-label">Artista</div>
                    <div className="card-modal-value">{card.artist}</div>
                  </div>
                  <div>
                    <div className="card-modal-label">Número</div>
                    <div className="card-modal-value">#{card.collector_number}</div>
                  </div>
                </div>
              </div>

              {/* Na sua coleção */}
              <div className="card-modal-section">
                <h4 className="text-xs text-white font-semibold mb-1">Na sua coleção</h4>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-cyan-300 font-medium">Quantidade:</span>
                  <Badge className="card-modal-badge">
                    <QuantidadeAsync cardId={card.id} />
                  </Badge>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col gap-1">
                <AdicionarCartaButton card={card} />

                {adicionarAoDeck && (
                  <AdicionarAoDeckButton card={card} />
                )}

                <div className="grid grid-cols-2 gap-1 mt-1">
                  <Button 
                    onClick={() => window.open(getGathererURL(card), '_blank')}
                    variant="outline"
                    size="sm"
                    className="card-modal-button-secondary text-xs py-1"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Ver no Gatherer
                  </Button>
                  <Button 
                    onClick={() => window.open(getLigaMagicURL(card), '_blank')}
                    variant="outline"
                    size="sm"
                    className="card-modal-button-secondary text-xs py-1"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Ver na LigaMagic
                  </Button>
                </div>
              </div>

              {/* Seletor de Deck */}
              <div className="card-modal-divider pt-2">
                <DeckSelector 
                  card={card}
                  className="w-full text-xs deck-selector-compact"
                  showCreateDeck={true}
                  showCategorySelect={true}
                />
              </div>

              {/* Uso em Decks */}
              <CollectionDeckUsage 
                card={card}
                className="card-modal-divider pt-2 text-xs"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
