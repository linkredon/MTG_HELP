"use client";

import { useEffect, useState } from 'react';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';
import { fetchAuthSession, getCurrentUser } from '@/lib/aws-auth-adapter';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, isInitialized } = useAmplifyAuth();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const performAuthCheck = async () => {
      try {
        console.log('🔍 AuthGuard: Verificando autenticação...');
        
        // Aguardar um pouco para dar tempo aos contextos se inicializarem
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verificar se há cookies de autenticação
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

        const hasAuthCookies = cookies['amplify.auth.tokens'] || 
                              cookies['amplify-signin-with-hostedUI'] || 
                              cookies['mtg_user_authenticated'];

        console.log('AuthGuard: Cookies de autenticação:', {
          amplifyTokens: !!cookies['amplify.auth.tokens'],
          amplifySignIn: !!cookies['amplify-signin-with-hostedUI'],
          mtgUserAuth: !!cookies['mtg_user_authenticated']
        });

        // Se não há cookies de autenticação, marcar para redirecionar
        if (!hasAuthCookies) {
          console.log('❌ AuthGuard: Nenhum cookie de autenticação encontrado');
          setShouldRedirect(true);
          return;
        }

        // Tentar obter sessão do Amplify
        try {
          const session = await fetchAuthSession();
          const currentUser = await getCurrentUser();
          
          console.log('AuthGuard: Sessão Amplify:', {
            hasTokens: !!session.tokens,
            hasIdToken: !!session.tokens?.idToken,
            hasAccessToken: !!session.tokens?.accessToken,
            currentUser: !!currentUser
          });

          // Se não há sessão válida, marcar para redirecionar
          if (!session.tokens?.idToken || !currentUser) {
            console.log('❌ AuthGuard: Sessão inválida');
            setShouldRedirect(true);
            return;
          }

          // Verificar se o contexto de autenticação está sincronizado
          if (!isAuthenticated || !user) {
            console.log('❌ AuthGuard: Contexto de autenticação não sincronizado');
            setShouldRedirect(true);
            return;
          }

          console.log('✅ AuthGuard: Autenticação válida detectada');
          setAuthCheckComplete(true);
        } catch (sessionError) {
          console.error('AuthGuard: Erro ao verificar sessão:', sessionError);
          setShouldRedirect(true);
          return;
        }
      } catch (error) {
        console.error('AuthGuard: Erro na verificação de autenticação:', error);
        setShouldRedirect(true);
      }
    };

    // Só executar a verificação se estivermos no cliente e inicializado
    if (typeof window !== 'undefined' && isInitialized) {
      performAuthCheck();
    }
  }, [isAuthenticated, user, isInitialized]);

  // Se ainda está verificando autenticação, mostrar loading
  if (!authCheckComplete && !shouldRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se deve redirecionar, fazer o redirecionamento
  if (shouldRedirect) {
    console.log('🔄 AuthGuard: Redirecionando para login...');
    window.location.href = '/login';
    return null;
  }

  // Se chegou até aqui, o usuário está autenticado e pode ver o conteúdo
  return <>{children}</>;
} 