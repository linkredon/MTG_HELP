import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Verificar se estamos no lado do servidor
const isServer = typeof window === 'undefined';

// Configuração do cliente DynamoDB (lado do servidor)
const createServerClient = () => {
  const client = new DynamoDBClient({
    region: process.env.AMZ_REGION || 'us-east-2',
    credentials: {
      accessKeyId: process.env.AMZ_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY || ''
    }
  });
  return DynamoDBDocumentClient.from(client);
};

// Criar um cliente vazio para o lado do cliente
// No lado do cliente, usaremos um cliente específico de awsConfigClient.ts
const createEmptyClient = () => {
  console.warn('Tentativa de usar DynamoDB no lado do cliente diretamente de awsConfig.ts');
  return null;
};

// Criar o cliente apropriado com base no ambiente
export const dynamoDb = isServer ? createServerClient() : createEmptyClient();

// Nomes das tabelas
export const TABLES = {
  USERS: process.env.DYNAMO_USERS_TABLE || process.env.NEXT_PUBLIC_DYNAMO_USERS_TABLE || 'mtg_users',
  COLLECTIONS: process.env.DYNAMO_COLLECTIONS_TABLE || process.env.NEXT_PUBLIC_DYNAMO_COLLECTIONS_TABLE || 'mtg_collections',
  DECKS: process.env.DYNAMO_DECKS_TABLE || process.env.NEXT_PUBLIC_DYNAMO_DECKS_TABLE || 'mtg_decks',
  FAVORITES: process.env.DYNAMO_FAVORITES_TABLE || process.env.NEXT_PUBLIC_DYNAMO_FAVORITES_TABLE || 'mtg_favorites'
};