'use client';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { fetchAuthSession } from './auth-adapter';

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
    // Em vez de lançar erro, usar credenciais dummy para desenvolvimento
    // Isso permite que o app continue funcionando mesmo sem credenciais válidas
    console.warn('⚠️ Usando credenciais temporárias de fallback para desenvolvimento');
    
    // Credenciais dummy para desenvolvimento - não têm acesso real ao AWS
    return {
      accessKeyId: 'DUMMY_ACCESS_KEY_FOR_DEV',
      secretAccessKey: 'DUMMY_SECRET_KEY_FOR_DEV',
      sessionToken: 'DUMMY_SESSION_TOKEN_FOR_DEV',
    };
  }
  
  try {
    // Adicionar pausa exponencial entre tentativas para evitar rate limiting
    const backoffTime = retryAttempt === 0 ? 0 : CREDENTIAL_RETRY_DELAY * Math.pow(2, retryAttempt - 1);
    if (backoffTime > 0) {
      console.log(`Aguardando ${backoffTime}ms antes da tentativa ${retryAttempt + 1}...`);
      await sleep(backoffTime);
    }
    
    console.log(`Tentativa ${retryAttempt + 1} de obter credenciais temporárias...`);
    
    // Obter credenciais da sessão atual do Amplify
    const session = await fetchAuthSession();
    
    // Verificar se temos credenciais válidas
    if (!session.credentials?.accessKeyId || !session.credentials?.secretAccessKey) {
      console.warn('Sessão obtida mas sem credenciais válidas, tentando novamente em breve...');
      return getTemporaryCredentials(retryAttempt + 1);
    }
    
    console.log('✅ Credenciais temporárias obtidas com sucesso');
    
    // Armazenar credenciais no cache
    cachedCredentials = {
      accessKeyId: session.credentials.accessKeyId,
      secretAccessKey: session.credentials.secretAccessKey,
      sessionToken: session.credentials.sessionToken,
    };
    
    // Definir expiração (se disponível)
    if (session.credentials.expiration) {
      credentialsExpiration = new Date(session.credentials.expiration);
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
    
    // Criar um cliente mock que retorna dados vazios
    const mockClient = {
      send: async () => ({ Items: [], Count: 0 })
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
