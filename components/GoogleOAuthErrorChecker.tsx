'use client';

import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';

export default function GoogleOAuthErrorChecker() {
  const [diagnosticResults, setDiagnosticResults] = useState<{
    googleClientId: string | null;
    googleClientSecret: string | null;
    cognitoClientId: string | null;
    cognitoRegion: string | null;
    cognitoDomain: string | null;
    redirectUris: string[] | null;
    commonProblems: string[];
  }>({
    googleClientId: null,
    googleClientSecret: null,
    cognitoClientId: null,
    cognitoRegion: null,
    cognitoDomain: null,
    redirectUris: null,
    commonProblems: [],
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      // Coletar informações de configuração
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || null;
      let googleClientSecret = null;
      // O segredo do cliente não deve estar disponível no frontend, mas verificamos por motivos de diagnóstico
      if (typeof window !== 'undefined') {
        try {
          // Verificar se há alguma configuração do Amplify
          const config = Amplify.configure({});
          console.log('Configuração atual do Amplify:', config);
        } catch (err) {
          console.error('Erro ao verificar configuração do Amplify:', err);
        }
      }

      const cognitoClientId = process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || null;
      const cognitoRegion = process.env.NEXT_PUBLIC_REGION || null;
      const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || null;
      
      // Coletar URIs de redirecionamento configurados
      const redirectUris = [
        process.env.OAUTH_REDIRECT_SIGNIN || '',
        process.env.OAUTH_REDIRECT_SIGNIN_PRODUCTION || '',
        process.env.NEXT_PUBLIC_REDIRECT_SIGNIN || '',
        window.location.origin || '',
        'http://localhost:3000',
        'http://localhost:3001'
      ].filter(Boolean);

      // Identificar problemas comuns
      const commonProblems: string[] = [];
      
      if (!googleClientId) {
        commonProblems.push('Google Client ID não está configurado');
      }
      
      if (!cognitoClientId) {
        commonProblems.push('AWS Cognito Client ID não está configurado');
      }
      
      if (!cognitoDomain) {
        commonProblems.push('Domínio do Cognito não está configurado');
      } else if (!cognitoDomain.startsWith('https://')) {
        commonProblems.push('Domínio do Cognito deve começar com https://');
      }
      
      if (redirectUris.length === 0) {
        commonProblems.push('Nenhum URI de redirecionamento configurado');
      }
      
      // Verificar erro 401 invalid_client
      commonProblems.push('O erro "401 invalid_client" geralmente indica que:');
      commonProblems.push('1. As credenciais do cliente Google OAuth (ID e Secret) não correspondem às configuradas no Cognito.');
      commonProblems.push('2. O projeto no Google Cloud Console não tem o OAuth ativado corretamente.');
      commonProblems.push('3. Os URIs de redirecionamento no Google Cloud Console não incluem o domínio do Cognito.');
      
      setDiagnosticResults({
        googleClientId,
        googleClientSecret,
        cognitoClientId,
        cognitoRegion,
        cognitoDomain,
        redirectUris,
        commonProblems,
      });
    };

    runDiagnostics();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-red-600">Diagnóstico de Erro Google OAuth</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Erro Detectado: Google Error - 401 invalid_client Unauthorized</h3>
        <p className="text-gray-700 mb-3">
          Este erro ocorre quando as credenciais OAuth do Google não são reconhecidas ou não estão configuradas corretamente.
          O Google não consegue validar o cliente OAuth que está fazendo a solicitação.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border border-gray-200 rounded p-4">
          <h3 className="font-medium mb-2">Configurações do Google</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Google Client ID:</span>{' '}
              {diagnosticResults.googleClientId ? (
                <code className="bg-gray-100 px-1 py-0.5 rounded">{diagnosticResults.googleClientId.substring(0, 10)}...</code>
              ) : (
                <span className="text-red-600">Não configurado</span>
              )}
            </div>
            <div>
              <span className="font-medium">Google Client Secret:</span>{' '}
              {diagnosticResults.googleClientSecret ? (
                <span className="text-green-600">Configurado</span>
              ) : (
                <span className="text-yellow-600">Não disponível no frontend (esperado)</span>
              )}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded p-4">
          <h3 className="font-medium mb-2">Configurações do AWS Cognito</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Cognito Client ID:</span>{' '}
              {diagnosticResults.cognitoClientId ? (
                <code className="bg-gray-100 px-1 py-0.5 rounded">{diagnosticResults.cognitoClientId.substring(0, 10)}...</code>
              ) : (
                <span className="text-red-600">Não configurado</span>
              )}
            </div>
            <div>
              <span className="font-medium">Região:</span>{' '}
              {diagnosticResults.cognitoRegion || <span className="text-red-600">Não configurada</span>}
            </div>
            <div>
              <span className="font-medium">Domínio:</span>{' '}
              {diagnosticResults.cognitoDomain || <span className="text-red-600">Não configurado</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-2">URIs de Redirecionamento Detectados</h3>
        {diagnosticResults.redirectUris && diagnosticResults.redirectUris.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {diagnosticResults.redirectUris.map((uri, index) => (
              <li key={index}><code>{uri}</code></li>
            ))}
          </ul>
        ) : (
          <p className="text-red-600">Nenhum URI de redirecionamento configurado</p>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <h3 className="font-medium mb-2 text-yellow-800">Problemas Identificados</h3>
        <ul className="list-disc pl-5 space-y-1 text-yellow-700">
          {diagnosticResults.commonProblems.map((problem, index) => (
            <li key={index}>{problem}</li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <h3 className="font-medium mb-2 text-blue-800">Passos para Resolver</h3>
        <ol className="list-decimal pl-5 space-y-2 text-blue-700">
          <li>
            <strong>Verifique suas credenciais no Google Cloud Console:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li>Acesse <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console &gt; APIs &amp; Services &gt; Credentials</a></li>
              <li>Confirme que o ID do cliente e o segredo estão corretos</li>
              <li>Verifique se o projeto está ativado</li>
            </ul>
          </li>
          <li>
            <strong>Atualize suas configurações no AWS Cognito:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li>No console AWS, vá para Cognito &gt; User Pools &gt; App integration &gt; App client settings</li>
              <li>Atualize o ID do cliente e o segredo do Google</li>
              <li>Verifique se os URIs de redirecionamento estão configurados corretamente</li>
            </ul>
          </li>
          <li>
            <strong>Atualize as variáveis de ambiente em seu arquivo .env.local:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li>GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET</li>
              <li>NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID</li>
              <li>NEXT_PUBLIC_COGNITO_DOMAIN (com https:// no início)</li>
            </ul>
          </li>
          <li>
            <strong>Verifique os URIs de redirecionamento no Google Cloud Console:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li>Adicione seu domínio do Cognito como URI autorizado: <code>{diagnosticResults.cognitoDomain}/oauth2/idpresponse</code></li>
              <li>Adicione todos os URIs de redirecionamento necessários</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}
