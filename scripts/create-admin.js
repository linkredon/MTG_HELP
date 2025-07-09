// Script para criar um usuário administrador
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Configurações
const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.AWS_DYNAMODB_USERS_TABLE || 'mtg_users';

// Dados do administrador
const ADMIN_NAME = 'Administrador';
const ADMIN_EMAIL = 'admin@mtghelper.com';
const ADMIN_PASSWORD = 'Admin@123'; // Altere para uma senha segura

async function createAdmin() {
  try {
    // Configurar cliente DynamoDB
    const client = new DynamoDBClient({
      region: REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    const dynamoDb = DynamoDBDocumentClient.from(client);
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    
    // Criar usuário administrador
    const timestamp = new Date().toISOString();
    const admin = {
      id: uuidv4(),
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      avatar: null,
      joinedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      collectionsCount: 0,
      totalCards: 0,
      achievements: ['admin']
    };
    
    const params = {
      TableName: TABLE_NAME,
      Item: admin
    };
    
    await dynamoDb.send(new PutCommand(params));
    
    console.log('Usuário administrador criado com sucesso!');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Senha:', ADMIN_PASSWORD);
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
  }
}

createAdmin();