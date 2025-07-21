'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthSession } from '@/lib/aws-auth-adapter';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';
import { Amplify } from 'aws-amplify';

export default function AppInitializer() {
  const [initStatus, setInitStatus] = useState('checking');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitialized } = useAmplifyAuth();

  useEffect(() => {
    // Verificar se o Amplify está configurado
    const checkAuthAndRedirect = async () => {
      try {
        console.log('AppInitializer: Verificando estado de autenticação');
        setInitStatus('checking');

        // Verificar se o Amplify está inicializado
        if (!isInitialized) {
          console.log('AppInitializer: Aguardando inicialização do Amplify...');
          return; // Sair e esperar pelo próximo ciclo quando isInitialized mudar
        }

        // Verificar se ainda estamos carregando dados de autenticação
        if (isLoading) {
          console.log('AppInitializer: Sistema de autenticação está carregando, aguardando...');
          return; // Sair e esperar pelo próximo ciclo quando isLoading mudar
        }

        // Verificar se o usuário está autenticado
        if (isAuthenticated) {
          // Já está autenticado pelo contexto, podemos prosseguir
          console.log('AppInitializer: Usuário autenticado via contexto, prosseguindo...');
          setInitStatus('authenticated');
          return;
        }

        // Verificação direta da sessão como fallback
        try {
          const session = await fetchAuthSession();
          const hasValidToken = !!session?.tokens?.idToken;
          
          if (hasValidToken) {
            console.log('AppInitializer: Sessão válida detectada via verificação direta');
            setInitStatus('authenticated');
            return;
          }
        } catch (sessionError) {
          console.log('AppInitializer: Sessão não disponível ou inválida:', sessionError);
          // Se não há sessão, redirecionar para login
          setInitStatus('unauthenticated');
          router.push('/login');
        }
        
      } catch (error: any) {
        console.error('AppInitializer: Erro ao verificar autenticação:', error);
        setError(`Erro de inicialização: ${error.message || 'Desconhecido'}`);
        setInitStatus('error');
      }
    };

    // Executar a verificação
    checkAuthAndRedirect();
  }, [isAuthenticated, isLoading, isInitialized, router]);

  // Este componente não renderiza nada visível, apenas executa lógica
  return null;
}
