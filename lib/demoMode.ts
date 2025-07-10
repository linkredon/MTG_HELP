// Modo de demonstração para o aplicativo funcionar sem backend
import { MTGCard, UserCollection, Deck } from '@/types/mtg';

// Verificar se estamos em modo de demonstração
export const isDemoMode = () => {
  // Verificar se estamos em ambiente de produção sem backend configurado
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
         (typeof window !== 'undefined' && window.location.hostname.includes('amplifyapp.com'));
};

// Obter configurações do Amplify das variáveis de ambiente
export const getAmplifyConfig = () => {
  return {
    aws_project_region: process.env.NEXT_PUBLIC_REGION || 'us-east-2',
    aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT,
    aws_appsync_region: process.env.NEXT_PUBLIC_REGION || 'us-east-2',
    aws_appsync_authenticationType: 'API_KEY',
    aws_appsync_apiKey: process.env.NEXT_PUBLIC_API_KEY,
    aws_cognito_region: process.env.NEXT_PUBLIC_REGION || 'us-east-2',
    aws_user_pools_id: process.env.NEXT_PUBLIC_USER_POOL_ID,
    aws_user_pools_web_client_id: process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID,
    aws_cognito_username_attributes: ['EMAIL'],
    aws_cognito_social_providers: [],
    aws_cognito_signup_attributes: ['EMAIL'],
    aws_cognito_mfa_configuration: 'OFF',
    aws_cognito_password_protection_settings: {
      passwordPolicyMinLength: 8,
      passwordPolicyCharacters: []
    },
    aws_cognito_verification_mechanisms: ['EMAIL']
  };
};

// Usuário de demonstração
export const demoUser = {
  id: 'demo-user',
  name: 'Usuário Demo',
  email: 'demo@mtghelper.com',
  role: 'user',
  avatar: null,
  joinedAt: new Date().toISOString(),
  collectionsCount: 1,
  totalCards: 0,
  achievements: ['demo_user']
};

// Coleção inicial de demonstração
export const demoCollection: UserCollection = {
  id: 'demo-collection',
  name: 'Minha Coleção',
  description: 'Coleção de demonstração',
  cards: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isPublic: false
};

// Deck inicial de demonstração
export const demoDeck: Deck = {
  id: 'demo-deck',
  name: 'Meu Primeiro Deck',
  format: 'Standard',
  colors: ['U', 'B'],
  cards: [],
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  description: 'Deck de demonstração',
  isPublic: false,
  tags: ['demo']
};

// Inicializar dados de demonstração
export const initDemoData = () => {
  if (typeof window === 'undefined') return;
  
  // Verificar se já temos dados salvos
  if (!localStorage.getItem('mtg-collections')) {
    localStorage.setItem('mtg-collections', JSON.stringify([demoCollection]));
  }
  
  if (!localStorage.getItem('mtg-decks')) {
    localStorage.setItem('mtg-decks', JSON.stringify([demoDeck]));
  }
  
  if (!localStorage.getItem('mtg-favorites')) {
    localStorage.setItem('mtg-favorites', JSON.stringify([]));
  }
  
  // Salvar usuário de demonstração
  localStorage.setItem('demo-user', JSON.stringify(demoUser));
};

import { AuthResult } from './auth-helpers';

// Função para autenticar usuário de demonstração
export const authenticateDemoUser = (email: string, password: string): AuthResult => {
  // Em modo de demonstração, aceitar qualquer email/senha
  if (isDemoMode()) {
    return {
      success: true,
      user: {
        ...demoUser,
        email: email // Usar o email fornecido
      }
    };
  }
  return { success: false, error: 'Modo de demonstração não ativado' };
};

// Função para registrar usuário de demonstração
export const registerDemoUser = (userData: { name: string, email: string, password: string }): AuthResult => {
  if (isDemoMode()) {
    return {
      success: true,
      user: {
        ...demoUser,
        name: userData.name,
        email: userData.email
      }
    };
  }
  return { success: false, error: 'Modo de demonstração não ativado' };
};