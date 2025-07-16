"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Use dynamic import with SSR disabled to prevent the authentication context from being used during server-side rendering
const LoginClientComponent = dynamic(() => import('./page.client'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Carregando autenticação...</div>
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginClientComponent />
    </Suspense>
  );
}
