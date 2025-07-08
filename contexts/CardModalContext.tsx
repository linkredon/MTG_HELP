"use client"

import React, { createContext, useContext, useState } from 'react';
import type { MTGCard } from '@/types/mtg';
import { getImageUrl, getDoubleFacedImageUrls } from '@/utils/imageService';

// Tipos de visualização disponíveis
export type CardVisualizationType = 'grid' | 'list' | 'details';

interface CardModalContextType {
  // Estado do modal
  card: MTGCard | null;
  isModalOpen: boolean;
  
  // Funções para controlar o modal
  openModal: (card: MTGCard) => void;
  closeModal: () => void;
  
  // Funções para interagir com cartas (agora assíncronas)
  quantidadeNaColecao: (cardId: string) => Promise<number>;
  adicionarCarta: (card: MTGCard) => Promise<void>;
  adicionarAoDeck?: (card: MTGCard) => Promise<void>;
  
  // Estado e funções para visualização de cartas
  visualizationType: CardVisualizationType;
  setVisualizationType: (type: CardVisualizationType) => void;
  
  // Estado e funções para filtros
  mostrarCartasNaColecao: boolean;
  toggleMostrarCartasNaColecao: () => void;
  atualizarPesquisa: () => Promise<void>;
  
  // Integração com decks
  showDeckSelector: boolean;
  setShowDeckSelector: (show: boolean) => void;
}

// Criando o contexto com valores padrão
const CardModalContext = createContext<CardModalContextType>({
  card: null,
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
  quantidadeNaColecao: async () => 0,
  adicionarCarta: async () => {},
  visualizationType: 'grid',
  setVisualizationType: () => {},
  mostrarCartasNaColecao: true,
  toggleMostrarCartasNaColecao: () => {},
  atualizarPesquisa: async () => {},
  showDeckSelector: false,
  setShowDeckSelector: () => {},
});

// Hook personalizado para facilitar o uso do contexto
export const useCardModal = () => useContext(CardModalContext);

// Propriedades do provider
interface CardModalProviderProps {
  children: React.ReactNode;
  getQuantidadeNaColecao: (cardId: string) => Promise<number>;
  adicionarCartaAColecao: (card: MTGCard) => Promise<void>;
  adicionarCartaAoDeck?: (card: MTGCard) => Promise<void>;
  onAtualizarPesquisa?: () => Promise<void>;
}

// Componente Provider para o contexto
export const CardModalProvider: React.FC<CardModalProviderProps> = ({
  children,
  getQuantidadeNaColecao,
  adicionarCartaAColecao,
  adicionarCartaAoDeck,
  onAtualizarPesquisa = async () => {},
}) => {
  // Estado do modal
  const [card, setCard] = useState<MTGCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado de visualização
  const [visualizationType, setVisualizationType] = useState<CardVisualizationType>('grid');
  
  // Estado de filtros
  const [mostrarCartasNaColecao, setMostrarCartasNaColecao] = useState(true);
  
  // Estado para deck selector
  const [showDeckSelector, setShowDeckSelector] = useState(false);
  
  // Funções para controlar o modal
  const openModal = (card: MTGCard) => {
    setCard(card);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setCard(null), 300); // Limpa o card após a animação de fechamento
  };
  
  // Função para alternar mostrar cartas na coleção
  const toggleMostrarCartasNaColecao = () => {
    setMostrarCartasNaColecao(prev => !prev);
  };
  
  return (
    <CardModalContext.Provider
      value={{
        card,
        isModalOpen,
        openModal,
        closeModal,
        quantidadeNaColecao: getQuantidadeNaColecao,
        adicionarCarta: adicionarCartaAColecao,
        adicionarAoDeck: adicionarCartaAoDeck,
        visualizationType,
        setVisualizationType,
        mostrarCartasNaColecao,
        toggleMostrarCartasNaColecao,
        atualizarPesquisa: onAtualizarPesquisa,
        showDeckSelector,
        setShowDeckSelector,
      }}
    >
      {children}
    </CardModalContext.Provider>
  );
};
