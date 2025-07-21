'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Componente que força o redirecionamento para a página especificada
 * sem depender de verificações de autenticação ou inicialização
 */
export default function ForceRedirect({ to = '/' }: { to?: string }) {
  const router = useRouter();

  useEffect(() => {
    console.log(`Forçando redirecionamento para ${to}`);
    
    // Primeiro tenta usar o router do Next.js
    try {
      router.push(to);
    } catch (error) {
      console.error('Erro ao redirecionar com router:', error);
    }
    
    // Como backup, após um pequeno delay, usa window.location
    const timer = setTimeout(() => {
      console.log('Redirecionando com window.location como fallback');
      window.location.href = to;
    }, 200);
    
    return () => clearTimeout(timer);
  }, [router, to]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-white text-center">
        <div className="animate-spin mb-4 mx-auto w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full"></div>
        <p>Redirecionando...</p>
      </div>
    </div>
  );
}
