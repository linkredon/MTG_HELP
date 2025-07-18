"use client";

import { ReactNode } from 'react';
import { CardModalProvider } from '@/contexts/CardModalContext';
import { useAppContext } from '@/contexts/AppContext';
import CardModal from '@/components/CardModal';
import type { MTGCard } from '@/types/mtg';

interface CardModalWrapperProps {
  children: ReactNode;
}

export default function CardModalWrapper({ children }: CardModalWrapperProps) {
  const { currentCollection, adicionarCarta } = useAppContext();
  
  // Função para obter quantidade baseada na coleção atual do AppContext
  const getQuantidadeNaColecao = async (cardId: string): Promise<number> => {
    if (!currentCollection?.cards) return 0;
    const card = currentCollection.cards.find((c: any) => c.card.id === cardId);
    return card ? card.quantity : 0;
  };

  // Função para adicionar carta que integra com o AppContext
  const adicionarCartaAColecao = async (card: MTGCard): Promise<void> => {
    try {
      adicionarCarta(card);
    } catch (error) {
      console.error('Erro ao adicionar carta:', error);
      throw error;
    }
  };

  // Função para adicionar carta ao deck que integra com o AppContext
  const adicionarCartaAoDeckWrapper = async (card: MTGCard): Promise<void> => {
    try {
      // if (adicionarCartaAoDeckAuto) { // This line was removed as per the edit hint
      //   await adicionarCartaAoDeckAuto(card);
      // }
    } catch (error) {
      console.error('Erro ao adicionar carta ao deck:', error);
      throw error;
    }
  };

  // Função de atualização (placeholder por enquanto)
  const atualizarPesquisa = async (): Promise<void> => {
    // Por enquanto não faz nada, mas pode ser expandido no futuro
    console.log('Pesquisa atualizada');
  };

  return (
    <CardModalProvider
      getQuantidadeNaColecao={getQuantidadeNaColecao}
      adicionarCartaAColecao={adicionarCartaAColecao}
      onAtualizarPesquisa={atualizarPesquisa}
    >
      {children}
      <CardModal />
    </CardModalProvider>
  );
}
