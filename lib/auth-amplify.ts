/**
 * Funções de autenticação usando AWS Amplify/Cognito
 * Este arquivo substitui a implementação anterior baseada em next-auth
 */
import { Amplify } from 'aws-amplify';
import { signIn, signUp, signOut, getCurrentUser, fetchAuthSession, confirmSignUp } from 'aws-amplify/auth';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDb, TABLES } from './awsConfig';
import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';

// Função para registrar um novo usuário
export async function registerUser(userData: { name: string, email: string, password: string }) {
  try {
    // 1. Verificar se o email já está em uso no DynamoDB
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
    
    // 2. Registrar no Cognito
    try {
      const signUpResult = await signUp({
        username: userData.email,
        password: userData.password,
        attributes: {
          email: userData.email,
          name: userData.name
        }
      });
      
      // 3. Se o registro no Cognito foi bem-sucedido, salvar também no DynamoDB
      const timestamp = new Date().toISOString();
      const userId = signUpResult.userSub || uuidv4(); // Usar ID do Cognito ou gerar um novo
      
      // Hash da senha para armazenamento seguro no DynamoDB
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = {
        id: userId,
        name: userData.name,
        email: userData.email,
        password: hashedPassword, // armazenamos a senha para compatibilidade com sistemas existentes
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
    } catch (error: any) {
      console.error('Erro ao registrar usuário no Cognito:', error);
      return { success: false, message: error.message || 'Erro ao registrar usuário' };
    }
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return { success: false, message: 'Erro ao registrar usuário' };
  }
}

// Função para obter usuário pelo ID
export async function getUserById(id: string) {
  try {
    // Primeiro tenta obter o usuário do DynamoDB
    const params = {
      TableName: TABLES.USERS,
      Key: { id }
    };
    
    const result = await dynamoDb.send(new GetCommand(params));
    
    if (result.Item) {
      // Retornar usuário sem a senha
      const { password, ...userWithoutPassword } = result.Item;
      return { success: true, user: userWithoutPassword };
    } else {
      // Se não encontrar no DynamoDB, tenta obter do Cognito
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        const userAttributes = currentUser.attributes || {};
        
        if (currentUser.username) {
          const user = {
            id: currentUser.sub,
            name: userAttributes.name || userAttributes.email || currentUser.username,
            email: userAttributes.email || currentUser.username,
            role: 'user',
            avatar: null,
            joinedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            collectionsCount: 0,
            totalCards: 0,
            achievements: []
          };
          
          return { success: true, user };
        }
      } catch (cognitoError) {
        console.error('Erro ao obter usuário do Cognito:', cognitoError);
      }
      
      return { success: false, message: 'Usuário não encontrado' };
    }
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return { success: false, message: 'Erro ao obter usuário' };
  }
}

// Função para login usando Amplify
export async function loginWithAmplify(credentials: { email: string, password: string }) {
  try {
    console.log('loginWithAmplify: credentials recebidos:', credentials);
    
    // Verificar se já há um usuário autenticado
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        console.log('loginWithAmplify: Usuário já autenticado:', currentUser.username);
        const userAttributes = currentUser.attributes || {};
        
        const user = {
          id: userAttributes.sub || currentUser.username,
          name: userAttributes.name || userAttributes.email || currentUser.username,
          email: userAttributes.email || currentUser.username,
          role: 'user'
        };
        
        return { success: true, user, alreadyAuthenticated: true };
      }
    } catch (notAuthenticatedError) {
      // Usuário não está autenticado, continuar com o login
      console.log('loginWithAmplify: Usuário não autenticado, prosseguindo com login');
    }
    
    const username = credentials.email?.trim();
    console.log('loginWithAmplify: username final:', username, 'password:', credentials.password);
    if (!username) {
      throw new Error('O campo de e-mail está vazio no momento do login!');
    }
    
    // Alteração: passar objeto { username, password }
    const signInResult = await signIn({ username, password: credentials.password });
    console.log('loginWithAmplify: signInResult:', signInResult);
    
    // Proteger acesso aos campos
    const userAttributes = signInResult?.attributes || {};
    const user = {
      id: userAttributes.sub || signInResult?.username || signInResult?.userId || null,
      name: userAttributes.name || userAttributes.email || signInResult?.username || null,
      email: userAttributes.email || signInResult?.username || null,
      role: 'user', // Papel padrão
    };
    
    if (signInResult) {
      return { success: true, user };
    } else {
      return { success: false, message: 'Falha na autenticação' };
    }
  } catch (error: any) {
    console.error('Erro no login:', error);
    
    // Verificar se é o erro de usuário já autenticado
    if (error.name === 'UserAlreadyAuthenticatedException') {
      console.log('loginWithAmplify: Usuário já autenticado detectado');
      try {
        const currentUser = await getCurrentUser();
        const userAttributes = currentUser.attributes || {};
        
        const user = {
          id: userAttributes.sub || currentUser.username,
          name: userAttributes.name || userAttributes.email || currentUser.username,
          email: userAttributes.email || currentUser.username,
          role: 'user'
        };
        
        return { success: true, user, alreadyAuthenticated: true };
      } catch (getUserError) {
        console.error('Erro ao obter usuário já autenticado:', getUserError);
        return { success: false, message: 'Erro ao obter usuário autenticado' };
      }
    }
    
    return { success: false, message: error.message || 'Falha na autenticação' };
  }
}

// Função para logout
export async function logoutUser() {
  try {
    await signOut();
    return { success: true };
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return { success: false, message: 'Erro ao fazer logout' };
  }
}

// Função para obter usuário atual
export async function getCurrentAuthUser() {
  try {
    const currentUser = await getCurrentUser();
    const userAttributes = currentUser.attributes || {};
    
    const user = {
      id: userAttributes.sub || currentUser.username,
      name: userAttributes.name || userAttributes.email || currentUser.username,
      email: userAttributes.email || currentUser.username
    };
    
    return { success: true, user };
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return { success: false, message: 'Usuário não autenticado' };
  }
}
