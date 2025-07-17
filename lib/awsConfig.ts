import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Verificar se estamos no lado do servidor
const isServer = typeof window === 'undefined';

// Configuração do cliente DynamoDB (lado do servidor)
const createServerClient = () => {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  });
  return DynamoDBDocumentClient.from(client);
};

// Criar o cliente apropriado com base no ambiente
export const dynamoDb = isServer ? createServerClient() : null;

// Nomes das tabelas
export const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || process.env.NEXT_PUBLIC_DYNAMODB_USERS_TABLE || 'mtg_users',
  COLLECTIONS: process.env.DYNAMODB_COLLECTIONS_TABLE || process.env.NEXT_PUBLIC_DYNAMODB_COLLECTIONS_TABLE || 'mtg_collections',
  DECKS: process.env.DYNAMODB_DECKS_TABLE || process.env.NEXT_PUBLIC_DYNAMODB_DECKS_TABLE || 'mtg_decks',
  FAVORITES: process.env.DYNAMODB_FAVORITES_TABLE || process.env.NEXT_PUBLIC_DYNAMODB_FAVORITES_TABLE || 'mtg_favorites'
};