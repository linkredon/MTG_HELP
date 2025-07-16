'use client';

import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';

/**
 * Utilitário para recuperação de erros do Amplify
 */
export function amplifyErrorHandler() {
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
 * e configurar resiliência para erros de autenticação
 */
export function useClearAmplifyErrors() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Capturar erros de chunk loading e erros específicos do Amplify
      const handleError = (event: ErrorEvent) => {
        const errorMsg = event.message || '';
        
        // Verificar erros comuns relacionados ao Amplify
        if (
          errorMsg.includes('chunk') || 
          errorMsg.includes('Loading chunk') || 
          errorMsg.includes('aws-amplify') ||
          errorMsg.includes('Auth UserPool not configured') ||
          errorMsg.includes('AuthUserPoolException')
        ) {
          console.warn('⚠️ Detectado erro relacionado ao Amplify:', errorMsg);
          amplifyErrorHandler();
          
          // Tenta verificar a configuração atual
          try {
            const config = Amplify.getConfig();
            console.log('📋 Configuração atual do Amplify:', 
              config.Auth?.Cognito ? 'Configurado' : 'Não configurado');
          } catch (configErr) {
            console.error('Erro ao verificar configuração:', configErr);
          }
          
          // Prevenir propagação do erro em caso de problemas não críticos
          if (!errorMsg.includes('fatal')) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      };
      
      // Adicionar listener para capturar erros
      window.addEventListener('error', handleError);
      
      // Adicionar listener para rejeições de promessas não tratadas
      window.addEventListener('unhandledrejection', (event) => {
        const errorMsg = event.reason?.message || String(event.reason);
        
        if (
          errorMsg.includes('Auth UserPool not configured') ||
          errorMsg.includes('AuthUserPoolException') ||
          errorMsg.includes('aws-amplify')
        ) {
          console.warn('⚠️ Promessa rejeitada relacionada ao Amplify:', errorMsg);
          // Não parar a propagação aqui, pois pode causar problemas com outras partes da aplicação
        }
      });
      
      return () => {
        window.removeEventListener('error', handleError);
        // Intencionalmente não removemos o listener de unhandledrejection
        // para evitar potenciais problemas com outros componentes
      };
    }
  }, []);
}

export default useClearAmplifyErrors;
