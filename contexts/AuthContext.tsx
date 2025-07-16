"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import * as AmplifyAuth from '@aws-amplify/auth';

// Tipo para sessão
type Session = {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    [key: string]: any;
  };
};

// Tipo para usuários autenticados
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  joinedAt?: string;
  collectionsCount?: number;
  totalCards?: number;
  achievements?: string[];
};

// Contexto de autenticação
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean, message?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean, message?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean, message?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Dados de usuário para o modo de demonstração
const DEMO_USER: AuthUser = {
  id: "demo-user-1",
  name: "Usuário Demo",
  email: "demo@example.com",
  role: "user",
  avatar: "",
  joinedAt: new Date().toISOString(),
  collectionsCount: 3,
  totalCards: 150,
  achievements: ['first_login', 'collection_created']
};

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider de autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const router = useRouter();

  // Verificar o status da autenticação ao carregar a página
  useEffect(() => {
    async function loadUserSession() {
      try {
        // Verificar modo de demonstração
        const demoMode = localStorage.getItem('NEXT_PUBLIC_DEMO_MODE') === 'true';
        setIsDemoMode(demoMode);
        
        if (demoMode) {
          console.log('📱 Modo de demonstração ativado');
          setUser(DEMO_USER);
          setIsLoading(false);
          return;
        }

        // Tenta obter usuário autenticado do Amplify
        try {
          const currentUser = await AmplifyAuth.getCurrentUser();
          
          if (currentUser) {
            // Buscar atributos do usuário
            const attributes = await AmplifyAuth.fetchUserAttributes();
            
            const authUser: AuthUser = {
              id: currentUser.username || attributes.sub || '',
              name: attributes.name || currentUser.username || '',
              email: attributes.email || currentUser.signInDetails?.loginId || '',
              avatar: attributes.picture || '',
              role: attributes['custom:role'] || 'user'
            };
            
            setUser(authUser);
          } else {
            setUser(null);
          }
        } catch (authError) {
          console.log('Usuário não autenticado:', authError);
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserSession();
  }, []);

  // Funções de autenticação
  const signIn = async (email: string, password: string) => {
    try {
      // Modo de demonstração
      if (email === 'demo@example.com' && password === 'demo123') {
        setUser(DEMO_USER);
        localStorage.setItem('NEXT_PUBLIC_DEMO_MODE', 'true');
        setIsDemoMode(true);
        router.push('/');
        return { success: true };
      }

      // AWS Amplify Authentication
      await AmplifyAuth.signIn({
        username: email,
        password
      });
      
      try {
        const user = await AmplifyAuth.getCurrentUser();
        const attributes = await AmplifyAuth.fetchUserAttributes();
        
        // Criar objeto de usuário a partir dos atributos do Cognito
        const authUser: AuthUser = {
          id: user.username || attributes.sub || '',
          name: attributes.name || user.username || '',
          email: attributes.email || email,
          avatar: attributes.picture || '',
          role: attributes['custom:role'] || 'user'
        };
        
        setUser(authUser);
        return { success: true };
      } catch (userError) {
        console.error("Erro ao obter detalhes do usuário:", userError);
        return { success: false, message: 'Erro ao buscar detalhes do usuário' };
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido ao fazer login'
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Usar o Amplify para login com Google (redireciona para o provedor OAuth)
      await AmplifyAuth.signInWithRedirect({
        provider: 'Google'
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao fazer login com Google'
      };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      // Registrar com AWS Amplify
      const result = await AmplifyAuth.signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name
          }
        }
      });

      if (result.isSignUpComplete) {
        // Login automático após registro
        return signIn(email, password);
      } else {
        throw new Error('Falha ao criar usuário');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido ao registrar' 
      };
    }
  };

  const signOut = async () => {
    try {
      // Limpar modo de demonstração se ativo
      if (isDemoMode) {
        localStorage.removeItem('NEXT_PUBLIC_DEMO_MODE');
        setIsDemoMode(false);
      }

      // Fazer logout do Amplify
      await AmplifyAuth.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const refreshUser = async () => {
    try {
      // No modo de demonstração, não precisa atualizar
      if (isDemoMode) return;

      try {
        // Buscar usuário atual do Amplify
        const currentUser = await AmplifyAuth.getCurrentUser();
        
        if (currentUser) {
          // Buscar atributos atualizados
          const attributes = await AmplifyAuth.fetchUserAttributes();
          
          const authUser: AuthUser = {
            id: currentUser.username || attributes.sub || '',
            name: attributes.name || currentUser.username || '',
            email: attributes.email || '',
            avatar: attributes.picture || '',
            role: attributes['custom:role'] || 'user'
          };
          
          setUser(authUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log('Usuário não autenticado ao atualizar');
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  };

  // Valor do contexto
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isDemoMode,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    refreshUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

// Provider de autenticação simplificado para modo de demonstração
export function DemoAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{
      user: DEMO_USER,
      isLoading: false,
      isAuthenticated: true,
      isDemoMode: true,
      signIn: async () => ({ success: true }),
      signInWithGoogle: async () => ({ success: true }),
      signUp: async () => ({ success: true }),
      signOut: async () => { window.location.href = '/login'; },
      refreshUser: async () => {}
    }}>
      {children}
    </AuthContext.Provider>
  );
}
