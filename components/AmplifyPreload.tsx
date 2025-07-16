'use client';

import { AmplifyAuthProvider } from '@/contexts/AmplifyAuthContext';
import { configureAmplify } from '@/lib/amplifySetup';
import { Amplify } from 'aws-amplify';
import { useEffect } from 'react';

/**
 * Componente que garante a inicialização do Amplify antes de renderizar os componentes
 * que dependem da autenticação. Este componente é usado para "pré-inicializar" o
 * Amplify antes de mostrar componentes que precisam de autenticação.
 */
export default function AmplifyPreload({ children }: { children: React.ReactNode }) {
  // Mover a inicialização para dentro de um useEffect para garantir que só execute no cliente
  useEffect(() => {
    try {
      // Verificar se já está configurado
      const config = Amplify.getConfig();
      if (!config.Auth?.Cognito) {
        console.log('🔄 Inicializando Amplify no AmplifyPreload...');
        configureAmplify();
      } else {
        console.log('✓ Amplify já configurado no AmplifyPreload');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar Amplify no AmplifyPreload:', error);
    }
  }, []);
  
  return (
    <AmplifyAuthProvider>
      {children}
    </AmplifyAuthProvider>
  );
}
