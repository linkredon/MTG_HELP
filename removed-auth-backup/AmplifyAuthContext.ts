"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth';

export interface AmplifyUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role?: string;
  avatar?: string | null;
}

interface AmplifyAuthContextType {
  user: AmplifyUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AmplifyAuthContext = createContext<AmplifyAuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  refreshUser: async () => {},
  logout: async () => {}
});

export function useAmplifyAuth() {
  return useContext(AmplifyAuthContext);
}

interface AmplifyAuthProviderProps {
  children: ReactNode;
}

export function AmplifyAuthProvider({ children }: AmplifyAuthProviderProps) {
  const [user, setUser] = useState<AmplifyUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      
      if (currentUser && userAttributes) {
        const amplifyUser: AmplifyUser = {
          id: currentUser.userId,
          username: currentUser.username,
          email: userAttributes.email || currentUser.username,
          name: userAttributes.name || userAttributes.email || currentUser.username,
          role: userAttributes['custom:role'] || 'user',
          avatar: userAttributes['picture'] || null
        };
        
        setUser(amplifyUser);
        setIsAuthenticated(true);
        console.log('✅ Usuário autenticado:', amplifyUser);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('❌ Nenhum usuário autenticado');
      }
    } catch (err: any) {
      console.error('Erro ao obter usuário atual:', err);
      setUser(null);
      setIsAuthenticated(false);
      setError(err.message || 'Erro ao verificar autenticação');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout realizado com sucesso');
    } catch (err: any) {
      console.error('Erro ao fazer logout:', err);
      setError(err.message || 'Erro ao fazer logout');
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    refreshUser,
    logout
  };

  return (
    <AmplifyAuthContext.Provider value={value}>
      {children}
    </AmplifyAuthContext.Provider>
  );
}
