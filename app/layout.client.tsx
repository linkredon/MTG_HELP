"use client"

import { configureAmplify } from '@/lib/amplifySetup';
configureAmplify();
// Importações atualizadas usando implementações reais
import { useEffect } from 'react'
import React from 'react'
import { AppProvider } from '@/contexts/AppContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import CardModalWrapper from '@/components/CardModalWrapper'
import { AmplifyAuthProvider } from '@/contexts/AmplifyAuthContext'
import { DataLoadingOptimizer } from '@/components/DataLoadingOptimizer'
import { RedirectLoopDetector } from '@/components/RedirectLoopDetector'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
  
  return (
    <>
      <AmplifyAuthProvider>
        <RedirectLoopDetector />
        <DataLoadingOptimizer>
          <AppProvider>
            <FavoritesProvider>
              <CardModalWrapper>
                {children}
              </CardModalWrapper>
            </FavoritesProvider>
          </AppProvider>
        </DataLoadingOptimizer>
      </AmplifyAuthProvider>
    </>
  )
}