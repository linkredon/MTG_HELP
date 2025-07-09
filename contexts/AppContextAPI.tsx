"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { MTGCard, UserCollection, CollectionCard, Deck, DeckCard } from '@/types/mtg';
import { collectionService, deckService, favoriteService } from '@/utils/apiService';
import { useSession } from 'next-auth/react';

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
  
  // Favoritos
  favorites: MTGCard[];
  addFavorite: (card: MTGCard) => Promise<void>;
  removeFavorite: (cardId: string) => Promise<void>;
  isFavorite: (cardId: string) => boolean;
  
  // Estado de carregamento
  loading: boolean;
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
  const { data: session } = useSession();
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [favorites, setFavorites] = useState<MTGCard[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCollection = React.useMemo(() => {
    return collections.find(c => c.id === currentCollectionId);
  }, [collections, currentCollectionId]);

  // Carregar dados da API quando o usuário estiver autenticado
  useEffect(() => {
    const loadData = async () => {
      if (session) {
        setLoading(true);
        try {
          // Carregar coleções
          const collectionsResponse = await collectionService.getAll();
          if (collectionsResponse.success && collectionsResponse.data) {
            setCollections(collectionsResponse.data);
            if (collectionsResponse.data.length > 0 && !currentCollectionId) {
              setCurrentCollectionId(collectionsResponse.data[0].id);
            }
          }

          // Carregar decks
          const decksResponse = await deckService.getAll();
          if (decksResponse.success && decksResponse.data) {
            setDecks(decksResponse.data);
          }

          // Carregar favoritos
          const favoritesResponse = await favoriteService.getAll();
          if (favoritesResponse.success && favoritesResponse.data) {
            setFavorites(favoritesResponse.data.map((fav: any) => fav.card));
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Usuário não autenticado, usar localStorage como fallback
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
  }, [session]);

  // Salvar dados no localStorage quando não estiver autenticado
  useEffect(() => {
    if (!session) {
      localStorage.setItem('mtg-collections', JSON.stringify(collections));
    }
  }, [collections, session]);

  useEffect(() => {
    if (!session) {
      localStorage.setItem('mtg-decks', JSON.stringify(decks));
    }
  }, [decks, session]);

  useEffect(() => {
    if (!session) {
      localStorage.setItem('mtg-favorites', JSON.stringify(favorites));
    }
  }, [favorites, session]);

  // Funções de gerenciamento de coleção
  const createCollection = async (name: string, description: string = ''): Promise<string> => {
    if (session) {
      try {
        const response = await collectionService.create({ name, description });
        if (response.success && response.data) {
          setCollections(prev => [...prev, response.data]);
          setCurrentCollectionId(response.data.id);
          return response.data.id;
        }
        throw new Error('Erro ao criar coleção');
      } catch (error) {
        console.error('Erro ao criar coleção:', error);
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
    if (session) {
      try {
        const response = await collectionService.update(id, updates);
        if (response.success) {
          setCollections(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        }
      } catch (error) {
        console.error('Erro ao atualizar coleção:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
      setCollections(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    }
  };

  const deleteCollection = async (id: string): Promise<void> => {
    if (session) {
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
        console.error('Erro ao excluir coleção:', error);
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

    if (session) {
      try {
        const newCollection = {
          name: `${collectionToDuplicate.name} (Cópia)`,
          description: collectionToDuplicate.description,
          isPublic: false
        };
        
        const response = await collectionService.create(newCollection);
        if (response.success && response.data) {
          // Adicionar cartas à nova coleção
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
            setCollections(prev => [...prev, updatedResponse.data]);
          }
        }
      } catch (error) {
        console.error('Erro ao duplicar coleção:', error);
        throw error;
      }
    } else {
      // Fallback para localStorage
      const newCollection: UserCollection = {
        ...collectionToDuplicate,
        id: Date.now().toString(),
        name: `${collectionToDuplicate.name} (Cópia)`,
      };
      setCollections(prev => [...prev, newCollection]);
    }
  };

  // Função para adicionar carta à coleção
  const adicionarCarta = async (card: MTGCard, quantidade: number = 1): Promise<void> => {
    if (!currentCollectionId) return;
    
    if (session) {
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
          setCollections(prev => prev.map(c => c.id === currentCollectionId ? response.data : c));
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

  // Função para remover carta da coleção
  const removerCarta = async (card: MTGCard): Promise<void> => {
    if (!currentCollectionId) return;
    
    if (session) {
      try {
        // Encontrar o ID da carta na coleção
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
          setCollections(prev => prev.map(c => c.id === currentCollectionId ? response.data : c));
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

  // Função para obter quantidade de uma carta na coleção
  const getQuantidadeNaColecao = (cardId: string): number => {
    const card = currentCollection?.cards?.find(c => c.card.id === cardId);
    return card ? card.quantity : 0;
  };

  // ====== FUNÇÕES DE GERENCIAMENTO DE DECKS ======

  // Criar novo deck
  const criarDeck = async (deckData: Omit<Deck, 'id' | 'createdAt' | 'lastModified'>): Promise<string> => {
    if (session) {
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
    if (session) {
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
    if (session) {
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

    if (session) {
      try {
        const newDeckData = {
          name: newName || `${originalDeck.name} (Cópia)`,
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
            setDecks(prev => [...prev, updatedResponse.data]);
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
        name: newName || `${originalDeck.name} (Cópia)`,
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
    if (session) {
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
          setDecks(prev => prev.map(deck => deck.id === deckId ? response.data : deck));
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
    if (session) {
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
          setDecks(prev => prev.map(deck => deck.id === deckId ? response.data : deck));
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

    if (session) {
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
          setDecks(prev => prev.map(deck => deck.id === deckId ? response.data : deck));
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

  // ====== FUNÇÕES DE GERENCIAMENTO DE FAVORITOS ======

  // Adicionar carta aos favoritos
  const addFavorite = async (card: MTGCard): Promise<void> => {
    if (session) {
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
    if (session) {
      try {
        const response = await favoriteService.removeCard(cardId);
        if (response.success) {
          setFavorites(prev => prev.filter(card => card.id !== cardId));
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

  // Verificar se uma carta está nos favoritos
  const isFavorite = (cardId: string): boolean => {
    return favorites.some(card => card.id === cardId);
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
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
};