import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { dynamoDb, TABLES } from './awsConfig';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Buscar usuário pelo email
          const params = {
            TableName: TABLES.USERS,
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
              ':email': credentials.email
            }
          };
          
          const result = await dynamoDb.send(new QueryCommand(params));
          
          if (!result.Items || result.Items.length === 0) {
            throw new Error('Email ou senha inválidos');
          }
          
          const user = result.Items[0];
          
          // Verificar se a senha corresponde
          const isMatch = await bcrypt.compare(credentials.password, user.password);
          
          if (!isMatch) {
            throw new Error('Email ou senha inválidos');
          }
          
          // Retornar objeto de usuário sem a senha
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            joinedAt: user.joinedAt,
            collectionsCount: user.collectionsCount || 0,
            totalCards: user.totalCards || 0,
            achievements: user.achievements || []
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
        token.joinedAt = user.joinedAt;
        token.collectionsCount = user.collectionsCount;
        token.totalCards = user.totalCards;
        token.achievements = user.achievements;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
        session.user.joinedAt = token.joinedAt;
        session.user.collectionsCount = token.collectionsCount;
        session.user.totalCards = token.totalCards;
        session.user.achievements = token.achievements;
      }
      return session;
    }
  },
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