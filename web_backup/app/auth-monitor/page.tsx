"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthTroubleshooter from '@/components/AuthTroubleshooter';
import AuthDebugger from '@/components/AuthDebugger';
import GoogleOAuthDiagnostic from '@/components/GoogleOAuthDiagnostic';
import GoogleAuthValidator from '@/components/GoogleAuthValidator';
import CognitoHostedUIDebugger from '@/components/CognitoHostedUIDebugger';
import CognitoCheckResult from '@/components/CognitoCheckResult';

interface AuthEvent {
  timestamp: string;
  type: string;
  details: string;
}

export default function GoogleAuthMonitor() {
  const [events, setEvents] = useState<AuthEvent[]>([]);
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});
  const [hashParams, setHashParams] = useState<Record<string, string>>({});
  const [authUrl, setAuthUrl] = useState<string>('');
  const [debugMode, setDebugMode] = useState(false);
  const [activeTab, setActiveTab] = useState('monitor'); // Adicionado estado para aba ativa

  // Função para adicionar eventos ao log
  const addEvent = (type: string, details: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
    
    setEvents(prev => [
      { timestamp, type, details },
      ...prev
    ]);

    // Também registrar no console para mais detalhes
    console.log(`[Auth Monitor] ${type}: ${details}`);
  };

  // Analisar parâmetros da URL ao carregar a página
  useEffect(() => {
    try {
      // Marcar o início do monitoramento
      addEvent('Monitor', 'Inicializado Monitor de Autenticação');

      // Capturar eventos de redirecionamento
      const captureRedirects = () => {
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;

        window.history.pushState = function(...args) {
          addEvent('Navigation', `pushState to: ${args[2]}`);
          return originalPushState.apply(this, args);
        };

        window.history.replaceState = function(...args) {
          addEvent('Navigation', `replaceState to: ${args[2]}`);
          return originalReplaceState.apply(this, args);
        };

        // Capturar navegações e redirecionamentos
        window.addEventListener('popstate', () => {
          addEvent('Navigation', `popstate: ${window.location.href}`);
        });
      };

      captureRedirects();

      // Analisar parâmetros da URL atual
      const currentUrl = window.location.href;
      addEvent('Page Load', `URL: ${currentUrl}`);

      // Extrair e analisar parâmetros
      const url = new URL(currentUrl);
      const params: Record<string, string> = {};
      
      url.searchParams.forEach((value, key) => {
        params[key] = value;
        addEvent('URL Param', `${key} = ${value}`);
      });
      
      setUrlParams(params);

      // Analisar parâmetros do hash fragment (comum em OAuth implícito)
      const hash = window.location.hash.substring(1);
      if (hash) {
        addEvent('Hash Fragment', `Detectado hash: ${hash}`);
        
        const hashParameters: Record<string, string> = {};
        hash.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            hashParameters[key] = decodeURIComponent(value);
            addEvent('Hash Param', `${key} = ${decodeURIComponent(value)}`);
          }
        });
        
        setHashParams(hashParameters);
      }

      // Verificar se há um erro de autenticação
      if (params.error) {
        addEvent('Auth Error', `Error: ${params.error}, Description: ${params.error_description || 'None'}`);
      }

      // Verificar se há um código de autenticação (sucesso)
      if (params.code) {
        addEvent('Auth Success', `Received authorization code`);
      }

      // Verificar se há um código de estado
      if (params.state) {
        addEvent('Auth State', `State: ${params.state}`);
      }

      // Verificar tokens no hash (fluxo implícito)
      if (hashParams.id_token || hashParams.access_token) {
        addEvent('Auth Tokens', 'Tokens detectados no hash da URL');
      }

      // Monitorar mensagens de erro no console
      const originalConsoleError = console.error;
      console.error = function(...args) {
        addEvent('Console Error', args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
        originalConsoleError.apply(this, args);
      };

      // Configurar captura de erros não tratados
      window.addEventListener('error', (event) => {
        addEvent('Unhandled Error', `${event.message} at ${event.filename}:${event.lineno}`);
      });

      // Configurar captura de rejeições de promessas não tratadas
      window.addEventListener('unhandledrejection', (event) => {
        addEvent('Promise Rejection', event.reason.toString());
      });
      
      // Verificar cookies de autenticação
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name && (
          name.includes('amplify') || 
          name.includes('next-auth') || 
          name.includes('cognito')
        )) {
          addEvent('Auth Cookie', `Detected: ${name}`);
        }
      });
    } catch (error) {
      addEvent('Monitor Error', `Error setting up monitoring: ${error}`);
    }
  }, []);

  // Construir URL de autenticação do Google
  const generateGoogleAuthUrl = () => {
    try {
      // Parâmetros da URL de autenticação do Google
      const baseUrl = 'https://mtghelper.auth.us-east-2.amazoncognito.com/oauth2/authorize';
      const clientId = '55j5l3rcp164av86djhf9qpjch';
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth-monitor`);
      const responseType = 'code';
      const identityProvider = 'Google';
      const scope = 'openid+profile+email';
      
      // Gerar estado aleatório para segurança
      const state = Math.random().toString(36).substring(2, 15);
      
      const url = `${baseUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&identity_provider=${identityProvider}&scope=${scope}&state=${state}`;
      
      setAuthUrl(url);
      addEvent('URL Generated', 'Google Auth URL generated');
      
      return url;
    } catch (error) {
      addEvent('URL Generation Error', `Failed to generate auth URL: ${error}`);
      return '';
    }
  };

  // Iniciar o login com Google
  const startGoogleLogin = () => {
    try {
      const url = generateGoogleAuthUrl();
      if (url) {
        addEvent('Login Attempt', `Redirecting to Google Auth URL`);
        window.location.href = url;
      }
    } catch (error) {
      addEvent('Login Error', `Error starting Google login: ${error}`);
    }
  };
  
  // Tentar login direto com o AWS Cognito Hosted UI
  const startCognitoHostedUI = () => {
    try {
      // Parâmetros da URL do Hosted UI
      const baseUrl = 'https://mtghelper.auth.us-east-2.amazoncognito.com/login';
      const clientId = '55j5l3rcp164av86djhf9qpjch';
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth-monitor`);
      const responseType = 'code';
      
      const url = `${baseUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}`;
      
      addEvent('Login Attempt', `Redirecting to Cognito Hosted UI`);
      window.location.href = url;
    } catch (error) {
      addEvent('Login Error', `Error starting Cognito Hosted UI: ${error}`);
    }
  };

  // Função para limpar o log de eventos
  const clearEvents = () => {
    setEvents([]);
    addEvent('System', 'Log cleared');
  };

  // Verifica status da sessão
  const checkSession = async () => {
    addEvent('Session', 'Verificando status da sessão...');
    
    try {
      // Verificar token NextAuth
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      
      if (data && Object.keys(data).length > 0 && data.user) {
        addEvent('Session', `NextAuth: Sessão autenticada - ${JSON.stringify(data.user)}`);
      } else {
        addEvent('Session', 'NextAuth: Sem sessão ativa');
      }
      
      // Verificar Amplify
      try {
        // Importar dinamicamente para evitar erros de SSR
        const { getCurrentUser } = await import('@/lib/aws-auth-adapter');
        
        try {
          const currentUser = await getCurrentUser();
          addEvent('Session', `Amplify: Usuário autenticado - ${JSON.stringify(currentUser)}`);
          
          // Remover todos os usos de fetchUserAttributes e acessar os atributos diretamente de currentUser se necessário.
        } catch (userError) {
          addEvent('Session', 'Amplify: Nenhum usuário autenticado');
        }
      } catch (importError) {
        addEvent('Session', `Amplify: Erro ao importar - ${importError}`);
      }
    } catch (error) {
      addEvent('Session Error', `Erro ao verificar sessão: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Monitor de Autenticação Google</h1>
      
      {/* Tabs de navegação */}
      <div className="flex mb-6 border-b border-gray-700">
        <div 
          className={`px-4 py-2 cursor-pointer ${activeTab === 'monitor' 
            ? 'border-b-2 border-blue-500 font-medium' 
            : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('monitor')}
        >
          Monitor
        </div>
        <div 
          className={`px-4 py-2 cursor-pointer ${activeTab === 'diagnostic' 
            ? 'border-b-2 border-blue-500 font-medium' 
            : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('diagnostic')}
        >
          Diagnóstico OAuth
        </div>
        <div 
          className={`px-4 py-2 cursor-pointer ${activeTab === 'validator' 
            ? 'border-b-2 border-blue-500 font-medium' 
            : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('validator')}
        >
          Validador OAuth
        </div>
        <div 
          className={`px-4 py-2 cursor-pointer ${activeTab === 'debug' 
            ? 'border-b-2 border-blue-500 font-medium' 
            : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('debug')}
        >
          Depurador
        </div>
      </div>
      
      {activeTab === 'diagnostic' && (
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <GoogleOAuthDiagnostic />
        </div>
      )}

      {activeTab === 'validator' && (
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <GoogleAuthValidator />
          <CognitoCheckResult />
        </div>
      )}
      
      {activeTab === 'debug' && (
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <AuthDebugger />
          <div className="mt-6">
            <CognitoHostedUIDebugger />
          </div>
        </div>
      )}
      
      {activeTab === 'monitor' && (
        <>
          {/* Componente solucionador de problemas */}
          <div className="mb-6">
            <AuthTroubleshooter />
          </div>
        </>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Controles</h2>
          
          <div className="space-y-4">
            <button
              onClick={startGoogleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full"
            >
              Iniciar Login com Google
            </button>
            
            <button
              onClick={startCognitoHostedUI}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md w-full"
            >
              Usar Hosted UI do Cognito
            </button>
            
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Ferramentas de Diagnóstico</h3>
              
              <div className="space-y-3">
                <a 
                  href="/auth-monitor/dashboard" 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full block text-center"
                >
                  Dashboard de Autenticação
                </a>
                
                <a 
                  href="/auth-monitor/login-debugger" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md w-full block text-center"
                >
                  Debugger de "Login pages unavailable"
                </a>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Documentação</h3>
              
              <div className="space-y-3">
                <a 
                  href="/docs/cognito-setup-guide.md" 
                  target="_blank"
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md w-full block text-center"
                >
                  Guia de Configuração do Cognito
                </a>
                
                <a 
                  href="/docs/cognito-login-error-fix.md" 
                  target="_blank"
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md w-full block text-center"
                >
                  Resolver "Login pages unavailable"
                </a>
              </div>
            </div>
            
            <button
              onClick={checkSession}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full"
            >
              Verificar Status da Sessão
            </button>
            
            <button
              onClick={clearEvents}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md w-full"
            >
              Limpar Log
            </button>
            
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md w-full"
            >
              {debugMode ? "Ocultar Depurador" : "Mostrar Depurador Avançado"}
            </button>
            
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md w-full"
            >
              Voltar para Página de Login
            </button>
          </div>
          
          {authUrl && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">URL de Autenticação:</h3>
              <div className="bg-gray-900 p-3 rounded-md overflow-x-auto">
                <code className="text-xs text-green-400 break-all">{authUrl}</code>
              </div>
            </div>
          )}
          
          {Object.keys(urlParams).length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Parâmetros da URL:</h3>
              <div className="bg-gray-900 p-3 rounded-md">
                <pre className="text-xs text-yellow-400 overflow-x-auto">
                  {JSON.stringify(urlParams, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {Object.keys(hashParams).length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Parâmetros do Hash:</h3>
              <div className="bg-gray-900 p-3 rounded-md">
                <pre className="text-xs text-blue-400 overflow-x-auto">
                  {JSON.stringify(hashParams, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Log de Eventos</h2>
          
          <div className="h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-2 px-3 text-left">Timestamp</th>
                  <th className="py-2 px-3 text-left">Tipo</th>
                  <th className="py-2 px-3 text-left">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-2 px-3 font-mono text-xs">{event.timestamp}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-block px-2 py-1 rounded-md text-xs ${
                        event.type.includes('Error') 
                          ? 'bg-red-900 text-red-200' 
                          : event.type === 'Auth Success' || event.type === 'Session'
                            ? 'bg-green-900 text-green-200'
                            : 'bg-blue-900 text-blue-200'
                      }`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 break-all">
                      <div className="max-w-lg overflow-x-auto">{event.details}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Depurador flutuante (só aparece quando ativado) */}
      {debugMode && <AuthDebugger />}

      {/* Componente de diagnóstico OAuth (abaixo do monitor) */}
      <div className="mt-6">
        <GoogleOAuthDiagnostic />
      </div>
    </div>
  );
}
