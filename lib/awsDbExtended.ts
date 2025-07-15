// Implementação da função query para awsDbService
import { awsDbService as baseAwsDbService } from '@/lib/awsDbConnect';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '@/lib/awsConfig';

// Crie uma versão estendida do serviço com TypeScript
interface AwsDbService {
  create: typeof baseAwsDbService.create;
  getById: typeof baseAwsDbService.getById;
  update: typeof baseAwsDbService.update;
  delete: typeof baseAwsDbService.delete;
  getByUserId: typeof baseAwsDbService.getByUserId;
  getAll: typeof baseAwsDbService.getAll;
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

// Converta o serviço base para o tipo estendido
const awsDbService = baseAwsDbService as AwsDbService;

// Adicionar a função query ao awsDbService
awsDbService.query = async function(
  tableName: string, 
  keyName: string, 
  keyValue: string, 
  options?: { 
    filterExpression?: string, 
    expressionValues?: Record<string, any> 
  }
) {
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

// Exportar a versão atualizada
export { awsDbService };
