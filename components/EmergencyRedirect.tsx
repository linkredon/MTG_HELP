'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmergencyRedirect() {
  const [showButton, setShowButton] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();
  
  useEffect(() => {
    // Mostrar o botão após um tempo
    const showTimer = setTimeout(() => {
      setShowButton(true);
    }, 8000);
    
    // Iniciar o countdown quando o botão for mostrado
    let countdownTimer: NodeJS.Timeout | null = null;
    if (showButton) {
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer!);
            // Redirecionar automaticamente quando o contador chegar a zero
            window.location.href = '/login?reset=1';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      clearTimeout(showTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [showButton]);
  
  // Função para limpar cache local e redirecionar
  const handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('Cache local limpo');
    } catch (e) {
      console.error('Erro ao limpar cache:', e);
    }
    
    // Redirecionar para login com parâmetro de reset
    window.location.href = '/login?reset=1';
  };
  
  if (!showButton) return null;
  
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="bg-red-800 border border-red-600 rounded-lg p-4 shadow-lg">
        <p className="text-white text-sm mb-3">
          A página está demorando muito para carregar?
        </p>
        <button
          onClick={handleReset}
          className="bg-white text-red-800 hover:bg-red-100 px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Resetar aplicação ({countdown}s)
        </button>
      </div>
    </div>
  );
}
