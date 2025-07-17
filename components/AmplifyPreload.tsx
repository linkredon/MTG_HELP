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
      if (typeof window !== 'undefined' && window.__amplifyConfigured) {
        console.log('✓ Amplify já configurado no AmplifyPreload');
        return;
      }
      configureAmplify();
      if (typeof window !== 'undefined') window.__amplifyConfigured = true;
      console.log('🔄 Inicializando Amplify no AmplifyPreload...');
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

declare global {
  interface Window { __amplifyConfigured?: boolean; }
}
