'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle, Home } from 'lucide-react';

export default function AuthFixPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const clearAllAuth = async () => {
    setLoading(true);
    setMessage('Limpando autenticação...');
    
    try {
      // Limpar todos os cookies relacionados à autenticação
      const cookiesToClear = [
        'mtg_user_authenticated',
        'amplify-signin-with-hostedUI',
        'amplify.auth.tokens',
        'mtg_auth_in_progress',
        'NEXT_PUBLIC_DEMO_MODE'
      ];

      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });

      // Chamar API para limpar cookies
      await fetch('/api/clear-auth-cookies', { method: 'POST' });
      
      setMessage('Autenticação limpa! Redirecionando...');
      
      // Aguardar e recarregar
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (error) {
      setMessage('Erro ao limpar autenticação');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToHome = () => {
    window.location.href = '/';
  };

  const forceReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Problema de Autenticação
          </h1>
          <p className="text-gray-600">
            Parece que você está preso em um loop de autenticação. 
            Vamos resolver isso!
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
            <p className="text-blue-800 text-sm">{message}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={clearAllAuth}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Limpando...
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Limpar Toda Autenticação
              </>
            )}
          </Button>

          <Button
            onClick={goToHome}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Página Inicial
          </Button>

          <Button
            onClick={forceReload}
            variant="outline"
            className="w-full"
          >
            Recarregar Página
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">O que fazer:</h3>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Clique em "Limpar Toda Autenticação"</li>
            <li>2. Aguarde o redirecionamento</li>
            <li>3. Se ainda houver problemas, tente "Ir para Página Inicial"</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 