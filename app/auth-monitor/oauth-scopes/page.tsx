'use client';

import React from 'react';
import OAuthScopeChecker from '@/components/OAuthScopeChecker';
import Link from 'next/link';

export default function OAuthScopesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/auth-monitor/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Voltar para o Dashboard
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Verificação de Escopos OAuth</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Importância dos Escopos OAuth</h2>
        <p className="mb-4">
          Os escopos OAuth determinam quais informações e permissões sua aplicação pode acessar na conta Google do usuário.
          Configurá-los corretamente é essencial para o funcionamento da autenticação.
        </p>
        <p className="mb-4">
          Se os escopos necessários não estiverem configurados ou houver discrepâncias entre as configurações do Google e do AWS Cognito,
          o processo de autenticação pode falhar ou não fornecer as informações necessárias.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Verificador de Escopos</h2>
        <div className="bg-white shadow rounded-lg">
          <OAuthScopeChecker />
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Verificação passo a passo</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-2">1. Google Cloud Console</h3>
            <div className="pl-5 space-y-2">
              <p>Verifique os escopos configurados no Google Cloud Console:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-4">
                <li>Vá para o <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                <li>Navegue até "APIs & Serviços" {'>'}  "OAuth consent screen"</li>
                <li>Role até a seção "Scopes"</li>
                <li>Verifique se os seguintes escopos estão presentes:</li>
                <ul className="list-disc space-y-1 pl-8">
                  <li><code className="bg-gray-100 px-1 rounded">openid</code></li>
                  <li><code className="bg-gray-100 px-1 rounded">email</code></li>
                  <li><code className="bg-gray-100 px-1 rounded">profile</code></li>
                </ul>
              </ol>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">2. AWS Cognito</h3>
            <div className="pl-5 space-y-2">
              <p>Verifique as configurações de escopo no AWS Cognito:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-4">
                <li>Vá para o <a href="https://console.aws.amazon.com/cognito/home" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AWS Cognito Console</a></li>
                <li>Selecione seu User Pool</li>
                <li>Vá para a guia "App integration"</li>
                <li>Clique em "Identity providers" e selecione "Google"</li>
                <li>Na seção "Authorize scopes", verifique se os escopos estão configurados corretamente</li>
              </ol>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">3. Corrigir problemas de escopo</h3>
            <div className="pl-5 space-y-2">
              <p>Se você encontrar problemas com os escopos:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-4">
                <li>Adicione os escopos ausentes no Google Cloud Console e no AWS Cognito</li>
                <li>Certifique-se de que os escopos mínimos necessários (<code>openid</code>, <code>email</code>, <code>profile</code>) estão configurados</li>
                <li>Após fazer alterações, salve as configurações</li>
                <li>Pode ser necessário atualizar a tela de consentimento OAuth no Google</li>
                <li>Depois de atualizar, teste o login novamente</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Próximos passos</h2>
        <p className="mb-4">
          Depois de verificar e corrigir os escopos, teste o login novamente para ver se o erro 401 foi resolvido.
        </p>
        <p className="mb-4">
          Se o problema persistir, verifique outros aspectos como o ID do cliente, o segredo do cliente ou os URIs de redirecionamento.
        </p>
        <div className="flex space-x-4">
          <Link href="/auth-monitor/google-oauth-error" className="text-blue-600 hover:text-blue-800">
            ← Voltar para Google OAuth Error
          </Link>
          <Link href="/auth-monitor/dashboard" className="text-blue-600 hover:text-blue-800">
            Ir para o Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
