"use client";

import { useState, useEffect } from 'react';

interface TableDebugInfo {
  allTables: string[];
  configuredTables: any;
  tableStatus: {
    users: boolean;
    collections: boolean;
    decks: boolean;
    favorites: boolean;
  };
  tableCounts: {
    users: number | string;
    collections: number | string;
    decks: number | string;
    favorites: number | string;
  };
}

interface ConfigInfo {
  region: {
    AMZ_REGION: boolean;
    AWS_REGION: boolean;
    value: string;
  };
  credentials: {
    AMZ_ACCESS_KEY_ID: boolean;
    AMZ_SECRET_ACCESS_KEY: boolean;
    AWS_ACCESS_KEY_ID: boolean;
    AWS_SECRET_ACCESS_KEY: boolean;
  };
  tables: {
    USERS: string;
    COLLECTIONS: string;
    DECKS: string;
    FAVORITES: string;
  };
  environment: string;
  hasCredentials: boolean;
}

interface CredentialTestResult {
  name: string;
  success: boolean;
  error?: string;
  tables: string[];
  count: number;
}

interface CredentialTestInfo {
  results: CredentialTestResult[];
  environment: {
    AMZ_REGION: boolean;
    AMZ_ACCESS_KEY_ID: boolean;
    AMZ_SECRET_ACCESS_KEY: boolean;
    AWS_REGION: boolean;
    AWS_ACCESS_KEY_ID: boolean;
    AWS_SECRET_ACCESS_KEY: boolean;
    NODE_ENV: string;
  };
}

export default function DebugTablesPage() {
  const [debugInfo, setDebugInfo] = useState<TableDebugInfo | null>(null);
  const [configInfo, setConfigInfo] = useState<ConfigInfo | null>(null);
  const [credentialInfo, setCredentialInfo] = useState<CredentialTestInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        setLoading(true);
        
        // Buscar configurações primeiro
        const configResponse = await fetch('/api/debug/config');
        const configData = await configResponse.json();
        
        if (configData.success) {
          setConfigInfo(configData.config);
        }
        
        // Testar credenciais
        const credentialResponse = await fetch('/api/debug/amplify-credentials');
        const credentialData = await credentialResponse.json();
        
        if (credentialData.success) {
          setCredentialInfo(credentialData);
        }
        
        // Buscar informações das tabelas (só se alguma credencial funcionar)
        const workingCredential = credentialData.results?.find((r: CredentialTestResult) => r.success);
        
        if (workingCredential) {
          const response = await fetch('/api/debug/tables');
          const data = await response.json();
          
          if (data.success) {
            setDebugInfo(data);
          } else {
            setError(data.message || 'Erro ao buscar informações das tabelas');
          }
        } else {
          setError('Nenhuma credencial AWS funcionou. Verifique as configurações.');
        }
      } catch (err) {
        setError('Erro ao conectar com a API');
      } finally {
        setLoading(false);
      }
    }

    fetchDebugInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Verificando configurações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ Erro</div>
          <p className="text-white">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Debug das Tabelas DynamoDB
        </h1>

        <div className="space-y-6">
          {/* Configurações */}
          {configInfo && (
            <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Configurações AWS</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-sm text-slate-400">Região</div>
                  <div className="text-white font-mono">{configInfo.region.value}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    AMZ_REGION: {configInfo.region.AMZ_REGION ? '✅' : '❌'} | 
                    AWS_REGION: {configInfo.region.AWS_REGION ? '✅' : '❌'}
                  </div>
                </div>
                
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-sm text-slate-400">Credenciais</div>
                  <div className={`text-white font-bold ${configInfo.hasCredentials ? 'text-green-400' : 'text-red-400'}`}>
                    {configInfo.hasCredentials ? 'Configuradas' : 'Não configuradas'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    AMZ_ACCESS_KEY_ID: {configInfo.credentials.AMZ_ACCESS_KEY_ID ? '✅' : '❌'} | 
                    AMZ_SECRET_ACCESS_KEY: {configInfo.credentials.AMZ_SECRET_ACCESS_KEY ? '✅' : '❌'}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-sm text-slate-400">Ambiente</div>
                <div className="text-white font-mono">{configInfo.environment}</div>
              </div>
            </div>
          )}

          {/* Teste de Credenciais */}
          {credentialInfo && (
            <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Teste de Credenciais AWS</h2>
              
              <div className="space-y-3">
                {credentialInfo.results.map((result, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{result.name}</span>
                      <div className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    </div>
                    
                    {result.success ? (
                      <div className="text-sm text-slate-300">
                        ✅ Conectado com sucesso - {result.count} tabelas encontradas
                      </div>
                    ) : (
                      <div className="text-sm text-red-400">
                        ❌ Erro: {result.error}
                      </div>
                    )}
                    
                    {result.tables.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-slate-400 mb-1">Tabelas encontradas:</div>
                        <div className="grid grid-cols-2 gap-1">
                          {result.tables.slice(0, 6).map((table, idx) => (
                            <div key={idx} className="text-xs text-slate-300 bg-slate-600/50 px-2 py-1 rounded">
                              {table}
                            </div>
                          ))}
                          {result.tables.length > 6 && (
                            <div className="text-xs text-slate-500 col-span-2">
                              +{result.tables.length - 6} mais...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {debugInfo && (
            <>
              {/* Tabelas Configuradas */}
              <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Tabelas Configuradas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(debugInfo.configuredTables).map(([key, value]) => (
                    <div key={key} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-sm text-slate-400">{key}</div>
                      <div className="text-white font-mono">{value as string}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status das Tabelas */}
              <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Status das Tabelas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(debugInfo.tableStatus).map(([tableName, exists]) => (
                    <div key={tableName} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white capitalize">{tableName}</span>
                        <div className={`w-3 h-3 rounded-full ${exists ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {exists ? 'Existe' : 'Não existe'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contagem de Itens */}
              <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Contagem de Itens</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(debugInfo.tableCounts).map(([tableName, count]) => (
                    <div key={tableName} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white capitalize">{tableName}</span>
                        <span className={`font-bold ${
                          typeof count === 'number' ? 'text-blue-400' : 'text-red-400'
                        }`}>
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Todas as Tabelas */}
              <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Todas as Tabelas Disponíveis</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {debugInfo.allTables.map((tableName) => (
                    <div key={tableName} className="bg-slate-700/50 rounded-lg p-2">
                      <div className="text-sm text-white font-mono">{tableName}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 