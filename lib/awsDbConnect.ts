// Verificar se estamos no lado do servidor
const isServer = typeof window === 'undefined';

// Importar apenas no servidor
let dynamoDb: any = null;
let TABLES: any = null;
let PutCommand: any = null;
let GetCommand: any = null;
let QueryCommand: any = null;

if (isServer) {
  const awsConfig = require('./awsConfig');
  const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
  const { DynamoDBDocumentClient, PutCommand: PutCmd, GetCommand: GetCmd, QueryCommand: QueryCmd } = require('@aws-sdk/lib-dynamodb');
  
  dynamoDb = awsConfig.dynamoDb;
  TABLES = awsConfig.TABLES;
  PutCommand = PutCmd;
  GetCommand = GetCmd;
  QueryCommand = QueryCmd;
}

import { v4 as uuidv4 } from 'uuid';

// Função para gerar IDs únicos
export const generateId = () => uuidv4();

// Função para obter timestamp atual
export const getCurrentTimestamp = () => new Date().toISOString();

// Funções genéricas para operações CRUD (apenas no servidor)
export const awsDbService = isServer ? {
  // Criar um item
  async create(tableName: string, item: any) {
    if (!isServer || !dynamoDb) {
      console.warn('Tentativa de usar DynamoDB no lado do cliente');
      return { success: false, error: 'DynamoDB não disponível no cliente' };
    }
    
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
    
    try {
      await dynamoDb.send(new PutCommand(params));
      return { success: true, data: params.Item };
    } catch (error) {
      console.error(`Error creating item in ${tableName}:`, error);
      return { success: false, error };
    }
  },
  
  // Obter um item por ID
  async getById(tableName: string, id: string) {
    if (!isServer || !dynamoDb) {
      console.warn('Tentativa de usar DynamoDB no lado do cliente');
      return { success: false, error: 'DynamoDB não disponível no cliente' };
    }
    
    const params = {
      TableName: tableName,
      Key: { id }
    };
    
    try {
      const result = await dynamoDb.send(new GetCommand(params));
      if (!result.Item) {
        return { success: false, error: 'Item not found' };
      }
      return { success: true, data: result.Item };
    } catch (error) {
      console.error(`Error getting item from ${tableName}:`, error);
      return { success: false, error };
    }
  },
  
  // Atualizar um item
  async update(tableName: string, id: string, updates: any) {
    if (!isServer || !dynamoDb) {
      console.warn('Tentativa de usar DynamoDB no lado do cliente');
      return { success: false, error: 'DynamoDB não disponível no cliente' };
    }
    
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
    
    try {
      const result = await dynamoDb.send(new UpdateCommand(params));
      return { success: true, data: result.Attributes };
    } catch (error) {
      console.error(`Error updating item in ${tableName}:`, error);
      return { success: false, error };
    }
  },
  
  // Excluir um item
  async delete(tableName: string, id: string) {
    if (!isServer || !dynamoDb) {
      console.warn('Tentativa de usar DynamoDB no lado do cliente');
      return { success: false, error: 'DynamoDB não disponível no cliente' };
    }
    
    const params = {
      TableName: tableName,
      Key: { id }
    };
    
    try {
      await dynamoDb.send(new DeleteCommand(params));
      return { success: true };
    } catch (error) {
      console.error(`Error deleting item from ${tableName}:`, error);
      return { success: false, error };
    }
  },
  
  // Obter todos os itens de um usuário
  async getByUserId(tableName: string, userId: string) {
    if (!isServer || !dynamoDb) {
      console.warn('Tentativa de usar DynamoDB no lado do cliente');
      return { success: false, error: 'DynamoDB não disponível no cliente' };
    }
    
    try {
      // Primeiro tentar com o índice
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
    } catch (indexError: any) {
      // Se o índice não existir, usar scan com filtro
              // Usando scan com filtro (índice não disponível)
      
      try {
        const scanParams = {
          TableName: tableName,
          FilterExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        };
        
        const scanResult = await dynamoDb.send(new ScanCommand(scanParams));
        return { success: true, data: scanResult.Items || [] };
      } catch (scanError) {
        console.error(`Error scanning items from ${tableName}:`, scanError);
        return { success: false, error: scanError };
      }
    }
  },
  
  // Obter todos os itens (com paginação)
  async getAll(tableName: string, limit = 100, lastEvaluatedKey?: any) {
    if (!isServer || !dynamoDb) {
      console.warn('Tentativa de usar DynamoDB no lado do cliente');
      return { success: false, error: 'DynamoDB não disponível no cliente' };
    }
    
    const params: any = {
      TableName: tableName,
      Limit: limit
    };
    
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
    
    try {
      const result = await dynamoDb.send(new ScanCommand(params));
      return { 
        success: true, 
        data: result.Items || [],
        lastEvaluatedKey: result.LastEvaluatedKey
      };
    } catch (error) {
      console.error(`Error scanning items from ${tableName}:`, error);
      return { success: false, error };
    }
  }
} : null;

// Classes personalizadas para substituir os comandos ausentes
class UpdateCommand {
  private params: any;
  
  constructor(params: any) {
    this.params = params;
  }
  
  get input() {
    return this.params;
  }
}

class DeleteCommand {
  private params: any;
  
  constructor(params: any) {
    this.params = params;
  }
  
  get input() {
    return this.params;
  }
}

class ScanCommand {
  private params: any;
  
  constructor(params: any) {
    this.params = params;
  }
  
  get input() {
    return this.params;
  }
}