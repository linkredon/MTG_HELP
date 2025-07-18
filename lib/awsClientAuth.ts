'use client';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { fetchAuthSession } from './auth-adapter';
import { fetchAuthSession as fetchAuthSessionAmplify } from 'aws-amplify/auth';

// Interface para credenciais temporárias
interface AwsTemporaryCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  expiration?: Date;
}

// Cache para as credenciais
let cachedCredentials: AwsTemporaryCredentials | null = null;
let credentialsExpiration: Date | null = null;

// Controle de tentativas para credenciais
let credentialAttempts = 0;
const MAX_CREDENTIAL_ATTEMPTS = 3;
const CREDENTIAL_RETRY_DELAY = 1000; // 1 segundo entre tentativas

// Função para esperar um tempo específico
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para obter credenciais temporárias do Cognito Identity Pool com retry
async function getTemporaryCredentials(retryAttempt = 0): Promise<AwsTemporaryCredentials> {
  // Se já temos credenciais válidas no cache, retorná-las
  if (cachedCredentials && credentialsExpiration && credentialsExpiration > new Date()) {
    console.log('Usando credenciais em cache que ainda são válidas');
    return cachedCredentials;
  }
  
  // Limite de tentativas
  if (retryAttempt >= MAX_CREDENTIAL_ATTEMPTS) {
    console.error(`Falha após ${MAX_CREDENTIAL_ATTEMPTS} tentativas de obter credenciais`);
    throw new Error('Não foi possível obter credenciais AWS válidas após múltiplas tentativas');
  }
  
  try {
    // Adicionar pausa exponencial entre tentativas para evitar rate limiting
    const backoffTime = retryAttempt === 0 ? 0 : CREDENTIAL_RETRY_DELAY * Math.pow(2, retryAttempt - 1);
    if (backoffTime > 0) {
      console.log(`Aguardando ${backoffTime}ms antes da tentativa ${retryAttempt + 1}...`);
      await sleep(backoffTime);
    }
    
    console.log(`Tentativa ${retryAttempt + 1} de obter credenciais temporárias...`);
    
    // Verificar se o usuário está autenticado
    try {
      const { getCurrentUser } = await import('aws-amplify/auth');
      const currentUser = await getCurrentUser();
      console.log('✅ Usuário autenticado:', currentUser.username);
    } catch (authError) {
      console.error('❌ Usuário não autenticado:', authError);
      throw new Error('Usuário não autenticado. Faça login primeiro.');
    }
    
    // Obter credenciais da sessão atual do Amplify
    const session = await fetchAuthSession();
    console.log('Retorno de fetchAuthSession (detalhado):', JSON.stringify(session, null, 2));
    
    // Tentar obter credenciais temporárias diretamente do Amplify
    try {
      const amplifySession = await fetchAuthSessionAmplify();
      console.log('Amplify Session (detalhado):', JSON.stringify(amplifySession, null, 2));
      
      if (amplifySession.credentials?.accessKeyId && amplifySession.credentials?.secretAccessKey) {
        console.log('✅ Credenciais temporárias obtidas do Amplify diretamente');
        
        cachedCredentials = {
          accessKeyId: amplifySession.credentials.accessKeyId,
          secretAccessKey: amplifySession.credentials.secretAccessKey,
          sessionToken: amplifySession.credentials.sessionToken,
        };
        
        if (amplifySession.credentials.expiration) {
          credentialsExpiration = new Date(amplifySession.credentials.expiration);
          console.log(`Credenciais válidas até: ${credentialsExpiration.toISOString()}`);
        } else {
          const expiresIn = new Date();
          expiresIn.setHours(expiresIn.getHours() + 1);
          credentialsExpiration = expiresIn;
          console.log(`Definindo expiração padrão: ${credentialsExpiration.toISOString()}`);
        }
        
        return cachedCredentials;
      }
    } catch (amplifyError) {
      console.warn('Erro ao obter credenciais do Amplify diretamente:', amplifyError);
    }
    
    // Verificar se temos credenciais válidas
    const credentials = session.credentials as any;
    if (!credentials || !credentials.accessKeyId || !credentials.secretAccessKey) {
      console.warn('Sessão obtida mas sem credenciais válidas, tentando novamente em breve...');
      return getTemporaryCredentials(retryAttempt + 1);
    }
    
    console.log('Credenciais retornadas:', credentials);
    
    console.log('✅ Credenciais temporárias obtidas com sucesso');
    
    // Armazenar credenciais no cache
    cachedCredentials = {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    };
    
    // Definir expiração (se disponível)
    if (credentials.expiration) {
      credentialsExpiration = new Date(credentials.expiration);
      console.log(`Credenciais válidas até: ${credentialsExpiration.toISOString()}`);
    } else {
      // Padrão: 1 hora de validade
      const expiresIn = new Date();
      expiresIn.setHours(expiresIn.getHours() + 1);
      credentialsExpiration = expiresIn;
      console.log(`Definindo expiração padrão: ${credentialsExpiration.toISOString()}`);
    }
    
    return cachedCredentials;
  } catch (error: any) {
    console.error(`Erro ao obter credenciais temporárias (tentativa ${retryAttempt + 1}):`, error);
    
    // Se o erro é de autenticação, não tentar novamente
    if (error?.message?.includes('não autenticado') || error?.message?.includes('Faça login')) {
      throw error;
    }
    
    // Verificar se é um erro de rate limit
    if (error?.name === 'TooManyRequestsException' || error?.message?.includes('Rate exceeded')) {
      console.log('⚠️ Erro de rate limit detectado. Aguardando mais tempo antes de tentar novamente...');
      // Aguardar mais tempo quando temos rate limit
      const rateLimitDelay = CREDENTIAL_RETRY_DELAY * 5 * (retryAttempt + 1);
      await sleep(rateLimitDelay);
      return getTemporaryCredentials(retryAttempt + 1);
    }
    
    // Se o erro parece ser relacionado à autenticação, esperar um pouco mais
    if (
      error?.message?.includes('Not authenticated') || 
      error?.message?.includes('No current user') ||
      error?.message?.includes('session')
    ) {
      console.log('Erro de autenticação detectado. Aguardando antes de tentar novamente...');
      await sleep(CREDENTIAL_RETRY_DELAY * 2); // Aguardar o dobro do tempo para problemas de auth
      return getTemporaryCredentials(retryAttempt + 1);
    }
    
    // Para outros tipos de erro, aguardar o tempo padrão
    await sleep(CREDENTIAL_RETRY_DELAY);
    return getTemporaryCredentials(retryAttempt + 1);
  }
}

