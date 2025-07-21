"use client";

import React, { useState, useEffect } from 'react';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';
import { fetchAuthSession } from '@/lib/aws-auth-adapter';
import { getDynamoDbClientAsync } from '@/lib/awsClientAuth';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

const DynamoDbDiagnostic: React.FC = () => {
  const { user, isAuthenticated } = useAmplifyAuth();
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>({});
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const runDiagnostic = async () => {
    setIsTesting(true);
    try {
      console.log('🔍 Iniciando diagnóstico do DynamoDB...');
      
      // Verificar autenticação
      const authStatus = {
        isAuthenticated,
        hasUser: !!user,
        userId: user?.id
      };
      
      // Verificar sessão
      let sessionInfo = {};
      try {
        const session = await fetchAuthSession();
        sessionInfo = {
          hasTokens: !!session.tokens,
          hasIdToken: !!session.tokens?.idToken,
          hasAccessToken: !!session.tokens?.accessToken,
          hasCredentials: !!session.credentials,
          credentialsType: session.credentials ? typeof session.credentials : 'none'
        };
      } catch (error) {
        sessionInfo = { error: error.message };
      }
      
      // Testar conexão com DynamoDB
      let dynamoTest = {};
      try {
        const dynamoClient = await getDynamoDbClientAsync();
        
        // Testar scan simples na tabela de coleções
        const testParams = {
          TableName: 'mtg_collections',
          Limit: 1
        };
        
        const result = await dynamoClient.send(new ScanCommand(testParams));
        dynamoTest = {
          success: true,
          itemsFound: result.Items?.length || 0,
          hasLastEvaluatedKey: !!result.LastEvaluatedKey
        };
      } catch (error: any) {
        dynamoTest = {
          success: false,
          error: error.message,
          errorName: error.name,
          errorCode: error.$metadata?.httpStatusCode
        };
      }
      
      setDiagnosticInfo({
        authStatus,
        sessionInfo,
        dynamoTest,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      setDiagnosticInfo({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    if (showDiagnostic) {
      runDiagnostic();
    }
  }, [showDiagnostic, isAuthenticated, user]);

  if (!showDiagnostic) {
    return (
      <button
        onClick={() => setShowDiagnostic(true)}
        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
      >
        Diagnóstico DynamoDB
      </button>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded border border-gray-600">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-300">Diagnóstico DynamoDB</h4>
        <button
          onClick={() => setShowDiagnostic(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Status de Autenticação:</strong>
          <div className="ml-2">
            <div>Autenticado: {diagnosticInfo.authStatus?.isAuthenticated ? '✅' : '❌'}</div>
            <div>Usuário: {diagnosticInfo.authStatus?.hasUser ? '✅' : '❌'}</div>
            <div>User ID: {diagnosticInfo.authStatus?.userId || 'N/A'}</div>
          </div>
        </div>
        
        <div>
          <strong>Sessão:</strong>
          <div className="ml-2">
            <div>Tokens: {diagnosticInfo.sessionInfo?.hasTokens ? '✅' : '❌'}</div>
            <div>ID Token: {diagnosticInfo.sessionInfo?.hasIdToken ? '✅' : '❌'}</div>
            <div>Access Token: {diagnosticInfo.sessionInfo?.hasAccessToken ? '✅' : '❌'}</div>
            <div>Credenciais: {diagnosticInfo.sessionInfo?.hasCredentials ? '✅' : '❌'}</div>
            {diagnosticInfo.sessionInfo?.error && (
              <div className="text-red-400">Erro: {diagnosticInfo.sessionInfo.error}</div>
            )}
          </div>
        </div>
        
        <div>
          <strong>Teste DynamoDB:</strong>
          <div className="ml-2">
            {diagnosticInfo.dynamoTest?.success ? (
              <>
                <div className="text-green-400">✅ Conexão bem-sucedida</div>
                <div>Itens encontrados: {diagnosticInfo.dynamoTest.itemsFound}</div>
              </>
            ) : (
              <>
                <div className="text-red-400">❌ Falha na conexão</div>
                <div>Erro: {diagnosticInfo.dynamoTest?.error}</div>
                <div>Código: {diagnosticInfo.dynamoTest?.errorCode}</div>
                <div>Tipo: {diagnosticInfo.dynamoTest?.errorName}</div>
              </>
            )}
          </div>
        </div>
        
        {diagnosticInfo.error && (
          <div className="text-red-400">
            <strong>Erro Geral:</strong> {diagnosticInfo.error}
          </div>
        )}
        
        <div className="text-gray-400 text-xs">
          Última verificação: {diagnosticInfo.timestamp}
        </div>
      </div>
      
      <button
        onClick={runDiagnostic}
        disabled={isTesting}
        className="mt-3 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
      >
        {isTesting ? 'Testando...' : 'Executar Teste'}
      </button>
    </div>
  );
};

export default DynamoDbDiagnostic; 