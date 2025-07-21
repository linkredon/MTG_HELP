'use client';

import React from 'react';
import DbDiagnosticTool from '@/components/DbDiagnosticTool';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';

export default function TestDbPage() {
  const { isAuthenticated, user } = useAmplifyAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Teste de Acesso ao DynamoDB</h1>
      
      {!isAuthenticated ? (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
          <p>Você precisa estar autenticado para testar o acesso ao DynamoDB.</p>
          <p>Por favor, faça login primeiro.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <h2 className="text-lg font-semibold mb-2">Informações do Usuário</h2>
            <p><strong>Autenticado:</strong> {isAuthenticated ? 'Sim' : 'Não'}</p>
            <p><strong>Usuário:</strong> {user ? JSON.stringify(user) : 'Não disponível'}</p>
          </div>
          
          <DbDiagnosticTool />
          
          <div className="mt-8 p-4 bg-gray-50 rounded border">
            <h2 className="text-lg font-semibold mb-2">Sobre esta página</h2>
            <p className="mb-2">
              Esta página testa o novo serviço universal de DynamoDB que funciona tanto no cliente 
              quanto no servidor usando a mesma API.
            </p>
            <p>
              O teste irá verificar se é possível acessar suas coleções do DynamoDB usando o novo serviço.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
