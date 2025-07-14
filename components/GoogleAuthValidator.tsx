'use client';

import { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function GoogleAuthValidator() {
  const [results, setResults] = useState<{
    domain: { value: string; valid: boolean; message: string };
    userPoolId: { value: string; valid: boolean; message: string };
    clientId: { value: string; valid: boolean; message: string };
    redirectUrls: { value: string[]; valid: boolean; message: string };
    fixApplied: boolean;
  }>({
    domain: { value: '', valid: false, message: 'Não verificado' },
    userPoolId: { value: '', valid: false, message: 'Não verificado' },
    clientId: { value: '', valid: false, message: 'Não verificado' },
    redirectUrls: { value: [], valid: false, message: 'Não verificado' },
    fixApplied: false
  });

  const [loading, setLoading] = useState(false);

  // Verificar configuração atual
  const checkConfiguration = () => {
    setLoading(true);
    
    try {
      const config = Amplify.getConfig();
      const authConfig = config.Auth?.Cognito;
      
      // Verificar domínio
      const domain = authConfig?.loginWith?.oauth?.domain || '';
      const isDomainValid = Boolean(domain && domain.startsWith('https://'));
      
      // Verificar UserPoolId
      const userPoolId = authConfig?.userPoolId || '';
      const isUserPoolIdValid = Boolean(userPoolId && /^[\w-]+_[\w]+$/.test(userPoolId));
      
      // Verificar ClientId
      const clientId = authConfig?.userPoolClientId || '';
      const isClientIdValid = Boolean(clientId && clientId.length > 10);
      
      // Verificar URLs de redirecionamento
      const redirectUrls = authConfig?.loginWith?.oauth?.redirectSignIn || [];
      const areUrlsValid = redirectUrls.length > 0;
      
      setResults({
        domain: { 
          value: domain, 
          valid: isDomainValid,
          message: isDomainValid 
            ? 'Válido' 
            : domain 
              ? 'Deve começar com https://' 
              : 'Não configurado'
        },
        userPoolId: { 
          value: userPoolId, 
          valid: isUserPoolIdValid,
          message: isUserPoolIdValid 
            ? 'Válido' 
            : userPoolId 
              ? 'Formato inválido (deve ser região_identificador)' 
              : 'Não configurado'
        },
        clientId: { 
          value: clientId, 
          valid: isClientIdValid,
          message: isClientIdValid 
            ? 'Válido' 
            : clientId 
              ? 'Muito curto ou inválido' 
              : 'Não configurado'
        },
        redirectUrls: { 
          value: redirectUrls, 
          valid: areUrlsValid,
          message: areUrlsValid 
            ? 'URLs configuradas' 
            : 'Nenhuma URL configurada'
        },
        fixApplied: false
      });
      
    } catch (error) {
      console.error('Erro ao verificar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tentar corrigir problemas automaticamente
  const applyFix = () => {
    setLoading(true);
    
    try {
      const config = Amplify.getConfig();
      const authConfig = config.Auth?.Cognito;
      
      // Corrigir o domínio se necessário
      if (authConfig?.loginWith?.oauth?.domain) {
        let domain = authConfig.loginWith.oauth.domain;
        
        // Adicionar https:// se não existir
        if (!domain.startsWith('https://')) {
          domain = `https://${domain}`;
        }
        
        // Remover barra final se existir
        if (domain.endsWith('/')) {
          domain = domain.slice(0, -1);
        }
        
        // Atualizar domínio
        const updatedConfig = {
          ...config,
          Auth: {
            ...config.Auth,
            Cognito: {
              ...authConfig,
              loginWith: {
                ...authConfig.loginWith,
                oauth: {
                  ...authConfig.loginWith.oauth,
                  domain
                }
              }
            }
          }
        };
        
        // Aplicar configuração atualizada
        console.log(`Atualizando domínio para: ${domain}`);
        
        // Recarregar a página é mais eficaz do que tentar reconfigurar o Amplify
        // Armazenamos o novo valor em localStorage para aplicar após o reload
        localStorage.setItem('corrected_oauth_domain', domain);
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        // Verificar novamente a configuração
        checkConfiguration();
        
        setResults(prev => ({
          ...prev,
          fixApplied: true
        }));
      }
    } catch (error) {
      console.error('Erro ao aplicar correção:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Validador de Configuração OAuth</h2>
      
      <div className="mb-4">
        <button
          onClick={checkConfiguration}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Verificar Configuração'}
        </button>
      </div>
      
      {results.domain.value && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900 rounded-md">
            <h3 className="font-semibold text-white mb-2">Domínio OAuth:</h3>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-4 h-4 rounded-full ${results.domain.valid ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-slate-300">{results.domain.value}</span>
            </div>
            <p className={`text-sm ${results.domain.valid ? 'text-green-400' : 'text-red-400'} mt-1`}>
              {results.domain.message}
            </p>
          </div>
          
          <div className="p-3 bg-slate-900 rounded-md">
            <h3 className="font-semibold text-white mb-2">User Pool ID:</h3>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-4 h-4 rounded-full ${results.userPoolId.valid ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-slate-300">{results.userPoolId.value}</span>
            </div>
            <p className={`text-sm ${results.userPoolId.valid ? 'text-green-400' : 'text-red-400'} mt-1`}>
              {results.userPoolId.message}
            </p>
          </div>
          
          <div className="p-3 bg-slate-900 rounded-md">
            <h3 className="font-semibold text-white mb-2">Client ID:</h3>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-4 h-4 rounded-full ${results.clientId.valid ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-slate-300">{results.clientId.value.substring(0, 8)}...</span>
            </div>
            <p className={`text-sm ${results.clientId.valid ? 'text-green-400' : 'text-red-400'} mt-1`}>
              {results.clientId.message}
            </p>
          </div>
          
          <div className="p-3 bg-slate-900 rounded-md">
            <h3 className="font-semibold text-white mb-2">URLs de Redirecionamento:</h3>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-4 h-4 rounded-full ${results.redirectUrls.valid ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-slate-300">{results.redirectUrls.value.length} URLs configuradas</span>
            </div>
            {results.redirectUrls.value.length > 0 && (
              <div className="mt-2 max-h-28 overflow-y-auto pl-6">
                <ul className="list-disc text-sm text-slate-400">
                  {results.redirectUrls.value.slice(0, 5).map((url, idx) => (
                    <li key={idx}>{url}</li>
                  ))}
                  {results.redirectUrls.value.length > 5 && (
                    <li>...e mais {results.redirectUrls.value.length - 5} URLs</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          {!results.domain.valid && (
            <div className="mt-4">
              <button
                onClick={applyFix}
                disabled={loading || results.fixApplied}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? 'Aplicando...' : results.fixApplied ? 'Correção Aplicada' : 'Corrigir Problemas de Domínio'}
              </button>
              
              {results.fixApplied && (
                <p className="mt-2 text-sm text-green-400">
                  Correção aplicada. Por favor, verifique novamente a configuração.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
