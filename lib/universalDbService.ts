'use client';

import { awsDbService as serverDbService } from './awsDbExtended';
import { clientDbService } from './awsClientDbService';

// Determinar se estamos no lado do cliente ou servidor
const isClient = typeof window !== 'undefined';

// Limite de tentativas para operações do banco de dados
const MAX_DB_RETRIES = 2;

// Função auxiliar para esperar
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Interface compartilhada para definir métodos do serviço de banco de dados
interface DbServiceInterface {
  create: typeof serverDbService.create;
  getById: typeof serverDbService.getById;
  update: typeof serverDbService.update;
  delete: typeof serverDbService.delete;
  getByUserId: typeof serverDbService.getByUserId;
  getAll: typeof serverDbService.getAll;
  query: typeof serverDbService.query;
}

// Implementação do DbService que verifica o ambiente e usa o serviço apropriado
class UniversalDbService implements DbServiceInterface {
  // Criar um item
  async create(tableName: string, item: any) {
    return isClient
      ? await clientDbService.create(tableName, item)
      : await serverDbService.create(tableName, item);
  }
  
  // Obter um item por ID
  async getById(tableName: string, id: string) {
    return isClient
      ? await clientDbService.getById(tableName, id)
      : await serverDbService.getById(tableName, id);
  }
  
  // Atualizar um item
  async update(tableName: string, id: string, updates: any) {
    return isClient
      ? await clientDbService.update(tableName, id, updates)
      : await serverDbService.update(tableName, id, updates);
  }
  
  // Excluir um item
  async delete(tableName: string, id: string) {
    return isClient
      ? await clientDbService.delete(tableName, id)
      : await serverDbService.delete(tableName, id);
  }
  
  // Obter todos os itens de um usuário (com retry e fallback)
  async getByUserId(tableName: string, userId: string) {
    if (!isClient) {
      // No servidor, simplesmente use o serviço do servidor
      return await serverDbService.getByUserId(tableName, userId);
    }
    
    // No cliente, implementar retry e fallback
    let attempt = 0;
    let lastError = null;
    
    // Tente algumas vezes com o cliente do lado do cliente
    while (attempt < MAX_DB_RETRIES) {
      try {
        console.log(`Tentativa ${attempt + 1} de obter dados do usuário ${userId} da tabela ${tableName}...`);
        const result = await clientDbService.getByUserId(tableName, userId);
        if (result.success) {
          console.log(`✅ Dados obtidos com sucesso na tentativa ${attempt + 1}`);
          return result;
        }
        
        // Se não teve sucesso mas não lançou erro, registre e tente novamente
        console.warn(`Tentativa ${attempt + 1} não teve sucesso, tentando novamente...`, result.error);
        lastError = result.error;
      } catch (error) {
        console.error(`Erro na tentativa ${attempt + 1}:`, error);
        lastError = error;
      }
      
      // Aguardar antes de tentar novamente (backoff exponencial)
      await wait(1000 * Math.pow(2, attempt));
      attempt++;
    }
    
    // Se chegamos aqui, todas as tentativas com o cliente falharam
    console.warn(`Todas as ${MAX_DB_RETRIES} tentativas falharam. Resultado vazio.`);
    
    // Retornar um resultado vazio em vez de falhar completamente
    return { 
      success: true, 
      data: [],
      // Incluir informações de diagnóstico
      warning: `Falha ao obter dados com credenciais temporárias após ${MAX_DB_RETRIES} tentativas`,
      originalError: lastError
    };
  }
  
  // Obter todos os itens (com paginação)
  async getAll(tableName: string, limit = 100, lastEvaluatedKey?: any) {
    return isClient
      ? await clientDbService.getAll(tableName, limit, lastEvaluatedKey)
      : await serverDbService.getAll(tableName, limit, lastEvaluatedKey);
  }
  
  // Consultar itens com condições
  async query(
    tableName: string, 
    keyName: string, 
    keyValue: string, 
    options?: { 
      filterExpression?: string, 
      expressionValues?: Record<string, any> 
    }
  ) {
    return isClient
      ? await clientDbService.query(tableName, keyName, keyValue, options)
      : await serverDbService.query(tableName, keyName, keyValue, options);
  }
}

// Exportar uma instância do serviço universal
export const universalDbService = new UniversalDbService();
