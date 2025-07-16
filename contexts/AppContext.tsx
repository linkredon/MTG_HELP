"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ApiResponse } from '@/types/api';

// Helper function for type assertion
function asUserCollection(data: any): UserCollection {
  return data as UserCollection;
}

function asUserCollectionArray(data: any[]): UserCollection[] {
  return data as UserCollection[];
}

function asDeckArray(data: any[]): Deck[] {
  return data as Deck[];
}
import { safeLocalStorageSave } from '@/utils/storageUtils';
import type { MTGCard, UserCollection, CollectionCard, Deck, DeckCard } from '@/types/mtg';
import { collectionService, deckService, favoriteService } from '@/utils/awsApiService';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';

interface AppContextType {
  collections: UserCollection[];
  currentCollection: UserCollection | undefined;
  setCurrentCollection: React.Dispatch<React.SetStateAction<UserCollection[]>>;
  currentCollectionId: string | null;
  setCurrentCollectionId: (id: string | null) => void;
  createCollection: (name: string, description?: string) => Promise<string>;
  updateCollection: (id: string, updates: Partial<UserCollection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  duplicateCollection: (id: string) => Promise<void>;
  adicionarCarta: (card: MTGCard, quantidade?: number) => Promise<void>;
  removerCarta: (card: MTGCard) => Promise<void>;
  getQuantidadeNaColecao: (cardId: string) => number;
  
  // Gerenciamento de Decks
  decks: Deck[];
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
  criarDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'lastModified'>) => Promise<string>;
  editarDeck: (deckId: string, updates: Partial<Deck>) => Promise<void>;
  deletarDeck: (deckId: string) => Promise<void>;
  duplicarDeck: (deckId: string, newName?: string) => Promise<string | undefined>;
  adicionarCartaAoDeck: (deckId: string, card: MTGCard, category?: 'mainboard' | 'sideboard' | 'commander', quantity?: number) => Promise<void>;
  removerCartaDoDeck: (deckId: string, cardId: string, category?: 'mainboard' | 'sideboard' | 'commander') => Promise<void>;
  atualizarQuantidadeNoDeck: (deckId: string, cardId: string, novaQuantidade: number, category?: 'mainboard' | 'sideboard' | 'commander') => Promise<void>;
  getCartasUsadasEmDecks: (cardId: string) => Array<{deck: Deck, quantity: number, category: string}>;
  importarDeckDeLista: (deckList: string, deckData: any) => Promise<string>;
  
  // Favoritos
  favorites: MTGCard[];
  addFavorite: (card: MTGCard) => Promise<void>;
  removeFavorite: (cardId: string) => Promise<void>;
  isFavorite: (cardId: string) => boolean;
  
  // Estado de carregamento
  loading: boolean;
  
