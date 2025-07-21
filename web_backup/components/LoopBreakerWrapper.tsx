'use client';

import dynamic from 'next/dynamic';

// Carrega o componente LoopBreaker apenas no lado do cliente para evitar erros de SSR
const LoopBreaker = dynamic(() => import('./LoopBreaker'), {
  ssr: false,
});

export default function LoopBreakerWrapper() {
  return <LoopBreaker timeout={8000} />;
}
