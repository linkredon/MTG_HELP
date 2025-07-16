"use client"

import AmplifyInit from '@/components/AmplifyInit'
import { useEffect, useState } from 'react'
import useClearAmplifyErrors from '@/lib/amplifyErrorRecovery'
import React from 'react'
import { AppProvider } from '@/contexts/AppContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import CardModalWrapper from '@/components/CardModalWrapper'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Estado para controlar se devemos tentar carregar o Amplify
  const [shouldLoadAmplify, setShouldLoadAmplify] = useState(true);
  
  // Usar o hook de recuperação de erros
  useClearAmplifyErrors();
  
  // Detectar erros de chunk loading e desabilitar o Amplify se necessário
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes('chunk') || 
        event.message?.includes('aws-amplify') ||
        event.message?.includes('Cannot read properties of undefined')
      ) {
        console.warn('Erro detectado, desabilitando carregamento do Amplify');
        setShouldLoadAmplify(false);
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  // Verificação para evitar execução durante a pré-renderização estática
  // Isso previne erros de hooks do React durante o build
  const isServer = typeof window === 'undefined';
  
  if (isServer) {
    // Retornar apenas o children quando estiver no servidor
    // durante a fase de pré-renderização
    return <>{children}</>;
  }
  
  // Componente completo com providers apenas no cliente
  // Usando apenas o AppProvider com o Amplify para autenticação
  return (
    <>
      {shouldLoadAmplify && <AmplifyInit />}
      <AppProvider>
        <FavoritesProvider>
          <CardModalWrapper>
            {children}
          </CardModalWrapper>
        </FavoritesProvider>
      </AppProvider>
    </>
  )
}