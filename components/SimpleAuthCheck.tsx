"use client";

import { useEffect, useState } from 'react';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';

interface SimpleAuthCheckProps {
  children: React.ReactNode;
}

export default function SimpleAuthCheck({ children }: SimpleAuthCheckProps) {
  const { user, isAuthenticated, isLoading } = useAmplifyAuth();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Aguardar um pouco para dar tempo aos contextos se inicializarem
    const timer = setTimeout(() => {
      // Verificar se há cookies de autenticação
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const hasAuthCookies = cookies['amplify.auth.tokens'] || 
                            cookies['amplify-signin-with-hostedUI'] || 
                            cookies['mtg_user_authenticated'];

      console.log('SimpleAuthCheck: Verificando autenticação...', {
        isAuthenticated,
        hasUser: !!user,
        hasAuthCookies,
        isLoading
      });

      // Se não há cookies de autenticação e não está autenticado, redirecionar
      if (!hasAuthCookies && !isAuthenticated && !isLoading) {
        console.log('SimpleAuthCheck: Nenhuma autenticação detectada, redirecionando para login');
        setShouldRedirect(true);
        return;
      }

      // Se está autenticado e tem usuário, permitir acesso
      if (isAuthenticated && user) {
        console.log('SimpleAuthCheck: Usuário autenticado, permitindo acesso');
        setAuthCheckComplete(true);
        return;
      }

      // Se ainda está carregando, aguardar
      if (isLoading) {
        console.log('SimpleAuthCheck: Ainda carregando, aguardando...');
        return;
      }

      // Se chegou até aqui, não está autenticado
      console.log('SimpleAuthCheck: Não autenticado, redirecionando para login');
      setShouldRedirect(true);
    }, 3000); // Aguardar 3 segundos

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, isLoading]);

  // Se deve redirecionar, fazer o redirecionamento
  if (shouldRedirect) {
    console.log('SimpleAuthCheck: Redirecionando para login...');
    window.location.replace('/login');
    return null;
  }

  // Se ainda está verificando, mostrar loading
  if (!authCheckComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se chegou até aqui, o usuário está autenticado e pode ver o conteúdo
  return <>{children}</>;
} 