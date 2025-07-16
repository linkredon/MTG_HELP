/**
 * Tipos para as respostas do serviço de banco de dados AWS
 */

// Resposta padrão de sucesso
export interface DbSuccessResponse<T> {
  success: true;
  data: T;
  error?: undefined;
  warning?: undefined;
  originalError?: undefined;
}

// Resposta padrão de erro
export interface DbErrorResponse {
  success: false;
  error: any;
  data?: undefined;
  warning?: undefined;
  originalError?: undefined;
}

// Resposta de fallback (quando há um aviso mas ainda retornamos dados)
export interface DbFallbackResponse {
  success: true;
  data: never[]; // Array vazio
  warning: string;
  originalError: any;
  error?: undefined;
}

// União de todos os tipos possíveis de resposta
export type DbResponse<T> = DbSuccessResponse<T> | DbErrorResponse | DbFallbackResponse;

// Tipo para o serviço de banco de dados universal
export interface DbService {
  create: <T>(tableName: string, item: any) => Promise<DbResponse<T>>;
  getById: <T>(tableName: string, id: string) => Promise<DbResponse<T>>;
  update: <T>(tableName: string, id: string, updates: any) => Promise<DbResponse<T>>;
  delete: (tableName: string, id: string) => Promise<DbResponse<void>>;
  getByUserId: <T>(tableName: string, userId: string) => Promise<DbResponse<T[]>>;
  getAll: <T>(tableName: string, limit?: number, lastEvaluatedKey?: any) => Promise<DbResponse<T[]>>;
  query: <T>(
    tableName: string, 
    keyName: string, 
    keyValue: string, 
    options?: { 
      filterExpression?: string, 
      expressionValues?: Record<string, any> 
    }
  ) => Promise<DbResponse<T[]>>;
}

/**
 * Função auxiliar para determinar o tipo de resposta
 */
export function isSuccessResponse<T>(response: DbResponse<T>): response is DbSuccessResponse<T> {
  return response.success === true && !('warning' in response);
}

export function isErrorResponse<T>(response: DbResponse<T>): response is DbErrorResponse {
  return response.success === false;
}

export function isFallbackResponse<T>(response: DbResponse<T>): response is DbFallbackResponse {
  return response.success === true && 'warning' in response;
}

/**
 * Função auxiliar para processar respostas com segurança
 */
export function safeGetResponseData<T>(response: DbResponse<T>, defaultValue: T): T {
  if (isSuccessResponse(response)) {
    return response.data;
  }
  return defaultValue;
}

export function safeGetResponseError<T>(response: DbResponse<T>): any {
  if (isErrorResponse(response)) {
    return response.error;
  } 
  if (isFallbackResponse(response)) {
    return response.originalError;
  }
  return null;
}
