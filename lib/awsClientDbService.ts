'use client';

import { awsDbService as serverDbService } from './awsDbConnect';
import { getDynamoDbClientAsync, TABLES } from './awsClientAuth';
import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
// Importar comandos personalizados
import { UpdateCommand, DeleteCommand, ScanCommand } from './awsDbCommands';
import { generateId, getCurrentTimestamp } from './awsDbConnect';

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
      
      const id = item.id || generateId();
      const timestamp = getCurrentTimestamp();
      
      const params = {
        TableName: tableName,
        Item: {
          ...item,
          id,
          createdAt: item.createdAt || timestamp,
          updatedAt: timestamp
        }
      };
      
      await dynamoDb.send(new PutCommand(params));
      return { success: true, data: params.Item };
    } catch (error) {
      console.error(`[Cliente] Error creating item in ${tableName}:`, error);
      return { success: false, error };
    }
  },
  
  // Obter um item por ID
  async getById(tableName: string, id: string) {
    try {
      const dynamoDb = await getOrCreateClientSideDbClient();
      
      const params = {
        TableName: tableName,
        Key: { id }
      };
      
      const result = await dynamoDb.send(new GetCommand(params));
      if (!result.Item) {
        return { success: false, error: 'Item not found' };
      }
      return { success: true, data: result.Item };
    } catch (error) {
      console.error(`[Cliente] Error getting item from ${tableName}:`, error);
      return { success: false, error };
    }
  },
  
  // Atualizar um item
  async update(tableName: string, id: string, updates: any) {
    try {
      const dynamoDb = await getOrCreateClientSideDbClient();
      const timestamp = getCurrentTimestamp();
      
      // Construir expressão de atualização
      let updateExpression = 'set updatedAt = :updatedAt';
      const expressionAttributeValues: any = {
        ':updatedAt': timestamp
      };
      
      Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'createdAt') {
          updateExpression += `, ${key} = :${key}`;
          expressionAttributeValues[`:${key}`] = updates[key];
        }
      });
      
      const params = {
        TableName: tableName,
        Key: { id },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW" as const
      };
      
      const result = await dynamoDb.send(new UpdateCommand(params));
      return { success: true, data: result.Attributes };
    } catch (error) {
      console.error(`[Cliente] Error updating item in ${tableName}:`, error);
      return { success: false, error };
    }
  },
  
  // Excluir um item
  async delete(tableName: string, id: string) {
    try {
      const dynamoDb = await getOrCreateClientSideDbClient();
      
      const params = {
        TableName: tableName,
        Key: { id }
      };
      
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
      
      const params = {
        TableName: tableName,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      };
      
      const result = await dynamoDb.send(new QueryCommand(params));
      return { success: true, data: result.Items || [] };
    } catch (error) {
      console.error(`[Cliente] Error querying items from ${tableName}:`, error);
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
      
      const result = await dynamoDb.send(new ScanCommand(params));
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
      
      const result = await dynamoDb.send(new QueryCommand(params));
      return { success: true, data: result.Items || [] };
    } catch (error) {
      console.error(`[Cliente] Error querying items from ${tableName}:`, error);
      return { success: false, error };
    }
  }
};
