'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Definição de tipos para as variáveis de ambiente
type EnvVars = {
  [key: string]: string;
};

// Definição do tipo do problema
interface Problem {
  type: 'error' | 'warning';
  message: string;
  expected?: string;
  current?: string;
}

export default function EnvVariableChecker() {
  const [variables, setVariables] = useState<{
    expected: EnvVars;
    current: EnvVars;
  }>({
    // Variáveis listadas na captura de tela
    expected: {
      AM2_ACCESS_KEY_ID: 'YOUR_AWS_ACCESS_KEY_ID',
      AM2_REGION: 'us-east-2',
      AM2_SECRET_ACCESS_KEY: 'YOUR_AWS_SECRET_ACCESS_KEY',
      DYNAMO_COLLECTIONS_TABLE: 'mtg_collections',
      DYNAMO_DECKS_TABLE: 'mtg_decks',
      DYNAMO_FAVORITES_TABLE: 'mtg_favorites',
      DYNAMO_USERS_TABLE: 'mtg_users',
      GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: 'YOUR_GOOGLE_CLIENT_SECRET',
      NEXTAUTH_SECRET: 'YOUR_NEXTAUTH_SECRET',
      NEXTAUTH_URL: 'https://your-app-url.amplifyapp.com',
      NEXT_PUBLIC_API_ENDPOINT: 'https://your-api-endpoint.appsync-api.us-east-2.amazonaws.com',
      NEXT_PUBLIC_API_KEY: 'your-api-key',
      NEXT_PUBLIC_COGNITO_DOMAIN: 'your-app.auth.us-east-2.amazoncognito.com',
      NEXT_PUBLIC_REGION: 'us-east-2',
      NEXT_PUBLIC_USER_POOL_ID: 'us-east-2_GlWZQN4d2',
      NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID: '55j5l3rcp164av86djhf9epjch'
    },
    // Variáveis atualmente carregadas no sistema
    current: {
      NEXT_PUBLIC_REGION: process.env.NEXT_PUBLIC_REGION || 'não configurado',
      NEXT_PUBLIC_USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID || 'não configurado',
      NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID: process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || 'não configurado',
      NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'não configurado',
      GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'não acessível no cliente',
      GOOGLE_CLIENT_SECRET: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || 'não acessível no cliente',
    }
  });

  const [problemCount, setProblemCount] = useState(0);
  const [analysis, setAnalysis] = useState<Problem[]>([]);

  useEffect(() => {
    // Analisar problemas com as variáveis de ambiente
    const problems: Problem[] = [];
    let count = 0;

    // Verificar se as variáveis públicas do Next.js estão configuradas
    for (const key of Object.keys(variables.expected)) {
      if (key.startsWith('NEXT_PUBLIC_')) {
        const envValue = process.env[key as keyof typeof process.env];
        if (!envValue) {
          problems.push({
            type: 'error',
            message: `A variável ${key} não está disponível no ambiente.`
          });
          count++;
        } else if (envValue !== variables.expected[key]) {
          problems.push({
            type: 'warning',
            message: `A variável ${key} tem valor diferente do esperado.`,
            expected: variables.expected[key],
            current: envValue
          });
          count++;
        }
      }
    }

    // Verificar domínio do Cognito
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    if (cognitoDomain && !cognitoDomain.startsWith('https://')) {
      problems.push({
        type: 'error',
        message: 'O domínio do Cognito deve começar com https://',
        expected: `https://${variables.expected.NEXT_PUBLIC_COGNITO_DOMAIN}`,
        current: cognitoDomain
      });
      count++;
    }

    // Verificar se o Google Client ID está correto
    if (variables.current.GOOGLE_CLIENT_ID !== 'não acessível no cliente' && 
        variables.current.GOOGLE_CLIENT_ID !== variables.expected.GOOGLE_CLIENT_ID) {
      problems.push({
        type: 'warning',
        message: 'O ID do cliente Google parece estar incorreto ou exposto indevidamente como variável pública.',
        expected: variables.expected.GOOGLE_CLIENT_ID,
        current: variables.current.GOOGLE_CLIENT_ID
      });
      count++;
    }

    setAnalysis(problems);
    setProblemCount(count);
  }, [variables]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Verificador de Variáveis de Ambiente</h2>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Variáveis AWS Cognito</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variável</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Esperado</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {['AM2_REGION', 'NEXT_PUBLIC_REGION', 'NEXT_PUBLIC_USER_POOL_ID', 'NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID', 'NEXT_PUBLIC_COGNITO_DOMAIN'].map((key) => (
                <tr key={key} className={`hover:bg-gray-50 ${key === 'NEXT_PUBLIC_USER_POOL_ID' || key === 'NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID' ? 'bg-blue-50' : ''}`}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{variables.expected[key]}</code>
                    {key === 'NEXT_PUBLIC_COGNITO_DOMAIN' && !variables.expected[key].startsWith('https://') && (
                      <span className="ml-2 text-xs text-red-500">* Falta https://</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {key.startsWith('NEXT_PUBLIC_') && process.env[key as keyof typeof process.env] === variables.expected[key] ? (
                      <span className="text-green-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        Correto
                      </span>
                    ) : key.startsWith('NEXT_PUBLIC_') && process.env[key as keyof typeof process.env] ? (
                      <span className="text-yellow-600">
                        ⚠️ Diferente: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{process.env[key as keyof typeof process.env]}</code>
                      </span>
                    ) : key.startsWith('NEXT_PUBLIC_') ? (
                      <span className="text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                        </svg>
                        Não configurado
                      </span>
                    ) : (
                      <span className="text-gray-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
                        </svg>
                        Verificável apenas no servidor
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-gray-500 italic">
          * As variáveis críticas para o funcionamento do Cognito estão destacadas em azul
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Variáveis Google OAuth</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variável</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Esperado</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="bg-yellow-50 hover:bg-yellow-100">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">GOOGLE_CLIENT_ID</td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded break-all">{variables.expected.GOOGLE_CLIENT_ID}</code>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center text-yellow-700">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    <span>Verificável apenas no servidor</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <Link href="/auth-monitor/google-oauth-error" className="text-blue-600 hover:underline">
                      Use o verificador específico
                    </Link>
                  </div>
                </td>
              </tr>
              <tr className="bg-yellow-50 hover:bg-yellow-100">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">GOOGLE_CLIENT_SECRET</td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  <div>
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">GOCSPX-yaU...XH_2_Sm</code>
                    <span className="text-xs ml-1">(mascarado por segurança)</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Formato: <code className="bg-gray-100 px-1 rounded">GOCSPX-[caracteres]</code>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center text-yellow-700">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    <span>Verificável apenas no servidor</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <Link href="/auth-monitor/google-oauth-error" className="text-blue-600 hover:underline">
                      Use o verificador específico
                    </Link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-gray-500 italic">
          * Estas variáveis são críticas para o funcionamento da autenticação Google OAuth
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Variáveis DynamoDB</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variável</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Esperado</th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {['DYNAMO_COLLECTIONS_TABLE', 'DYNAMO_DECKS_TABLE', 'DYNAMO_FAVORITES_TABLE', 'DYNAMO_USERS_TABLE'].map((key) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{variables.expected[key]}</code>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                      <span>Verificável apenas no servidor</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-gray-500 italic">
          * Estas variáveis são necessárias para acesso ao banco de dados
        </div>
      </div>
      
      {analysis.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
          <h3 className="font-medium text-yellow-800 mb-2">Problemas detectados: {problemCount}</h3>
          <ul className="list-disc pl-5 space-y-1 text-yellow-700">
            {analysis.map((problem, index) => (
              <li key={index} className={problem.type === 'error' ? 'text-red-600' : 'text-yellow-600'}>
                {problem.message}
                {problem.expected && problem.current && (
                  <div className="ml-4 text-sm">
                    <div>Esperado: <code className="bg-gray-100 px-1 py-0.5 rounded">{problem.expected}</code></div>
                    <div>Atual: <code className="bg-gray-100 px-1 py-0.5 rounded">{problem.current}</code></div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded mt-4">
        <h3 className="font-medium text-blue-800 mb-2">Observações importantes</h3>
        <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
          <li>
            <strong>Variáveis do lado do servidor</strong> (sem prefixo NEXT_PUBLIC_) não podem ser verificadas diretamente no navegador.
          </li>
          <li>
            O segredo do cliente Google <strong>não deve</strong> ser exposto como variável pública (NEXT_PUBLIC_).
          </li>
          <li>
            Verifique se o domínio do Cognito está configurado com o prefixo <code>https://</code>.
          </li>
          <li>
            Todas as variáveis devem estar definidas no arquivo <code>.env.local</code> para desenvolvimento local.
          </li>
        </ul>
      </div>
      
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
        <h3 className="font-medium text-red-800 mb-2">Problemas com API de Sessão</h3>
        <p className="mb-2 text-red-700">
          Se você está enfrentando o erro <code className="bg-gray-100 px-1 py-0.5 rounded">Unexpected token '&lt;', ... is not valid JSON</code> na API de sessão,
          utilize o depurador específico para essa questão:
        </p>
        <Link href="/auth-monitor/session-debugger" className="inline-block mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Acessar Depurador de API de Sessão
        </Link>
      </div>
    </div>
  );
}
