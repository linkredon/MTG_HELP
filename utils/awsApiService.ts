import { TABLES } from '@/lib/awsConfig';
import { fetchAuthSession } from '@/lib/auth-adapter';
import { getCurrentUser } from 'aws-amplify/auth';
import { getUserSession } from '@/lib/authHelper';
// Usar o serviço de banco de dados universal que funciona tanto no cliente quanto no servidor
import { universalDbService as awsDbService } from '@/lib/universalDbService';

// Funções auxiliares locais para evitar dependências circulares
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getCurrentTimestamp = () => new Date().toISOString();

// Função auxiliar para obter o ID do usuário autenticado
async function getAuthenticatedUserId() {
  try {
    console.log('🔍 Obtendo usuário autenticado...');
    const currentUser = await getCurrentUser();
    console.log('👤 Usuário obtido:', currentUser);
    console.log('📋 Atributos:', currentUser?.attributes);
    console.log('🆔 Sub:', currentUser?.attributes?.sub);
    console.log('👤 Username:', currentUser?.username);
    
    const userId = currentUser?.attributes?.sub || currentUser?.username;
    console.log('✅ UserId final:', userId);
    return userId;
  } catch (error) {
    console.error('❌ Erro ao obter usuário autenticado:', error);
    return null;
  }
}

// Função para diagnosticar status da autenticação
async function diagnoseAuthStatus() {
  try {
    console.log('🔍 Diagnosticando status da autenticação...');
    
    // Verificar se estamos no lado do cliente
    if (typeof window === 'undefined') {
      console.error('❌ Diagnóstico deve ser executado no lado do cliente');
      return { authenticated: false, error: 'Executando no servidor' };
    }
    
    // Verificar se o Amplify está configurado
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      console.log('✅ Amplify configurado, sessão obtida:', session);
      
      if (session.tokens?.idToken) {
        console.log('✅ Token de ID presente');
      } else {
        console.log('❌ Token de ID ausente');
      }
      
      if (session.credentials?.accessKeyId) {
        console.log('✅ Credenciais AWS presentes');
      } else {
        console.log('❌ Credenciais AWS ausentes');
      }
      
      return { authenticated: true, session };
    } catch (amplifyError) {
      console.error('❌ Erro ao verificar sessão do Amplify:', amplifyError);
      return { authenticated: false, error: amplifyError.message };
    }
  } catch (error) {
    console.error('❌ Erro no diagnóstico de autenticação:', error);
    return { authenticated: false, error: error.message };
  }
}

// Função para testar diferentes estruturas de dados
async function testTableStructure(tableName: string, testData: any) {
  console.log(`Testando estrutura da tabela ${tableName} com dados:`, JSON.stringify(testData, null, 2));
  
  try {
    const result = await awsDbService.create(tableName, testData);
    console.log(`✅ Estrutura válida para ${tableName}:`, result);
    return { success: true, data: testData };
  } catch (error) {
    console.error(`❌ Estrutura inválida para ${tableName}:`);
    console.error('  - Mensagem:', error.message);
    console.error('  - Nome:', error.name);
    console.error('  - Código:', error.code);
    console.error('  - Stack:', error.stack);
    
    // Se for AccessDeniedException, é problema de permissões
    if (error.name === 'AccessDeniedException') {
      console.error('  - Erro de permissão detectado');
      console.error('  - Verifique se o usuário está autenticado e tem permissões para acessar o DynamoDB');
      console.error('  - Estrutura completa do erro:', JSON.stringify(error, null, 2));
      
      // Tentar extrair mensagem específica do DynamoDB
      if (error.message) {
        console.error('  - Mensagem específica do DynamoDB:', error.message);
      }
      
      // Tentar acessar propriedades específicas do erro
      try {
        if (error.$metadata) {
          console.error('  - Metadata do erro:', error.$metadata);
        }
        if (error.$fault) {
          console.error('  - Fault do erro:', error.$fault);
        }
      } catch (metadataError) {
        console.error('  - Erro ao acessar metadata:', metadataError);
      }
    }
    
    // Se for ValidationException, tentar extrair mais detalhes
    if (error.name === 'ValidationException') {
      console.error('  - Detalhes da validação:', error);
      console.error('  - Estrutura completa do erro:', JSON.stringify(error, null, 2));
      
      // Tentar extrair mensagem específica do DynamoDB
      if (error.message) {
        console.error('  - Mensagem específica do DynamoDB:', error.message);
      }
      
      // Tentar acessar propriedades específicas do erro
      try {
        if (error.$metadata) {
          console.error('  - Metadata do erro:', error.$metadata);
        }
        if (error.$fault) {
          console.error('  - Fault do erro:', error.$fault);
        }
      } catch (metadataError) {
        console.error('  - Erro ao acessar metadata:', metadataError);
      }
    }
    
    return { success: false, error: error.message };
  }
}

