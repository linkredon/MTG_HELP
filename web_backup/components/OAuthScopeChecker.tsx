'use client';

import React, { useState } from 'react';

export default function OAuthScopeChecker() {
  // Os escopos esperados para Google OAuth
  const recommendedScopes = [
    'profile',
    'email',
    'openid'
  ];

  // Estado para armazenar os escopos configurados pelo usuário
  const [configuredScopes, setConfiguredScopes] = useState<string[]>([
    'profile',
    'email',
    'openid'
  ]);

  // Estado para controlar se está editando
  const [isEditing, setIsEditing] = useState(false);

  // Função para comparar os escopos e identificar quais estão faltando ou em excesso
  const analyzeScopes = () => {
    const missing = recommendedScopes.filter(scope => !configuredScopes.includes(scope));
    const extra = configuredScopes.filter(scope => !recommendedScopes.includes(scope));

    return { missing, extra };
  };

  // Resultados da análise
  const { missing, extra } = analyzeScopes();
  
  // Adicionar um escopo
  const addScope = () => {
    setConfiguredScopes([...configuredScopes, '']);
    setIsEditing(true);
  };

  // Atualizar um escopo
  const updateScope = (index: number, value: string) => {
    const updated = [...configuredScopes];
    updated[index] = value;
    setConfiguredScopes(updated);
  };

  // Remover um escopo
  const removeScope = (index: number) => {
    const updated = configuredScopes.filter((_, i) => i !== index);
    setConfiguredScopes(updated);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Verificador de Escopos OAuth</h2>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Escopos Configurados</h3>
        
        {isEditing ? (
          <div className="mb-4">
            {configuredScopes.map((scope, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={scope}
                  onChange={(e) => updateScope(index, e.target.value)}
                  className="border rounded px-2 py-1 flex-1 mr-2"
                />
                <button
                  onClick={() => removeScope(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </button>
              </div>
            ))}
            <div className="flex space-x-2 mt-2">
              <button
                onClick={addScope}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Adicionar Escopo
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
              >
                Concluído
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            {configuredScopes.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {configuredScopes.map((scope, index) => (
                  <li key={index}>
                    <code className="bg-gray-100 px-1 rounded">{scope}</code>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-gray-500">Nenhum escopo configurado</p>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 text-sm mt-2"
            >
              Editar escopos
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Escopos Recomendados</h3>
        <ul className="list-disc pl-5 space-y-1">
          {recommendedScopes.map((scope, index) => (
            <li key={index}>
              <code className="bg-gray-100 px-1 rounded">{scope}</code>
              {configuredScopes.includes(scope) && (
                <span className="text-green-600 ml-2">✓</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      {(missing.length > 0 || extra.length > 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">Possíveis problemas detectados:</h3>
          
          {missing.length > 0 && (
            <div className="mb-2">
              <h4 className="font-medium text-yellow-800">Escopos ausentes:</h4>
              <ul className="list-disc pl-5 space-y-1 text-yellow-700">
                {missing.map((scope, index) => (
                  <li key={index}>
                    <code className="bg-yellow-100 px-1 rounded">{scope}</code>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-yellow-700 mt-1">
                A ausência destes escopos pode causar problemas na autenticação ou na obtenção dos dados do usuário.
              </p>
            </div>
          )}
          
          {extra.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-800">Escopos extras:</h4>
              <ul className="list-disc pl-5 space-y-1 text-yellow-700">
                {extra.map((scope, index) => (
                  <li key={index}>
                    <code className="bg-yellow-100 px-1 rounded">{scope}</code>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-yellow-700 mt-1">
                Escopos extras não são necessariamente um problema, mas podem requerer aprovações adicionais do Google.
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-medium text-blue-800 mb-2">Verificação de escopos</h3>
        <p className="text-blue-700 text-sm mb-2">
          Para o funcionamento básico da autenticação Google via Cognito, recomendamos os seguintes escopos:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
          <li><code className="bg-blue-100 px-1 rounded">profile</code> - Para acessar informações básicas do perfil do usuário</li>
          <li><code className="bg-blue-100 px-1 rounded">email</code> - Para obter o endereço de email do usuário</li>
          <li><code className="bg-blue-100 px-1 rounded">openid</code> - Para permitir autenticação OpenID Connect</li>
        </ul>
        <p className="text-blue-700 text-sm mt-2">
          Certifique-se de que estes escopos estejam configurados tanto no Google Cloud Console quanto no AWS Cognito.
        </p>
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Onde configurar os escopos:</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>
            <strong>Google Cloud Console:</strong> 
            <span className="text-sm text-gray-600">APIs & Services {'>'} OAuth consent screen {'>'} Scopes</span>
          </li>
          <li>
            <strong>AWS Cognito:</strong> 
            <span className="text-sm text-gray-600">User Pools {'>'} App integration {'>'} Identity providers {'>'} Google {'>'} Authorize scopes</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
