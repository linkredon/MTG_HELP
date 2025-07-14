'use client';

import React from 'react';
import EnvVariableChecker from '@/components/EnvVariableChecker';
import Link from 'next/link';

export default function EnvVariablesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/auth-monitor/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Voltar para o Dashboard
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Verificação de Variáveis de Ambiente</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Importância das Variáveis de Ambiente</h2>
        <p className="mb-4">
          As variáveis de ambiente são essenciais para a configuração correta da autenticação e outros serviços na sua aplicação.
          Elas determinam como sua aplicação se conecta ao AWS Cognito, Google OAuth, DynamoDB e outros serviços.
        </p>
        <p className="mb-4">
          Problemas de configuração de variáveis de ambiente são uma causa comum de erros de autenticação, incluindo o erro
          "401 invalid_client Unauthorized" do Google OAuth.
        </p>
      </div>
      
      <div className="mb-8">
        <EnvVariableChecker />
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Como Configurar Variáveis de Ambiente</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-2">1. Desenvolvimento Local</h3>
            <div className="pl-5 space-y-2">
              <p>Para configurar variáveis de ambiente em desenvolvimento local:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-4">
                <li>Crie um arquivo <code className="bg-gray-100 px-1 rounded">.env.local</code> na raiz do projeto</li>
                <li>Adicione suas variáveis de ambiente no formato <code className="bg-gray-100 px-1 rounded">NOME_DA_VARIAVEL=valor</code></li>
                <li>Variáveis com prefixo <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_</code> estarão disponíveis no cliente</li>
                <li>Reinicie o servidor Next.js após modificar o arquivo <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
              </ol>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">2. Produção (AWS Amplify)</h3>
            <div className="pl-5 space-y-2">
              <p>Para configurar variáveis de ambiente na AWS Amplify:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-4">
                <li>Acesse o <a href="https://console.aws.amazon.com/amplify" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Console da AWS Amplify</a></li>
                <li>Selecione seu aplicativo</li>
                <li>Vá para a guia "Variáveis de ambiente"</li>
                <li>Adicione ou edite as variáveis conforme necessário</li>
                <li>Clique em "Salvar"</li>
                <li>Reimplante seu aplicativo para aplicar as alterações</li>
              </ol>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">3. Variáveis Recomendadas</h3>
            <div className="pl-5 space-y-2">
              <p>Certifique-se de configurar corretamente estas variáveis críticas:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
                <li><code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_REGION</code>: Região da AWS (ex: 'us-east-2')</li>
                <li><code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_USER_POOL_ID</code>: ID do User Pool do Cognito</li>
                <li><code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID</code>: ID do cliente do app Cognito</li>
                <li><code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_COGNITO_DOMAIN</code>: Domínio do Cognito (com https://)</li>
                <li><code className="bg-gray-100 px-1 rounded">GOOGLE_CLIENT_ID</code>: ID do cliente OAuth do Google</li>
                <li><code className="bg-gray-100 px-1 rounded">GOOGLE_CLIENT_SECRET</code>: Segredo do cliente OAuth do Google</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Próximos passos</h2>
        <p className="mb-4">
          Depois de verificar e corrigir as variáveis de ambiente, teste o login novamente para ver se o erro 401 foi resolvido.
        </p>
        <p className="mb-4">
          Se o problema persistir, verifique outros aspectos como o ID do cliente, o segredo do cliente ou os URIs de redirecionamento.
        </p>
        <div className="flex space-x-4">
          <Link href="/auth-monitor/google-oauth-error" className="text-blue-600 hover:text-blue-800">
            Verificar Erro Google OAuth
          </Link>
          <Link href="/auth-monitor/dashboard" className="text-blue-600 hover:text-blue-800">
            Voltar para o Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
