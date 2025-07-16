"use client"

import AmplifyInit from '@/components/AmplifyInit'
import { useEffect } from 'react'
import useClearAmplifyErrors from '@/lib/amplifyErrorRecovery'
import React from 'react'
import { AppProvider } from '@/contexts/AppContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import CardModalWrapper from '@/components/CardModalWrapper'
import AmplifyPreload from '@/components/AmplifyPreload'
import LoopBreakerWrapper from '@/components/LoopBreakerWrapper'
import EmergencyRedirectWrapper from '@/components/EmergencyRedirectWrapper'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Usar o hook de recuperação de erros
  useClearAmplifyErrors();
  
  // Não precisamos mais de inicialização direta aqui ou controle de estado shouldLoadAmplify
  // A inicialização será feita no AmplifyPreload e AmplifyInit via useEffect
  
  // Ainda podemos adicionar monitoramento de erros para logs e diagnóstico
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes('chunk') || 
        event.message?.includes('aws-amplify') ||
        event.message?.includes('Cannot read properties of undefined') ||
        event.message?.includes('Auth UserPool not configured')
      ) {
        console.warn('Erro relacionado a AWS Amplify detectado:', event.message);
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  // IMPORTANTE: Não faça verificações de "typeof window === 'undefined'"
  // no corpo do componente, pois isso causa erros de hidratação
  
  // Em vez disso, renderize a mesma estrutura no servidor e no cliente,
  // e use useEffect para lógica específica do cliente
  
  return (
    <AmplifyPreload>
      {/* Componente que detecta loops de carregamento e força redirecionamento */}
      <LoopBreakerWrapper />
      
      {/* Botão de emergência para redirecionamento */}
      <EmergencyRedirectWrapper />
      
      {/* Sempre renderize o AmplifyInit, mas ele só fará algo no cliente */}
      <AmplifyInit />
      <AppProvider>
        <FavoritesProvider>
          <CardModalWrapper>
            {children}
          </CardModalWrapper>
        </FavoritesProvider>
      </AppProvider>
    </AmplifyPreload>
  )
}