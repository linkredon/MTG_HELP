'use client';

import { useState, useEffect } from 'react';

interface ConfigInfo {
  domainConfig: {
    NEXT_PUBLIC_COGNITO_DOMAIN: string;
    NEXT_PUBLIC_HOSTED_UI_DOMAIN: string;
    OAUTH_DOMAIN: string;
  };
  userPoolConfig: {
    NEXT_PUBLIC_USER_POOL_ID: string;
    NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID: string;
    NEXT_PUBLIC_REGION: string;
  };
  redirectConfig: {
    OAUTH_REDIRECT_SIGNIN: string;
    OAUTH_REDIRECT_SIGNOUT: string;
    OAUTH_REDIRECT_SIGNIN_PRODUCTION: string;
    OAUTH_REDIRECT_SIGNOUT_PRODUCTION: string;
  };
  loginPageUrl: string;
  oauthUrl: string;
}

interface Issue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
}

interface ApiResponse {
  status: string;
  configInfo: ConfigInfo;
  issues: Issue[];
  possibleSolutions: string[];
}

export default function CognitoCheckResult() {
  const [apiResult, setApiResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cognito-check');
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      setApiResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };
  
  // Abrir URL em uma nova aba
  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">Verificador de Cognito Hosted UI</h2>
      
      <button
        onClick={fetchData}
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        disabled={loading}
      >
        {loading ? 'Verificando...' : 'Verificar Configuração Cognito'}
      </button>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded-md">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {apiResult && (
        <div className="space-y-6">
          {/* URLs para Teste */}
          <div className="p-4 bg-gray-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">URLs para Teste</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Página de Login Cognito:</span>
                  <button 
                    onClick={() => openUrl(apiResult.configInfo.loginPageUrl)}
                    className="bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded"
                  >
                    Abrir
                  </button>
                </div>
                <div className="bg-gray-800 p-2 rounded text-xs text-blue-400 break-all mt-1">
                  {apiResult.configInfo.loginPageUrl}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Login com Google:</span>
                  <button 
                    onClick={() => openUrl(apiResult.configInfo.oauthUrl)}
                    className="bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded"
                  >
                    Abrir
                  </button>
                </div>
                <div className="bg-gray-800 p-2 rounded text-xs text-blue-400 break-all mt-1">
                  {apiResult.configInfo.oauthUrl}
                </div>
              </div>
            </div>
          </div>
          
          {/* Problemas Encontrados */}
          {apiResult.issues.length > 0 && (
            <div className="p-4 bg-gray-900 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-yellow-500">
                Problemas Encontrados ({apiResult.issues.length})
              </h3>
              
              <div className="space-y-3">
                {apiResult.issues.map((issue, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-md border ${
                      issue.severity === 'critical' ? 'border-red-600 bg-red-900/20' :
                      issue.severity === 'high' ? 'border-orange-600 bg-orange-900/20' :
                      'border-yellow-600 bg-yellow-900/20'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className={`inline-block w-2 h-2 mt-1.5 mr-2 rounded-full ${
                        issue.severity === 'critical' ? 'bg-red-500' :
                        issue.severity === 'high' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`}></span>
                      <div>
                        <span className="font-medium">{issue.message}</span>
                        <div className="text-xs text-gray-400 mt-1">{issue.type}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Possíveis Soluções */}
          {apiResult.possibleSolutions.length > 0 && (
            <div className="p-4 bg-gray-900 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-green-500">Possíveis Soluções</h3>
              
              <ul className="list-disc pl-5 space-y-2">
                {apiResult.possibleSolutions.map((solution, idx) => (
                  <li key={idx} className="text-gray-300">{solution}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Configurações Atuais */}
          <div className="p-4 bg-gray-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Configurações Atuais</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-800 rounded-md">
                <h4 className="font-medium text-blue-400 mb-2">Configuração de Domínio</h4>
                <ul className="space-y-2 text-sm">
                  {Object.entries(apiResult.configInfo.domainConfig).map(([key, value]) => (
                    <li key={key}>
                      <span className="text-gray-400">{key}:</span>{' '}
                      <span className="text-white break-all">{value || 'Não configurado'}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-3 bg-gray-800 rounded-md">
                <h4 className="font-medium text-blue-400 mb-2">Configuração do User Pool</h4>
                <ul className="space-y-2 text-sm">
                  {Object.entries(apiResult.configInfo.userPoolConfig).map(([key, value]) => (
                    <li key={key}>
                      <span className="text-gray-400">{key}:</span>{' '}
                      <span className="text-white break-all">{value || 'Não configurado'}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-3 bg-gray-800 rounded-md lg:col-span-2">
                <h4 className="font-medium text-blue-400 mb-2">URLs de Redirecionamento</h4>
                <ul className="space-y-2 text-sm">
                  {Object.entries(apiResult.configInfo.redirectConfig).map(([key, value]) => (
                    <li key={key}>
                      <span className="text-gray-400">{key}:</span>{' '}
                      <span className="text-white break-all">{value || 'Não configurado'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600 rounded-md">
        <h3 className="font-semibold mb-2">Passos para resolver erro "Login pages unavailable":</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Verifique se o domínio do Cognito está configurado no AWS Console</li>
          <li>Confirme se o App Client tem o Hosted UI habilitado no console AWS</li>
          <li>Verifique se todas as URLs de redirecionamento estão registradas no App Client</li>
          <li>Certifique-se de que o provedor de identidade Google esteja corretamente configurado</li>
          <li>Teste com as URLs geradas para identificar o problema específico</li>
        </ol>
        
        <div className="mt-4">
          <a 
            href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Documentação de Integração do Cognito User Pools
          </a>
        </div>
      </div>
    </div>
  );
}
