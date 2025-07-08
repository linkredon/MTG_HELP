"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { MTGCard, UserCollection, CollectionCard, Deck, DeckCard } from '@/types/mtg';
import { getCardByNameWithTranslation } from '@/utils/scryfallService';
import { getImageUrl } from '@/utils/imageService';

interface AppContextType {
  collections: UserCollection[];
  currentCollection: UserCollection | undefined;
  setCurrentCollection: React.Dispatch<React.SetStateAction<UserCollection[]>>;
  currentCollectionId: string | null;
  setCurrentCollectionId: (id: string | null) => void;
  createCollection: (name: string, description?: string) => string;
  updateCollection: (id: string, updates: Partial<UserCollection>) => void;
  deleteCollection: (id: string) => void;
  duplicateCollection: (id: string) => void;
  adicionarCarta: (card: MTGCard, quantidade?: number) => void;
  removerCarta: (card: MTGCard) => void;
  getQuantidadeNaColecao: (cardId: string) => number;
  
  // Gerenciamento de Decks
  decks: Deck[];
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
  criarDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'lastModified'>) => string;
  editarDeck: (deckId: string, updates: Partial<Deck>) => void;
  deletarDeck: (deckId: string) => void;
  duplicarDeck: (deckId: string, newName?: string) => string | undefined;
  adicionarCartaAoDeck: (deckId: string, card: MTGCard, category?: 'mainboard' | 'sideboard' | 'commander', quantity?: number) => void;
  removerCartaDoDeck: (deckId: string, cardId: string, category?: 'mainboard' | 'sideboard' | 'commander') => void;
  atualizarQuantidadeNoDeck: (deckId: string, cardId: string, novaQuantidade: number, category?: 'mainboard' | 'sideboard' | 'commander') => void;
  getCartasUsadasEmDecks: (cardId: string) => Array<{deck: Deck, quantity: number, category: string}>;
  importarDeckDeLista: (lista: string, deckInfo: Omit<Deck, 'id' | 'cards' | 'createdAt' | 'lastModified'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);

  const currentCollection = React.useMemo(() => {
    return collections.find(c => c.id === currentCollectionId);
  }, [collections, currentCollectionId]);

  const [decks, setDecks] = useState<Deck[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedCollections = localStorage.getItem('mtg-collections');
    if (savedCollections) {
      try {
        const parsedCollections = JSON.parse(savedCollections);
        setCollections(parsedCollections);
        if (parsedCollections.length > 0 && !currentCollectionId) {
          setCurrentCollectionId(parsedCollections[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar coleções salvas:', error);
      }
    } else {
      // Criar uma coleção padrão se não houver nenhuma
      const defaultCollection: UserCollection = {
        id: '1',
        name: 'Minha Coleção',
        description: 'Coleção principal de cartas Magic',
        cards: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: false
      };
      setCollections([defaultCollection]);
      setCurrentCollectionId(defaultCollection.id);
    }

    const savedDecks = localStorage.getItem('mtg-decks');
    if (savedDecks) {
      try {
        const parsedDecks = JSON.parse(savedDecks);
        setDecks(parsedDecks);
      } catch (error) {
        console.error('Erro ao carregar decks salvos:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage quando houver mudanças
  useEffect(() => {
    localStorage.setItem('mtg-collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem('mtg-decks', JSON.stringify(decks));
  }, [decks]);

  // Funções de gerenciamento de coleção
  const createCollection = (name: string, description: string = ''): string => {
    const newCollection: UserCollection = {
      id: Date.now().toString(),
      name,
      description,
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
    };
    setCollections(prev => [...prev, newCollection]);
    setCurrentCollectionId(newCollection.id);
    return newCollection.id;
  };

  const updateCollection = (id: string, updates: Partial<UserCollection>) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
  };

  const deleteCollection = (id: string) => {
    setCollections(prev => {
      const newCollections = prev.filter(c => c.id !== id);
      if (currentCollectionId === id) {
        setCurrentCollectionId(newCollections.length > 0 ? newCollections[0].id : null);
      }
      return newCollections;
    });
  };

  const duplicateCollection = (id: string) => {
    const collectionToDuplicate = collections.find(c => c.id === id);
    if (collectionToDuplicate) {
      const newCollection: UserCollection = {
        ...collectionToDuplicate,
        id: Date.now().toString(),
        name: `${collectionToDuplicate.name} (Cópia)`,
      };
      setCollections(prev => [...prev, newCollection]);
    }
  };

  // Função para adicionar carta à coleção
  const adicionarCarta = (card: MTGCard, quantidade: number = 1) => {
    if (!currentCollectionId) return;
    setCollections(prev => prev.map(c => {
      if (c.id !== currentCollectionId) return c;
      
      const existingCard = c.cards.find(cc => cc.card.id === card.id);
      let newCards;
      if (existingCard) {
        newCards = c.cards.map(cc =>
          cc.card.id === card.id
            ? { ...cc, quantity: cc.quantity + quantidade }
            : cc
        );
      } else {
        newCards = [...c.cards, {
          card,
          quantity: quantidade,
          condition: 'Near Mint',
          foil: false
        }];
      }
      return { ...c, cards: newCards, updatedAt: new Date().toISOString() };
    }));
  };

  // Função para remover carta da coleção
  const removerCarta = (card: MTGCard) => {
    if (!currentCollectionId) return;
    setCollections(prev => prev.map(c => {
      if (c.id !== currentCollectionId) return c;

      const existingCard = c.cards.find(cc => cc.card.id === card.id);
      let newCards;
      if (existingCard && existingCard.quantity > 1) {
        newCards = c.cards.map(cc =>
          cc.card.id === card.id
            ? { ...cc, quantity: cc.quantity - 1 }
            : cc
        );
      } else {
        newCards = c.cards.filter(cc => cc.card.id !== card.id);
      }
      return { ...c, cards: newCards, updatedAt: new Date().toISOString() };
    }));
  };

  // Função para obter quantidade de uma carta na coleção
  const getQuantidadeNaColecao = (cardId: string): number => {
    const card = currentCollection?.cards.find(c => c.card.id === cardId);
    return card ? card.quantity : 0;
  };

  // ====== FUNÇÕES DE GERENCIAMENTO DE DECKS ======

  // Criar novo deck
  const criarDeck = (deckData: Omit<Deck, 'id' | 'createdAt' | 'lastModified'>): string => {
    const newDeck: Deck = {
      ...deckData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    setDecks(prev => [...prev, newDeck]);
    return newDeck.id;
  };

  // Editar deck existente
  const editarDeck = (deckId: string, updates: Partial<Deck>) => {
    setDecks(prev => prev.map(deck => 
      deck.id === deckId 
        ? { ...deck, ...updates, lastModified: new Date().toISOString() }
        : deck
    ));
  };

  // Deletar deck
  const deletarDeck = (deckId: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== deckId));
  };

  // Duplicar deck
  const duplicarDeck = (deckId: string, newName?: string): string | undefined => {
    const originalDeck = decks.find(deck => deck.id === deckId);
    if (originalDeck) {
      const duplicatedDeck: Deck = {
        ...originalDeck,
        id: Date.now().toString(),
        name: newName || `${originalDeck.name} (Cópia)`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
      setDecks(prev => [...prev, duplicatedDeck]);
      return duplicatedDeck.id;
    }
    return undefined;
  };

  // Adicionar carta ao deck
  const adicionarCartaAoDeck = (
    deckId: string, 
    card: MTGCard, 
    category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard',
    quantity: number = 1
  ) => {
    setDecks(prev => prev.map(deck => {
      if (deck.id === deckId) {
        const existingCard = deck.cards.find(c => c.card.id === card.id && c.category === category);
        if (existingCard) {
          return {
            ...deck,
            cards: deck.cards.map(c => 
              c.card.id === card.id && c.category === category
                ? { ...c, quantity: c.quantity + quantity }
                : c
            ),
            lastModified: new Date().toISOString()
          };
        } else {
          return {
            ...deck,
            cards: [...deck.cards, { card, quantity, category }],
            lastModified: new Date().toISOString()
          };
        }
      }
      return deck;
    }));
  };

  // Remover carta do deck
  const removerCartaDoDeck = (
    deckId: string, 
    cardId: string, 
    category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard'
  ) => {
    setDecks(prev => prev.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.filter(c => !(c.card.id === cardId && c.category === category)),
          lastModified: new Date().toISOString()
        };
      }
      return deck;
    }));
  };

  // Atualizar quantidade de carta no deck
  const atualizarQuantidadeNoDeck = (
    deckId: string, 
    cardId: string, 
    novaQuantidade: number, 
    category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard'
  ) => {
    if (novaQuantidade <= 0) {
      removerCartaDoDeck(deckId, cardId, category);
      return;
    }

    setDecks(prev => prev.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.map(c => 
            c.card.id === cardId && c.category === category
              ? { ...c, quantity: novaQuantidade }
              : c
          ),
          lastModified: new Date().toISOString()
        };
      }
      return deck;
    }));
  };

  // Obter cartas que estão sendo usadas em decks
  const getCartasUsadasEmDecks = (cardId: string): Array<{deck: Deck, quantity: number, category: string}> => {
    const result: Array<{deck: Deck, quantity: number, category: string}> = [];
    
    decks.forEach(deck => {
      deck.cards.forEach(deckCard => {
        if (deckCard.card.id === cardId) {
          result.push({
            deck,
            quantity: deckCard.quantity,
            category: deckCard.category
          });
        }
      });
    });
    
    return result;
  };

  // Importar deck de lista de texto
  const importarDeckDeLista = async (
    lista: string, 
    deckInfo: Omit<Deck, 'id' | 'cards' | 'createdAt' | 'lastModified'>
  ): Promise<void> => {
    try {
      const lines = lista.split('\n').filter(line => line.trim());
      const cards: DeckCard[] = [];
      let currentCategory: 'mainboard' | 'sideboard' | 'commander' = 'mainboard';

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Detectar seções
        if (trimmedLine.toLowerCase().includes('sideboard')) {
          currentCategory = 'sideboard';
          continue;
        }
        if (trimmedLine.toLowerCase().includes('commander')) {
          currentCategory = 'commander';
          continue;
        }

        // Parse linha de carta (ex: "4 Lightning Bolt" ou "1x Sol Ring")
        const match = trimmedLine.match(/^(\d+)x?\s+(.+)$/);
        if (match) {
          const quantity = parseInt(match[1]);
          const cardName = match[2].trim();

          try {
            // Buscar carta na API Scryfall
            const cardData = await getCardByNameWithTranslation(cardName);
            if (cardData) {
              cards.push({
                card: cardData,
                quantity,
                category: currentCategory
              });
            }
          } catch (error) {
            console.warn(`Erro ao buscar carta: ${cardName}`, error);
          }
        }
      }

      const newDeck: Deck = {
        ...deckInfo,
        id: Date.now().toString(),
        cards,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      setDecks(prev => [...prev, newDeck]);
    } catch (error) {
      console.error('Erro ao importar deck:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      collections,
      currentCollection,
      setCurrentCollection: setCollections,
      currentCollectionId,
      setCurrentCollectionId,
      createCollection,
      updateCollection,
      deleteCollection,
      duplicateCollection,
      adicionarCarta,
      removerCarta,
      getQuantidadeNaColecao,
      decks,
      setDecks,
      criarDeck,
      editarDeck,
      deletarDeck,
      duplicarDeck,
      adicionarCartaAoDeck,
      removerCartaDoDeck,
      atualizarQuantidadeNoDeck,
      getCartasUsadasEmDecks,
      importarDeckDeLista
    }}>
      {children}
    </AppContext.Provider>
  );
};
