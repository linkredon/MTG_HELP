'use client';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Função que configura e retorna um cliente DynamoDB para uso no lado do cliente
export function getDynamoDbClient() {
  // Verificar se estamos no lado do cliente
  if (typeof window === 'undefined') {
    console.error('Esta função deve ser chamada apenas no lado do cliente');
    throw new Error('getDynamoDbClient deve ser usado apenas em componentes do cliente');
  }

  // Obter credenciais a partir do sessionStorage (onde Amplify armazena tokens)
  let region = 'us-east-2'; // Região padrão
  let accessKeyId = '';
  let secretAccessKey = '';
  
  try {
    // Tentar obter as credenciais do .env.local primeiro (valores públicos)
    region = process.env.NEXT_PUBLIC_REGION || region;
    
    // Verificar se as credenciais são definidas explicitamente no ambiente
    accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '';
    secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '';
    
    console.log('Configurando DynamoDB com credenciais do ambiente');
  } catch (error) {
    console.error('Erro ao obter credenciais:', error);
  }

  // Configurar cliente DynamoDB
  const client = new DynamoDBClient({
    region,
    credentials: accessKeyId && secretAccessKey ? {
      accessKeyId,
      secretAccessKey
    } : undefined
  });

  // Criar um cliente de documento para operações mais simples
  return DynamoDBDocumentClient.from(client);
}

// Nomes das tabelas
export const TABLES = {
  USERS: process.env.NEXT_PUBLIC_DYNAMO_USERS_TABLE || 'mtg_users',
  COLLECTIONS: process.env.NEXT_PUBLIC_DYNAMO_COLLECTIONS_TABLE || 'mtg_collections',
  DECKS: process.env.NEXT_PUBLIC_DYNAMO_DECKS_TABLE || 'mtg_decks',
  FAVORITES: process.env.NEXT_PUBLIC_DYNAMO_FAVORITES_TABLE || 'mtg_favorites'
};

// Exportar uma versão já instanciada para uso em componentes
export const dynamoDb = typeof window !== 'undefined' ? getDynamoDbClient() : null;
