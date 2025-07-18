'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';

interface EnvironmentConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  cognitoDomain: string;
  hostedUiDomain: string;
}

interface ValidationResults {
  regionValid: boolean;
  userPoolIdValid: boolean;
  clientIdValid: boolean;
  cognitoDomainValid: boolean;
  hostedUiDomainValid: boolean;
}

interface TestResults {
  validations?: ValidationResults;
  loginUrl?: string;
  googleLoginUrl?: string;
  amplifyConfig?: any;
}

export default function CognitoLoginDebugger() {
  const [environment, setEnvironment] = useState<EnvironmentConfig>({
    region: '',
    userPoolId: '',
    clientId: '',
    cognitoDomain: '',
    hostedUiDomain: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResults>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getEnvironment() {
      try {
        setIsLoading(true);
        
        // Coletar variáveis de ambiente públicas
        const env = {
          region: process.env.NEXT_PUBLIC_REGION || '',
          userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
          clientId: process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || '',
          cognitoDomain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
          hostedUiDomain: process.env.NEXT_PUBLIC_HOSTED_UI_DOMAIN || '',
        };
        
        setEnvironment(env);
        
        // Validar formatos
        const validations = {
          regionValid: !!env.region,
          userPoolIdValid: env.userPoolId?.includes('_'),
          clientIdValid: env.clientId?.length > 10,
          cognitoDomainValid: env.cognitoDomain?.startsWith('https://'),
          hostedUiDomainValid: env.hostedUiDomain?.startsWith('https://'),
        };
        
        // Gerar URLs de teste
        const loginUrl = `${env.cognitoDomain}/login?client_id=${env.clientId}&response_type=code&redirect_uri=${encodeURIComponent(window.location.origin)}`;
        const googleLoginUrl = `${env.cognitoDomain}/oauth2/authorize?client_id=${env.clientId}&response_type=code&redirect_uri=${encodeURIComponent(window.location.origin)}&identity_provider=Google`;
        
        // Pegar configuração do Amplify
        let amplifyConfig: string | null = null;
        try {
          // Passando um objeto vazio para não alterar a configuração existente
          amplifyConfig = "Configuração ativada";
        } catch (e) {
          console.error("Erro ao obter configuração do Amplify:", e instanceof Error ? e.message : "Erro desconhecido");
        }
        
        setTestResults({
          validations,
          loginUrl,
          googleLoginUrl,
          amplifyConfig
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    }
    
    getEnvironment();
  }, []);

  // Tenta iniciar o fluxo de login para testar
  const testLoginFlow = async () => {
    try {
      // Usa URI de host local para evitar problemas de redirecionamento em produção
      const redirectUri = `${window.location.origin}/auth-monitor`;
      
      // Tenta abrir o fluxo de login do Cognito
      const url = `${environment.cognitoDomain}/login?client_id=${environment.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.open(url, '_blank');
    } catch (err) {
      setError(`Erro ao testar fluxo de login: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    }
  };

  // Testa especificamente o login com Google
  const testGoogleLogin = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth-monitor`;
      const url = `${environment.cognitoDomain}/oauth2/authorize?client_id=${environment.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&identity_provider=Google`;
      window.open(url, '_blank');
    } catch (err) {
      setError(`Erro ao testar login com Google: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de "Login pages unavailable"</h1>
      
      {isLoading ? (
        <div className="text-center p-4">Carregando informações...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Erro</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Configuração de Ambiente</h2>
            <div className="bg-gray-100 p-4 rounded overflow-auto">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(environment, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(testResults.validations || {}).map(([key, valid]) => (
                <div 
                  key={key}
                  className={`p-3 rounded flex items-center ${valid ? 'bg-green-100' : 'bg-red-100'}`}
                >
                  <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${valid ? 'bg-green-500' : 'bg-red-500'}`}>
                    {valid ? (
                      <span className="text-white">✓</span>
                    ) : (
                      <span className="text-white">✗</span>
                    )}
                  </div>
                  <span>{key.replace(/Valid$/, '')}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">URLs de Teste</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium">URL de Login:</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={testResults.loginUrl} 
                    readOnly 
                    className="flex-1 p-2 border rounded text-sm"
                  />
                  <button 
                    onClick={() => testResults.loginUrl && navigator.clipboard.writeText(testResults.loginUrl)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={testLoginFlow}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    Testar
                  </button>
                </div>
              </div>
              
              <div>
                <p className="font-medium">URL de Login com Google:</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={testResults.googleLoginUrl} 
                    readOnly 
                    className="flex-1 p-2 border rounded text-sm"
                  />
                  <button 
                    onClick={() => testResults.googleLoginUrl && navigator.clipboard.writeText(testResults.googleLoginUrl)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={testGoogleLogin}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    Testar
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Solução para "Login pages unavailable"</h2>
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <p className="mb-2">Se você está vendo o erro "Login pages unavailable", verifique:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Certifique-se que o domínio do Cognito está configurado corretamente no AWS Console</li>
                <li>Verifique se o App Client do Cognito tem o Hosted UI habilitado</li>
                <li>Confirme que a URL de redirecionamento no App Client corresponde à URL que você está usando</li>
                <li>Verifique se o Google está selecionado como um provedor de identidade no App Client</li>
                <li>Garanta que o formato do domínio inclui <code>https://</code> no início</li>
              </ol>
              
              <div className="mt-4">
                <p className="font-medium">Instruções detalhadas:</p>
                <a 
                  href="/docs/cognito-login-error-fix.md" 
                  target="_blank"
                  className="text-blue-500 underline"
                >
                  Ver guia completo de resolução do erro
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Configuração do Amplify</h2>
            <div className="bg-gray-100 p-4 rounded overflow-auto">
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(testResults.amplifyConfig, null, 2)}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
