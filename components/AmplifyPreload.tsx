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
  // Remover o useEffect que chama configureAmplify
  
  return (
    <AmplifyAuthProvider>
      {children}
    </AmplifyAuthProvider>
  );
}

declare global {
  interface Window { __amplifyConfigured?: boolean; }
}
