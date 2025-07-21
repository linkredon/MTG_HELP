'use client';

import React from 'react';
import type { MTGCard } from '@/types/mtg';
import ColecaoImproved from './colecao-improved';

interface UserCollection {
  id: string;
  name: string;
  description: string;
  cards: any[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export default function Page() {
  // Para evitar erros, passamos todas as props necessárias
  const allCards: MTGCard[] = [];
  const setAllCards = (cards: MTGCard[]) => {};
  const exportCollectionToCSV = (collection: UserCollection) => {};

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <ColecaoImproved 
        allCards={allCards}
        setAllCards={setAllCards}
        exportCollectionToCSV={exportCollectionToCSV}
      />
    </main>
  );
}