// Serviço para gerenciar coleções
export const collectionService = {
  // Obter todas as coleções do usuário
  async getAll() {
    try {
      console.log('📚 Obtendo todas as coleções do usuário...');
      const userId = await getAuthenticatedUserId();
      console.log('🆔 UserId para busca:', userId);
      
      if (!userId) {
        console.log('❌ Usuário não autenticado');
        return { success: false, error: 'Usuário não autenticado' };
      }
      
      console.log('🔍 Buscando coleções na tabela:', TABLES.COLLECTIONS);
      const result = await awsDbService.getByUserId(TABLES.COLLECTIONS, userId);
      console.log('📊 Resultado da busca de coleções:', result);
      
      if (result.success && result.data) {
        console.log('✅ Coleções encontradas:', result.data.length);
        result.data.forEach((collection, index) => {
          console.log(`📋 Coleção ${index + 1}:`, {
            id: collection.id,
            name: collection.name,
            userId: collection.userId,
            cardsCount: collection.cards?.length || 0
          });
        });
      } else {
        console.log('⚠️ Nenhuma coleção encontrada ou erro:', result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar coleções:', error);
      return { success: false, error: 'Erro ao verificar autenticação' };
    }
  },
  
  // Obter uma coleção por ID
  async getById(id: string) {
    return awsDbService.getById(TABLES.COLLECTIONS, id);
  },
  
  // Função para criar coleção
  async create(collectionData: any) {
    console.log('🔄 Tentando criar coleção com dados:', JSON.stringify(collectionData, null, 2));
    
    try {
      // Executar diagnóstico de autenticação primeiro
      const authDiagnostic = await diagnoseAuthStatus();
      console.log('📊 Resultado do diagnóstico de autenticação:', authDiagnostic);
      
      if (!authDiagnostic.authenticated) {
        throw new Error(`Usuário não autenticado: ${authDiagnostic.error}`);
      }

      // Obter o userId do usuário autenticado
      const userId = await getAuthenticatedUserId();
      if (!userId) {
        throw new Error('Não foi possível obter o userId do usuário autenticado.');
      }

      // Garantir que todas as estruturas testadas tenham userId e collectionId
      const collectionId = collectionData.id || generateId();
      const baseData = { ...collectionData, userId, collectionId };

      // Testar diferentes estruturas de dados
      const testResults = await Promise.all([
        testTableStructure('mtg_collections', baseData),
        testTableStructure('mtg_collections', { ...baseData, collectionId }),
        testTableStructure('mtg_collections', { ...baseData, id: collectionId, collectionId }),
        testTableStructure('mtg_collections', {
          id: collectionId,
          collectionId,
          name: collectionData.name,
          description: collectionData.description || '',
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          cards: collectionData.cards || []
        })
      ]);
      
      console.log('📊 Resultados dos testes:', testResults);
      
      // Encontrar o primeiro sucesso
      const successResult = testResults.find(result => result.success);
      if (successResult) {
        console.log('✅ Estrutura válida encontrada:', successResult.data);
        // Garante que o campo id e collectionId estejam presentes
        const retorno = {
          ...successResult.data,
          id: successResult.data.id || successResult.data.collectionId || collectionId,
          collectionId: successResult.data.collectionId || collectionId,
        };
        console.log('Retornando objeto da coleção:', retorno);
        return { success: true, data: retorno };
      }
      
      // Se nenhum teste passou, mostrar todos os erros detalhadamente
      console.error('❌ Todas as estruturas falharam. Erros detalhados:');
      testResults.forEach((result, index) => {
        if (!result.success) {
          console.error(`  Teste ${index + 1}:`, result.error);
        }
      });
      throw new Error('Nenhuma estrutura de dados válida encontrada para a tabela mtg_collections');
      
    } catch (error) {
      console.error('💥 Erro ao criar coleção:', error);
      console.error('  - Tipo de erro:', error.constructor.name);
      console.error('  - Mensagem:', error.message);
      console.error('  - Stack:', error.stack);
      
      // Se for AccessDeniedException, é problema de permissões
      if (error.name === 'AccessDeniedException') {
        console.error('  - Erro de permissão detectado');
        console.error('  - Verifique se o usuário está autenticado e tem permissões para acessar o DynamoDB');
        throw new Error('Acesso negado ao banco de dados. Verifique se você está logado e tem permissões adequadas.');
      }
      
      // Se for erro de autenticação
      if (error.message?.includes('não autenticado') || error.message?.includes('Faça login')) {
        console.error('  - Erro de autenticação detectado');
        throw new Error('Usuário não autenticado. Faça login primeiro.');
      }
      
      // Se for ValidationException, tentar extrair mais detalhes
      if (error.name === 'ValidationException') {
        console.error('  - Detalhes da validação:', error);
        console.error('  - Estrutura completa do erro:', JSON.stringify(error, null, 2));
        
        // Tentar extrair mensagem específica do DynamoDB
        if (error.message) {
          console.error('  - Mensagem específica do DynamoDB:', error.message);
        }
        
        // Tentar acessar propriedades específicas do erro
        try {
          if (error.$metadata) {
            console.error('  - Metadata do erro:', error.$metadata);
          }
          if (error.$fault) {
            console.error('  - Fault do erro:', error.$fault);
          }
        } catch (metadataError) {
          console.error('  - Erro ao acessar metadata:', metadataError);
        }
      }
      
      throw error;
    }
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
    if (collection.data.userId !== userId) {
      return { success: false, error: 'Acesso negado' };
    }
    const newCard = {
      id: generateId(),
      ...cardData,
      addedAt: getCurrentTimestamp()
    };
    const cards = collection.data.cards || [];
    cards.push(newCard);
    // Atualizar a coleção
    console.log('Coleção atual antes do update:', collection);
    console.log('Atualizando coleção com:', {
      collectionId,
      userId,
      cards,
      updatedAt: getCurrentTimestamp()
    });
    const updateResult = await awsDbService.update(TABLES.COLLECTIONS, collectionId, {
      cards,
      updatedAt: getCurrentTimestamp()
    });
    return { success: updateResult.success, data: updateResult.data, error: updateResult.error };
  },

  // Remover carta da coleção
  async removeCard(collectionId: string, cardId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, collectionId);
    if (!collection.success || !collection.data) {
      return { success: false, error: 'Coleção não encontrada' };
    }
    if (collection.data.userId !== userId) {
      return { success: false, error: 'Acesso negado' };
    }
    const cards = collection.data.cards || [];
    const updatedCards = cards.filter((card: any) => card.id !== cardId);
    const updateResult = await awsDbService.update(TABLES.COLLECTIONS, collectionId, {
      cards: updatedCards,
      updatedAt: getCurrentTimestamp()
    });
    return { success: updateResult.success, data: updateResult.data, error: updateResult.error };
  },

  // Atualizar carta na coleção
  async updateCard(collectionId: string, cardId: string, updates: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, collectionId);
    if (!collection.success || !collection.data) {
      return { success: false, error: 'Coleção não encontrada' };
    }
    if (collection.data.userId !== userId) {
      return { success: false, error: 'Acesso negado' };
    }
    const cards = collection.data.cards || [];
    const updatedCards = cards.map((card: any) => {
      if (card.id === cardId) {
        return { ...card, ...updates };
      }
      return card;
    });
    const updateResult = await awsDbService.update(TABLES.COLLECTIONS, collectionId, {
      cards: updatedCards,
      updatedAt: getCurrentTimestamp()
    });
    return { success: updateResult.success, data: updateResult.data, error: updateResult.error };
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
  async getById(deckId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    return awsDbService.getById(TABLES.DECKS, { userId, deckId });
  },
  async create(deckData: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Gerar um ID único para o deck
    const deckId = generateId();
    
    const deckToCreate = {
      userId: userId, // Chave de partição
      deckId: deckId, // Chave de classificação
      ...deckData,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    
    const createResult = await awsDbService.create(TABLES.DECKS, deckToCreate);
    return { success: createResult.success, data: createResult.data, error: createResult.error };
  },
  async update(deckId: string, updates: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    const deck = await awsDbService.getById(TABLES.DECKS, { userId, deckId });
    if (!deck.success || !deck.data || deck.data.userId !== userId) {
      return { success: false, error: 'Deck não encontrado ou acesso negado' };
    }
    const updateResult = await awsDbService.update(TABLES.DECKS, { userId, deckId }, updates);
    return { success: updateResult.success, data: updateResult.data, error: updateResult.error };
  },
  async delete(deckId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    const deck = await awsDbService.getById(TABLES.DECKS, { userId, deckId });
    if (!deck.success || !deck.data || deck.data.userId !== userId) {
      return { success: false, error: 'Deck não encontrado ou acesso negado' };
    }
    const deleteResult = await awsDbService.delete(TABLES.DECKS, { userId, deckId });
    return { success: deleteResult.success, data: deleteResult.data, error: deleteResult.error };
  },
  async addCard(deckId: string, cardData: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    const deck = await awsDbService.getById(TABLES.DECKS, { userId, deckId });
    if (!deck.success || !deck.data) {
      return { success: false, error: 'Deck não encontrado' };
    }
    if (deck.data.userId !== userId) {
      return { success: false, error: 'Acesso negado' };
    }
    const newCard = {
      id: generateId(),
      ...cardData,
      addedAt: getCurrentTimestamp()
    };
    const cards = deck.data.cards || [];
    cards.push(newCard);
    const updateResult = await awsDbService.update(TABLES.DECKS, { userId, deckId }, {
      cards,
      updatedAt: getCurrentTimestamp()
    });
    return { success: updateResult.success, data: updateResult.data, error: updateResult.error };
  },
  async removeCard(deckId: string, cardId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    const deck = await awsDbService.getById(TABLES.DECKS, { userId, deckId });
    if (!deck.success || !deck.data) {
      return { success: false, error: 'Deck não encontrado' };
    }
    if (deck.data.userId !== userId) {
      return { success: false, error: 'Acesso negado' };
    }
    const cards = deck.data.cards || [];
    const updatedCards = cards.filter((card: any) => card.id !== cardId);
    const updateResult = await awsDbService.update(TABLES.DECKS, { userId, deckId }, {
      cards: updatedCards,
      updatedAt: getCurrentTimestamp()
    });
    return { success: updateResult.success, data: updateResult.data, error: updateResult.error };
  },
  async updateCard(deckId: string, cardId: string, updates: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    const deck = await awsDbService.getById(TABLES.DECKS, { userId, deckId });
    if (!deck.success || !deck.data) {
      return { success: false, error: 'Deck não encontrado' };
    }
    if (deck.data.userId !== userId) {
      return { success: false, error: 'Acesso negado' };
    }
    const cards = deck.data.cards || [];
    const updatedCards = cards.map((card: any) => {
      if (card.id === cardId) {
        return { ...card, ...updates };
      }
      return card;
    });
    const updateResult = await awsDbService.update(TABLES.DECKS, { userId, deckId }, {
      cards: updatedCards,
      updatedAt: getCurrentTimestamp()
    });
    return { success: updateResult.success, data: updateResult.data, error: updateResult.error };
  }
};

// Serviço para gerenciar favoritos
export const favoriteService = {
  async getAll() {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    return awsDbService.getByUserId(TABLES.FAVORITES, userId);
  },
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
    const createResult = await awsDbService.create(TABLES.FAVORITES, favorite);
    return { success: createResult.success, data: createResult.data, error: createResult.error };
  },
  async remove(favoriteId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    const deleteResult = await awsDbService.delete(TABLES.FAVORITES, favoriteId);
    return { success: deleteResult.success, data: deleteResult.data, error: deleteResult.error };
  },
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