  // ExportaÃ§Ã£o
  exportCollectionToCSV: (collection: UserCollection) => void;
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
  const { user: authUser, isAuthenticated } = useAmplifyAuth();
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [favorites, setFavorites] = useState<MTGCard[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCollection = React.useMemo(() => {
    return collections.find(c => c.id === currentCollectionId);
  }, [collections, currentCollectionId]);

  // Carregar dados da API quando o usuÃ¡rio estiver autenticado
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          // Carregar coleÃ§Ãµes
          const collectionsResponse = await collectionService.getAll();
          if (collectionsResponse.success && collectionsResponse.data) {
            setCollections(asUserCollectionArray(collectionsResponse.data));
            if (collectionsResponse.data.length > 0 && !currentCollectionId) {
              setCurrentCollectionId(collectionsResponse.data[0].id);
            }
          }

          // Carregar decks
          const decksResponse = await deckService.getAll();
          if (decksResponse.success && decksResponse.data) {
            setDecks(asDeckArray(decksResponse.data));
          }

          // Carregar favoritos
          const favoritesResponse = await favoriteService.getAll();
          if (favoritesResponse.success && favoritesResponse.data) {
            setFavorites(favoritesResponse.data.map((fav: any) => fav.card) as MTGCard[]);
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // UsuÃ¡rio nÃ£o autenticado, usar localStorage como fallback
        const savedCollections = localStorage.getItem('mtg-collections');
        if (savedCollections) {
          try {
            const parsedCollections = JSON.parse(savedCollections);
            setCollections(parsedCollections);
            if (parsedCollections.length > 0 && !currentCollectionId) {
              setCurrentCollectionId(parsedCollections[0].id);
            }
          } catch (error) {
            console.error('Erro ao carregar coleÃ§Ãµes salvas:', error);
          }
        } else {
          // Criar uma coleÃ§Ã£o padrÃ£o se nÃ£o houver nenhuma
          const defaultCollection: UserCollection = {
            id: '1',
            name: 'Minha ColeÃ§Ã£o',
            description: 'ColeÃ§Ã£o principal de cartas Magic',
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

        const savedFavorites = localStorage.getItem('mtg-favorites');
        if (savedFavorites) {
          try {
            const parsedFavorites = JSON.parse(savedFavorites);
            setFavorites(parsedFavorites);
          } catch (error) {
            console.error('Erro ao carregar favoritos salvos:', error);
          }
        }
        
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Salvar dados no localStorage quando nÃ£o estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      safeLocalStorageSave('mtg-collections', collections);
    }
  }, [collections, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      safeLocalStorageSave('mtg-decks', decks);
    }
  }, [decks, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      safeLocalStorageSave('mtg-favorites', favorites);
    }
  }, [favorites, isAuthenticated]);

  // FunÃ§Ãµes de gerenciamento de coleÃ§Ã£o
  const createCollection = async (name: string, description: string = ''): Promise<string> => {
    if (isAuthenticated) {
      try {
        const response = await collectionService.create({ name, description });
        if (response.success && response.data) {
          setCollections(prev => [...prev, asUserCollection(response.data)]);
          setCurrentCollectionId(response.data.id);
          return response.data.id;
        }
        throw new Error('Erro ao criar coleÃ§Ã£o');
      } catch (error) {
        console.error('Erro ao criar coleÃ§Ã£o:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
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
    }
  };

  const updateCollection = async (id: string, updates: Partial<UserCollection>): Promise<void> => {
    if (isAuthenticated) {
      try {
        const response = await collectionService.update(id, updates);
        if (response.success) {
          setCollections(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        }
      } catch (error) {
        console.error('Erro ao atualizar coleÃ§Ã£o:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
      setCollections(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    }
  };

  const deleteCollection = async (id: string): Promise<void> => {
    if (isAuthenticated) {
      try {
        const response = await collectionService.delete(id);
        if (response.success) {
          setCollections(prev => {
            const newCollections = prev.filter(c => c.id !== id);
            if (currentCollectionId === id) {
              setCurrentCollectionId(newCollections.length > 0 ? newCollections[0].id : null);
            }
            return newCollections;
          });
        }
      } catch (error) {
        console.error('Erro ao excluir coleÃ§Ã£o:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
      setCollections(prev => {
        const newCollections = prev.filter(c => c.id !== id);
        if (currentCollectionId === id) {
          setCurrentCollectionId(newCollections.length > 0 ? newCollections[0].id : null);
        }
        return newCollections;
      });
    }
  };

  const duplicateCollection = async (id: string): Promise<void> => {
    const collectionToDuplicate = collections.find(c => c.id === id);
    if (!collectionToDuplicate) return;

    if (isAuthenticated) {
      try {
        const newCollection = {
          name: `${collectionToDuplicate.name} (CÃ³pia)`,
          description: collectionToDuplicate.description,
          isPublic: false
        };
        
        const response = await collectionService.create(newCollection);
        if (response.success && response.data) {
          // Adicionar cartas Ã  nova coleÃ§Ã£o
          for (const cardItem of collectionToDuplicate.cards) {
            await collectionService.addCard(response.data.id, {
              card: cardItem.card,
              quantity: cardItem.quantity,
              condition: cardItem.condition,
              foil: cardItem.foil,
              language: cardItem.language
            });
          }
          
          // Atualizar estado local
          const updatedResponse = await collectionService.getById(response.data.id);
          if (updatedResponse.success) {
            setCollections(prev => [...prev, asUserCollection(updatedResponse.data)]);
          }
        }
      } catch (error) {
        console.error('Erro ao duplicar coleÃ§Ã£o:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
      const newCollection: UserCollection = {
        ...collectionToDuplicate,
        id: Date.now().toString(),
        name: `${collectionToDuplicate.name} (CÃ³pia)`,
      };
      setCollections(prev => [...prev, newCollection]);
    }
  };

  // FunÃ§Ã£o para adicionar carta Ã  coleÃ§Ã£o
  const adicionarCarta = async (card: MTGCard, quantidade: number = 1): Promise<void> => {
    if (!currentCollectionId) return;
    
    if (isAuthenticated) {
      try {
        await collectionService.addCard(currentCollectionId, {
          card,
          quantity: quantidade,
          condition: 'Near Mint',
          foil: false,
          language: 'English'
        });
        
        // Atualizar estado local
        const response = await collectionService.getById(currentCollectionId);
        if (response.success) {
          setCollections(prev => prev.map(c => c.id === currentCollectionId ? asUserCollection(response.data) : c));
        }
      } catch (error) {
        console.error('Erro ao adicionar carta:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
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
    }
  };

  // FunÃ§Ã£o para remover carta da coleÃ§Ã£o
  const removerCarta = async (card: MTGCard): Promise<void> => {
    if (!currentCollectionId) return;
    
    if (isAuthenticated) {
      try {
        // Encontrar o ID da carta na coleÃ§Ã£o
        const collection = collections.find(c => c.id === currentCollectionId);
        if (!collection) return;
        
        const cardInCollection = collection.cards.find(cc => cc.card.id === card.id);
        if (!cardInCollection) return;
        
        if (cardInCollection.quantity > 1) {
          // Atualizar quantidade
          if (cardInCollection._id) {
            await collectionService.updateCard(currentCollectionId, cardInCollection._id, {
              quantity: cardInCollection.quantity - 1
            });
          }
        } else {
          // Remover carta
          if (cardInCollection._id) {
            await collectionService.removeCard(currentCollectionId, cardInCollection._id);
          }
        }
        
        // Atualizar estado local
        const response = await collectionService.getById(currentCollectionId);
        if (response.success) {
          setCollections(prev => prev.map(c => c.id === currentCollectionId ? asUserCollection(response.data) : c));
        }
      } catch (error) {
        console.error('Erro ao remover carta:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
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
    }
  };

  // FunÃ§Ã£o para obter quantidade de uma carta na coleÃ§Ã£o
  const getQuantidadeNaColecao = (cardId: string): number => {
    const card = currentCollection?.cards?.find(c => c.card.id === cardId);
    return card ? card.quantity : 0;
  };

  // ====== FUNÃ‡Ã•ES DE GERENCIAMENTO DE DECKS ======

  // Criar novo deck
  const criarDeck = async (deckData: Omit<Deck, 'id' | 'createdAt' | 'lastModified'>): Promise<string> => {
    if (isAuthenticated) {
      try {
        const response = await deckService.create(deckData);
        if (response.success && response.data) {
          setDecks(prev => [...prev, response.data]);
          return response.data.id;
        }
        throw new Error('Erro ao criar deck');
      } catch (error) {
        console.error('Erro ao criar deck:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
      const newDeck: Deck = {
        ...deckData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
      setDecks(prev => [...prev, newDeck]);
      return newDeck.id;
    }
  };

  // Editar deck existente
  const editarDeck = async (deckId: string, updates: Partial<Deck>): Promise<void> => {
    if (isAuthenticated) {
      try {
        const response = await deckService.update(deckId, updates);
        if (response.success) {
          setDecks(prev => prev.map(deck => 
            deck.id === deckId 
              ? { ...deck, ...updates }
              : deck
          ));
        }
      } catch (error) {
        console.error('Erro ao editar deck:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
      setDecks(prev => prev.map(deck => 
        deck.id === deckId 
          ? { ...deck, ...updates, lastModified: new Date().toISOString() }
          : deck
      ));
    }
  };

  // Deletar deck
  const deletarDeck = async (deckId: string): Promise<void> => {
    if (isAuthenticated) {
      try {
        const response = await deckService.delete(deckId);
        if (response.success) {
          setDecks(prev => prev.filter(deck => deck.id !== deckId));
        }
      } catch (error) {
        console.error('Erro ao deletar deck:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
      setDecks(prev => prev.filter(deck => deck.id !== deckId));
    }
  };

  // Duplicar deck
  const duplicarDeck = async (deckId: string, newName?: string): Promise<string | undefined> => {
    const originalDeck = decks.find(deck => deck.id === deckId);
    if (!originalDeck) return undefined;

    if (isAuthenticated) {
      try {
        const newDeckData = {
          name: newName || `${originalDeck.name} (CÃ³pia)`,
          description: originalDeck.description,
          format: originalDeck.format,
          colors: originalDeck.colors,
          isPublic: false
        };
        
        const response = await deckService.create(newDeckData);
        if (response.success && response.data) {
          // Adicionar cartas ao novo deck
          for (const cardItem of originalDeck.cards) {
            await deckService.addCard(response.data.id, {
              card: cardItem.card,
              quantity: cardItem.quantity,
              isSideboard: cardItem.category === 'sideboard',
              isCommander: cardItem.category === 'commander',
              category: cardItem.category
            });
          }
          
          // Atualizar estado local
          const updatedResponse = await deckService.getById(response.data.id);
          if (updatedResponse.success && updatedResponse.data) {
            setDecks(prev => [...prev, updatedResponse.data as Deck]);
            return updatedResponse.data.id;
          }
        }
        return undefined;
      } catch (error) {
        console.error('Erro ao duplicar deck:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
      const duplicatedDeck: Deck = {
        ...originalDeck,
        id: Date.now().toString(),
        name: newName || `${originalDeck.name} (CÃ³pia)`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
      setDecks(prev => [...prev, duplicatedDeck]);
      return duplicatedDeck.id;
    }
  };

  // Adicionar carta ao deck
  const adicionarCartaAoDeck = async (
    deckId: string, 
    card: MTGCard, 
    category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard',
    quantity: number = 1
  ): Promise<void> => {
    if (isAuthenticated) {
      try {
        await deckService.addCard(deckId, {
          card,
          quantity,
          isSideboard: category === 'sideboard',
          isCommander: category === 'commander',
          category
        });
        
        // Atualizar estado local
        const response = await deckService.getById(deckId);
        if (response.success) {
          setDecks(prev => prev.map(deck => deck.id === deckId ? response.data as Deck : deck));
        }
      } catch (error) {
        console.error('Erro ao adicionar carta ao deck:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
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
    }
  };

  // Remover carta do deck
  const removerCartaDoDeck = async (
    deckId: string, 
    cardId: string, 
    category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard'
  ): Promise<void> => {
    if (isAuthenticated) {
      try {
        // Encontrar o ID da carta no deck
        const deck = decks.find(d => d.id === deckId);
        if (!deck) return;
        
        const cardInDeck = deck.cards.find(c => c.card.id === cardId && c.category === category);
        if (!cardInDeck) return;
        
        if (cardInDeck._id) {
          await deckService.removeCard(deckId, cardInDeck._id);
        }
        
        // Atualizar estado local
        const response = await deckService.getById(deckId);
        if (response.success) {
          setDecks(prev => prev.map(deck => deck.id === deckId ? response.data as Deck : deck));
        }
      } catch (error) {
        console.error('Erro ao remover carta do deck:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
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
    }
  };

  // Atualizar quantidade de carta no deck
  const atualizarQuantidadeNoDeck = async (
    deckId: string, 
    cardId: string, 
    novaQuantidade: number, 
    category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard'
  ): Promise<void> => {
    if (novaQuantidade <= 0) {
      await removerCartaDoDeck(deckId, cardId, category);
      return;
    }

    if (isAuthenticated) {
      try {
        // Encontrar o ID da carta no deck
        const deck = decks.find(d => d.id === deckId);
        if (!deck) return;
        
        const cardInDeck = deck.cards.find(c => c.card.id === cardId && c.category === category);
        if (!cardInDeck) return;
        
        if (cardInDeck._id) {
          await deckService.updateCard(deckId, cardInDeck._id, { quantity: novaQuantidade });
        }
        
        // Atualizar estado local
        const response = await deckService.getById(deckId);
        if (response.success) {
          setDecks(prev => prev.map(deck => deck.id === deckId ? response.data as Deck : deck));
        }
      } catch (error) {
        console.error('Erro ao atualizar quantidade no deck:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
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
    }
  };

  // Obter cartas que estÃ£o sendo usadas em decks
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
  
  // FunÃ§Ã£o para importar deck a partir de uma lista de texto
  const importarDeckDeLista = async (deckList: string, deckData: any): Promise<string> => {
    try {
      // Criar o deck vazio primeiro
      const deckId = await criarDeck({
        name: deckData.name,
        format: deckData.format,
        description: deckData.description || '',
        colors: deckData.colors || [],
        cards: [],
        isPublic: deckData.isPublic || false,
        tags: deckData.tags || []
      });
      
      // Processar a lista de cartas
      const lines = deckList.split('\n').filter(line => line.trim());
      let currentSection: 'mainboard' | 'sideboard' | 'commander' = 'mainboard';
      const cardPromises: Promise<any>[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim().toLowerCase();
        
        // Verificar se Ã© uma linha de seÃ§Ã£o
        if (trimmedLine.includes('sideboard')) {
          currentSection = 'sideboard';
          continue;
        }
        if (trimmedLine.includes('commander')) {
          currentSection = 'commander';
          continue;
        }
        if (trimmedLine.includes('mainboard') || trimmedLine.includes('main deck')) {
          currentSection = 'mainboard';
          continue;
        }
        
        // Verificar se Ã© uma linha de carta
        const match = line.match(/^(\d+)x?\s+(.+)$/);
        if (match) {
          const quantity = parseInt(match[1]);
          const cardName = match[2].trim();
          
          // Buscar a carta na API do Scryfall
          cardPromises.push(
            (async () => {
              try {
                const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`);
                if (response.ok) {
                  const cardData = await response.json();
                  // Adicionar a carta ao deck
                  await adicionarCartaAoDeck(deckId, cardData, currentSection, quantity);
                  return { success: true, card: cardName };
                } else {
                  console.error(`Carta nÃ£o encontrada: ${cardName}`);
                  return { success: false, card: cardName };
                }
              } catch (error) {
                console.error(`Erro ao buscar carta ${cardName}:`, error);
                return { success: false, card: cardName };
              }
            })()
          );
        }
      }
      
      // Aguardar todas as cartas serem processadas
      const results = await Promise.allSettled(cardPromises);
      const failedCards = results
        .filter(result => result.status === 'fulfilled' && !(result.value as any).success)
        .map(result => (result.status === 'fulfilled' ? (result.value as any).card : 'Unknown'));
      
      if (failedCards.length > 0) {
        console.warn(`Algumas cartas nÃ£o foram encontradas: ${failedCards.join(', ')}`);
      }
      
      return deckId;
    } catch (error) {
      console.error('Erro ao importar deck:', error);
      throw new Error('Falha ao importar deck. Verifique o formato da lista.');
    }
  };

  // ====== FUNÃ‡Ã•ES DE GERENCIAMENTO DE FAVORITOS ======

  // Adicionar carta aos favoritos
  const addFavorite = async (card: MTGCard): Promise<void> => {
    if (isAuthenticated) {
      try {
        const response = await favoriteService.add(card);
        if (response.success) {
          setFavorites(prev => [...prev, card]);
        }
      } catch (error) {
        console.error('Erro ao adicionar favorito:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
      setFavorites(prev => {
        if (prev.some(c => c.id === card.id)) return prev;
        return [...prev, card];
      });
    }
  };

  // Remover carta dos favoritos
  const removeFavorite = async (cardId: string): Promise<void> => {
    if (isAuthenticated) {
      try {
        // Primeiro obter o ID do favorito e depois remover
        const checkResult = await favoriteService.checkCard(cardId);
        if (checkResult.success && checkResult.data && checkResult.data.favoriteId) {
          const response = await favoriteService.remove(checkResult.data.favoriteId);
          if (response.success) {
            setFavorites(prev => prev.filter(card => card.id !== cardId));
          }
        }
      } catch (error) {
        console.error('Erro ao remover favorito:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
      setFavorites(prev => prev.filter(card => card.id !== cardId));
    }
  };

  // Verificar se uma carta estÃ¡ nos favoritos
  const isFavorite = (cardId: string): boolean => {
    return favorites.some(card => card.id === cardId);
  };

  // FunÃ§Ã£o para exportar coleÃ§Ã£o para CSV no formato Manabox
  const exportCollectionToCSV = (collection: UserCollection) => {
    // Formato Manabox: Name,Set,Quantity,Foil,Condition,Language
    const csvContent = [
      ['Name', 'Set', 'Quantity', 'Foil', 'Condition', 'Language'],
      ...collection.cards.map(c => [
        c.card.name,
        c.card.set_code,
        c.quantity.toString(),
        c.foil ? 'Foil' : 'Non-foil',
        c.condition || 'Near Mint',
        c.language || 'English'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.name}_manabox.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
      importarDeckDeLista,
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      loading,
      exportCollectionToCSV
    }}>
      {children}
    </AppContext.Provider>
  );
};


