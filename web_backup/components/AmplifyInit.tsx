'use client';

import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { configureAmplify } from '@/lib/amplifySetup';

/**
 * Este componente inicializa o Amplify no lado do cliente
 * de forma otimizada para evitar problemas de chunk loading
 */
export default function AmplifyInit() {
  // Use useEffect para atualizar o estado apenas no cliente
  // Inicialmente, todos os estados são configurados com valores padrão
  // que serão iguais tanto no servidor quanto no cliente
  const [initialized, setInitialized] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Remover o useEffect que chama configureAmplify

  // Para evitar erros de hidratação, vamos usar um useEffect para adicionar atributos
  // de dados aos elementos DOM depois que o componente for montado no cliente
  useEffect(() => {
    const statusDiv = document.getElementById('amplify-init-status');
    if (statusDiv) {
      statusDiv.setAttribute('data-initialized', initialized.toString());
      statusDiv.setAttribute('data-attempts', initAttempts.toString());
      statusDiv.setAttribute('data-error', error?.message || '');
    }
  }, [initialized, initAttempts, error]);
  
  // Render apenas um div simples que será o mesmo no servidor e no cliente
  // Os atributos de dados serão adicionados via useEffect apenas no cliente
  return (
    <div id="amplify-init-status" style={{ display: 'none' }}></div>
  );
}

declare global {
  interface Window { __amplifyConfigured?: boolean; }
}
