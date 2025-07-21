'use client';

import React, { useState } from 'react';

export default function GoogleCredentialsUpdater() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [updateEnv, setUpdateEnv] = useState(true);
  const [status, setStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
    details?: any;
  }>({ loading: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId || !clientSecret) {
      setStatus({
        loading: false,
        success: false,
        message: 'Por favor, preencha todos os campos'
      });
      return;
    }

    setStatus({ loading: true });

    try {
      const response = await fetch('/api/auth/update-oauth-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleClientId: clientId,
          googleClientSecret: clientSecret,
          updateEnv
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          loading: false,
          success: true,
          message: data.message || 'Credenciais atualizadas com sucesso',
          details: data
        });
      } else {
        setStatus({
          loading: false,
          success: false,
          message: data.message || 'Erro ao atualizar credenciais',
          details: data
        });
      }
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Atualizar Credenciais do Google OAuth</h2>
      <p className="text-gray-600 mb-4">
        Use este formulário para atualizar as credenciais do Google OAuth que são usadas para autenticação.
        Você pode obter estas credenciais no <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
            Google Client ID
          </label>
          <input
            id="clientId"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ex: 1234567890-abcdefghijk.apps.googleusercontent.com"
          />
        </div>

        <div>
          <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 mb-1">
            Google Client Secret
          </label>
          <input
            id="clientSecret"
            type="text"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ex: GOCSPX-abcdefghijklmnop"
          />
        </div>

        <div className="flex items-center">
          <input
            id="updateEnv"
            type="checkbox"
            checked={updateEnv}
            onChange={(e) => setUpdateEnv(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="updateEnv" className="ml-2 block text-sm text-gray-700">
            Atualizar arquivo .env.local
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={status.loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {status.loading ? 'Atualizando...' : 'Atualizar Credenciais'}
          </button>
        </div>
      </form>

      {status.message && (
        <div
          className={`mt-4 p-3 rounded-md ${
            status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          <p className="font-medium">{status.message}</p>
          {status.details && (
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(status.details, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded p-3">
        <h3 className="text-sm font-medium text-yellow-800 mb-1">Importante</h3>
        <ul className="list-disc pl-5 text-sm text-yellow-700">
          <li>Após atualizar as credenciais, você precisará reiniciar o servidor para que as mudanças tenham efeito.</li>
          <li>Você também precisará atualizar as credenciais no AWS Cognito Console.</li>
          <li>Certifique-se de que os URIs de redirecionamento estão configurados corretamente no Google Cloud Console.</li>
        </ul>
      </div>
    </div>
  );
}
