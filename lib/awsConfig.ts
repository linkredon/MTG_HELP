import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Configuração do cliente DynamoDB
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Criar um cliente de documento para operações mais simples
export const dynamoDb = DynamoDBDocumentClient.from(client);

// Nomes das tabelas
export const TABLES = {
  USERS: process.env.AWS_DYNAMODB_USERS_TABLE || 'mtg_users',
  COLLECTIONS: process.env.AWS_DYNAMODB_COLLECTIONS_TABLE || 'mtg_collections',
  DECKS: process.env.AWS_DYNAMODB_DECKS_TABLE || 'mtg_decks',
  FAVORITES: process.env.AWS_DYNAMODB_FAVORITES_TABLE || 'mtg_favorites'
};