"use client";

import { useState, useEffect } from 'react';

interface LogItem {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

export default function AuthDebugger() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);

  const addLog = (message: string, type: LogItem['type'] = 'info') => {
    // Use setTimeout to ensure state updates happen outside of rendering cycle
    setTimeout(() => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
      
      setLogs(prev => [
        { timestamp, message, type },
        ...prev.slice(0, 99) // Manter apenas os últimos 100 logs
      ]);
    }, 0);
  };

  // Verifica o status de autenticação atual
  const checkAuthStatus = async () => {
    addLog('Verificando status de autenticação...', 'info');
    
    try {
      const res = await fetch('/api/auth-check');
      if (res.ok) {
        const data = await res.json();
        setAuthStatus(data);
        
        if (data.isAuthenticated) {
          addLog(`Autenticado como: ${data.user?.name || 'Usuário'}`, 'success');
        } else {
          addLog('Não autenticado', 'warning');
        }
        
        // Verificar cookies de autenticação
        if (data.hasCookies) {
          addLog(`Encontrados ${Object.keys(data.authCookies).length} cookies de autenticação`, 'info');
        } else {
          addLog('Nenhum cookie de autenticação encontrado', 'warning');
        }
      } else {
        addLog(`Erro ao verificar autenticação: ${res.status}`, 'error');
      }
    } catch (error) {
      addLog(`Falha ao verificar autenticação: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  useEffect(() => {
    // Monitorar o console
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;

    // Helper function to safely stringify objects
    const safeStringify = (arg: any) => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg !== 'object') return String(arg);
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return '[Object cannot be stringified]';
      }
    };

    console.log = function(...args) {
      try {
        addLog(args.map(safeStringify).join(' '), 'info');
      } catch (e) {
        // Silently fail if logging causes errors
      }
      originalConsoleLog.apply(this, args);
    };

    console.error = function(...args) {
      try {
        addLog(args.map(safeStringify).join(' '), 'error');
      } catch (e) {
        // Silently fail if logging causes errors
      }
      originalConsoleError.apply(this, args);
    };

    console.warn = function(...args) {
      try {
        addLog(args.map(safeStringify).join(' '), 'warning');
      } catch (e) {
        // Silently fail if logging causes errors
      }
      originalConsoleWarn.apply(this, args);
    };

    console.info = function(...args) {
      try {
        addLog(args.map(safeStringify).join(' '), 'success');
      } catch (e) {
        // Silently fail if logging causes errors
      }
      originalConsoleInfo.apply(this, args);
    };

    // Monitorar navegação
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      addLog(`Navegação: pushState para ${args[2]}`, 'info');
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function(...args) {
      addLog(`Navegação: replaceState para ${args[2]}`, 'info');
      return originalReplaceState.apply(this, args);
    };

    // Monitorar redirecionamentos
    window.addEventListener('popstate', () => {
      addLog(`Navegação: popstate para ${window.location.href}`, 'info');
    });

    // Monitorar erros não tratados
    window.addEventListener('error', (event) => {
      addLog(`Erro não tratado: ${event.message} em ${event.filename}:${event.lineno}`, 'error');
    });

    // Monitorar rejeições de promessa não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      addLog(`Promessa rejeitada: ${event.reason}`, 'error');
    });

    // Analisar URL atual
    const currentUrl = window.location.href;
    addLog(`URL atual: ${currentUrl}`, 'info');

    // Verificar parâmetros de URL
    const url = new URL(currentUrl);
    url.searchParams.forEach((value, key) => {
      addLog(`Parâmetro URL: ${key} = ${value}`, key === 'error' ? 'error' : 'info');
    });

    // Verificar hash fragment (comum em OAuth)
    if (url.hash) {
      addLog(`Hash fragment: ${url.hash}`, 'info');
      
      // Extrair parâmetros do hash
      const hashParams = new URLSearchParams(url.hash.substring(1));
      hashParams.forEach((value, key) => {
        if (key === 'access_token' || key === 'id_token') {
          addLog(`Token detectado no hash: ${key}`, 'success');
        } else {
          addLog(`Hash param: ${key} = ${value}`, 'info');
        }
      });
    }

    // Adicionar log de inicialização
    addLog(`Debugger inicializado`, 'success');

    // Verificar status de autenticação na inicialização
    checkAuthStatus();

    // Cleanup
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.info = originalConsoleInfo;
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  if (!isExpanded) {
    return (
      <button 
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50"
        onClick={() => setIsExpanded(true)}
        title="Abrir depurador de autenticação"
      >
        🛠️
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 h-64 bg-gray-900 border-t border-gray-700 text-white z-50 flex flex-col">
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-700 bg-gray-800">
        <h3 className="font-semibold text-sm">Depurador de Autenticação</h3>
        <div className="flex space-x-2">
          <button 
            onClick={checkAuthStatus}
            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded"
            title="Verificar status de autenticação"
          >
            Verificar Auth
          </button>
          <button 
            onClick={() => setLogs([])}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Limpar
          </button>
          <button 
            onClick={() => setIsExpanded(false)}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Minimizar
          </button>
        </div>
      </div>
      
      {authStatus && (
        <div className="p-2 text-xs border-b border-gray-700 bg-gray-800">
          <span className={authStatus.isAuthenticated ? "text-green-400" : "text-red-400"}>
            {authStatus.isAuthenticated ? "✓ Autenticado" : "✗ Não autenticado"}
          </span>
          {authStatus.user && (
            <span className="ml-2 text-blue-400">
              ({authStatus.user.name})
            </span>
          )}
          {authStatus.hasCookies && (
            <span className="ml-2">
              Cookies: {Object.keys(authStatus.authCookies).length}
            </span>
          )}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-2 text-xs font-mono">
        {logs.map((log, index) => (
          <div 
            key={index} 
            className={`mb-1 border-l-2 pl-2 ${
              log.type === 'error' ? 'border-red-500 text-red-400' :
              log.type === 'success' ? 'border-green-500 text-green-400' :
              log.type === 'warning' ? 'border-yellow-500 text-yellow-400' :
              'border-blue-500 text-blue-400'
            }`}
          >
            <span className="text-gray-400 mr-2">{log.timestamp}</span>
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}
