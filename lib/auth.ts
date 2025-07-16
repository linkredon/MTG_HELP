import { dynamoDb, TABLES } from './awsConfig';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { SimplifiedAuthOptions } from './fallbackAuth';

export const authOptions: SimplifiedAuthOptions = {
  providers: [
    {
      id: "credentials",
      name: "Credentials"
    }
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {},
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Função para registrar um novo usuário
export async function registerUser(userData: { name: string, email: string, password: string }) {
  try {
    // Verificar se o email já está em uso
    const checkParams = {
      TableName: TABLES.USERS,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': userData.email
      }
    };
    
    const existingUser = await dynamoDb.send(new QueryCommand(checkParams));
    
    if (existingUser.Items && existingUser.Items.length > 0) {
      return { success: false, message: 'Email já está em uso' };
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Criar novo usuário
    const timestamp = new Date().toISOString();
    const user = {
      id: uuidv4(),
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: 'user',
      avatar: null,
      joinedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      collectionsCount: 0,
      totalCards: 0,
      achievements: ['first_login']
    };
    
    const params = {
      TableName: TABLES.USERS,
      Item: user
    };
    
    await dynamoDb.send(new PutCommand(params));
    
    // Retornar usuário sem a senha
    const { password, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return { success: false, message: 'Erro ao registrar usuário' };
  }
}

// Função para obter usuário por ID
export async function getUserById(id: string) {
  try {
    const params = {
      TableName: TABLES.USERS,
      Key: { id }
    };
    
    const result = await dynamoDb.send(new GetCommand(params));
    
    if (!result.Item) {
      return { success: false, message: 'Usuário não encontrado' };
    }
    
    // Retornar usuário sem a senha
    const { password, ...userWithoutPassword } = result.Item;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return { success: false, message: 'Erro ao obter usuário' };
  }
}