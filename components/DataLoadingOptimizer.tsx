'use client';

import { useEffect, useState, useRef } from 'react';

interface DataLoadingOptimizerProps {
  children: React.ReactNode;
}

export const DataLoadingOptimizer: React.FC<DataLoadingOptimizerProps> = ({ children }) => {
  const [isOptimized, setIsOptimized] = useState(false);
  const attemptsRef = useRef(0);
  const maxAttempts = 3;

  useEffect(() => {
    // Evitar múltiplas tentativas
    if (attemptsRef.current >= maxAttempts) {
      console.warn('⚠️ DataLoadingOptimizer: Máximo de tentativas atingido');
      setIsOptimized(true);
      return;
    }

    // Simular otimização de carregamento
    const timer = setTimeout(() => {
      attemptsRef.current += 1;
      setIsOptimized(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []); // Sem dependências para evitar loops

  if (!isOptimized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Otimizando carregamento...</p>
          <p className="text-sm text-gray-500 mt-2">Tentativa {attemptsRef.current + 1} de {maxAttempts}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 