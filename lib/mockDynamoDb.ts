/**
 * Este arquivo contém implementações em memória das funções do DynamoDB
 * para permitir que a aplicação funcione localmente sem credenciais AWS.
 */

import { v4 as uuidv4 } from 'uuid';

// Armazenamento em memória para simulação de banco de dados
const inMemoryDB: Record<string, Record<string, any>[]> = {
  mtg_users: [],
  mtg_collections: [],
  mtg_decks: [],
  mtg_favorites: []
};

// Índices em memória
const indexes: Record<string, Record<string, Record<string, any[]>>> = {
  mtg_users: {
    'EmailIndex': {}
  } as Record<string, Record<string, any[]>>
};

// Função para adicionar um item a um índice
function addToIndex(tableName: string, indexName: string, keyField: string, item: any) {
  const keyValue = item[keyField];
  
  if (!indexes[tableName]?.[indexName]) {
    if (!indexes[tableName]) indexes[tableName] = {} as Record<string, Record<string, any[]>>;
    indexes[tableName][indexName] = {} as Record<string, any[]>;
  }
  
  if (!indexes[tableName][indexName][keyValue]) {
    indexes[tableName][indexName][keyValue] = [];
  }
  
  indexes[tableName][indexName][keyValue].push(item);
}

// Função para remover um item de um índice
function removeFromIndex(tableName: string, indexName: string, keyField: string, keyValue: string, itemId: string) {
  if (indexes[tableName]?.[indexName]?.[keyValue]) {
    indexes[tableName][indexName][keyValue] = indexes[tableName][indexName][keyValue]
      .filter((item: any) => item.id !== itemId);
  }
}

// Mock do cliente DynamoDB para ambiente de desenvolvimento
export const mockDynamoDb = {
  send: async (command: any) => {
    try {
      // Simular um atraso para parecer uma chamada real
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Comandos PutCommand - Adicionar ou atualizar item
      if (command.constructor.name === 'PutCommand') {
        const { TableName, Item } = command.input;
        
        if (!inMemoryDB[TableName]) {
          inMemoryDB[TableName] = [];
        }
        
        // Verificar se o item já existe
        const existingIndex = inMemoryDB[TableName].findIndex(item => item.id === Item.id);
        
        if (existingIndex >= 0) {
          // Atualizar item existente
          inMemoryDB[TableName][existingIndex] = Item;
          
          // Atualizar índices se for a tabela de usuários
          if (TableName === 'mtg_users' && Item.email) {
            removeFromIndex(TableName, 'EmailIndex', 'email', inMemoryDB[TableName][existingIndex].email, Item.id);
            addToIndex(TableName, 'EmailIndex', 'email', Item);
          }
        } else {
          // Adicionar novo item
          inMemoryDB[TableName].push(Item);
          
          // Adicionar a índices se for a tabela de usuários
          if (TableName === 'mtg_users' && Item.email) {
            addToIndex(TableName, 'EmailIndex', 'email', Item);
          }
        }
        
        return { $metadata: { httpStatusCode: 200 } };
      }
      
      // Comandos GetCommand - Obter um item
      if (command.constructor.name === 'GetCommand') {
        const { TableName, Key } = command.input;
        
        if (!inMemoryDB[TableName]) {
          return { Item: null };
        }
        
        const item = inMemoryDB[TableName].find(item => item.id === Key.id);
        
        return { Item: item || null };
      }
      
      // Comandos QueryCommand - Consultar por índice
      if (command.constructor.name === 'QueryCommand') {
        const { TableName, IndexName, KeyConditionExpression, ExpressionAttributeValues } = command.input;
        
        if (TableName === 'mtg_users' && IndexName === 'EmailIndex' && KeyConditionExpression === 'email = :email') {
          const email = ExpressionAttributeValues[':email'];
          const items = indexes[TableName]?.[IndexName]?.[email] || [];
          return { Items: items, Count: items.length };
        }
        
        // Consultas não implementadas retornam array vazio
        return { Items: [], Count: 0 };
      }
      
      // Comandos não implementados
      console.warn(`Comando DynamoDB não implementado: ${command.constructor.name}`);
      return { Items: [] };
    } catch (error) {
      console.error('Erro no mock do DynamoDB:', error);
      throw error;
    }
  }
};

// Interface para as tabelas
export const MOCK_TABLES = {
  USERS: 'mtg_users',
  COLLECTIONS: 'mtg_collections',
  DECKS: 'mtg_decks',
  FAVORITES: 'mtg_favorites'
};

// Pré-popular com alguns dados de teste
const timestamp = new Date().toISOString();
inMemoryDB.mtg_users.push({
  id: "demo-user-1",
  name: "Usuário Demo",
  email: "demo@example.com",
  password: "$2a$10$QeWvUasdAHGbGGZH3xQT4eQYsLiJTuIFzuoSHDPgYJ9IQn1n0VP7W", // senha: password123
  role: "user",
  avatar: "",
  joinedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
  collectionsCount: 3,
  totalCards: 150,
  achievements: ['first_login', 'collection_created']
});

// Adicionar ao índice
addToIndex('mtg_users', 'EmailIndex', 'email', inMemoryDB.mtg_users[0]);
