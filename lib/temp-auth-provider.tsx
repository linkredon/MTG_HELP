'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Tipo para a sessão de usuário
interface UserSession {
  isLoggedIn: boolean;
  user: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
  } | null;
}

// Contexto para a autenticação temporária
const TempAuthContext = createContext<{
  session: UserSession;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}>({
  session: { isLoggedIn: false, user: null },
  status: 'loading'
});

// Hook personalizado para usar o contexto
export const useTempAuth = () => useContext(TempAuthContext);

// Componente provedor
export function TempAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession>({ isLoggedIn: false, user: null });
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  // Verificar se há sessão armazenada no localStorage
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Tentar buscar a sessão da API
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (data && data.user) {
          setSession({ isLoggedIn: true, user: data.user });
          setStatus('authenticated');
        } else {
          setSession({ isLoggedIn: false, user: null });
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setSession({ isLoggedIn: false, user: null });
        setStatus('unauthenticated');
      }
    };

    checkSession();
  }, []);

  return (
    <TempAuthContext.Provider value={{ session, status }}>
      {children}
    </TempAuthContext.Provider>
  );
}
