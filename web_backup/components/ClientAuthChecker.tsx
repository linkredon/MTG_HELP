'use client';

import React from 'react';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';

export default function ClientAuthChecker({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAmplifyAuth();
  const [secondsWaited, setSecondsWaited] = React.useState(0);
  const [showRetryButton, setShowRetryButton] = React.useState(false);

  // Se a autenticação não estiver totalmente inicializada após 5 segundos,
  // mostrar um botão de retry
  React.useEffect(() => {
    if (!isInitialized) {
      const timer = setInterval(() => {
        setSecondsWaited(prev => {
          const newSeconds = prev + 1;
          if (newSeconds >= 5) {
            setShowRetryButton(true);
            clearInterval(timer);
          }
          return newSeconds;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isInitialized]);
  
  // Função para recarregar a página
  const handleRefresh = () => {
    // Usar router em vez de recarregar a página
    window.location.href = '/';
  };

  // Se não estiver inicializado, mostrar uma mensagem de carregamento
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-center">
            Inicializando MTG Helper
          </h2>
          
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          
          <p className="text-center mb-4">
            Configurando serviços de autenticação...
          </p>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{
                width: `${Math.min((secondsWaited / 5) * 100, 100)}%`
              }}
            ></div>
          </div>
          
          {showRetryButton && (
            <>
              <p className="text-center text-amber-600 dark:text-amber-400 mb-4">
                A inicialização está demorando mais do que o esperado. 
                Pode haver um problema com a conexão ou com a configuração.
              </p>
              
              <div className="flex justify-center">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Tentar Novamente
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Se estiver autenticado, renderizar o conteúdo normalmente
  return <>{children}</>;
}