// Cliente DynamoDB em cache
let cachedDynamoDBClient: ReturnType<typeof DynamoDBDocumentClient.from> | null = null;

// Função que configura e retorna um cliente DynamoDB para uso no lado do cliente
export async function getDynamoDbClientAsync() {
  // Verificar se estamos no lado do cliente
  if (typeof window === 'undefined') {
    console.error('Esta função deve ser chamada apenas no lado do cliente');
    throw new Error('getDynamoDbClientAsync deve ser usado apenas em componentes do cliente');
  }

  // Se já temos um cliente em cache, retorná-lo
  if (cachedDynamoDBClient) {
    return cachedDynamoDBClient;
  }

  try {
    // Obter credenciais temporárias
    const credentials = await getTemporaryCredentials();
    
    // Região padrão
    const region = process.env.NEXT_PUBLIC_REGION || 'us-east-2';
    
    // Configurar cliente DynamoDB com credenciais temporárias
    const client = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
      // Configurar opções de tempo limite e retry para tornar o cliente mais resiliente
      maxAttempts: 5, // Tentar 5 vezes
    });

    console.log('Cliente DynamoDB configurado com sucesso no lado do cliente');
    
    // Criar um cliente de documento para operações mais simples
    cachedDynamoDBClient = DynamoDBDocumentClient.from(client);
    return cachedDynamoDBClient;
  } catch (error) {
    console.error('Erro ao configurar cliente DynamoDB:', error);
    
    // Usar um cliente mock que não faz nada, mas permite que a aplicação continue
    console.warn('⚠️ Usando cliente DynamoDB simulado para desenvolvimento');
    
    // Criar um cliente mock que retorna dados vazios e ignora resolveMiddleware
    const mockClient = {
      send: async (command: any) => {
        console.warn('[MOCK] Chamando send com comando:', command?.constructor?.name || typeof command);
        return { Items: [], Count: 0 };
      }
    };
    // @ts-ignore - Mock client não é exatamente do tipo DynamoDBDocumentClient
    return mockClient;
  }
}

// Nomes das tabelas
export const TABLES = {
  USERS: process.env.NEXT_PUBLIC_DYNAMO_USERS_TABLE || 'mtg_users',
  COLLECTIONS: process.env.NEXT_PUBLIC_DYNAMO_COLLECTIONS_TABLE || 'mtg_collections',
  DECKS: process.env.NEXT_PUBLIC_DYNAMO_DECKS_TABLE || 'mtg_decks',
  FAVORITES: process.env.NEXT_PUBLIC_DYNAMO_FAVORITES_TABLE || 'mtg_favorites'
};
