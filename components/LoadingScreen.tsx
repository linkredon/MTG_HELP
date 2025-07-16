'use client';

import { useState, useEffect } from 'react';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';
import { useRouter } from 'next/navigation';

// Tempo máximo de carregamento em ms (10 segundos)
const MAX_LOADING_TIME = 10000;

export default function LoadingScreen() {
  const [loadingTime, setLoadingTime] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const { isInitialized, isAuthenticated, isLoading } = useAmplifyAuth();
  const router = useRouter();

  // Estado de carregamento e tempo
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setLoadingTime(elapsed);
      
      // Se estamos carregando por muito tempo, mostrar opções de debug
      if (elapsed > 5000) {
        setShowDebugInfo(true);
      }
      
      // Se atingirmos o tempo máximo, oferecer opção de redirecionamento
      if (elapsed > MAX_LOADING_TIME) {
        setErrorState('timeout');
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Status da autenticação
  useEffect(() => {
    // Se já inicializamos e não estamos carregando, podemos decidir o que fazer
    if (isInitialized && !isLoading) {
      // Se não está autenticado, redirecionar para login
      if (!isAuthenticated) {
        router.push('/login');
      }
      // Se estiver autenticado, a tela de carregamento será removida pelo componente pai
    }
  }, [isInitialized, isAuthenticated, isLoading, router]);

  // Botão para tentar corrigir problemas
  const handleFixAttempt = () => {
    // Limpar o cache do localStorage e sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Cache local limpo com sucesso');
    } catch (e) {
      console.error('❌ Erro ao limpar cache local:', e);
    }
    
    // Recarregar a página
    window.location.href = '/login?reset=true';
  };
  
  // Botão para forçar redirecionamento
  const handleForceRedirect = () => {
    router.push('/');
  };
  
  // Botão para ir para login
  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Inicializando MTG Helper</h2>
        
        <div className="inline-block rounded-full bg-blue-600 p-3 mb-4">
          <svg className="animate-spin w-8 h-8 text-white" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" cy="12" r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        
        <p className="text-blue-300 mb-6">Configurando serviços de autenticação...</p>
        
        {/* Barra de progresso */}
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all" 
            style={{ width: `${Math.min(100, (loadingTime / MAX_LOADING_TIME) * 100)}%` }}
          />
        </div>
        
        {showDebugInfo && (
          <div className="mt-6 text-left text-sm">
            <p className="text-gray-300">Tempo de carregamento: {Math.round(loadingTime / 1000)}s</p>
            <p className="text-gray-300">Amplify inicializado: {isInitialized ? '✅' : '❌'}</p>
            <p className="text-gray-300">Autenticado: {isAuthenticated ? '✅' : '❌'}</p>
            <p className="text-gray-300">Carregando: {isLoading ? '⏳' : '✓'}</p>
            
            <div className="flex flex-col space-y-2 mt-4">
              <button 
                onClick={handleFixAttempt}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
              >
                Tentar corrigir problemas
              </button>
              
              <button 
                onClick={handleForceRedirect}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                Forçar acesso à página inicial
              </button>
              
              <button 
                onClick={handleGoToLogin}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Ir para página de login
              </button>
            </div>
          </div>
        )}
        
        {errorState === 'timeout' && (
          <div className="mt-6 bg-red-900 bg-opacity-50 p-4 rounded text-white">
            <p className="font-bold">Tempo limite excedido</p>
            <p className="text-sm mb-4">Não foi possível inicializar a aplicação no tempo esperado.</p>
            
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Tentar novamente
              </button>
              
              <button 
                onClick={handleGoToLogin}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                Ir para página de login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
