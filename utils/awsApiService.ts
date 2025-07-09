import { awsDbService, generateId, getCurrentTimestamp } from '@/lib/awsDbConnect';
import { TABLES } from '@/lib/awsConfig';
import { getSession } from 'next-auth/react';

// Serviço para gerenciar coleções
export const collectionService = {
  // Obter todas as coleções do usuário
  async getAll() {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    return awsDbService.getByUserId(TABLES.COLLECTIONS, session.user.id);
  },
  
  // Obter uma coleção por ID
  async getById(id: string) {
    return awsDbService.getById(TABLES.COLLECTIONS, id);
  },
  
  // Criar uma nova coleção
  async create(collectionData: any) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    const collection = {
      ...collectionData,
      userId: session.user.id,
      cards: [],
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    
    return awsDbService.create(TABLES.COLLECTIONS, collection);
  },
  
  // Atualizar uma coleção
  async update(id: string, updates: any) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Verificar se a coleção pertence ao usuário
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, id);
    if (!collection.success || !collection.data || collection.data.userId !== session.user.id) {
      return { success: false, error: 'Coleção não encontrada ou acesso negado' };
    }
    
    return awsDbService.update(TABLES.COLLECTIONS, id, updates);
  },
  
  // Excluir uma coleção
  async delete(id: string) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Verificar se a coleção pertence ao usuário
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, id);
    if (!collection.success || !collection.data || collection.data.userId !== session.user.id) {
      return { success: false, error: 'Coleção não encontrada ou acesso negado' };
    }
    
    return awsDbService.delete(TABLES.COLLECTIONS, id);
  },
  
  // Adicionar carta à coleção
  async addCard(collectionId: string, cardData: any) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Obter a coleção atual
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, collectionId);
    if (!collection.success || !collection.data || collection.data.userId !== session.user.id) {
      return { success: false, error: 'Coleção não encontrada ou acesso negado' };
    }
    
    // Verificar se a carta já existe na coleção
    const cards = collection.data.cards || [];
    const cardIndex = cards.findIndex((c: any) => 
      c.card.id === cardData.card.id && 
      c.foil === cardData.foil && 
      c.condition === cardData.condition && 
      c.language === cardData.language
    );
    
    if (cardIndex >= 0) {
      // Atualizar quantidade se a carta já existe
      cards[cardIndex].quantity += cardData.quantity;
    } else {
      // Adicionar nova carta com ID único
      cards.push({
        ...cardData,
        _id: generateId()
      });
    }
    
    // Atualizar a coleção
    return awsDbService.update(TABLES.COLLECTIONS, collectionId, { 
      cards,
      updatedAt: getCurrentTimestamp()
    });
  },
  
  // Atualizar carta na coleção
  async updateCard(collectionId: string, cardId: string, updates: any) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Obter a coleção atual
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, collectionId);
    if (!collection.success || !collection.data || collection.data.userId !== session.user.id) {
      return { success: false, error: 'Coleção não encontrada ou acesso negado' };
    }
    
    // Atualizar a carta
    const cards = collection.data.cards || [];
    const cardIndex = cards.findIndex((c: any) => c._id === cardId);
    
    if (cardIndex < 0) {
      return { success: false, error: 'Carta não encontrada na coleção' };
    }
    
    cards[cardIndex] = { ...cards[cardIndex], ...updates };
    
    // Atualizar a coleção
    return awsDbService.update(TABLES.COLLECTIONS, collectionId, { 
      cards,
      updatedAt: getCurrentTimestamp()
    });
  },
  
  // Remover carta da coleção
  async removeCard(collectionId: string, cardId: string) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Obter a coleção atual
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, collectionId);
    if (!collection.success || !collection.data || collection.data.userId !== session.user.id) {
      return { success: false, error: 'Coleção não encontrada ou acesso negado' };
    }
    
    // Remover a carta
    const cards = collection.data.cards || [];
    const updatedCards = cards.filter((c: any) => c._id !== cardId);
    
    // Atualizar a coleção
    return awsDbService.update(TABLES.COLLECTIONS, collectionId, { 
      cards: updatedCards,
      updatedAt: getCurrentTimestamp()
    });
  }
};

