/**
 * Mock das declarações de tipos do next-auth para evitar erros de compilação
 * sem precisar instalar o pacote next-auth
 */

// NextAuthOptions
export interface NextAuthOptions {
  providers: Array<any>;
  session?: {
    strategy?: 'jwt' | 'database';
    maxAge?: number;
    updateAge?: number;
  };
  callbacks?: {
    jwt?: (params: { token: any; user: any }) => Promise<any>;
    session?: (params: { session: any; token: any }) => Promise<any>;
    redirect?: (params: { url: string; baseUrl: string }) => Promise<string>;
    signIn?: (params: any) => Promise<boolean>;
  };
  pages?: {
    signIn?: string;
    signOut?: string;
    error?: string;
    verifyRequest?: string;
    newUser?: string;
  };
  secret?: string;
  debug?: boolean;
}

// Mocking CredentialsProvider
export const CredentialsProvider = (options: {
  name: string;
  credentials: Record<string, any>;
  authorize: (credentials: Record<string, string>) => Promise<any>;
}) => {
  return {
    id: 'credentials',
    name: options.name,
    type: 'credentials',
    credentials: options.credentials,
    authorize: options.authorize
  };
};

// Mock da função registerUser do lib/auth.ts
export async function registerUser(userData: { name: string, email: string, password: string }) {
  try {
    // Implementação mock que simula o registro bem-sucedido
    const timestamp = new Date().toISOString();
    const user = {
      id: 'mock-user-id',
      name: userData.name,
      email: userData.email,
      role: 'user',
      avatar: null,
      joinedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      collectionsCount: 0,
      totalCards: 0,
      achievements: ['first_login']
    };
    
    return { success: true, user };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return { success: false, message: 'Erro ao registrar usuário' };
  }
}

// Mock da função getUserById
export async function getUserById(id: string) {
  try {
    const timestamp = new Date().toISOString();
    const user = {
      id,
      name: 'Mock User',
      email: 'mock@example.com',
      role: 'user',
      avatar: null,
      joinedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      collectionsCount: 0,
      totalCards: 0,
      achievements: ['first_login']
    };
    
    return { success: true, user };
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return { success: false, message: 'Erro ao obter usuário' };
  }
};
