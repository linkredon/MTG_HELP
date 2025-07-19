'use client';

import { useEffect, useState, useRef } from 'react';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';

interface AuthProblem {
  type: 'loop' | 'timeout' | 'error_405' | 'cognito_error';
  message: string;
  timestamp: number;
  resolved: boolean;
}

interface AuthProblemResolverProps {
  children: React.ReactNode;
}

/**
 * Componente para monitorar e resolver problemas de autenticação em tempo real
 */
export default function AuthProblemResolver({ children }: AuthProblemResolverProps) {
  const { isAuthenticated, user, isLoading, error } = useAmplifyAuth();
  const [problems, setProblems] = useState<AuthProblem[]>([]);
  const [showResolver, setShowResolver] = useState(false);
  const authAttemptsRef = useRef(0);
  const lastAuthStateRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Monitorar problemas de autenticação
  useEffect(() => {
    const currentAuthState = `${isAuthenticated}-${isLoading}-${!!error}`;
    
    // Detectar mudanças no estado de autenticação
    if (currentAuthState !== lastAuthStateRef.current) {
      lastAuthStateRef.current = currentAuthState;
      
      // Se está tentando autenticar, incrementar contador
      if (isLoading) {
        authAttemptsRef.current++;
        
        // Se tentou muitas vezes, pode ser um loop
        if (authAttemptsRef.current > 5) {
          addProblem({
            type: 'loop',
            message: 'Múltiplas tentativas de autenticação detectadas',
            timestamp: Date.now(),
            resolved: false
          });
        }
      } else {
        // Resetar contador se não está mais carregando
        authAttemptsRef.current = 0;
      }
    }

    // Detectar erros específicos
    if (error) {
      if (error.includes('405') || error.includes('Method Not Allowed')) {
        addProblem({
          type: 'error_405',
          message: 'Erro 405 detectado - problema de configuração do Cognito',
          timestamp: Date.now(),
          resolved: false
        });
      } else if (error.includes('Cognito') || error.includes('cognito')) {
        addProblem({
          type: 'cognito_error',
          message: `Erro do Cognito: ${error}`,
          timestamp: Date.now(),
          resolved: false
        });
      }
    }

    // Detectar timeouts
    if (isLoading) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (isLoading) {
          addProblem({
            type: 'timeout',
            message: 'Timeout de autenticação detectado',
            timestamp: Date.now(),
            resolved: false
          });
        }
      }, 10000); // 10 segundos
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, isLoading, error]);

  // Função para adicionar problema
  const addProblem = (problem: AuthProblem) => {
    setProblems(prev => {
      // Verificar se já existe um problema similar
      const existingProblem = prev.find(p => p.type === problem.type && !p.resolved);
      if (existingProblem) {
        return prev;
      }
      
      return [...prev, problem];
    });
    
    // Mostrar resolver se há problemas não resolvidos
    const unresolvedProblems = problems.filter(p => !p.resolved);
    if (unresolvedProblems.length > 0) {
      setShowResolver(true);
    }
  };

  // Função para resolver problemas
  const resolveProblem = (problemType: string) => {
    setProblems(prev => 
      prev.map(p => 
        p.type === problemType ? { ...p, resolved: true } : p
      )
    );
    
    // Aplicar soluções específicas
    switch (problemType) {
      case 'loop':
        // Limpar cookies e redirecionar
        document.cookie = 'mtg_user_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'amplify-signin-with-hostedUI=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'amplify.auth.tokens=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login?reset=1';
        break;
        
      case 'error_405':
        // Abrir página de diagnóstico
        window.open('/auth-monitor/login-debugger', '_blank');
        break;
        
      case 'cognito_error':
        // Tentar reconfigurar Amplify
        window.location.reload();
        break;
        
      case 'timeout':
        // Limpar cache e tentar novamente
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
        break;
    }
  };

  // Função para resolver todos os problemas
  const resolveAllProblems = () => {
    setProblems(prev => prev.map(p => ({ ...p, resolved: true })));
    setShowResolver(false);
    
    // Limpar tudo e redirecionar para login
    document.cookie = 'mtg_user_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'amplify-signin-with-hostedUI=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'amplify.auth.tokens=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.clear();
    sessionStorage.clear();
    
    setTimeout(() => {
      window.location.href = '/login?reset=1';
    }, 1000);
  };

  // Se não há problemas ou todos foram resolvidos, não mostrar nada
  const unresolvedProblems = problems.filter(p => !p.resolved);
  if (unresolvedProblems.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Overlay de resolução de problemas */}
      {showResolver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-red-500 text-2xl">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-800">
                Problemas de Autenticação Detectados
              </h3>
            </div>
            
            <div className="space-y-3 mb-6">
              {unresolvedProblems.map((problem, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {problem.type === 'loop' && 'Loop de Redirecionamento'}
                        {problem.type === 'timeout' && 'Timeout de Autenticação'}
                        {problem.type === 'error_405' && 'Erro 405 - Configuração'}
                        {problem.type === 'cognito_error' && 'Erro do Cognito'}
                      </p>
                      <p className="text-xs text-red-600 mt-1">{problem.message}</p>
                    </div>
                    <button
                      onClick={() => resolveProblem(problem.type)}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Resolver
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={resolveAllProblems}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Resolver Todos
              </button>
              <button
                onClick={() => setShowResolver(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Ignorar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 