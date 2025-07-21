'use client';

import { useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser, Amplify, Hub } from '@/lib/aws-auth-adapter';
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
      if (typeof window !== 'undefined' && window.__amplifyConfigured) {
        addLog('✓ Amplify configurado. Para detalhes, verifique o arquivo de configuração usado em configureAmplify().');
        setDiagnostics(prev => ({ ...prev, configFound: true, amplifyConfigured: true }));
      } else {
        addLog('⚠️ Amplify não está configurado.');
        setDiagnostics(prev => ({ ...prev, configFound: false, amplifyConfigured: false }));
      }
    } catch (error) {
      addLog(`⚠️ Erro ao verificar configuração: ${error instanceof Error ? error.message : String(error)}`);
      setDiagnostics(prev => ({ ...prev, configFound: false, amplifyConfigured: false }));
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
        // Redirecionar para aplicar as novas configurações
        window.location.href = '/';
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
