"use server";

import type { MTGCard } from "@/types/mtg";

// Funções de servidor para manipular cartas e coleção
export async function getQuantidadeNaColecao(cardId: string): Promise<number> {
  // Implementação real será conectada ao estado da aplicação
  console.log('Verificando quantidade para carta:', cardId);
  return 0;
}

export async function adicionarCartaAColecao(card: MTGCard): Promise<void> {
  // Implementação real será conectada ao estado da aplicação
  console.log('Carta adicionada à coleção:', card.name);
}

export async function atualizarPesquisa(): Promise<void> {
  console.log('Atualizando pesquisa...');
}
