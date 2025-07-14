import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Configuração do cliente DynamoDB
const client = new DynamoDBClient({
  region: process.env.AMZ_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AMZ_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY || ''
  }
});

// Criar um cliente de documento para operações mais simples
export const dynamoDb = DynamoDBDocumentClient.from(client);

// Nomes das tabelas
export const TABLES = {
  USERS: process.env.DYNAMO_USERS_TABLE || 'mtg_users',
  COLLECTIONS: process.env.DYNAMO_COLLECTIONS_TABLE || 'mtg_collections',
  DECKS: process.env.DYNAMO_DECKS_TABLE || 'mtg_decks',
  FAVORITES: process.env.DYNAMO_FAVORITES_TABLE || 'mtg_favorites'
};