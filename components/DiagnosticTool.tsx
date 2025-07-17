'use client';

import { useEffect, useState } from 'react';
import { getDynamoDbClientAsync, TABLES } from '@/lib/awsClientAuth';
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';

export default function DiagnosticTool() {
  const { isAuthenticated, user } = useAmplifyAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string; error?: any}>({ 
    success: false, 
    message: 'Aguardando teste' 
  });
  
  const runDynamoDbTest = async () => {
    if (!isAuthenticated || !user) {
      setTestResult({
        success: false,
        message: 'Você precisa estar autenticado para executar este teste'
      });
      return;
    }
    
    setIsLoading(true);
    setTestResult({
      success: false,
      message: 'Executando teste DynamoDB...'
    });
    
    try {
      // Tentar obter um cliente DynamoDB com credenciais temporárias
      const dynamoDb = await getDynamoDbClientAsync();
      
      // Tentar uma operação simples - consultar a tabela de coleções por ID de usuário
      const params = {
        TableName: TABLES.COLLECTIONS,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': user.id
        },
        Limit: 1
      };
      
      // Executar a consulta
      const result = await dynamoDb.send(new QueryCommand(params));
      
      setTestResult({
        success: true,
        message: `Teste bem-sucedido! Encontrado ${result.Items?.length || 0} coleções.`,
      });
    } catch (error: any) {
      console.error('Erro no teste DynamoDB:', error);
      
      // Formatar o erro de forma amigável
      let errorMessage = 'Erro desconhecido';
      let errorDetail = '';
      
      if (error.name) {
        errorMessage = error.name;
      }
      
      if (error.message) {
        errorDetail = error.message;
      }
      
      if (error.name === 'UnrecognizedClientException') {
        errorDetail = 'Credenciais AWS inválidas ou não fornecidas. Verifique se você está autenticado corretamente.';
      }
      
      setTestResult({
        success: false,
        message: `Erro: ${errorMessage}`,
        error: errorDetail
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Limpar resultado ao alterar status de autenticação
    if (!isAuthenticated) {
      setTestResult({
        success: false,
        message: 'Faça login para testar a conexão com o DynamoDB'
      });
    }
  }, [isAuthenticated]);
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Ferramenta de Diagnóstico DynamoDB</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Status da Autenticação</h3>
        <div className="bg-gray-700 p-3 rounded-md">
          <p className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isAuthenticated ? 'Autenticado' : 'Não autenticado'}
          </p>
          {isAuthenticated && user && (
            <p className="text-gray-300 text-sm mt-2">
              Usuário: {user.name || user.email || 'Desconhecido'}
            </p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Teste de Conexão</h3>
        <div className={`bg-gray-700 p-3 rounded-md ${testResult.success ? 'border-green-500 border' : testResult.message !== 'Aguardando teste' ? 'border-red-500 border' : ''}`}>
          <p className="font-medium">{testResult.message}</p>
          {testResult.error && (
            <p className="text-red-300 text-sm mt-2 overflow-auto max-h-32 whitespace-pre-wrap">
              {testResult.error}
            </p>
          )}
        </div>
      </div>
      
      <button
        onClick={runDynamoDbTest}
        disabled={isLoading || !isAuthenticated}
        className={`w-full py-2 px-4 rounded ${
          isAuthenticated 
            ? isLoading 
              ? 'bg-blue-800 cursor-wait' 
              : 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-600 cursor-not-allowed'
        } transition-colors`}
      >
        {isLoading ? 'Testando...' : 'Testar Conexão DynamoDB'}
      </button>
      
      <div className="mt-4 text-gray-400 text-xs">
        <p>Esta ferramenta testa a conexão com o DynamoDB usando credenciais temporárias do AWS Cognito.</p>
        <p className="mt-1">Se o teste falhar com "UnrecognizedClientException", pode indicar um problema com as credenciais temporárias.</p>
      </div>
    </div>
  );
}
