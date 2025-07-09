import { dynamoDb, TABLES } from './awsConfig';
import { PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Função para gerar IDs únicos
export const generateId = () => uuidv4();

// Função para obter timestamp atual
export const getCurrentTimestamp = () => new Date().toISOString();

// Funções genéricas para operações CRUD
export const awsDbService = {
  // Criar um item
  async create(tableName: string, item: any) {
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
      ReturnValues: 'ALL_NEW'
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
    const params = {
      TableName: tableName,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    
    try {
      const result = await dynamoDb.send(new QueryCommand(params));
      return { success: true, data: result.Items || [] };
    } catch (error) {
      console.error(`Error querying items from ${tableName}:`, error);
      return { success: false, error };
    }
  },
  
  // Obter todos os itens (com paginação)
  async getAll(tableName: string, limit = 100, lastEvaluatedKey?: any) {
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
};