'use client';

import { useState } from 'react';
import './GoogleOAuthSetup.module.css';

export default function GoogleOAuthSetup() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState('http://localhost:3000/api/auth/callback/google');
  const [status, setStatus] = useState({type: '', message: ''});
  const [loading, setLoading] = useState(false);
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/setup-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          clientSecret,
          redirectUri,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus({
          type: 'success',
          message: 'Configurações do Google OAuth salvas com sucesso. Reinicie o servidor para aplicar as alterações.'
        });
      } else {
        setStatus({
          type: 'error',
          message: `Erro ao salvar: ${data.error}`
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 max-w-xl mx-auto mt-8 p-6 rounded-lg border border-slate-700 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">
        Configuração do Google OAuth
      </h2>
      
      <div className="mb-4">
        <p className="text-slate-300 mb-2">
          Para configurar o login com Google, você precisa criar um projeto no 
          <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline"> Console de Desenvolvedores do Google</a> 
          e obter as credenciais OAuth.
        </p>
      </div>
      
      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-slate-300 mb-1">Client ID</label>
          <input
            id="clientId"
            type="text"
            className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
            value={clientId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientId(e.target.value)}
            placeholder="Seu Google Client ID"
          />
        </div>
        
        <div>
          <label htmlFor="clientSecret" className="block text-sm font-medium text-slate-300 mb-1">Client Secret</label>
          <input
            id="clientSecret"
            type="password"
            className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
            value={clientSecret}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientSecret(e.target.value)}
            placeholder="Seu Google Client Secret"
          />
        </div>
        
        <div>
          <label htmlFor="redirectUri" className="block text-sm font-medium text-slate-300 mb-1">URL de Redirecionamento</label>
          <input
            id="redirectUri"
            type="text"
            className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
            value={redirectUri}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRedirectUri(e.target.value)}
            placeholder="URL de redirecionamento após autenticação"
          />
          <p className="text-xs text-slate-400 mt-1">Você deve adicionar esta URL às URLs de redirecionamento autorizadas no console de desenvolvedores do Google.</p>
        </div>
      </div>
      
      {status.message && (
        <div className={`p-3 mb-4 rounded ${status.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
          {status.message}
        </div>
      )}
      
      <button 
        className={`py-2 px-4 rounded ${(!clientId || !clientSecret) 
          ? 'bg-slate-600 cursor-not-allowed text-slate-400' 
          : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        onClick={handleSave}
        disabled={!clientId || !clientSecret}
      >
        Salvar Configurações
      </button>
    </div>
  );
}
