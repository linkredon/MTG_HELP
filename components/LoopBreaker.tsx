'use client';

import { useState, useEffect } from 'react';
import ForceRedirect from './ForceRedirect';

/**
 * Este componente detecta quando a aplicação está presa em um
 * loop de carregamento e força a navegação após um tempo limite
 */
export default function LoopBreaker({ timeout = 5000 }: { timeout?: number }) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadTime, setLoadTime] = useState(0);
  const [forceRedirect, setForceRedirect] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    let timer: NodeJS.Timeout | null = null;

    // Verificar quanto tempo estamos esperando
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setLoadTime(elapsed);
      
      // Se estiver demorando muito, considerar que estamos em um loop
      if (elapsed > timeout) {
        console.log('Tempo de carregamento excedido, forçando redirecionamento');
        setForceRedirect(true);
        clearInterval(interval);
      }
    }, 1000);

    // Detectar quando a página terminou de carregar
    const handleLoad = () => {
      setIsLoading(false);
      clearInterval(interval);
      if (timer) clearTimeout(timer);
    };

    // Usar um timer como backup para caso o evento load não dispare
    timer = setTimeout(handleLoad, timeout + 1000);

    // Adicionar listener para evento de carregamento completo
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [timeout]);

  // Se detectamos um loop, força o redirecionamento
  if (forceRedirect) {
    return <ForceRedirect to="/" />;
  }

  // Caso contrário, não renderiza nada
  return null;
}
