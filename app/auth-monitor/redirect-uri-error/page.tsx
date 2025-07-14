'use client';

import React from 'react';
import RedirectUriChecker from '@/components/RedirectUriChecker';
import Link from 'next/link';

export default function RedirectUriErrorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/auth-monitor/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Voltar para o Dashboard
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Verificação de URIs de Redirecionamento</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Importância dos URIs de Redirecionamento</h2>
        <p className="mb-4">
          O erro 401 invalid_client pode ocorrer quando os URIs de redirecionamento não estão configurados corretamente entre o Google Cloud Console e o AWS Cognito.
        </p>
        <p className="mb-4">
          Ambos os serviços precisam concordar sobre quais URLs são permitidas para redirecionamento após o login, 
          caso contrário, o Google rejeitará a solicitação de autenticação como medida de segurança.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Verificador de URIs de Redirecionamento</h2>
        <div className="bg-white shadow rounded-lg">
          <RedirectUriChecker />
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Verificação passo a passo</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-2">1. Google Cloud Console</h3>
            <div className="pl-5 space-y-2">
              <p>Acesse o Google Cloud Console e verifique os URIs de redirecionamento configurados:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-4">
                <li>Vá para o <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                <li>Navegue até "APIs & Serviços" {'>'}  "Credenciais"</li>
                <li>Clique no cliente OAuth 2.0 que você está usando</li>
                <li>Na seção "Authorized redirect URIs", verifique se os seguintes URIs estão presentes:</li>
                <li className="pl-6">
                  <ul className="list-disc space-y-1">
                    <li><code className="bg-gray-100 px-1 rounded">https://mtghelper.auth.us-east-2.amazoncognito.com/oauth2/idpresponse</code></li>
                    <li>Seu domínio de produção (ex: <code className="bg-gray-100 px-1 rounded">https://main.da2ht88kn6qm.amplifyapp.com/api/auth/callback/google</code>)</li>
                    <li>Seu domínio local (ex: <code className="bg-gray-100 px-1 rounded">http://localhost:3000/api/auth/callback/google</code>)</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">2. AWS Cognito</h3>
            <div className="pl-5 space-y-2">
              <p>Verifique as configurações no AWS Cognito:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-4">
                <li>Vá para o <a href="https://console.aws.amazon.com/cognito/home" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AWS Cognito Console</a></li>
                <li>Selecione seu User Pool</li>
                <li>Vá para a guia "App integration"</li>
                <li>Na seção "App client settings", verifique os "Callback URL(s)" e "Sign out URL(s)"</li>
                <li>Certifique-se de que todos os domínios onde sua aplicação estará hospedada estão listados</li>
              </ol>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">3. Corrigir problemas de URIs</h3>
            <div className="pl-5 space-y-2">
              <p>Se você encontrar problemas com os URIs de redirecionamento:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 pl-4">
                <li>Adicione todos os URIs ausentes ao Google Cloud Console</li>
                <li>Certifique-se de que o URI <code className="bg-gray-100 px-1 rounded">https://mtghelper.auth.us-east-2.amazoncognito.com/oauth2/idpresponse</code> está presente</li>
                <li>Verifique se não há erros de digitação ou formatação</li>
                <li>Depois de fazer alterações, clique em "Salvar" ou "Save"</li>
                <li>Pode levar alguns minutos para que as alterações tenham efeito</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Próximos passos</h2>
        <p className="mb-4">
          Depois de verificar e corrigir os URIs de redirecionamento, teste o login novamente para ver se o erro 401 foi resolvido.
        </p>
        <p className="mb-4">
          Se o problema persistir, verifique os outros aspectos da configuração do OAuth como o ID do cliente e o segredo do cliente.
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