// Serviço para gerenciar decks
export const deckService = {
  // Obter todos os decks do usuário
  async getAll() {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    return awsDbService.getByUserId(TABLES.DECKS, session.user.id);
  },
  
  // Obter um deck por ID
  async getById(id: string) {
    return awsDbService.getById(TABLES.DECKS, id);
  },
  
  // Criar um novo deck
  async create(deckData: any) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    const deck = {
      ...deckData,
      userId: session.user.id,
      cards: deckData.cards || [],
      createdAt: getCurrentTimestamp(),
      lastModified: getCurrentTimestamp()
    };
    
    return awsDbService.create(TABLES.DECKS, deck);
  },
  
  // Atualizar um deck
  async update(id: string, updates: any) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Verificar se o deck pertence ao usuário
    const deck = await awsDbService.getById(TABLES.DECKS, id);
    if (!deck.success || !deck.data || deck.data.userId !== session.user.id) {
      return { success: false, error: 'Deck não encontrado ou acesso negado' };
    }
    
    const updatedData = {
      ...updates,
      lastModified: getCurrentTimestamp()
    };
    
    return awsDbService.update(TABLES.DECKS, id, updatedData);
  },
  
  // Excluir um deck
  async delete(id: string) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Verificar se o deck pertence ao usuário
    const deck = await awsDbService.getById(TABLES.DECKS, id);
    if (!deck.success || !deck.data || deck.data.userId !== session.user.id) {
      return { success: false, error: 'Deck não encontrado ou acesso negado' };
    }
    
    return awsDbService.delete(TABLES.DECKS, id);
  },
  
  // Adicionar carta ao deck
  async addCard(deckId: string, cardData: any) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Obter o deck atual
    const deck = await awsDbService.getById(TABLES.DECKS, deckId);
    if (!deck.success || !deck.data || deck.data.userId !== session.user.id) {
      return { success: false, error: 'Deck não encontrado ou acesso negado' };
    }
    
    // Determinar a categoria da carta
    const category = cardData.category || 
      (cardData.isCommander ? 'commander' : 
       cardData.isSideboard ? 'sideboard' : 'mainboard');
    
    // Verificar se a carta já existe no deck na mesma categoria
    const cards = deck.data.cards || [];
    const cardIndex = cards.findIndex((c: any) => 
      c.card.id === cardData.card.id && c.category === category
    );
    
    if (cardIndex >= 0) {
      // Atualizar quantidade se a carta já existe
      cards[cardIndex].quantity += cardData.quantity;
    } else {
      // Adicionar nova carta com ID único
      cards.push({
        card: cardData.card,
        quantity: cardData.quantity,
        category,
        _id: generateId()
      });
    }
    
    // Atualizar o deck
    return awsDbService.update(TABLES.DECKS, deckId, { 
      cards,
      lastModified: getCurrentTimestamp()
    });
  },
  
  // Atualizar carta no deck
  async updateCard(deckId: string, cardId: string, updates: any) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Obter o deck atual
    const deck = await awsDbService.getById(TABLES.DECKS, deckId);
    if (!deck.success || !deck.data || deck.data.userId !== session.user.id) {
      return { success: false, error: 'Deck não encontrado ou acesso negado' };
    }
    
    // Atualizar a carta
    const cards = deck.data.cards || [];
    const cardIndex = cards.findIndex((c: any) => c._id === cardId);
    
    if (cardIndex < 0) {
      return { success: false, error: 'Carta não encontrada no deck' };
    }
    
    cards[cardIndex] = { ...cards[cardIndex], ...updates };
    
    // Atualizar o deck
    return awsDbService.update(TABLES.DECKS, deckId, { 
      cards,
      lastModified: getCurrentTimestamp()
    });
  },
  
  // Remover carta do deck
  async removeCard(deckId: string, cardId: string) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Obter o deck atual
    const deck = await awsDbService.getById(TABLES.DECKS, deckId);
    if (!deck.success || !deck.data || deck.data.userId !== session.user.id) {
      return { success: false, error: 'Deck não encontrado ou acesso negado' };
    }
    
    // Remover a carta
    const cards = deck.data.cards || [];
    const updatedCards = cards.filter((c: any) => c._id !== cardId);
    
    // Atualizar o deck
    return awsDbService.update(TABLES.DECKS, deckId, { 
      cards: updatedCards,
      lastModified: getCurrentTimestamp()
    });
  }
};

// Serviço para gerenciar favoritos
export const favoriteService = {
  // Obter todos os favoritos do usuário
  async getAll() {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    return awsDbService.getByUserId(TABLES.FAVORITES, session.user.id);
  },
  
  // Adicionar carta aos favoritos
  async add(card: any) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Verificar se a carta já está nos favoritos
    const favorites = await this.getAll();
    if (favorites.success && favorites.data) {
      const exists = favorites.data.some((fav: any) => fav.card.id === card.id);
      if (exists) {
        return { success: true, message: 'Carta já está nos favoritos' };
      }
    }
    
    // Adicionar aos favoritos
    const favorite = {
      id: generateId(),
      userId: session.user.id,
      card,
      addedAt: getCurrentTimestamp()
    };
    
    return awsDbService.create(TABLES.FAVORITES, favorite);
  },
  
  // Remover carta dos favoritos
  async removeCard(cardId: string) {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Encontrar o ID do favorito
    const favorites = await this.getAll();
    if (!favorites.success || !favorites.data) {
      return { success: false, error: 'Erro ao obter favoritos' };
    }
    
    const favorite = favorites.data.find((fav: any) => fav.card.id === cardId);
    if (!favorite) {
      return { success: false, error: 'Carta não encontrada nos favoritos' };
    }
    
    // Remover dos favoritos
    return awsDbService.delete(TABLES.FAVORITES, favorite.id);
  }
};
