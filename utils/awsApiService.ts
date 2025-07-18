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
    const currentUser = await getCurrentUser();
    return currentUser?.attributes?.sub || currentUser?.username;
  } catch (error) {
    console.error('Erro ao obter usuário autenticado:', error);
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
      const currentUser = await getCurrentUser();
      if (!currentUser?.attributes?.sub) {
        return { success: false, error: 'Usuário não autenticado' };
      }
      
      return awsDbService.getByUserId(TABLES.COLLECTIONS, currentUser.attributes.sub);
    } catch (error) {
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
      
      // Testar diferentes estruturas de dados
      const testResults = await Promise.all([
        testTableStructure('collections', collectionData),
        testTableStructure('collections', { ...collectionData, collectionId: collectionData.id }),
        testTableStructure('collections', { ...collectionData, id: collectionData.id, collectionId: collectionData.id }),
        testTableStructure('collections', { 
          id: collectionData.id, 
          name: collectionData.name, 
          description: collectionData.description || '',
          userId: collectionData.userId,
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
        return successResult.data;
      }
      
      // Se nenhum teste passou, mostrar todos os erros
      console.error('❌ Todas as estruturas falharam. Erros:');
      testResults.forEach((result, index) => {
        if (!result.success) {
          console.error(`  Teste ${index + 1}:`, result.error);
        }
      });
      
      throw new Error('Nenhuma estrutura de dados válida encontrada para a tabela collections');
      
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
    
    console.log('Tentando criar deck com diferentes estruturas...');
    
    // Estrutura 1: Básica
    const structure1 = {
      id: generateId(),
      name: deckData.name,
      userId: userId,
      createdAt: getCurrentTimestamp()
    };
    
    let result = await testTableStructure(TABLES.DECKS, structure1);
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    // Estrutura 2: Com mais campos
    const structure2 = {
      id: generateId(),
      name: deckData.name,
      description: deckData.description || '',
      format: deckData.format || 'Commander',
      userId: userId,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };
    
    result = await testTableStructure(TABLES.DECKS, structure2);
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    // Estrutura 3: Com deckId
    const structure3 = {
      id: generateId(),
      deckId: generateId(),
      name: deckData.name,
      userId: userId,
      createdAt: getCurrentTimestamp()
    };
    
    result = await testTableStructure(TABLES.DECKS, structure3);
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    // Estrutura 4: Apenas campos essenciais
    const structure4 = {
      name: deckData.name,
      userId: userId
    };
    
    result = await testTableStructure(TABLES.DECKS, structure4);
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return { success: false, error: 'Não foi possível encontrar uma estrutura válida para a tabela' };
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
      favoriteId: generateId(), // Campo obrigatório para a tabela
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
