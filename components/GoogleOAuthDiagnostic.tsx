'use client';

import { useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import { Hub } from 'aws-amplify/utils';
import '../styles/oauth-diagnostic.css';

export default function GoogleOAuthDiagnostic() {
  const [diagnostics, setDiagnostics] = useState({
    configFound: false,
    userPoolId: '',
    userPoolClientId: '',
    oauthDomain: '',
    redirectSignIn: [] as string[],
    redirectSignOut: [] as string[],
    googleProviderEnabled: false,
    amplifyConfigured: false,
    oauthConfigured: false
  });
  
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [fixAttemptStatus, setFixAttemptStatus] = useState('');

  // Adicionar um log com timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    checkOAuthConfiguration();
    
    // Configurar listeners para eventos do Hub
    const listener = (data: any) => {
      const { payload } = data;
      addLog(`Hub event: ${payload.event}`);
    };

    Hub.listen('auth', listener);
    
    return () => {
      Hub.listen('auth', listener);
    };
  }, []);

  // Verificar configuração OAuth
  const checkOAuthConfiguration = async () => {
    addLog('Iniciando diagnóstico de configuração OAuth');
    setLoading(true);
    
    try {
      // Tentar obter a configuração do Amplify
      const currentConfig = Amplify.getConfig();
      
      // Verificar se o Auth está configurado
      const authConfig = currentConfig.Auth?.Cognito;
      
      if (!authConfig) {
        addLog('⚠️ Configuração Auth não encontrada');
        setDiagnostics(prev => ({
          ...prev,
          configFound: false
        }));
      } else {
        addLog('✓ Configuração Auth encontrada');
        
        // Verificar User Pool ID
        const userPoolId = authConfig.userPoolId;
        if (!userPoolId) {
          addLog('⚠️ User Pool ID não encontrado');
        } else {
          addLog(`✓ User Pool ID encontrado: ${maskSensitiveInfo(userPoolId)}`);
        }
        
        // Verificar Client ID
        const clientId = authConfig.userPoolClientId;
        if (!clientId) {
          addLog('⚠️ User Pool Client ID não encontrado');
        } else {
          addLog(`✓ User Pool Client ID encontrado: ${maskSensitiveInfo(clientId)}`);
        }
        
        // Verificar configuração OAuth
        const oauthConfig = authConfig.loginWith?.oauth;
        if (!oauthConfig) {
          addLog('⚠️ Configuração OAuth não encontrada');
        } else {
          addLog('✓ Configuração OAuth encontrada');
          
          // Verificar domínio
          if (!oauthConfig.domain) {
            addLog('⚠️ Domínio OAuth não encontrado');
          } else {
            addLog(`✓ Domínio OAuth encontrado: ${maskSensitiveInfo(oauthConfig.domain)}`);
          }
          
          // Verificar URLs de redirecionamento
          if (!oauthConfig.redirectSignIn || oauthConfig.redirectSignIn.length === 0) {
            addLog('⚠️ URLs de redirecionamento para login não encontradas');
          } else {
            addLog(`✓ URLs de redirecionamento para login encontradas: ${oauthConfig.redirectSignIn.join(', ')}`);
          }
          
          if (!oauthConfig.redirectSignOut || oauthConfig.redirectSignOut.length === 0) {
            addLog('⚠️ URLs de redirecionamento para logout não encontradas');
          } else {
            addLog(`✓ URLs de redirecionamento para logout encontradas: ${oauthConfig.redirectSignOut.join(', ')}`);
          }
          
          // Verificar escopos
          if (!oauthConfig.scopes || oauthConfig.scopes.length === 0) {
            addLog('⚠️ Escopos OAuth não encontrados');
          } else {
            addLog(`✓ Escopos OAuth encontrados: ${oauthConfig.scopes.join(', ')}`);
          }
        }
        
        setDiagnostics({
          configFound: true,
          userPoolId: userPoolId || '',
          userPoolClientId: clientId || '',
          oauthDomain: oauthConfig?.domain || '',
          redirectSignIn: (oauthConfig?.redirectSignIn as string[]) || [],
          redirectSignOut: (oauthConfig?.redirectSignOut as string[]) || [],
          googleProviderEnabled: !!oauthConfig,
          amplifyConfigured: true,
          oauthConfigured: !!oauthConfig
        });
      }
      
    } catch (error) {
      addLog(`⚠️ Erro ao verificar configuração: ${error instanceof Error ? error.message : String(error)}`);
      setDiagnostics(prev => ({
        ...prev,
        configFound: false
      }));
    } finally {
      setLoading(false);
      addLog('Diagnóstico concluído');
    }
  };
  
  // Tentar corrigir automaticamente
  const attemptAutoFix = async () => {
    addLog('Tentando corrigir automaticamente...');
    setFixAttemptStatus('pending');
    
    try {
      const response = await fetch('/api/auth/fix-oauth-config', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog('✓ Correção automática bem-sucedida');
        setFixAttemptStatus('success');
        // Recarregar a página para aplicar as novas configurações
        window.location.reload();
      } else {
        addLog(`⚠️ Falha na correção automática: ${data.error}`);
        setFixAttemptStatus('error');
      }
    } catch (error) {
      addLog(`⚠️ Erro na correção automática: ${error instanceof Error ? error.message : String(error)}`);
      setFixAttemptStatus('error');
    }
  };
  
  // Mascarar informações sensíveis
  const maskSensitiveInfo = (info: string) => {
    if (!info) return '';
    if (info.length <= 8) return '****';
    return `${info.substring(0, 4)}****${info.substring(info.length - 4)}`;
  };
  
  return (
    <div className="oauth-diagnostic">
      <h2>Diagnóstico de Autenticação OAuth</h2>
      
      <div className="diagnostic-status">
        <h3>Status da Configuração</h3>
        <ul>
          <li>
            <span className="status-label">Amplify configurado:</span>
            <span className={`status-indicator ${diagnostics.amplifyConfigured ? 'success' : 'error'}`}>
              {diagnostics.amplifyConfigured ? '✓' : '✗'}
            </span>
          </li>
          <li>
            <span className="status-label">User Pool ID:</span>
            <span className={`status-indicator ${diagnostics.userPoolId ? 'success' : 'error'}`}>
              {diagnostics.userPoolId ? '✓' : '✗'}
            </span>
          </li>
          <li>
            <span className="status-label">Client ID:</span>
            <span className={`status-indicator ${diagnostics.userPoolClientId ? 'success' : 'error'}`}>
              {diagnostics.userPoolClientId ? '✓' : '✗'}
            </span>
          </li>
          <li>
            <span className="status-label">Domínio OAuth:</span>
            <span className={`status-indicator ${diagnostics.oauthDomain ? 'success' : 'error'}`}>
              {diagnostics.oauthDomain ? '✓' : '✗'}
            </span>
          </li>
          <li>
            <span className="status-label">URL de redirecionamento:</span>
            <span className={`status-indicator ${diagnostics.redirectSignIn.length > 0 ? 'success' : 'error'}`}>
              {diagnostics.redirectSignIn.length > 0 ? '✓' : '✗'}
            </span>
          </li>
          <li>
            <span className="status-label">Provider Google:</span>
            <span className={`status-indicator ${diagnostics.googleProviderEnabled ? 'success' : 'error'}`}>
              {diagnostics.googleProviderEnabled ? '✓' : '✗'}
            </span>
          </li>
        </ul>
      </div>
      
      <div className="diagnostic-logs">
        <h3>Logs de Diagnóstico</h3>
        <div className="logs-container">
          {logs.map((log, index) => (
            <div key={index} className="log-entry">
              {log}
            </div>
          ))}
        </div>
      </div>
      
      <div className="diagnostic-actions">
        <button 
          onClick={checkOAuthConfiguration}
          disabled={loading}
          className="action-button check"
        >
          {loading ? 'Verificando...' : 'Verificar Novamente'}
        </button>
        
        <button 
          onClick={attemptAutoFix}
          disabled={loading || fixAttemptStatus === 'pending'}
          className={`action-button fix ${fixAttemptStatus}`}
        >
          {fixAttemptStatus === 'pending' ? 'Corrigindo...' : 'Tentar Corrigir Automaticamente'}
        </button>
      </div>
      
      <div className="manual-setup-link">
        <a href="/admin/google-oauth-setup">Ir para Configuração Manual</a>
      </div>
    </div>
  );
}
