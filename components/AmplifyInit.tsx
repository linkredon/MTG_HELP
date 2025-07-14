'use client';

import { useEffect, useState } from 'react';
import { configureAmplify } from '@/lib/amplifySetup';

/**
 * Este componente inicializa o Amplify no lado do cliente
 * de forma otimizada para evitar problemas de chunk loading
 */
export default function AmplifyInit() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Usar try-catch para garantir que erros não quebrem a aplicação
    try {
      // Verificar se já inicializamos para evitar múltiplas inicializações
      if (initialized) return;

      // Usar setTimeout para garantir que isso aconteça depois do renderização inicial
      const timer = setTimeout(() => {
        try {
          const success = configureAmplify();
          setInitialized(success);
          console.log('Amplify inicialização:', success ? 'bem-sucedida' : 'falhou');
        } catch (err) {
          console.error('Erro ao inicializar Amplify:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }, 100);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Erro no useEffect do AmplifyInit:', err);
    }
  }, [initialized]);
  
  // Este componente não renderiza nada visível
  return null;
}
