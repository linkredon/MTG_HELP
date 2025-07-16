'use client';

import DiagnosticTool from '@/components/DiagnosticTool';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';
import Link from 'next/link';

export default function AwsDiagnosticPage() {
  const { isAuthenticated, user, isLoading } = useAmplifyAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de Conexão AWS</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <DiagnosticTool />
        </div>
        
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Como resolver "UnrecognizedClientException"</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">1. Verificar Autenticação</h3>
              <p className="text-gray-300 text-sm mt-1">
                Este erro geralmente ocorre quando não há credenciais válidas para acessar 
                o DynamoDB. Verifique se você está autenticado corretamente.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">2. Recarregar a Página</h3>
              <p className="text-gray-300 text-sm mt-1">
                Tente recarregar a página para renovar as credenciais temporárias.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">3. Fazer Login Novamente</h3>
              <p className="text-gray-300 text-sm mt-1">
                Faça logout e login novamente para atualizar as credenciais.
                <Link href="/login" className="ml-2 text-blue-400 hover:underline">
                  Ir para login
                </Link>
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">4. Verificar Permissões no IAM</h3>
              <p className="text-gray-300 text-sm mt-1">
                Verifique se o Identity Pool configurado no Cognito tem as permissões 
                necessárias para acessar as tabelas DynamoDB.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">5. Usar Credenciais Corretas</h3>
              <p className="text-gray-300 text-sm mt-1">
                A aplicação agora usa credenciais temporárias obtidas através do 
                AWS Cognito Identity Pool para acessar o DynamoDB no lado do cliente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
