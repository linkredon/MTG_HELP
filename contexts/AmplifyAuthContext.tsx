'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchAuthSession, getCurrentUser, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

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

// Provedor que fornece autenticação via Amplify
export function AmplifyAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AmplifyUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Função para extrair informações do usuário
  const extractUserInfo = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      
      // Verificar se temos um token válido
      if (!session?.tokens?.idToken) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Extrair informações do usuário do token JWT
      const idTokenPayload = session.tokens.idToken.payload;
      
      const userInfo: AmplifyUser = {
        id: currentUser.userId,
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
      await signOut({ global: true });
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Efeito para carregar o usuário inicial
  useEffect(() => {
    extractUserInfo();
    
    // Ouvir eventos de autenticação
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
  }, []);

  // Fornecer contexto para a árvore de componentes
  return (
    <AmplifyAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        signOut: handleSignOut,
        refreshUser
      }}
    >
      {children}
    </AmplifyAuthContext.Provider>
  );
}
