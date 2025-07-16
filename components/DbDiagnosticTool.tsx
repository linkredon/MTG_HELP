'use client';

import React, { useState } from 'react';
import { collectionService } from '@/utils/awsApiService';
import { getCurrentUser } from 'aws-amplify/auth';

export default function DbDiagnosticTool() {
  const [diagnosticResult, setDiagnosticResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostic = async () => {
    setIsLoading(true);
    setDiagnosticResult(null);
    
    try {
      // Verificar autenticação
      let currentUser;
      try {
        currentUser = await getCurrentUser();
      } catch (error) {
        setDiagnosticResult({
          success: false,
          message: 'Erro na autenticação. Você precisa estar autenticado para usar este diagnóstico.',
          error
        });
        setIsLoading(false);
        return;
      }
      
      // Teste 1: Buscar coleções
      const collectionsResult = await collectionService.getAll();
      
      // Usar type assertion para lidar com diferentes formatos de resposta
      const resultAny: any = collectionsResult;
      let diagnosticData;
      
      // Verificações manuais e explícitas para evitar erros de TypeScript
      if (resultAny.success === false) {
        // Erro padrão
        diagnosticData = {
          success: false,
          message: 'Falha ao acessar o DynamoDB. Verifique o erro nos detalhes.',
          data: null,
          error: resultAny.error
        };
      } 
      else if (resultAny.success === true && resultAny.warning) {
        // Aviso de fallback
        diagnosticData = {
          success: false,
          message: 'Aviso durante acesso ao DynamoDB: ' + resultAny.warning,
          data: null,
          error: resultAny.originalError || 'Erro não especificado'
        };
      }
      else if (resultAny.success === true && resultAny.data) {
        // Sucesso
        diagnosticData = {
          success: true,
          message: 'Conexão com DynamoDB estabelecida com sucesso!',
          data: {
            user: currentUser?.userId,
            collections: resultAny.data
          },
          error: null
        };
      } 
      else {
        // Resposta desconhecida
        diagnosticData = {
          success: false,
          message: 'Formato de resposta desconhecido do DynamoDB',
          data: null,
          error: resultAny
        };
      }
      
      setDiagnosticResult(diagnosticData);
    } catch (error) {
      setDiagnosticResult({
        success: false,
        message: 'Erro inesperado durante o diagnóstico',
        error,
        data: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Diagnóstico de DynamoDB</h2>
      
      <button
        onClick={runDiagnostic}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Executando...' : 'Testar Conexão DynamoDB'}
      </button>
      
      {diagnosticResult && (
        <div className="mt-4">
          <div className={`p-3 rounded ${diagnosticResult.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
            <p className="font-bold">{diagnosticResult.message}</p>
          </div>
          
          {diagnosticResult.success && diagnosticResult.data && (
            <div className="mt-4 overflow-auto max-h-96">
              <h3 className="font-semibold mb-2">Detalhes:</h3>
              <div className="bg-white dark:bg-gray-900 p-3 rounded overflow-auto">
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(diagnosticResult.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {!diagnosticResult.success && diagnosticResult.error && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Detalhes do Erro:</h3>
              <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded overflow-auto">
                <pre className="whitespace-pre-wrap text-xs text-red-800 dark:text-red-300">
                  {JSON.stringify(diagnosticResult.error, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
