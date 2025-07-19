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
      
      // Garantir que o comando é uma instância do SDK antes de enviar
      const putCmd = new PutCommand(params);
      if (!(putCmd instanceof PutCommand)) {
        console.error('Comando passado para send não é uma instância de PutCommand:', putCmd);
      }
      await dynamoDb.send(putCmd);
      return { success: true, data: params.Item };
    } catch (error) {
      console.error(`[Cliente] Error creating item in ${tableName}:`, error);
      return { success: false, error };
    }
  },
  
  // Obter um item por ID (suporta chaves simples e compostas)
  async getById(tableName: string, key: string | { userId: string, deckId: string }) {
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
      
      // Garantir que o comando é uma instância do SDK antes de enviar
      const getCmd = new GetCommand(params);
      if (!(getCmd instanceof GetCommand)) {
        console.error('Comando passado para send não é uma instância de GetCommand:', getCmd);
      }
      const result = await dynamoDb.send(getCmd);
      if (!result.Item) {
        return { success: false, error: 'Item not found' };
      }
      return { success: true, data: result.Item };
    } catch (error) {
      console.error(`[Cliente] Error getting item from ${tableName}:`, error);
      return { success: false, error };
    }
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
      const scanParams = {
        TableName: tableName,
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      };
      
      console.log('📋 Parâmetros do scan:', JSON.stringify(scanParams, null, 2));
      
      // Garantir que o comando é uma instância do SDK antes de enviar
      const scanCmd = new ScanCommand(scanParams);
      if (!(scanCmd instanceof ScanCommand)) {
        console.error('Comando passado para send não é uma instância de ScanCommand:', scanCmd);
      }
      
      const scanResult = await dynamoDb.send(scanCmd);
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
      
      // Garantir que o comando é uma instância do SDK antes de enviar
      const queryCmd2 = new QueryCommand(params);
      if (!(queryCmd2 instanceof QueryCommand)) {
        console.error('Comando passado para send não é uma instância de QueryCommand:', queryCmd2);
      }
      const result = await dynamoDb.send(queryCmd2);
      return { success: true, data: result.Items || [] };
    } catch (error) {
      console.error(`[Cliente] Error querying items from ${tableName}:`, error);
      return { success: false, error };
    }
  }
};
