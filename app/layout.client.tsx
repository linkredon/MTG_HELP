"use client"

// Importações atualizadas usando implementações reais
import { useEffect } from 'react'
import React from 'react'
import { AppProvider } from '@/contexts/AppContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import CardModalWrapper from '@/components/CardModalWrapper'
import { AmplifyAuthProvider } from '@/contexts/AmplifyAuthContext'
import LoopBreakerWrapper from '@/components/LoopBreakerWrapper'
import EmergencyRedirectWrapper from '@/components/EmergencyRedirectWrapper'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Modo Mock: sem necessidade de recuperação de erros do Amplify
  
  // Monitoramento básico de erros para logs e diagnóstico
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
    <>
      {/* Temporariamente desabilitado para evitar loops */}
      {/* <LoopBreakerWrapper /> */}
      
      {/* Temporariamente desabilitado para evitar loops */}
      {/* <EmergencyRedirectWrapper /> */}
      
      <AmplifyAuthProvider>
          <AppProvider>
            <FavoritesProvider>
              <CardModalWrapper>
                {children}
              </CardModalWrapper>
            </FavoritesProvider>
          </AppProvider>
      </AmplifyAuthProvider>
    </>
  )
}