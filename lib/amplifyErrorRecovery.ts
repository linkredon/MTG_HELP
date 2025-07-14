'use client';

import { useEffect } from 'react';

/**
 * Utilitário para recuperação de erros do Amplify
 */
export function amplifyErrorHandler() {
  // Aqui você poderia adicionar lógica para recuperar de erros do Amplify
  console.log('Recuperando de erros do Amplify');
  
  // Limpar localStorage para evitar estado corrompido
  if (typeof window !== 'undefined') {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('amplify') || key.includes('CognitoIdentityServiceProvider')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Erro ao limpar localStorage:', e);
    }
  }
}

/**
 * Hook para limpar recursos do Amplify quando ocorrem erros
 */
export function useClearAmplifyErrors() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Capturar erros de chunk loading
      window.addEventListener('error', (event) => {
        const errorMsg = event.message || '';
        if (
          errorMsg.includes('chunk') || 
          errorMsg.includes('Loading chunk') || 
          errorMsg.includes('aws-amplify')
        ) {
          console.log('Detectado erro de carregamento de chunk do Amplify, tentando recuperar...');
          amplifyErrorHandler();
        }
      });
    }
  }, []);
}

export default useClearAmplifyErrors;
