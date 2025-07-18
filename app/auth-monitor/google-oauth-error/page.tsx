'use client';
export const dynamic = 'force-dynamic';

import React from 'react';
import GoogleOAuthErrorChecker from '@/components/GoogleOAuthErrorChecker';
import GoogleCredentialsUpdater from '@/components/GoogleCredentialsUpdater';
import ClientSecretChecker from '@/components/ClientSecretChecker';
import Link from 'next/link';

export default function GoogleOAuthErrorPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/auth-monitor/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Voltar para o Dashboard
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Diagnóstico de Erro Google OAuth</h1>
      
      <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4">
        <h2 className="text-lg font-medium text-red-800">Erro: 401 invalid_client Unauthorized</h2>
        <p className="text-red-700 mt-1">
          Este erro geralmente indica um problema com as credenciais do cliente OAuth, como um ID de cliente inválido, 
          segredo do cliente incorreto, ou URIs de redirecionamento mal configurados.
        </p>
      </div>
      
      <div className="mb-8 bg-blue-50 border-l-4 border-blue-400 p-4">
        <h2 className="text-lg font-medium text-blue-800">Etapas de verificação</h2>
        <ol className="list-decimal pl-5 mt-2 space-y-1 text-blue-700">
          <li>
            <strong>Ponto 1:</strong> Verificar se o segredo do cliente do Google está corretamente configurado
            <span className="ml-2 text-sm">(Verificação atual)</span>
          </li>
          <li>
            <strong>Ponto 2:</strong> Verificar se os URIs de redirecionamento estão configurados corretamente
            <Link href="/auth-monitor/redirect-uri-error" className="ml-2 text-sm text-blue-600 hover:text-blue-800">
              (Verificar agora)
            </Link>
          </li>
          <li>
            <strong>Ponto 3:</strong> Verificar os escopos OAuth configurados
            <Link href="/auth-monitor/oauth-scopes" className="ml-2 text-sm text-blue-600 hover:text-blue-800">
              (Verificar agora)
            </Link>
          </li>
          <li>
            <strong>Ponto 4:</strong> Verificar as variáveis de ambiente na aplicação
            <Link href="/auth-monitor/env-variables" className="ml-2 text-sm text-blue-600 hover:text-blue-800">
              (Verificar agora)
            </Link>
          </li>
        </ol>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Ponto 1: Verificação do Segredo do Cliente</h2>
        <ClientSecretChecker />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Verificação Geral de Erro</h2>
          <GoogleOAuthErrorChecker />
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Atualizar Credenciais</h2>
          <GoogleCredentialsUpdater />
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Ferramentas de Diagnóstico Avançadas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/auth-monitor/redirect-uri-error"
            className="block p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <h3 className="font-medium text-lg">Verificador de URIs de Redirecionamento</h3>
            <p className="text-gray-600 text-sm mt-1">
              Verifica se os URIs de redirecionamento estão configurados corretamente entre o Google Cloud e o AWS Cognito.
            </p>
          </Link>
          
          <Link 
            href="/auth-monitor/oauth-scopes"
            className="block p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <h3 className="font-medium text-lg">Verificador de Escopos OAuth</h3>
            <p className="text-gray-600 text-sm mt-1">
              Verifica se os escopos OAuth necessários estão configurados corretamente.
            </p>
          </Link>
          
          <a 
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <h3 className="font-medium text-lg">Google Cloud Credentials</h3>
            <p className="text-gray-600 text-sm mt-1">
              Acesse diretamente a página de credenciais do Google Cloud Console.
            </p>
          </a>
          
          <a 
            href="https://console.aws.amazon.com/cognito/users"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <h3 className="font-medium text-lg">AWS Cognito User Pools</h3>
            <p className="text-gray-600 text-sm mt-1">
              Acesse diretamente a página de User Pools do AWS Cognito.
            </p>
          </a>
        </div>
        
        <div className="mt-6 text-center">
          <a 
            href="/auth-monitor/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Voltar para o Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
