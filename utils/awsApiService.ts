import { generateId, getCurrentTimestamp } from '@/lib/awsDbConnect';
import { TABLES } from '@/lib/awsConfig';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { getUserSession } from '@/lib/authHelper';
// Usar o serviço de banco de dados universal que funciona tanto no cliente quanto no servidor
import { universalDbService as awsDbService } from '@/lib/universalDbService';

// Função auxiliar para obter o ID do usuário autenticado
async function getAuthenticatedUserId() {
  try {
    const currentUser = await getCurrentUser();
    return currentUser?.userId;
  } catch (error) {
    console.error('Erro ao obter usuário autenticado:', error);
    return null;
  }
}

// Serviço para gerenciar coleções
export const collectionService = {
  // Obter todas as coleções do usuário
  async getAll() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser?.userId) {
        return { success: false, error: 'Usuário não autenticado' };
      }
      
      return awsDbService.getByUserId(TABLES.COLLECTIONS, currentUser.userId);
    } catch (error) {
      return { success: false, error: 'Erro ao verificar autenticação' };
    }
  },
  
  // Obter uma coleção por ID
  async getById(id: string) {
    return awsDbService.getById(TABLES.COLLECTIONS, id);
  },
  
  // Criar uma nova coleção
  async create(collectionData: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    const collection = {
      ...collectionData,
      userId: userId,
      cards: [],
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    
    return awsDbService.create(TABLES.COLLECTIONS, collection);
  },
  
  // Atualizar uma coleção
  async update(id: string, updates: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Verificar se a coleção pertence ao usuário
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, id);
    if (!collection.success || !collection.data || collection.data.userId !== userId) {
      return { success: false, error: 'Coleção não encontrada ou acesso negado' };
    }
    
    return awsDbService.update(TABLES.COLLECTIONS, id, updates);
  },
  
  // Excluir uma coleção
  async delete(id: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Verificar se a coleção pertence ao usuário
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, id);
    if (!collection.success || !collection.data || collection.data.userId !== userId) {
      return { success: false, error: 'Coleção não encontrada ou acesso negado' };
    }
    
    return awsDbService.delete(TABLES.COLLECTIONS, id);
  },
  
  // Adicionar carta à coleção
  async addCard(collectionId: string, cardData: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Obter a coleção atual
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, collectionId);
    if (!collection.success || !collection.data) {
      return { success: false, error: 'Coleção não encontrada' };
    }
    
    // Verificar se a coleção pertence ao usuário
    if (collection.data.userId !== userId) {
      return { success: false, error: 'Acesso negado' };
    }
    
    // Preparar o novo card com ID gerado
    const newCard = {
      id: generateId(),
      ...cardData,
      addedAt: getCurrentTimestamp()
    };
    
    // Adicionar o card na coleção
    const cards = collection.data.cards || [];
    cards.push(newCard);
    
    // Atualizar a coleção
    return awsDbService.update(TABLES.COLLECTIONS, collectionId, {
      cards,
      updatedAt: getCurrentTimestamp()
    });
  },
  
  // Remover carta da coleção
  async removeCard(collectionId: string, cardId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Obter a coleção atual
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, collectionId);
    if (!collection.success || !collection.data) {
      return { success: false, error: 'Coleção não encontrada' };
    }
    
    // Verificar se a coleção pertence ao usuário
    if (collection.data.userId !== userId) {
      return { success: false, error: 'Acesso negado' };
    }
    
    // Remover o card da coleção
    const cards = collection.data.cards || [];
    const updatedCards = cards.filter((card: any) => card.id !== cardId);
    
    // Atualizar a coleção
    return awsDbService.update(TABLES.COLLECTIONS, collectionId, {
      cards: updatedCards,
      updatedAt: getCurrentTimestamp()
    });
  },
  
  // Atualizar carta na coleção
  async updateCard(collectionId: string, cardId: string, updates: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Obter a coleção atual
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, collectionId);
    if (!collection.success || !collection.data) {
      return { success: false, error: 'Coleção não encontrada' };
    }
    
    // Verificar se a coleção pertence ao usuário
    if (collection.data.userId !== userId) {
      return { success: false, error: 'Acesso negado' };
    }
    
    // Atualizar o card na coleção
    const cards = collection.data.cards || [];
    const updatedCards = cards.map((card: any) => {
      if (card.id === cardId) {
        return { ...card, ...updates };
      }
      return card;
    });
    
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
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    return awsDbService.getByUserId(TABLES.DECKS, userId);
  },
  
  // Obter um deck por ID
  async getById(id: string) {
    return awsDbService.getById(TABLES.DECKS, id);
  },
  
  // Criar um novo deck
  async create(deckData: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    const deck = {
      ...deckData,
      userId: userId,
      cards: [],
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    
    return awsDbService.create(TABLES.DECKS, deck);
  },
  
  // Atualizar um deck
  async update(id: string, updates: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Verificar se o deck pertence ao usuário
    const deck = await awsDbService.getById(TABLES.DECKS, id);
    if (!deck.success || !deck.data || deck.data.userId !== userId) {
      return { success: false, error: 'Deck não encontrado ou acesso negado' };
    }
    
    const updatedData = {
      ...updates,
      updatedAt: getCurrentTimestamp()
    };
    
    return awsDbService.update(TABLES.DECKS, id, updatedData);
  },
  
  // Excluir um deck
  async delete(id: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Verificar se o deck pertence ao usuário
    const deck = await awsDbService.getById(TABLES.DECKS, id);
    if (!deck.success || !deck.data || deck.data.userId !== userId) {
      return { success: false, error: 'Deck não encontrado ou acesso negado' };
    }
    
    return awsDbService.delete(TABLES.DECKS, id);
  },
  
  // Adicionar carta ao deck
  async addCard(deckId: string, cardData: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Obter o deck atual
    const deck = await awsDbService.getById(TABLES.DECKS, deckId);
    if (!deck.success || !deck.data) {
      return { success: false, error: 'Deck não encontrado' };
    }
    
    // Verificar se o deck pertence ao usuário
    if (deck.data.userId !== userId) {
      return { success: false, error: 'Acesso negado' };
    }
    
    // Preparar o novo card com ID gerado
    const newCard = {
      id: generateId(),
      ...cardData,
      addedAt: getCurrentTimestamp()
    };
    
    // Adicionar o card ao deck
    const cards = deck.data.cards || [];
    cards.push(newCard);
    
    // Atualizar o deck
    return awsDbService.update(TABLES.DECKS, deckId, {
      cards,
      updatedAt: getCurrentTimestamp()
    });
  },
  
  // Remover carta do deck
  async removeCard(deckId: string, cardId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Obter o deck atual
    const deck = await awsDbService.getById(TABLES.DECKS, deckId);
    if (!deck.success || !deck.data) {
      return { success: false, error: 'Deck não encontrado' };
    }
    
    // Verificar se o deck pertence ao usuário
    if (deck.data.userId !== userId) {
      return { success: false, error: 'Acesso negado' };
    }
    
    // Remover o card do deck
    const cards = deck.data.cards || [];
    const updatedCards = cards.filter((card: any) => card.id !== cardId);
    
    // Atualizar o deck
    return awsDbService.update(TABLES.DECKS, deckId, {
      cards: updatedCards,
      updatedAt: getCurrentTimestamp()
    });
  },
  
  // Atualizar carta no deck
  async updateCard(deckId: string, cardId: string, updates: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Obter o deck atual
    const deck = await awsDbService.getById(TABLES.DECKS, deckId);
    if (!deck.success || !deck.data) {
      return { success: false, error: 'Deck não encontrado' };
    }
    
    // Verificar se o deck pertence ao usuário
    if (deck.data.userId !== userId) {
      return { success: false, error: 'Acesso negado' };
    }
    
    // Atualizar o card no deck
    const cards = deck.data.cards || [];
    const updatedCards = cards.map((card: any) => {
      if (card.id === cardId) {
        return { ...card, ...updates };
      }
      return card;
    });
    
    // Atualizar o deck
    return awsDbService.update(TABLES.DECKS, deckId, {
      cards: updatedCards,
      updatedAt: getCurrentTimestamp()
    });
  }
};

// Serviço para gerenciar favoritos
export const favoriteService = {
  // Obter todos os favoritos do usuário
  async getAll() {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    return awsDbService.getByUserId(TABLES.FAVORITES, userId);
  },
  
  // Adicionar um favorito
  async add(cardData: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    const favorite = {
      id: generateId(),
      userId: userId,
      ...cardData,
      createdAt: getCurrentTimestamp()
    };
    
    return awsDbService.create(TABLES.FAVORITES, favorite);
  },
  
  // Remover um favorito
  async remove(favoriteId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    return awsDbService.delete(TABLES.FAVORITES, favoriteId);
  },
  
  // Verificar se uma carta está nos favoritos
  async checkCard(cardId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    const result = await awsDbService.query(TABLES.FAVORITES, 'userId', userId, {
      filterExpression: 'cardId = :cardId',
      expressionValues: {
        ':cardId': cardId
      }
    });
    
    return {
      success: result.success,
      data: {
        isFavorite: result.data && result.data.length > 0,
        favoriteId: result.data && result.data.length > 0 ? result.data[0].id : null
      },
      error: result.error
    };
  }
};
