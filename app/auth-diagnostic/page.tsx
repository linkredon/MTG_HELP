'use client';

import { useState } from 'react';
import AuthDiagnosticComponent from '@/components/AuthDiagnostic';
import OAuthTest from '@/components/OAuthTest';

export default function DiagnosticPage() {
  const [showOAuthTest, setShowOAuthTest] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de Autenticação</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Ferramentas de Diagnóstico</h2>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Use estas ferramentas para diagnosticar problemas de autenticação com AWS Cognito e OAuth.
            </p>
            
            <div>
              <button 
                onClick={() => setShowOAuthTest(!showOAuthTest)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {showOAuthTest ? 'Esconder' : 'Mostrar'} Teste de OAuth
              </button>
            </div>
            
            {showOAuthTest && (
              <div className="mt-4">
                <OAuthTest />
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Como resolver problemas comuns</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-white">Origem não está nas URLs de redirecionamento</h3>
              <p className="text-gray-300 mt-1">
                Execute o script <code className="bg-gray-700 px-1 rounded">npm run fix-oauth-urls</code> para 
                corrigir URLs de redirecionamento no arquivo amplifySetup.ts
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-white">Configuração no AWS Cognito</h3>
              <p className="text-gray-300 mt-1">
                Acesse o console do AWS Cognito e verifique se a URL do seu aplicativo está configurada 
                nas URLs de redirecionamento do app client.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-white">Domínio Cognito incorreto</h3>
              <p className="text-gray-300 mt-1">
                Verifique se o domínio do Cognito está usando HTTPS e não termina com barra (/).
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-white">Mais informações</h3>
              <p className="text-gray-300 mt-1">
                Consulte o arquivo <code className="bg-gray-700 px-1 rounded">docs/OAUTH_FIX_GUIDE.md</code> para 
                instruções detalhadas sobre como corrigir problemas de OAuth.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <AuthDiagnosticComponent />
      </div>
    </div>
  );
}
