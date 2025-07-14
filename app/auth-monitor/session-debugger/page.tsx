'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Interface para representar um teste de sessão
interface SessionTest {
  id: string;
  description: string;
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  result?: any;
  error?: string;
}

export default function ApiSessionDebugger() {
  const [tests, setTests] = useState<SessionTest[]>([
    {
      id: 'direct-fetch',
      description: 'Chamada direta para API de sessão',
      endpoint: '/api/auth/session',
      method: 'GET',
      status: 'pending'
    },
    {
      id: 'headers-fetch',
      description: 'Chamada com cabeçalhos personalizados',
      endpoint: '/api/auth/session',
      method: 'GET',
      status: 'pending'
    },
    {
      id: 'validate-json',
      description: 'Validar formato JSON da resposta',
      endpoint: '/api/auth/session',
      method: 'GET',
      status: 'pending'
    }
  ]);
  
  // Função para executar os testes
  const runTests = async () => {
    // Reiniciar o status dos testes
    setTests(tests.map(test => ({ ...test, status: 'pending', result: undefined, error: undefined })));
    
    // Teste 1: Chamada direta
    try {
      const directResponse = await fetch('/api/auth/session');
      const directResponseClone = directResponse.clone();
      let responseText = '';
      
      try {
        // Tentar obter o texto bruto primeiro
        responseText = await directResponseClone.text();
        
        // Agora tentar parsear como JSON
        const directData = JSON.parse(responseText);
        
        setTests(current => 
          current.map(test => 
            test.id === 'direct-fetch' 
              ? { 
                  ...test, 
                  status: 'success', 
                  result: directData,
                  error: undefined
                } 
              : test
          )
        );
      } catch (error) {
        setTests(current => 
          current.map(test => 
            test.id === 'direct-fetch' 
              ? { 
                  ...test, 
                  status: 'error', 
                  error: `Erro ao parsear resposta: ${(error as Error).message}. Resposta bruta: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`,
                  result: undefined
                } 
              : test
          )
        );
      }
    } catch (error) {
      setTests(current => 
        current.map(test => 
          test.id === 'direct-fetch' 
            ? { 
                ...test, 
                status: 'error', 
                error: `Falha na chamada: ${(error as Error).message}`,
                result: undefined
              } 
            : test
        )
      );
    }
    
    // Teste 2: Chamada com cabeçalhos personalizados
    try {
      const headersResponse = await fetch('/api/auth/session', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Debug-Mode': 'true'
        }
      });
      
      try {
        const headersData = await headersResponse.json();
        
        setTests(current => 
          current.map(test => 
            test.id === 'headers-fetch' 
              ? { 
                  ...test, 
                  status: 'success', 
                  result: headersData,
                  error: undefined
                } 
              : test
          )
        );
      } catch (error) {
        const responseText = await headersResponse.text();
        
        setTests(current => 
          current.map(test => 
            test.id === 'headers-fetch' 
              ? { 
                  ...test, 
                  status: 'error', 
                  error: `Erro ao parsear resposta: ${(error as Error).message}. Resposta bruta: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`,
                  result: undefined
                } 
              : test
          )
        );
      }
    } catch (error) {
      setTests(current => 
        current.map(test => 
          test.id === 'headers-fetch' 
            ? { 
                ...test, 
                status: 'error', 
                error: `Falha na chamada: ${(error as Error).message}`,
                result: undefined
              } 
            : test
        )
      );
    }
    
    // Teste 3: Validar formato JSON
    try {
      const validateResponse = await fetch('/api/auth/session', {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const contentType = validateResponse.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (isJson) {
        try {
          const validateData = await validateResponse.json();
          
          setTests(current => 
            current.map(test => 
              test.id === 'validate-json' 
                ? { 
                    ...test, 
                    status: 'success', 
                    result: {
                      contentType,
                      isValidJson: true,
                      data: validateData
                    },
                    error: undefined
                  } 
                : test
            )
          );
        } catch (error) {
          setTests(current => 
            current.map(test => 
              test.id === 'validate-json' 
                ? { 
                    ...test, 
                    status: 'error', 
                    error: `Content-Type é application/json mas falha ao parsear: ${(error as Error).message}`,
                    result: {
                      contentType,
                      isValidJson: false
                    }
                  } 
                : test
            )
          );
        }
      } else {
        const responseText = await validateResponse.text();
        
        setTests(current => 
          current.map(test => 
            test.id === 'validate-json' 
              ? { 
                  ...test, 
                  status: 'error', 
                  error: `Content-Type não é application/json: ${contentType || 'não definido'}`,
                  result: {
                    contentType,
                    isValidJson: false,
                    responseText: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
                  }
                } 
              : test
          )
        );
      }
    } catch (error) {
      setTests(current => 
        current.map(test => 
          test.id === 'validate-json' 
            ? { 
                ...test, 
                status: 'error', 
                error: `Falha na chamada: ${(error as Error).message}`,
                result: undefined
              } 
            : test
        )
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Depurador de API de Sessão</h1>
          <button 
            onClick={runTests}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Executar Testes
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Esta ferramenta diagnostica problemas com a API <code className="bg-gray-100 px-1 py-0.5 rounded">/api/auth/session</code>, 
          que está retornando um erro de token inesperado (<code className="bg-gray-100 px-1 py-0.5 rounded">Unexpected token &lt;</code>).
        </p>
        
        <div className="space-y-4">
          {tests.map((test) => (
            <div key={test.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{test.description}</h3>
                  <div className="text-sm text-gray-500">
                    <span className="font-mono">{test.method}</span> {test.endpoint}
                  </div>
                </div>
                <div>
                  {test.status === 'pending' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Pendente
                    </span>
                  )}
                  {test.status === 'success' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Sucesso
                    </span>
                  )}
                  {test.status === 'error' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Erro
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                {test.status === 'pending' && (
                  <div className="text-gray-500 italic">Clique em "Executar Testes" para iniciar...</div>
                )}
                
                {test.status === 'success' && test.result && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Resultado:</h4>
                    <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(test.result, null, 2)}
                    </pre>
                  </div>
                )}
                
                {test.status === 'error' && (
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2">Erro:</h4>
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm">
                      {test.error}
                    </div>
                    
                    {test.result && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Detalhes adicionais:</h4>
                        <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                          {JSON.stringify(test.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-blue-800 mb-3">Possíveis Soluções</h2>
        
        <div className="space-y-4 mb-6">
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            <h3 className="font-medium">1. Problema de Middleware</h3>
            <p className="text-sm text-gray-600">
              Se o erro persistir, pode haver um middleware interceptando as chamadas da API. Verifique 
              o arquivo <code className="bg-gray-100 px-1 py-0.5 rounded">middleware.ts</code> e certifique-se
              de que ele não está interferindo com a rota <code className="bg-gray-100 px-1 py-0.5 rounded">/api/auth/session</code>.
            </p>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            <h3 className="font-medium">2. Problema de Configuração</h3>
            <p className="text-sm text-gray-600">
              Verifique se todas as variáveis de ambiente necessárias para o NextAuth estão configuradas corretamente.
              Especialmente <code className="bg-gray-100 px-1 py-0.5 rounded">NEXTAUTH_URL</code> e 
              <code className="bg-gray-100 px-1 py-0.5 rounded">NEXTAUTH_SECRET</code>.
            </p>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            <h3 className="font-medium">3. Versões Incompatíveis</h3>
            <p className="text-sm text-gray-600">
              Verifique se as versões do Next.js e NextAuth são compatíveis entre si. Em caso de dúvida,
              atualize ambos para as versões mais recentes.
            </p>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            <h3 className="font-medium">4. Problema na Implementação da API</h3>
            <p className="text-sm text-gray-600">
              Verifique se o arquivo <code className="bg-gray-100 px-1 py-0.5 rounded">app/api/auth/[...nextauth]/route.ts</code> está
              implementado corretamente e se ele está retornando respostas JSON válidas.
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link href="/auth-monitor/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Voltar para o Dashboard
          </Link>
          <Link href="/auth-monitor/env-variables" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
            Verificar Variáveis de Ambiente
          </Link>
        </div>
      </div>
    </div>
  );
}
