"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { AmplifyAuthProvider } from '@/contexts/AmplifyAuthContext';

// Use dynamic import with SSR disabled to prevent the authentication context from being used during server-side rendering
const LoginClientComponent = dynamic(() => import('./page.client'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Carregando autenticação...</div>
});

// Adicionar wrapper para garantir que o contexto de autenticação esteja disponível
export default function LoginClientWrapper() {
  return (
    <AmplifyAuthProvider>
      <Suspense fallback={<div>Carregando...</div>}>
        <LoginClientComponent />
      </Suspense>
    </AmplifyAuthProvider>
  );
}
