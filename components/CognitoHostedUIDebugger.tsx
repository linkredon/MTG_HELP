'use client';

import { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function CognitoHostedUIDebugger() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailedInfo, setDetailedInfo] = useState<any>(null);

  // Teste direto do Cognito Hosted UI
  const testHostedUI = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      // Obter a URL atual da aplicação
      const currentUrl = window.location.origin;
      
      // Obter configuração do Amplify
      const configuration = Amplify.getConfig();
      
      // Construir URL do Hosted UI diretamente
      const region = process.env.NEXT_PUBLIC_REGION || 'us-east-2';
      const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID || 'us-east-2_GIWZQN4d2';
      const clientId = process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || '55j5l3rcp164av86djhf9qpjch';
      const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'mtghelper.auth.us-east-2.amazoncognito.com';
      
      // Verifique se o domínio já tem https://
      const domainUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
      
      // Criar URL de login direta para testar
      const directLoginUrl = `${domainUrl}/login?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(currentUrl)}`;
      
      // Também criar URL para o endpoint OAuth
      const oauthUrl = `${domainUrl}/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(currentUrl)}&identity_provider=Google`;
      
      // Informações detalhadas
      setDetailedInfo({
        amplifyConfig: configuration,
        userPoolId,
        clientId,
        domain,
        domainUrl,
        directLoginUrl,
        oauthUrl,
        currentUrl,
        envVars: {
          NEXT_PUBLIC_REGION: process.env.NEXT_PUBLIC_REGION,
          NEXT_PUBLIC_USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID,
          NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID: process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID,
          NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
          NEXT_PUBLIC_HOSTED_UI_DOMAIN: process.env.NEXT_PUBLIC_HOSTED_UI_DOMAIN,
        }
      });

      setTestResult('Informações geradas com sucesso. Verifique abaixo os detalhes e links para teste.');
    } catch (error) {
      console.error('Erro ao testar Hosted UI:', error);
      setTestResult(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Tenta login direto com o AWS Cognito Hosted UI
  const openHostedUI = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Debugador do Cognito Hosted UI</h2>
      
      <button
        onClick={testHostedUI}
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        disabled={isLoading}
      >
        {isLoading ? 'Testando...' : 'Gerar Links e Detalhes'}
      </button>
      
      {testResult && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600 rounded-md">
          <p>{testResult}</p>
        </div>
      )}

      {detailedInfo && (
        <div className="space-y-4">
          <div className="p-3 bg-gray-900 rounded-md">
            <h3 className="font-semibold text-white mb-2">Links para Teste:</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Hosted UI Login (direto):</span>
                  <button 
                    onClick={() => openHostedUI(detailedInfo.directLoginUrl)}
                    className="bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded"
                  >
                    Abrir
                  </button>
                </div>
                <div className="bg-gray-800 p-2 rounded text-xs text-blue-400 break-all mt-1">
                  {detailedInfo.directLoginUrl}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">OAuth com Google:</span>
                  <button 
                    onClick={() => openHostedUI(detailedInfo.oauthUrl)}
                    className="bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded"
                  >
                    Abrir
                  </button>
                </div>
                <div className="bg-gray-800 p-2 rounded text-xs text-blue-400 break-all mt-1">
                  {detailedInfo.oauthUrl}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-900 rounded-md">
            <h3 className="font-semibold text-white mb-2">Configurações Atuais:</h3>
            <pre className="bg-gray-800 p-2 rounded text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(detailedInfo.envVars, null, 2)}
            </pre>
          </div>
          
          <div className="p-3 bg-gray-900 rounded-md">
            <h3 className="font-semibold text-white mb-2">Configuração Amplify:</h3>
            <pre className="bg-gray-800 p-2 rounded text-xs text-gray-300 overflow-x-auto max-h-60">
              {JSON.stringify(detailedInfo.amplifyConfig, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-600 rounded-md">
        <h3 className="font-semibold text-lg mb-2">Possíveis problemas:</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>O domínio do Cognito não está configurado corretamente no AWS Console</li>
          <li>O cliente OAuth não tem permissão para usar o Hosted UI</li>
          <li>O Hosted UI não está habilitado para o User Pool</li>
          <li>As URLs de redirecionamento no cliente OAuth não incluem a URL atual</li>
          <li>O provedor de identidade Google não está configurado corretamente</li>
          <li>Os segredos do cliente OAuth estão incorretos</li>
        </ul>
      </div>
    </div>
  );
}
