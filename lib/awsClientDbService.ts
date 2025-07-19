'use client';

import { getDynamoDbClientAsync, TABLES } from './awsClientAuth';
import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Função auxiliar para gerar IDs únicos
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Função para obter timestamp atual
const getCurrentTimestamp = () => new Date().toISOString();

// Cliente singleton para manter apenas uma instância do cliente DynamoDB
let dynamoDbClientInstance: any = null;

// Função auxiliar para obter ou criar o cliente DynamoDB do lado do cliente
async function getOrCreateClientSideDbClient() {
  try {
    // Se já temos uma instância, retorná-la
    if (dynamoDbClientInstance) {
      return dynamoDbClientInstance;
    }
    
    console.log('Criando nova instância do cliente DynamoDB para o lado do cliente...');
    dynamoDbClientInstance = await getDynamoDbClientAsync();
    console.log('Cliente DynamoDB para o lado do cliente criado com sucesso');
    
    return dynamoDbClientInstance;
  } catch (error) {
    console.error('Erro ao criar cliente DynamoDB para o lado do cliente:', error);
    
    // Se não conseguimos criar o cliente após várias tentativas em getDynamoDbClientAsync,
    // podemos implementar um mecanismo de fallback ou retry adicional aqui
    throw new Error(`Falha ao criar cliente DynamoDB: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Cliente de banco de dados para o lado do cliente que usa credenciais temporárias
export const clientDbService = {
  // Criar um item
  async create(tableName: string, item: any) {
    try {
      const dynamoDb = await getOrCreateClientSideDbClient();
      
      // Garantir que sempre temos um ID
      const id = item.id || generateId();
      const timestamp = getCurrentTimestamp();
      
      const params = {
        TableName: tableName,
        Item: {
          ...item,
          id, // Sempre incluir o ID
          createdAt: item.createdAt || timestamp,
          updatedAt: timestamp
        }
      };
      
      console.log(`🆕 [Cliente] Criando item na tabela ${tableName}:`, params.Item);
      
      // Garantir que o comando é uma instância do SDK antes de enviar
      const putCmd = new PutCommand(params);
      if (!(putCmd instanceof PutCommand)) {
        console.error('Comando passado para send não é uma instância de PutCommand:', putCmd);
      }
      await dynamoDb.send(putCmd);
      console.log(`✅ [Cliente] Item criado com sucesso na tabela ${tableName}`);
      return { success: true, data: params.Item };
    } catch (error) {
      console.error(`❌ [Cliente] Erro ao criar item na tabela ${tableName}:`, error);
      console.error(`📋 Detalhes do erro:`, {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack
      });
      
      // Se for erro de schema, tentar diferentes estruturas
      if (error.name === 'ValidationException') {
        console.log('🔄 Tentando diferentes estruturas de item...');
        return await this.tryDifferentItemStructures(tableName, item);
      }
      
      return { success: false, error: error.message };
    }
  },
  
  // Obter um item por ID (suporta chaves simples e compostas)
  async getById(tableName: string, key: string | { userId: string, deckId: string }) {
    try {
      const dynamoDb = await getOrCreateClientSideDbClient();
      
      let params;
      if (typeof key === 'string') {
        // Para tabela mtg_decks, usar deckId como chave primária
        if (tableName === 'mtg_decks') {
          params = {
            TableName: tableName,
            Key: { deckId: key }
          };
        } else {
          // Para outras tabelas, usar chave simples com 'id'
          params = {
            TableName: tableName,
            Key: { id: key }
          };
        }
      } else {
        // Chave composta (para tabelas que usam chave composta)
        params = {
          TableName: tableName,
          Key: key
        };
      }
      
      console.log(`🔍 [Cliente] getById para tabela: ${tableName}, key:`, key);
      console.log('📋 Parâmetros:', JSON.stringify(params, null, 2));
      console.log('🔧 Tipo de key:', typeof key);
      console.log('🔧 Valor de key:', key);
      console.log('🔧 Chave sendo usada:', Object.keys(params.Key)[0]);
      
      const result = await dynamoDb.send(new GetCommand(params));
      if (!result.Item) {
        console.log(`❌ [Cliente] Item não encontrado na tabela ${tableName}`);
        return { success: false, error: 'Item não encontrado' };
      }
      
      console.log(`✅ [Cliente] Item encontrado:`, result.Item);
      return { success: true, data: result.Item };
    } catch (error) {
      console.error(`❌ [Cliente] Erro em getById para tabela ${tableName}:`, error);
      console.error(`📋 Detalhes do erro:`, {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack
      });
      
      // Se for erro de schema, tentar diferentes estruturas de chave
      if (error.name === 'ValidationException' && error.message.includes('schema')) {
        console.log('🔄 Erro de schema detectado, tentando diferentes estruturas de chave...');
        return await this.tryDifferentKeyStructures(tableName, key);
      }
      
      // Se não for erro de schema, também tentar fallback para debug
      console.log('🔄 Erro não é de schema, mas tentando fallback mesmo assim...');
      return await this.tryDifferentKeyStructures(tableName, key);
      
      return { success: false, error: error.message };
    }
  },

  // Função para tentar diferentes estruturas de chave
  async tryDifferentKeyStructures(tableName: string, key: string | { userId: string, deckId: string }) {
    const dynamoDb = await getOrCreateClientSideDbClient();
    
          if (typeof key === 'string') {
        // Tentar diferentes estruturas de chave baseadas em possíveis schemas
        const keyStructures = [
          { deckId: key }, // Primeiro tentar deckId (baseado na estrutura real)
          { id: key },
          { _id: key },
          { deck_id: key },
          { deckID: key },
          { pk: key },
          { PK: key },
          { partitionKey: key },
          { partition_key: key }
        ];
      
      console.log(`🔄 Tentando ${keyStructures.length} diferentes estruturas de chave para: ${key}`);
      console.log('📋 Estruturas que serão tentadas:', keyStructures.map(k => Object.keys(k)[0]));
      
      for (const keyStructure of keyStructures) {
        try {
          console.log(`🔄 Tentando chave:`, keyStructure);
          console.log(`🔧 Chave específica:`, Object.keys(keyStructure)[0], '=', Object.values(keyStructure)[0]);
          const params = {
            TableName: tableName,
            Key: keyStructure
          };
          
          const result = await dynamoDb.send(new GetCommand(params));
          if (result.Item) {
            console.log(`✅ Item encontrado com chave:`, keyStructure);
            console.log(`📋 Item encontrado:`, result.Item);
            return { success: true, data: result.Item };
          }
        } catch (tryError) {
          console.log(`❌ Falhou com chave:`, keyStructure, tryError.message);
          // Se for erro de schema, continuar tentando
          if (tryError.name === 'ValidationException') {
            continue;
          }
        }
      }
      
      // Se nenhuma chave funcionou, tentar scan como último recurso
      console.log('🔄 Tentando scan como último recurso...');
      try {
        const scanParams = {
          TableName: tableName,
          FilterExpression: 'deckId = :id OR id = :id',
          ExpressionAttributeValues: {
            ':id': key
          }
        };
        
        const scanResult = await dynamoDb.send(new ScanCommand(scanParams));
        if (scanResult.Items && scanResult.Items.length > 0) {
          console.log(`✅ Item encontrado via scan:`, scanResult.Items[0]);
          return { success: true, data: scanResult.Items[0] };
        }
      } catch (scanError) {
        console.log(`❌ Scan também falhou:`, scanError.message);
      }
    }
    
    console.log('❌ Nenhuma estrutura de chave funcionou');
    return { success: false, error: 'Item não encontrado com nenhuma estrutura de chave' };
  },

  // Função para tentar diferentes estruturas de item na criação
  async tryDifferentItemStructures(tableName: string, originalItem: any) {
    const dynamoDb = await getOrCreateClientSideDbClient();
    const timestamp = getCurrentTimestamp();
    
    console.log('🔄 Tentando diferentes estruturas de item para criação...');
    
    // Tentar diferentes estruturas baseadas em possíveis schemas
    const itemStructures = [
      // Estrutura padrão
      {
        ...originalItem,
        id: originalItem.id || generateId(),
        createdAt: originalItem.createdAt || timestamp,
        updatedAt: timestamp
      },
      // Estrutura com userId (minúsculo) - conforme schema da tabela
      {
        ...originalItem,
        id: originalItem.id || generateId(),
        userId: originalItem.userID || originalItem.userId,
        createdAt: originalItem.createdAt || timestamp,
        updatedAt: timestamp
      },
      // Estrutura com userID (maiúsculo) - para compatibilidade
      {
        ...originalItem,
        id: originalItem.id || generateId(),
        userID: originalItem.userId || originalItem.userID,
        createdAt: originalItem.createdAt || timestamp,
        updatedAt: timestamp
      },
      // Estrutura com ambas as chaves
      {
        ...originalItem,
        id: originalItem.id || generateId(),
        userId: originalItem.userID || originalItem.userId,
        userID: originalItem.userId || originalItem.userID,
        createdAt: originalItem.createdAt || timestamp,
        updatedAt: timestamp
      },
      // Estrutura simplificada com userId
      {
        id: originalItem.id || generateId(),
        name: originalItem.name,
        format: originalItem.format,
        userId: originalItem.userID || originalItem.userId,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      // Estrutura com _id
      {
        _id: originalItem.id || generateId(),
        name: originalItem.name,
        format: originalItem.format,
        userId: originalItem.userID || originalItem.userId,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ];
    
    for (const itemStructure of itemStructures) {
      try {
        console.log(`🔄 Tentando estrutura:`, Object.keys(itemStructure));
        const params = {
          TableName: tableName,
          Item: itemStructure
        };
        
        await dynamoDb.send(new PutCommand(params));
        console.log(`✅ Item criado com sucesso usando estrutura:`, Object.keys(itemStructure));
        return { success: true, data: itemStructure };
      } catch (tryError) {
        console.log(`❌ Falhou com estrutura:`, Object.keys(itemStructure), tryError.message);
        // Se for erro de schema, continuar tentando
        if (tryError.name === 'ValidationException') {
          continue;
        }
      }
    }
    
    console.log('❌ Nenhuma estrutura de item funcionou para criação');
    return { success: false, error: 'Não foi possível criar item com nenhuma estrutura' };
  },
  
  // Atualizar um item (suporta chaves simples e compostas)
  async update(tableName: string, key: string | { userId: string, deckId: string }, updates: any) {
    try {
      const dynamoDb = await getOrCreateClientSideDbClient();
      const timestamp = getCurrentTimestamp();
      
      // Construir expressão de atualização
      let updateExpression = '';
      const expressionAttributeValues: any = {};
      const expressionAttributeNames: any = {};
      
      // Adicionar updatedAt primeiro
      updateExpression = 'set updatedAt = :updatedAt';
      expressionAttributeValues[':updatedAt'] = timestamp;
      
      // Adicionar outros campos
      Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          // Usar alias para palavras reservadas
          const alias = `#${key}`;
          expressionAttributeNames[alias] = key;
          updateExpression += `, ${alias} = :${key}`;
          expressionAttributeValues[`:${key}`] = updates[key];
        }
      });
      
      let params: any;
      if (typeof key === 'string') {
        // Chave simples
        params = {
          TableName: tableName,
          Key: { id: key },
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "ALL_NEW" as const
        };
      } else {
        // Chave composta (para tabelas como mtg_decks)
        params = {
          TableName: tableName,
          Key: key,
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "ALL_NEW" as const
        };
      }
      
      // Adicionar ExpressionAttributeNames apenas se houver palavras reservadas
      if (Object.keys(expressionAttributeNames).length > 0) {
        params.ExpressionAttributeNames = expressionAttributeNames;
      }
      
      // Garantir que o comando é uma instância do SDK antes de enviar
      const updateCmd = new UpdateCommand(params);
      if (!(updateCmd instanceof UpdateCommand)) {
        console.error('Comando passado para send não é uma instância de UpdateCommand:', updateCmd);
      }
      const result = await dynamoDb.send(updateCmd);
      return { success: true, data: result.Attributes };
    } catch (error) {
      console.error(`[Cliente] Error updating item in ${tableName}:`, error);
      return { success: false, error };
    }
  },
  
  // Excluir um item (suporta chaves simples e compostas)
  async delete(tableName: string, key: string | { userId: string, deckId: string }) {
    try {
      const dynamoDb = await getOrCreateClientSideDbClient();
      
      let params;
      if (typeof key === 'string') {
        // Chave simples
        params = {
          TableName: tableName,
          Key: { id: key }
        };
      } else {
        // Chave composta (para tabelas como mtg_decks)
        params = {
          TableName: tableName,
          Key: key
        };
      }
      
      await dynamoDb.send(new DeleteCommand(params));
      return { success: true };
    } catch (error) {
      console.error(`[Cliente] Error deleting item from ${tableName}:`, error);
      return { success: false, error };
    }
  },
  
  // Obter todos os itens de um usuário
  async getByUserId(tableName: string, userId: string) {
    try {
      const dynamoDb = await getOrCreateClientSideDbClient();
      
      console.log(`🔍 Buscando itens para userId: ${userId} na tabela: ${tableName}`);
      
      // Usar scan com filtro diretamente, sem depender de índices
      // Para favoritos, usar userId (minúsculo), para outras tabelas usar userID (maiúsculo)
      const filterField = tableName === 'mtg_favorites' ? 'userId' : 'userID';
      const scanParams = {
        TableName: tableName,
        FilterExpression: `${filterField} = :${filterField}`,
        ExpressionAttributeValues: {
          [`:${filterField}`]: userId
        }
      };
      
      console.log('📋 Parâmetros do scan:', JSON.stringify(scanParams, null, 2));
      
      const scanResult = await dynamoDb.send(new ScanCommand(scanParams));
      console.log(`✅ Scan concluído. Itens encontrados: ${scanResult.Items?.length || 0}`);
      
      return { success: true, data: scanResult.Items || [] };
    } catch (error) {
      console.error(`❌ [Cliente] Error querying items from ${tableName}:`, error);
      
      // Se for erro de permissão, retornar array vazio em vez de falhar
      if (error?.name === 'AccessDeniedException' || error?.name === 'ValidationException') {
        console.warn(`⚠️ Erro de permissão/validação para tabela ${tableName}. Retornando array vazio.`);
        return { success: true, data: [], warning: 'Permissões limitadas para esta operação' };
      }
      
      return { success: false, error };
    }
  },
  
  // Obter todos os itens (com paginação)
  async getAll(tableName: string, limit = 100, lastEvaluatedKey?: any) {
    try {
      const dynamoDb = await getOrCreateClientSideDbClient();
      
      const params: any = {
        TableName: tableName,
        Limit: limit
      };
      
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }
      
      // Garantir que o comando é uma instância do SDK antes de enviar
      const scanCmd2 = new ScanCommand(params);
      if (!(scanCmd2 instanceof ScanCommand)) {
        console.error('Comando passado para send não é uma instância de ScanCommand:', scanCmd2);
      }
      const result = await dynamoDb.send(scanCmd2);
      return { 
        success: true, 
        data: result.Items || [],
        lastEvaluatedKey: result.LastEvaluatedKey
      };
    } catch (error) {
      console.error(`[Cliente] Error scanning items from ${tableName}:`, error);
      return { success: false, error };
    }
  },
  
  // Função query (igual a awsDbExtended)
  async query(
    tableName: string, 
    keyName: string, 
    keyValue: string, 
    options?: { 
      filterExpression?: string, 
      expressionValues?: Record<string, any> 
    }
  ) {
    try {
      const dynamoDb = await getOrCreateClientSideDbClient();
      
      console.log(`🔍 [Cliente] Query chamada para tabela: ${tableName}, keyName: ${keyName}, keyValue: ${keyValue}`);
      
      const params: any = {
        TableName: tableName,
        KeyConditionExpression: `${keyName} = :keyValue`,
        ExpressionAttributeValues: {
          ':keyValue': keyValue
        }
      };
    
      // Adicionar expressão de filtro se fornecida
      if (options?.filterExpression) {
        params.FilterExpression = options.filterExpression;
        
        // Mesclar valores de expressão se fornecidos
        if (options.expressionValues) {
          params.ExpressionAttributeValues = {
            ...params.ExpressionAttributeValues,
            ...options.expressionValues
          };
        }
      }
      
      console.log('📋 Parâmetros da query:', JSON.stringify(params, null, 2));
      
      const result = await dynamoDb.send(new QueryCommand(params));
      console.log(`✅ Query concluída. Itens encontrados: ${result.Items?.length || 0}`);
      return { success: true, data: result.Items || [] };
    } catch (error) {
      console.error(`❌ [Cliente] Error querying items from ${tableName}:`, error);
      
      // Se for erro de permissão, retornar array vazio em vez de falhar
      if (error?.name === 'AccessDeniedException' || error?.name === 'ValidationException') {
        console.warn(`⚠️ Erro de permissão/validação para tabela ${tableName}. Retornando array vazio.`);
        return { success: true, data: [], warning: 'Permissões limitadas para esta operação' };
      }
      
      return { success: false, error };
    }
  }
};
