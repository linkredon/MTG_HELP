// Implementação da função query para awsDbService
import { awsDbService as baseAwsDbService } from '@/lib/awsDbConnect';

// Verificar se estamos no lado do servidor
const isServer = typeof window === 'undefined';

// Importar apenas no servidor
let QueryCommand: any = null;
let dynamoDb: any = null;

if (isServer) {
  const { QueryCommand: QC } = require('@aws-sdk/lib-dynamodb');
  const awsConfig = require('./awsConfig');
  QueryCommand = QC;
  dynamoDb = awsConfig.dynamoDb;
}

// Crie uma versão estendida do serviço com TypeScript
interface AwsDbService {
  create: (tableName: string, item: any) => Promise<{ success: boolean; data?: any; error?: any }>;
  getById: (tableName: string, id: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  update: (tableName: string, id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: any }>;
  delete: (tableName: string, id: string) => Promise<{ success: boolean; error?: any }>;
  getByUserId: (tableName: string, userId: string) => Promise<{ success: boolean; data?: any[]; error?: any }>;
  getAll: (tableName: string, limit?: number, lastEvaluatedKey?: any) => Promise<{ success: boolean; data?: any[]; lastEvaluatedKey?: any; error?: any }>;
  query: (
    tableName: string,
    keyName: string,
    keyValue: string,
    options?: {
      filterExpression?: string;
      expressionValues?: Record<string, any>;
    }
  ) => Promise<{
    success: boolean;
    data?: any[];
    error?: unknown;
  }>;
}

// Converta o serviço base para o tipo estendido (apenas se existir)
const awsDbService = baseAwsDbService ? (baseAwsDbService as AwsDbService) : null;

// Adicionar a função query ao awsDbService (apenas se existir)
if (awsDbService) {
  awsDbService.query = async function(
    tableName: string, 
    keyName: string, 
    keyValue: string, 
    options?: { 
      filterExpression?: string, 
      expressionValues?: Record<string, any> 
    }
  ) {
    if (!isServer || !dynamoDb || !QueryCommand) {
      console.warn('Tentativa de usar DynamoDB no lado do cliente');
      return { success: false, error: 'DynamoDB não disponível no cliente' };
    }

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
    
    try {
      const result = await dynamoDb.send(new QueryCommand(params));
      return { success: true, data: result.Items || [] };
    } catch (error) {
      console.error(`Error querying items from ${tableName}:`, error);
      return { success: false, error };
    }
  };
}

// Exportar a versão atualizada
export { awsDbService };
