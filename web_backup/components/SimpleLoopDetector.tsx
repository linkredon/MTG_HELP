'use client';

import { useEffect, useRef, useState } from 'react';

interface SimpleLoopDetectorProps {
  children: React.ReactNode;
}

/**
 * Componente simples para detectar loops de redirecionamento sem causar problemas
 */
export default function SimpleLoopDetector({ children }: SimpleLoopDetectorProps) {
  const [redirectCount, setRedirectCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const lastPathRef = useRef<string>('');
  const countRef = useRef(0);

  useEffect(() => {
    const currentPath = window.location.pathname + window.location.search;
    
    // Só contar se realmente mudou de página
    if (currentPath !== lastPathRef.current) {
      countRef.current += 1;
      setRedirectCount(countRef.current);
      lastPathRef.current = currentPath;
      
      // Mostrar aviso se muitas redireções
      if (countRef.current > 5) {
        setShowWarning(true);
        console.warn(`Muitas redireções detectadas: ${countRef.current}`);
      }
    }

    // Resetar contador após um tempo
    const resetTimer = setTimeout(() => {
      countRef.current = 0;
      setRedirectCount(0);
      setShowWarning(false);
    }, 10000); // 10 segundos

    return () => clearTimeout(resetTimer);
  }, []);

  // Se há muitas redireções, mostrar aviso discreto
  if (showWarning) {
    return (
      <>
        {children}
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="text-yellow-200">⚠️</div>
            <div>
              <p className="font-medium text-sm">Muitas redireções detectadas</p>
              <p className="text-xs opacity-90">
                Se a página não carregar, tente limpar o cache do navegador
              </p>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="text-white hover:text-yellow-200 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
} 