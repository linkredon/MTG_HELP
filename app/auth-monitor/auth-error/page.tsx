'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Configuração para evitar pré-renderização estática
export const dynamic = 'force-dynamic';

interface ErrorDetail {
  title: string;
  description: string;
  solution: string;
}

const errorTypes: Record<string, ErrorDetail> = {
  'client_fetch_error': {
    title: 'Erro de Comunicação com API',
    description: 'O cliente não conseguiu processar a resposta da API de autenticação.',
    solution: 'Verifique se a API está retornando JSON válido e se não há interceptação por middleware ou problemas de CORS.'
  },
  'configuration': {
    title: 'Erro de Configuração',
    description: 'A configuração do NextAuth está incorreta ou incompleta.',
    solution: 'Verifique se todas as variáveis de ambiente necessárias estão configuradas corretamente.'
  },
  'accessdenied': {
    title: 'Acesso Negado',
    description: 'O provedor de autenticação negou o acesso.',
    solution: 'Verifique as configurações do OAuth no console do Google Developer.'
  },
  'verification': {
    title: 'Verificação Falhou',
    description: 'A verificação do token ou credenciais falhou.',
    solution: 'Verifique se os segredos e tokens estão configurados corretamente.'
  },
  'default': {
    title: 'Erro de Autenticação',
    description: 'Ocorreu um erro durante o processo de autenticação.',
    solution: 'Verifique os logs do servidor para mais detalhes.'
  }
};

// Componente interno que usa useSearchParams
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [errorType, setErrorType] = useState('default');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    const error = searchParams?.get('error') || 'default';
    setErrorType(error);
    setErrorMessage(searchParams?.get('error_description') || '');
  }, [searchParams]);
  
  const errorDetail = errorTypes[errorType] || errorTypes.default;
  
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd"></path>
        </svg>
        <h1 className="text-2xl font-bold text-red-700">{errorDetail.title}</h1>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Detalhes do Erro</h2>
        <div className="bg-white p-4 rounded border border-red-200 mb-4">
          <p className="text-gray-800 mb-2"><strong>Tipo:</strong> {errorType}</p>
          {errorMessage && (
            <p className="text-gray-800"><strong>Mensagem:</strong> {errorMessage}</p>
          )}
        </div>
        <p className="text-gray-700">{errorDetail.description}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Solução Recomendada</h2>
        <p className="text-gray-700">{errorDetail.solution}</p>
      </div>
      
      <div className="bg-white p-4 rounded border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-3">Verificações Adicionais</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Verifique se as <a href="/auth-monitor/env-variables" className="text-blue-600 hover:underline">variáveis de ambiente</a> estão configuradas corretamente.</li>
          <li>Verifique se o <a href="/auth-monitor/google-oauth-error" className="text-blue-600 hover:underline">OAuth do Google</a> está configurado corretamente.</li>
          <li>Verifique se o <code className="bg-gray-100 px-1 py-0.5 rounded">NEXTAUTH_URL</code> está configurado para a URL correta.</li>
          <li>Verifique se o <code className="bg-gray-100 px-1 py-0.5 rounded">NEXTAUTH_SECRET</code> está definido.</li>
        </ul>
      </div>
      
      <div className="flex flex-wrap gap-3 mt-4">
        <a href="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Voltar para Login
        </a>
        <a href="/auth-monitor/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Painel de Monitoramento
        </a>
        <a href="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
          Voltar para a Página Inicial
        </a>
      </div>
    </div>
  );
}

// Componente de fallback para o Suspense
function AuthErrorFallback() {
  return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Suspense fallback={<AuthErrorFallback />}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
