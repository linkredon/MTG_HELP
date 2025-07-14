'use client';

import React from 'react';
import Link from 'next/link';

export default function AuthDashboard() {
  // Ferramentas de diagnóstico para problemas de autenticação
  const diagnosticTools = [
    {
      id: 'cognito-validator',
      name: 'Validador de OAuth',
      description: 'Verifica se as configurações do OAuth estão corretas',
      path: '/auth-monitor'
    },
    {
      id: 'login-debugger',
      name: 'Debugger de Login',
      description: 'Ajuda a resolver o erro "Login pages unavailable"',
      path: '/auth-monitor/login-debugger'
    },
    {
      id: 'google-oauth-error',
      name: 'Resolver Erro Google OAuth',
      description: 'Solução para o erro "401 invalid_client Unauthorized"',
      path: '/auth-monitor/google-oauth-error',
      highlight: true
    },
    {
      id: 'redirect-uri-error',
      name: 'Verificador de URIs de Redirecionamento',
      description: 'Verificar configurações de URIs entre Google e Cognito',
      path: '/auth-monitor/redirect-uri-error',
      new: true
    },
    {
      id: 'oauth-scopes',
      name: 'Verificador de Escopos OAuth',
      description: 'Verificar se os escopos OAuth estão configurados corretamente',
      path: '/auth-monitor/oauth-scopes',
      new: true
    },
    {
      id: 'client-secret',
      name: 'Verificador de Segredo do Cliente',
      description: 'Verificação detalhada do Google Client Secret',
      path: '/auth-monitor/google-oauth-error',
      new: true
    },
    {
      id: 'env-variables',
      name: 'Verificador de Variáveis de Ambiente',
      description: 'Verificação completa das variáveis de ambiente configuradas',
      path: '/auth-monitor/env-variables',
      new: true,
      highlight: true
    },
    {
      id: 'session-debugger',
      name: 'Depurador da API de Sessão',
      description: 'Solução para o erro "Unexpected token <" na API de sessão',
      path: '/auth-monitor/session-debugger',
      new: true,
      highlight: true,
      alert: 'Urgente'
    }
  ];
  
  const documentationLinks = [
    {
      id: 'cognito-setup',
      name: 'Guia de Configuração do Cognito',
      description: 'Passos detalhados para configurar o Cognito no AWS Console',
      path: '/docs/cognito-setup-guide.md'
    },
    {
      id: 'login-error-fix',
      name: 'Resolver "Login pages unavailable"',
      description: 'Solução específica para o erro de páginas de login indisponíveis',
      path: '/docs/cognito-login-error-fix.md'
    },
    {
      id: 'google-oauth-error-fix',
      name: 'Resolver Erro Google OAuth 401',
      description: 'Solução para o erro "401 invalid_client Unauthorized"',
      path: '/docs/google-oauth-error-fix.md'
    }
  ];
  
  const testTools = [
    {
      id: 'test-login',
      name: 'Testar Login',
      description: 'Abre o fluxo de login do Cognito em uma nova janela',
      path: '/login'
    },
    {
      id: 'test-google-login',
      name: 'Testar Login com Google',
      description: 'Abre o fluxo de login com Google em uma nova janela',
      path: '/login'
    },
    {
      id: 'run-diagnostic',
      name: 'Executar Diagnóstico',
      description: 'Executa o script de diagnóstico',
      path: '/auth-monitor'
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard de Autenticação</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Status do Ambiente</h2>
          <div className="space-y-2 mb-4">
            <div>
              <span className="font-medium">Região:</span> {process.env.NEXT_PUBLIC_REGION || 'Não configurada'}
            </div>
            <div>
              <span className="font-medium">User Pool ID:</span> {process.env.NEXT_PUBLIC_USER_POOL_ID || 'Não configurado'}
            </div>
            <div>
              <span className="font-medium">Client ID:</span> {process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || 'Não configurado'}
            </div>
            <div>
              <span className="font-medium">Domínio Cognito:</span> {process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'Não configurado'}
            </div>
          </div>
          
          <div className="mt-4">
            <div className={`px-3 py-2 rounded ${process.env.NEXT_PUBLIC_COGNITO_DOMAIN?.startsWith('https://') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {process.env.NEXT_PUBLIC_COGNITO_DOMAIN?.startsWith('https://') 
                ? '✓ Formato de domínio correto (começa com https://)' 
                : '✗ Formato de domínio incorreto (deve começar com https://)'}
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ferramentas de Teste</h2>
          <div className="space-y-3">
            {testTools.map(tool => (
              <Link 
                key={tool.id}
                href={tool.path}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded flex flex-col items-start transition-colors"
              >
                <span className="font-medium">{tool.name}</span>
                <span className="text-sm text-blue-600">{tool.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ferramentas de Diagnóstico</h2>
          <div className="space-y-3">
            {diagnosticTools.map(tool => (
              <Link 
                href={tool.path} 
                key={tool.id}
                className={`block p-4 rounded transition-colors ${
                  tool.highlight 
                    ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <div className="font-medium">{tool.name}</div>
                  {tool.new && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Novo</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">{tool.description}</div>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Documentação</h2>
          <div className="space-y-3">
            {documentationLinks.map(doc => (
              <a 
                href={doc.path}
                target="_blank" 
                rel="noopener noreferrer"
                key={doc.id}
                className="block bg-gray-50 hover:bg-gray-100 p-4 rounded transition-colors"
              >
                <div className="font-medium">{doc.name}</div>
                <div className="text-sm text-gray-600">{doc.description}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Guia de Resolução de Problemas</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Problemas de Login Geral</h3>
            <ul className="list-disc pl-5 space-y-1 text-yellow-700">
              <li>"Login pages unavailable" - <Link href="/auth-monitor/login-debugger" className="underline text-blue-700">Use o Login Debugger</Link></li>
              <li>"O domínio não começa com https://" - Adicione o prefixo https:// às variáveis de ambiente</li>
              <li>"ChunkLoadError: Loading chunk failed" - Pode indicar problemas com a importação do Amplify</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-2">Erros de Integração Google OAuth</h3>
            <ul className="list-disc pl-5 space-y-1 text-red-700">
              <li>
                "Google Error - 401 invalid_client Unauthorized" - 
                <Link href="/auth-monitor/google-oauth-error" className="underline text-blue-700 ml-1">
                  Solução completa disponível
                </Link>
              </li>
              <li>
                "URI de redirecionamento inválido" - 
                <Link href="/auth-monitor/redirect-uri-error" className="underline text-blue-700 ml-1">
                  Verificador de URIs
                </Link>
              </li>
              <li>
                "Escopos de permissão insuficientes" - 
                <Link href="/auth-monitor/oauth-scopes" className="underline text-blue-700 ml-1">
                  Verificador de Escopos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Problemas de Configuração de Ambiente</h3>
          <p className="text-blue-700 mb-2">
            A maioria dos problemas de autenticação está relacionada à configuração incorreta das variáveis de ambiente
            ou discrepâncias entre as configurações em diferentes plataformas.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Link href="/auth-monitor/google-oauth-error" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
              Verificador de Erro Google OAuth
            </Link>
            <Link href="/auth-monitor/redirect-uri-error" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
              Verificar URIs de Redirecionamento
            </Link>
            <Link href="/auth-monitor/oauth-scopes" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
              Verificar Escopos OAuth
            </Link>
            <Link href="/auth-monitor/env-variables" className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
              Verificar Variáveis de Ambiente ✓
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
