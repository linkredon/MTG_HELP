'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auth, Amplify, Hub, fetchAuthSession, getCurrentUser, signOut } from './amplify-types';
import { configureAmplify } from '@/lib/amplifySetup';

// Definir tipos
export type AmplifyUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  image?: string;
  // Adicionar campos para compatibilidade com componentes existentes
  collectionsCount?: number;
  totalCards?: number;
};

export type AmplifyAuthContextType = {
  user: AmplifyUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean; // Indica se o Amplify foi inicializado
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

// Criar o contexto
const AmplifyAuthContext = createContext<AmplifyAuthContextType | undefined>(undefined);

// Hook para usar o contexto
export const useAmplifyAuth = () => {
  const context = useContext(AmplifyAuthContext);
  if (context === undefined) {
    throw new Error('useAmplifyAuth deve ser usado dentro de um AmplifyAuthProvider');
  }
  return context;
};

// Verificar e garantir que Amplify está inicializado
function ensureAmplifyConfigured() {
  try {
    if (typeof window !== 'undefined' && window.__amplifyConfigured) {
      return true;
    }
    const success = configureAmplify();
    if (typeof window !== 'undefined' && success) {
      window.__amplifyConfigured = true;
    }
    return success;
  } catch (error) {
    console.error('❌ Erro ao configurar Amplify:', error);
    return false;
  }
}

// Adicionar declaração global para evitar erro de linter
declare global {
  interface Window { __amplifyConfigured?: boolean; }
}

// Provedor que fornece autenticação via Amplify
export function AmplifyAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AmplifyUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [amplifyConfigured, setAmplifyConfigured] = useState(false);
  
  // Garantir que o Amplify esteja configurado antes de usar os serviços de autenticação
  useEffect(() => {
    const configureAuth = async () => {
      const success = ensureAmplifyConfigured();
      setAmplifyConfigured(success);
    };
    
    configureAuth();
  }, []);

  // Função para extrair informações do usuário
  const extractUserInfo = async () => {
    try {
      // Verificar se o Amplify está configurado
      if (!amplifyConfigured) {
        const success = ensureAmplifyConfigured();
        if (!success) {
          console.error('❌ Não foi possível configurar o Amplify antes de buscar usuário');
          setIsLoading(false);
          return;
        }
      }
      
      let currentUser;
      let session;
      
      try {
        // Primeiro verificar se temos uma sessão válida
        session = await Auth.currentSession();
        
        // Verificar se temos um token válido
        if (!session?.getIdToken()?.getJwtToken()) {
          console.log('Sessão não possui token válido');
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // Se temos uma sessão válida, agora podemos obter o usuário atual
        currentUser = await Auth.currentAuthenticatedUser();
      } catch (authError) {
        console.log('Erro ao verificar autenticação:', authError);
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      

      // Extrair informações do usuário do token JWT
      const idTokenPayload = session.getIdToken().decodePayload();
      
      const userInfo: AmplifyUser = {
        id: currentUser.attributes.sub,
        email: (idTokenPayload.email as string) || '',
        name: (idTokenPayload.name as string) || ((idTokenPayload.email as string)?.split('@')[0]) || '',
        avatar: (idTokenPayload.picture as string) || undefined,
        image: (idTokenPayload.picture as string) || undefined,
        // Valores padrão para compatibilidade
        collectionsCount: 0,
        totalCards: 0
      };
      
      setUser(userInfo);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro ao buscar sessão:', error);
      // Se ocorrer um erro específico do Auth UserPool, tentar reconfigurar
      if (error instanceof Error && 
          (error.name === 'AuthUserPoolException' || 
           error.message?.includes('Auth UserPool not configured'))) {
        console.log('🔄 Tentando reconfigurar Amplify após erro...');
        const success = ensureAmplifyConfigured();
        setAmplifyConfigured(success);
      }
      
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar as informações do usuário
  const refreshUser = async () => {
    setIsLoading(true);
    await extractUserInfo();
  };

  // Função para fazer logout
  const handleSignOut = async () => {
    try {
      await Auth.signOut({ global: true });
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Efeito para carregar o usuário inicial
  useEffect(() => {
    if (amplifyConfigured) {
      extractUserInfo();
    }
  }, [amplifyConfigured]);
  
  // Ouvir eventos de autenticação
  useEffect(() => {
    if (!amplifyConfigured) return;
    
    const listener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          extractUserInfo();
          break;
        case 'signedOut':
          setUser(null);
          setIsAuthenticated(false);
          break;
        default:
          break;
      }
    });
    
    return () => {
      listener();  // No AWS Amplify v6, o listener retorna uma função de limpeza
    };
  }, [amplifyConfigured]);

  // Fornecer contexto para a árvore de componentes
  return (
    <AmplifyAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isInitialized: amplifyConfigured, // Adicionar o status de inicialização
        signOut: handleSignOut,
        refreshUser
      }}
    >
      {children}
    </AmplifyAuthContext.Provider>
  );
}
