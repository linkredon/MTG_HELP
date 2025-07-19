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
    
    if (!userId) {
      console.warn('⚠️ Nenhum userId encontrado');
      return null;
    }
    
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

// Função para detectar a estrutura correta da tabela
async function detectTableStructure(tableName: string, userId: string) {
  console.log(`🔍 Detectando estrutura da tabela: ${tableName}`);
  
  // Para a tabela de favoritos, usar userId (minúsculo) diretamente
  if (tableName === TABLES.FAVORITES) {
    console.log(`✅ Tabela ${tableName} usa userId (minúsculo)`);
    return { keyName: 'userId', structure: 'userId' };
  }
  
  // Para outras tabelas, usar userID (maiúsculo) conforme schema Amplify
  console.log(`✅ Tabela ${tableName} usa userID (maiúsculo)`);
  return { keyName: 'userID', structure: 'userID' };
}

// Cache para estruturas detectadas
const tableStructureCache = new Map<string, { keyName: string | null, structure: string }>();

// Serviço para gerenciar coleções
export const collectionService = {
  // Obter todas as coleções do usuário
  async getAll() {
    try {
      console.log('📚 Obtendo todas as coleções do usuário...');
      const userId = await getAuthenticatedUserId();
      console.log('🆔 UserId para busca:', userId);
      
      if (!userId) {
        console.log('❌ Usuário não autenticado ou userId não encontrado');
        return { success: true, data: [], warning: 'Usuário não autenticado' };
      }
      
      console.log('🔍 Buscando coleções na tabela:', TABLES.COLLECTIONS);
      
      // Usar scan com filtro diretamente para evitar ValidationException
      try {
        const result = await awsDbService.getAll(TABLES.COLLECTIONS);
        console.log('📊 Resultado do scan:', result);
        
        if (result.success && result.data) {
          // Filtrar apenas as coleções do usuário
          const userCollections = result.data.filter((collection: any) => 
            collection.userID === userId || collection.userId === userId
          );
          
          console.log('✅ Coleções filtradas do usuário:', userCollections.length);
          return { success: true, data: userCollections };
        }
      } catch (error) {
        console.warn('⚠️ Scan falhou:', error);
      }
      
      // Se todas as tentativas falharam, retornar array vazio
      console.log('⚠️ Nenhuma coleção encontrada ou erro');
      return { success: true, data: [], warning: 'Não foi possível carregar coleções' };
      
    } catch (error) {
      console.error('❌ Erro ao buscar coleções:', error);
      return { success: true, data: [], error: 'Erro ao verificar autenticação' };
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

      // Criar coleção com estrutura correta do schema Amplify
      const collectionToCreate = {
        id: generateId(),
        name: collectionData.name,
        description: collectionData.description || '',
        isPublic: collectionData.isPublic || false,
        backgroundImage: collectionData.backgroundImage || '',
        userID: userId, // Chave de partição (maiúsculo conforme schema)
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
      };
      
      console.log('🆕 collectionService.create: Criando coleção:', {
        userId,
        collectionData: collectionToCreate
      });
      
      const createResult = await awsDbService.create(TABLES.COLLECTIONS, collectionToCreate);
      console.log('📊 collectionService.create: Resultado:', createResult);
      
      return { success: createResult.success, data: createResult.data, error: createResult.error };
      
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
    if (!collection.success || !collection.data || collection.data.userID !== userId) {
      return { success: false, error: 'Coleção não encontrada ou acesso negado' };
    }
    
    return awsDbService.update(TABLES.COLLECTIONS, id, {
      ...updates,
      updatedAt: getCurrentTimestamp()
    });
  },
  
  // Excluir uma coleção
  async delete(id: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Verificar se a coleção pertence ao usuário
    const collection = await awsDbService.getById(TABLES.COLLECTIONS, id);
    if (!collection.success || !collection.data || collection.data.userID !== userId) {
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
    if (collection.data.userID !== userId) {
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
    try {
      console.log('🎴 Obtendo todos os decks do usuário...');
      const userId = await getAuthenticatedUserId();
      console.log('🆔 UserId para busca:', userId);
      
      if (!userId) {
        console.log('❌ Usuário não autenticado ou userId não encontrado');
        return { success: true, data: [], warning: 'Usuário não autenticado' };
      }
      
      console.log('🔍 Buscando decks na tabela:', TABLES.DECKS);
      
      // Usar scan com filtro diretamente para evitar ValidationException
      try {
        const result = await awsDbService.getAll(TABLES.DECKS);
        console.log('📊 Resultado do scan:', result);
        
        if (result.success && result.data) {
          // Filtrar apenas os decks do usuário
          const userDecks = result.data.filter((deck: any) => 
            deck.userID === userId || deck.userId === userId
          );
          
          console.log('✅ Decks filtrados do usuário:', userDecks.length);
          return { success: true, data: userDecks };
        }
      } catch (error) {
        console.warn('⚠️ Scan falhou:', error);
      }
      
      // Se todas as tentativas falharam, retornar array vazio
      console.log('⚠️ Nenhum deck encontrado ou erro');
      return { success: true, data: [], warning: 'Não foi possível carregar decks' };
      
    } catch (error) {
      console.error('❌ Erro ao buscar decks:', error);
      return { success: true, data: [], error: 'Erro ao verificar autenticação' };
    }
  },
  
  // Buscar todas as cartas de um deck
  async getDeckCards(deckId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    console.log('🔍 deckService.getDeckCards: Buscando cartas do deck:', deckId);
    console.log('👤 UserId autenticado:', userId);
    console.log('📋 Tabela sendo usada:', TABLES.DECKS);
    
    // Para mtg_decks, sempre usar scan devido a problemas de schema
    console.log('🔄 Usando scan para buscar deck (devido a problemas de schema)...');
    try {
      const scanResult = await awsDbService.getAll(TABLES.DECKS);
      console.log('📊 Scan result:', scanResult);
      
      if (scanResult.success && scanResult.data) {
        const foundDeck = scanResult.data.find((item: any) => 
          item.id === deckId || item.deckId === deckId || item._id === deckId
        );
        console.log('🔍 Deck encontrado via scan:', foundDeck);
        
        if (foundDeck) {
          console.log('✅ Deck encontrado via scan');
          console.log('📋 Estrutura do deck encontrado:', foundDeck);
          
          // Se encontrou o deck via scan, usar os dados dele
          const deckUserId = foundDeck.userID || foundDeck.userId;
          if (deckUserId === userId) {
            console.log('✅ Deck pertence ao usuário, usando dados do scan');
            const cards = foundDeck.cards || [];
            console.log('📊 Cartas encontradas no deck:', cards.length);
            return { success: true, data: cards };
          } else {
            console.error('❌ Deck não pertence ao usuário');
            return { success: false, error: 'Acesso negado' };
          }
        } else {
          console.log('❌ Deck não existe na tabela');
          return { success: false, error: 'Deck não encontrado' };
        }
      }
    } catch (scanError) {
      console.error('❌ Erro no scan:', scanError);
      return { success: false, error: 'Erro ao buscar deck' };
    }
    
    return { success: false, error: 'Deck não encontrado' };
    
    // Verificar se o deck pertence ao usuário
    const deckUserId = deck.data.userID || deck.data.userId;
    console.log('🔍 deckService.getDeckCards: UserId do deck:', deckUserId);
    console.log('🔍 deckService.getDeckCards: UserId autenticado:', userId);
    console.log('🔍 deckService.getDeckCards: Comparação:', deckUserId === userId);
    
    if (deckUserId !== userId) {
      console.error('❌ deckService.getDeckCards: Acesso negado - userID não confere');
      return { success: false, error: 'Acesso negado' };
    }
    
    // Por enquanto, retornar array vazio para evitar AccessDeniedException
    // TODO: Implementar acesso à tabela DeckCard quando permissões forem configuradas
    console.log('⚠️ deckService.getDeckCards: Tabela DeckCard não acessível - retornando array vazio');
    return { success: true, data: [], warning: 'Cartas do deck não disponíveis temporariamente' };
  },
  async getById(deckId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    console.log('🔍 deckService.getById: Buscando deck:', deckId);
    
    // Para mtg_decks, usar scan devido a problemas de schema
    console.log('🔄 Usando scan para buscar deck...');
    try {
      const scanResult = await awsDbService.getAll(TABLES.DECKS);
      console.log('📊 deckService.getById: Scan result:', scanResult);
      
      if (scanResult.success && scanResult.data) {
        const foundDeck = scanResult.data.find((item: any) => 
          item.id === deckId || item.deckId === deckId || item._id === deckId
        );
        
        if (foundDeck) {
          console.log('✅ Deck encontrado via scan:', foundDeck);
          
          // Verificar se o deck pertence ao usuário
          const deckUserId = foundDeck.userID || foundDeck.userId;
          if (deckUserId !== userId) {
            console.error('❌ deckService.getById: Acesso negado - userID não confere');
            return { success: false, error: 'Acesso negado' };
          }
          
          return { success: true, data: foundDeck };
        }
      }
      
      return { success: false, error: 'Deck não encontrado' };
    } catch (error) {
      console.error('❌ deckService.getById: Erro no scan:', error);
      return { success: false, error: 'Erro ao buscar deck' };
    }
  },
  async create(deckData: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Gerar um ID único para o deck
    const deckId = generateId();
    
    const deckToCreate = {
      deckId: deckId, // Chave primária baseada na estrutura real
      id: deckId, // ID para compatibilidade
      userId: userId, // Chave de partição (minúsculo conforme schema da tabela)
      userID: userId, // Para compatibilidade
      name: deckData.name,
      format: deckData.format,
      colors: deckData.colors || [],
      description: deckData.description || '',
      isPublic: deckData.isPublic || false,
      tags: deckData.tags || [],
      createdAt: getCurrentTimestamp(),
      lastModified: getCurrentTimestamp()
    };
    
    console.log('🆕 deckService.create: Criando deck:', {
      userId,
      deckId,
      deckData: deckToCreate
    });
    
    const createResult = await awsDbService.create(TABLES.DECKS, deckToCreate);
    console.log('📊 deckService.create: Resultado:', createResult);
    
    return { success: createResult.success, data: createResult.data, error: createResult.error };
  },
  async update(deckId: string, updates: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Para mtg_decks, usar scan devido a problemas de schema
    console.log('🔄 Usando scan para verificar deck antes de atualizar...');
    try {
      const scanResult = await awsDbService.getAll(TABLES.DECKS);
      console.log('📊 Scan result para update:', scanResult);
      
      if (scanResult.success && scanResult.data) {
        const foundDeck = scanResult.data.find((item: any) => 
          item.id === deckId || item.deckId === deckId || item._id === deckId
        );
        
        if (foundDeck) {
          console.log('✅ Deck encontrado via scan:', foundDeck);
          
          // Verificar se o deck pertence ao usuário
          const deckUserId = foundDeck.userID || foundDeck.userId;
          if (deckUserId !== userId) {
            console.error('❌ update: Acesso negado - userID não confere');
            return { success: false, error: 'Acesso negado' };
          }
          
          // Atualizar o deck usando scan fallback
          console.log('🔄 Atualizando deck via scan fallback...');
          
          // Criar um novo item com as atualizações
          const updatedDeck = {
            ...foundDeck,
            ...updates,
            lastModified: getCurrentTimestamp()
          };
          
          // Usar put para substituir o item completamente
          const putResult = await awsDbService.create(TABLES.DECKS, updatedDeck);
          return { success: putResult.success, data: updatedDeck, error: putResult.error };
        } else {
          console.log('❌ Deck não encontrado via scan');
          return { success: false, error: 'Deck não encontrado' };
        }
      }
    } catch (error) {
      console.error('❌ update: Erro no scan:', error);
      return { success: false, error: 'Erro ao verificar deck' };
    }
    
    return { success: false, error: 'Deck não encontrado' };
  },
  async delete(deckId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Para mtg_decks, usar scan devido a problemas de schema
    console.log('🔄 Usando scan para verificar deck antes de deletar...');
    try {
      const scanResult = await awsDbService.getAll(TABLES.DECKS);
      console.log('📊 Scan result para delete:', scanResult);
      
      if (scanResult.success && scanResult.data) {
        const foundDeck = scanResult.data.find((item: any) => 
          item.id === deckId || item.deckId === deckId || item._id === deckId
        );
        
        if (foundDeck) {
          console.log('✅ Deck encontrado via scan:', foundDeck);
          
          // Verificar se o deck pertence ao usuário
          const deckUserId = foundDeck.userID || foundDeck.userId;
          if (deckUserId !== userId) {
            console.error('❌ delete: Acesso negado - userID não confere');
            return { success: false, error: 'Acesso negado' };
          }
          
          // Deletar o deck
          const deleteResult = await awsDbService.delete(TABLES.DECKS, deckId);
          return { success: deleteResult.success, error: deleteResult.error };
        } else {
          console.log('❌ Deck não encontrado via scan');
          return { success: false, error: 'Deck não encontrado' };
        }
      }
    } catch (error) {
      console.error('❌ delete: Erro no scan:', error);
      return { success: false, error: 'Erro ao verificar deck' };
    }
    
    return { success: false, error: 'Deck não encontrado' };
  },
  async addCard(deckId: string, cardData: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Para mtg_decks, usar scan devido a problemas de schema
    console.log('🔄 Usando scan para verificar deck antes de adicionar carta...');
    try {
      const scanResult = await awsDbService.getAll(TABLES.DECKS);
      console.log('📊 Scan result para addCard:', scanResult);
      
      if (scanResult.success && scanResult.data) {
        const foundDeck = scanResult.data.find((item: any) => 
          item.id === deckId || item.deckId === deckId || item._id === deckId
        );
        
        if (foundDeck) {
          console.log('✅ Deck encontrado via scan:', foundDeck);
          
          // Verificar se o deck pertence ao usuário
          const deckUserId = foundDeck.userID || foundDeck.userId;
          if (deckUserId !== userId) {
            console.error('❌ addCard: Acesso negado - userID não confere');
            return { success: false, error: 'Acesso negado' };
          }
          
          // Adicionar a carta diretamente ao deck (em vez de tabela separada)
          console.log('🔄 Adicionando carta diretamente ao deck...');
          
          // Buscar o deck atual
          const currentDeck = foundDeck;
          const currentCards = currentDeck.cards || [];
          
          // Verificar se a carta já existe
          const existingCardIndex = currentCards.findIndex((card: any) => 
            card.id === cardData.id && card.category === (cardData.category || 'main')
          );
          
          if (existingCardIndex >= 0) {
            // Atualizar quantidade da carta existente
            currentCards[existingCardIndex].quantity += (cardData.quantity || 1);
            console.log('✅ Carta existente, quantidade atualizada');
          } else {
            // Adicionar nova carta
            const newCard = {
              id: cardData.id,
              name: cardData.name || cardData.card?.name,
              quantity: cardData.quantity || 1,
              category: cardData.category || 'main',
              cardData: cardData.card || cardData,
              addedAt: getCurrentTimestamp()
            };
            currentCards.push(newCard);
            console.log('✅ Nova carta adicionada ao deck');
          }
          
          // Atualizar o deck com as cartas usando scan fallback
          console.log('🔄 Atualizando deck com cartas via scan fallback...');
          
          // Criar um novo item com as cartas atualizadas
          const updatedDeck = {
            ...currentDeck,
            cards: currentCards,
            lastModified: getCurrentTimestamp()
          };
          
          // Usar put para substituir o item completamente
          const putResult = await awsDbService.create(TABLES.DECKS, updatedDeck);
          return { success: putResult.success, data: currentCards, error: putResult.error };
        } else {
          console.log('❌ Deck não encontrado via scan');
          return { success: false, error: 'Deck não encontrado' };
        }
      }
    } catch (error) {
      console.error('❌ addCard: Erro no scan:', error);
      return { success: false, error: 'Erro ao verificar deck' };
    }
    
    return { success: false, error: 'Deck não encontrado' };
  },
  async removeCard(deckId: string, cardId: string) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Para mtg_decks, usar scan devido a problemas de schema
    console.log('🔄 Usando scan para verificar deck antes de remover carta...');
    try {
      const scanResult = await awsDbService.getAll(TABLES.DECKS);
      console.log('📊 Scan result para removeCard:', scanResult);
      
      if (scanResult.success && scanResult.data) {
        const foundDeck = scanResult.data.find((item: any) => 
          item.id === deckId || item.deckId === deckId || item._id === deckId
        );
        
        if (foundDeck) {
          console.log('✅ Deck encontrado via scan:', foundDeck);
          
          // Verificar se o deck pertence ao usuário
          const deckUserId = foundDeck.userID || foundDeck.userId;
          if (deckUserId !== userId) {
            console.error('❌ removeCard: Acesso negado - userID não confere');
            return { success: false, error: 'Acesso negado' };
          }
          
          // Remover a carta do deck
          console.log('🔄 Removendo carta do deck...');
          
          const currentDeck = foundDeck;
          const currentCards = currentDeck.cards || [];
          
          // Encontrar e remover a carta
          const cardIndex = currentCards.findIndex((card: any) => 
            card.id === cardId
          );
          
          if (cardIndex >= 0) {
            currentCards.splice(cardIndex, 1);
            console.log('✅ Carta removida do deck');
            
            // Atualizar o deck usando scan fallback
            console.log('🔄 Atualizando deck sem carta via scan fallback...');
            
            // Criar um novo item com as cartas atualizadas
            const updatedDeck = {
              ...currentDeck,
              cards: currentCards,
              lastModified: getCurrentTimestamp()
            };
            
            // Usar put para substituir o item completamente
            const putResult = await awsDbService.create(TABLES.DECKS, updatedDeck);
            return { success: putResult.success, data: currentCards, error: putResult.error };
          } else {
            console.log('❌ Carta não encontrada no deck');
            return { success: false, error: 'Carta não encontrada' };
          }
        } else {
          console.log('❌ Deck não encontrado via scan');
          return { success: false, error: 'Deck não encontrado' };
        }
      }
    } catch (error) {
      console.error('❌ removeCard: Erro no scan:', error);
      return { success: false, error: 'Erro ao verificar deck' };
    }
    
    return { success: false, error: 'Deck não encontrado' };
  },
  async updateCard(deckId: string, cardId: string, updates: any) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Para mtg_decks, usar scan devido a problemas de schema
    console.log('🔄 Usando scan para verificar deck antes de atualizar carta...');
    try {
      const scanResult = await awsDbService.getAll(TABLES.DECKS);
      console.log('📊 Scan result para updateCard:', scanResult);
      
      if (scanResult.success && scanResult.data) {
        const foundDeck = scanResult.data.find((item: any) => 
          item.id === deckId || item.deckId === deckId || item._id === deckId
        );
        
        if (foundDeck) {
          console.log('✅ Deck encontrado via scan:', foundDeck);
          
          // Verificar se o deck pertence ao usuário
          const deckUserId = foundDeck.userID || foundDeck.userId;
          if (deckUserId !== userId) {
            console.error('❌ updateCard: Acesso negado - userID não confere');
            return { success: false, error: 'Acesso negado' };
          }
          
          // Atualizar a carta no deck
          console.log('🔄 Atualizando carta no deck...');
          
          const currentDeck = foundDeck;
          const currentCards = currentDeck.cards || [];
          
          // Encontrar e atualizar a carta
          const cardIndex = currentCards.findIndex((card: any) => 
            card.id === cardId
          );
          
          if (cardIndex >= 0) {
            // Atualizar a carta
            currentCards[cardIndex] = {
              ...currentCards[cardIndex],
              ...updates,
              lastModified: getCurrentTimestamp()
            };
            console.log('✅ Carta atualizada no deck');
            
            // Atualizar o deck usando scan fallback
            console.log('🔄 Atualizando deck com carta atualizada via scan fallback...');
            
            // Criar um novo item com as cartas atualizadas
            const updatedDeck = {
              ...currentDeck,
              cards: currentCards,
              lastModified: getCurrentTimestamp()
            };
            
            // Usar put para substituir o item completamente
            const putResult = await awsDbService.create(TABLES.DECKS, updatedDeck);
            return { success: putResult.success, data: currentCards, error: putResult.error };
          } else {
            console.log('❌ Carta não encontrada no deck');
            return { success: false, error: 'Carta não encontrada' };
          }
        } else {
          console.log('❌ Deck não encontrado via scan');
          return { success: false, error: 'Deck não encontrado' };
        }
      }
    } catch (error) {
      console.error('❌ updateCard: Erro no scan:', error);
      return { success: false, error: 'Erro ao verificar deck' };
    }
    
    return { success: false, error: 'Deck não encontrado' };
  }
};

// Serviço para gerenciar favoritos
export const favoriteService = {
  async getAll() {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: true, data: [], warning: 'Usuário não autenticado' };
    }
    
    console.log('🔍 favoriteService.getAll: Buscando favoritos do usuário:', userId);
    
    // Usar scan com filtro diretamente para evitar ValidationException
    try {
      const result = await awsDbService.getAll(TABLES.FAVORITES);
      console.log('📊 Resultado do scan:', result);
      
      if (result.success && result.data) {
        // Filtrar apenas os favoritos do usuário
        const userFavorites = result.data.filter((favorite: any) => 
          favorite.userID === userId || favorite.userId === userId
        );
        
        console.log('✅ Favoritos filtrados do usuário:', userFavorites.length);
        return { success: true, data: userFavorites };
      }
    } catch (error) {
      console.warn('⚠️ Scan falhou:', error);
    }
    
    // Se todas as tentativas falharam, retornar array vazio
    console.log('⚠️ Nenhum favorito encontrado ou erro');
    return { success: true, data: [], warning: 'Não foi possível carregar favoritos' };
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

