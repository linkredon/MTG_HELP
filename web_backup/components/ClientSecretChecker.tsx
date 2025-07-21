'use client';

import React, { useState, useEffect } from 'react';

export default function ClientSecretChecker() {
  const [googleSecretEnv, setGoogleSecretEnv] = useState<string | null>(null);
  const [secretMasked, setSecretMasked] = useState<string | null>(null);
  const [secretPrefix, setSecretPrefix] = useState<string | null>(null);
  const [secretLength, setSecretLength] = useState<number | null>(null);
  const [status, setStatus] = useState<'checking' | 'complete'>('checking');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    async function checkSecret() {
      try {
        // Tentativa de obter a variável de ambiente pelo lado do cliente
        const googleSecret = process.env.GOOGLE_CLIENT_SECRET || null;
        setGoogleSecretEnv(googleSecret ? 'configurado' : 'não configurado');

        if (googleSecret) {
          setSecretMasked('*'.repeat(googleSecret.length));
          setSecretPrefix(googleSecret.substring(0, 3) + '...' + googleSecret.substring(googleSecret.length - 3));
          setSecretLength(googleSecret.length);
        }
        
        // Verificar também a variável NEXT_PUBLIC
        const publicGoogleSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || null;
        if (publicGoogleSecret) {
          setSecretMasked('*'.repeat(publicGoogleSecret.length));
          setSecretPrefix(publicGoogleSecret.substring(0, 3) + '...' + publicGoogleSecret.substring(publicGoogleSecret.length - 3));
          setSecretLength(publicGoogleSecret.length);
        }

        // Registrar quando a verificação foi realizada
        setLastUpdated(new Date().toLocaleString());
        setStatus('complete');
      } catch (error) {
        console.error('Erro ao verificar segredo:', error);
        setStatus('complete');
      }
    }

    checkSecret();
  }, []);

  // Função para verificar se o prefixo corresponde ao segredo do Cognito
  const checkPrefixMatch = (prefix: string | null, length: number | null) => {
    if (!prefix) return false;
    
    // Este é um exemplo de segredo do Google (modificado para segurança)
    const cognitoSecretPrefix = 'yaU';
    const cognitoSecretSuffix = 'XH_';
    const cognitoSecretLength = 24;
    
    // Verificar o prefixo, sufixo e comprimento
    const prefixMatch = prefix.startsWith(cognitoSecretPrefix);
    const suffixMatch = prefix.endsWith(cognitoSecretSuffix);
    const lengthMatch = length === cognitoSecretLength;
    
    return prefixMatch && suffixMatch && lengthMatch;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Verificador de Segredo do Cliente Google</h2>
      
      {status === 'checking' ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Verificando configurações...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Informações do Google Cloud Console:</h3>
            <p className="text-sm text-gray-600 mb-2">
              O segredo do cliente (Client Secret) está disponível no Google Cloud Console em:
              <br />
              <strong>APIs & Services {'>'}  Credentials {'>'}  OAuth 2.0 Client IDs</strong>
            </p>
            <div className="text-gray-700">
              <div className="flex items-center">
                <span className="font-medium mr-2">Format esperado:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxx</code>
              </div>
              <p className="text-xs text-gray-500 mt-1">Os segredos do Google Cloud normalmente começam com "GOCSPX-" e têm aproximadamente 24-30 caracteres.</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Segredo no AWS Cognito:</h3>
            <p className="text-sm text-gray-600 mb-2">
              Acesse em: <strong>AWS Cognito {'>'}  User Pools {'>'}  App Integration {'>'}  Identity providers {'>'}  Google</strong>
            </p>
            <div className="text-gray-700">
              <div className="flex items-center">
                <span className="font-medium mr-2">Exemplo de formato:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">GOCSPX-yaU...XH_</code>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Por segurança, apenas os primeiros e últimos caracteres são mostrados.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Segredo nas variáveis de ambiente:</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">GOOGLE_CLIENT_SECRET: </span> 
                {googleSecretEnv === 'configurado' ? (
                  <span className="text-green-600">Configurado</span>
                ) : (
                  <span className="text-red-600">Não configurado</span>
                )}
              </div>
              
              {secretPrefix && (
                <>
                  <div>
                    <span className="font-medium">Formato do segredo: </span>
                    <code className="bg-gray-100 px-2 py-1 rounded">{secretPrefix}</code>
                    {secretMasked && <span className="text-gray-400 ml-2">(mascarado como {secretMasked})</span>}
                  </div>
                  <div>
                    <span className="font-medium">Comprimento: </span>
                    {secretLength} caracteres
                    {secretLength && secretLength < 20 && 
                      <span className="text-red-500 ml-2">(Parece muito curto para um segredo do Google)</span>
                    }
                    {secretLength && secretLength > 35 && 
                      <span className="text-red-500 ml-2">(Parece muito longo para um segredo do Google)</span>
                    }
                  </div>
                  <div>
                    <span className="font-medium">Formato correto: </span>
                    {secretPrefix && secretPrefix.startsWith('GOC') ? (
                      <span className="text-green-600">✓ Começa com o prefixo esperado</span>
                    ) : (
                      <span className="text-red-600">✗ Não começa com "GOCSPX-"</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Correspondência geral: </span>
                    {checkPrefixMatch(secretPrefix, secretLength) ? (
                      <span className="text-green-600">✓ Parece corresponder ao formato esperado</span>
                    ) : (
                      <span className="text-red-600">✗ Não corresponde ao formato esperado</span>
                    )}
                  </div>
                  {lastUpdated && (
                    <div className="text-xs text-gray-500 mt-1">
                      Última verificação: {lastUpdated}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <h3 className="font-medium text-blue-800 mb-2">Dicas para Verificação de Segredo</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
              <li>O segredo do cliente é sensível a caracteres, incluindo maiúsculas, minúsculas e caracteres especiais.</li>
              <li>Segredos do Google Cloud geralmente começam com "GOCSPX-" seguido por uma sequência de caracteres.</li>
              <li>O segredo é gerado pelo Google e não pode ser personalizado.</li>
              <li>Se o segredo foi rotacionado/regenerado no Google Cloud, ele deve ser atualizado em todos os lugares que o usam.</li>
            </ul>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
            <h3 className="font-medium text-red-800 mb-2">Problemas comuns:</h3>
            <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
              <li>Cópia incompleta do segredo do Google Cloud Console</li>
              <li>Espaços em branco extras no início ou final do segredo</li>
              <li>Segredo antigo sendo usado após uma rotação de credenciais</li>
              <li>Formatação incorreta ao copiar (quebras de linha ou caracteres invisíveis)</li>
              <li>Confusão entre ID do cliente e segredo do cliente</li>
            </ul>
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="font-medium mb-3">Próximos passos para corrigir:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <strong>Acesse o Google Cloud Console</strong> 
                <span className="text-sm text-gray-600 block ml-6">
                  Vá para APIs & Services {'>'}  Credentials {'>'}  OAuth 2.0 Client IDs e localize seu aplicativo.
                </span>
              </li>
              <li>
                <strong>Copie o segredo do cliente exato</strong>
                <span className="text-sm text-gray-600 block ml-6">
                  Clique no botão para exibir o segredo completo e copie-o cuidadosamente sem espaços extras.
                </span>
              </li>
              <li>
                <strong>Atualize o segredo no AWS Cognito</strong>
                <span className="text-sm text-gray-600 block ml-6">
                  Vá para User Pools {'>'}  App Integration {'>'}  Identity providers {'>'}  Google e cole o segredo correto.
                </span>
              </li>
              <li>
                <strong>Atualize seu arquivo <code>.env.local</code></strong>
                <span className="text-sm text-gray-600 block ml-6">
                  Certifique-se de que GOOGLE_CLIENT_SECRET contém o valor correto e exato.
                </span>
              </li>
              <li>
                <strong>Reinicie o servidor</strong>
                <span className="text-sm text-gray-600 block ml-6">
                  As variáveis de ambiente são carregadas na inicialização, então um reinício é necessário.
                </span>
              </li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <h3 className="font-medium text-yellow-800 mb-2">Considerações de segurança:</h3>
            <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
              <li>
                <strong>Nunca exponha</strong> o segredo do cliente em código do lado do cliente ou em repositórios públicos.
              </li>
              <li>
                O arquivo <code>.env.local</code> deve estar listado no <code>.gitignore</code> para evitar exposição acidental.
              </li>
              <li>
                Variáveis <code>NEXT_PUBLIC_*</code> são expostas ao cliente. <strong>Nunca</strong> armazene segredos em variáveis com esse prefixo.
              </li>
              <li>
                Se suspeitar de exposição de credenciais, rotacione o segredo imediatamente no Google Cloud Console.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
