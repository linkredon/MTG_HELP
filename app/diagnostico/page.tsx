'use client';

import React, { useEffect, useState } from 'react';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import { universalDbService } from '@/lib/universalDbService';
import { TABLES } from '@/lib/awsConfig';

export default function DiagnosticPage() {
  const { isAuthenticated, isInitialized, user } = useAmplifyAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [dbTestResult, setDbTestResult] = useState<any>(null);
  const [dbTestError, setDbTestError] = useState<string | null>(null);
  const [amplifyConfig, setAmplifyConfig] = useState<any>(null);

  // Testar se a sessão é válida
  const checkSession = async () => {
    try {
      const session = await fetchAuthSession();
      setSessionInfo({
        hasCredentials: !!session.credentials,
        isSignedIn: session.tokens?.idToken ? true : false,
        expiresAt: session.tokens?.idToken?.payload?.exp ? new Date(session.tokens.idToken.payload.exp * 1000).toISOString() : 'N/A'
      });
      setSessionError(null);
    } catch (error) {
      console.error('Erro ao buscar sessão:', error);
      setSessionError(error instanceof Error ? error.message : String(error));
      setSessionInfo(null);
    }
  };

  // Testar acesso ao DynamoDB
  const testDynamoDb = async () => {
    try {
      let userId = null;
      try {
        const currentUser = await getCurrentUser();
        userId = currentUser.userId || currentUser.username;
        if (!userId) {
          setDbTestError('ID de usuário não encontrado no objeto de usuário atual');
          return;
        }
      } catch (error) {
        setDbTestError('Não foi possível obter o usuário atual: ' + String(error));
        return;
      }

      // Tentar buscar as coleções usando o serviço universal
      const result = await universalDbService.getByUserId(TABLES.COLLECTIONS, userId);
      
      // Usar type assertion para lidar com diferentes formatos de resposta
      const resultAny: any = result;
      
      // Construir resultado para exibição
      const testResult: any = {
        success: resultAny.success,
        itemCount: resultAny.data?.length || 0,
        data: resultAny.data?.slice(0, 2) // Mostrar apenas os 2 primeiros itens
      };
      
      // Verificar se há um aviso (que foi adicionado em nossa implementação de fallback)
      if (resultAny.warning) {
        testResult.hasWarning = true;
        testResult.warning = resultAny.warning;
      }
      
      setDbTestResult(testResult);
      setDbTestError(null);
    } catch (error) {
      console.error('Erro no teste de DynamoDB:', error);
      setDbTestError(error instanceof Error ? error.message : String(error));
      setDbTestResult(null);
    }
  };

  // Obter configuração atual do Amplify
  useEffect(() => {
    try {
      const config = Amplify.getConfig();
      // Remover informações sensíveis
      const safeConfig = {
        hasAuthConfig: !!config.Auth?.Cognito,
        region: config.Auth?.Cognito?.region || 'não definido',
        userPoolConfigured: !!config.Auth?.Cognito?.userPoolId,
        oauthConfigured: !!config.Auth?.Cognito?.oauth
      };
      setAmplifyConfig(safeConfig);
    } catch (error) {
      console.error('Erro ao obter configuração:', error);
    }
  }, [isInitialized]);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico do Sistema</h1>

      {/* Status de autenticação */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Status de Autenticação</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="font-medium">Amplify inicializado: <span className={isInitialized ? "text-green-600" : "text-red-600"}>{isInitialized ? "Sim" : "Não"}</span></p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="font-medium">Usuário autenticado: <span className={isAuthenticated ? "text-green-600" : "text-red-600"}>{isAuthenticated ? "Sim" : "Não"}</span></p>
            </div>
            {user && (
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg md:col-span-2">
                <p className="font-medium">Informações do usuário:</p>
                <pre className="mt-2 text-xs overflow-auto max-h-32">{JSON.stringify(user, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={checkSession}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Verificar Sessão
          </button>

          {sessionInfo && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded">
              <h3 className="font-medium mb-2 text-green-800 dark:text-green-300">Informações da Sessão:</h3>
              <pre className="text-xs overflow-auto max-h-32">{JSON.stringify(sessionInfo, null, 2)}</pre>
            </div>
          )}

          {sessionError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded">
              <h3 className="font-medium mb-2 text-red-800 dark:text-red-300">Erro na Sessão:</h3>
              <p className="text-sm text-red-600 dark:text-red-400">{sessionError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Acesso ao DynamoDB */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Teste de Acesso ao DynamoDB</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
          <p className="mb-4">Este teste verifica se o cliente DynamoDB está funcionando corretamente e pode acessar seus dados.</p>
          <button
            onClick={testDynamoDb}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={!isAuthenticated}
          >
            Testar Acesso ao DynamoDB
          </button>
          {!isAuthenticated && (
            <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm">É necessário estar autenticado para realizar este teste.</p>
          )}
        </div>

        {dbTestResult && (
          <div className={`mt-4 p-4 rounded ${dbTestResult.success ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'}`}>
            <h3 className={`font-medium mb-2 ${dbTestResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
              {dbTestResult.success ? 'Acesso ao DynamoDB bem-sucedido' : 'Falha no acesso ao DynamoDB'}
            </h3>
            
            {dbTestResult.hasWarning && (
              <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded">
                <p className="text-sm text-amber-800 dark:text-amber-300">Aviso: {dbTestResult.warning}</p>
              </div>
            )}
            
            <div className="mb-2">
              <strong>Itens encontrados:</strong> {dbTestResult.itemCount}
            </div>
            
            {dbTestResult.data && dbTestResult.data.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium mb-1">Exemplos de dados:</h4>
                <pre className="text-xs overflow-auto max-h-32">{JSON.stringify(dbTestResult.data, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {dbTestError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded">
            <h3 className="font-medium mb-2 text-red-800 dark:text-red-300">Erro no DynamoDB:</h3>
            <p className="text-sm text-red-600 dark:text-red-400">{dbTestError}</p>
          </div>
        )}
      </div>

      {/* Configuração do Amplify */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Configuração do Amplify</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          {amplifyConfig ? (
            <pre className="text-xs overflow-auto max-h-32">{JSON.stringify(amplifyConfig, null, 2)}</pre>
          ) : (
            <p className="text-amber-600 dark:text-amber-400">Não foi possível obter a configuração do Amplify.</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-300">Sobre esta página</h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Esta página de diagnóstico foi criada para ajudar a identificar e resolver problemas relacionados à autenticação
          e ao acesso ao banco de dados. Use-a para verificar se todas as partes do sistema estão funcionando corretamente.
        </p>
      </div>
    </div>
  );
}
