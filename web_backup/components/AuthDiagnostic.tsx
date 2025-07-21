"use client";

import { useState } from 'react';
import { getAuthDiagnosticData } from '@/lib/authDiagnostic';

export default function AuthDiagnosticComponent() {
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const runDiagnostic = () => {
    const data = getAuthDiagnosticData();
    setDiagnosticData(data);
    setIsVisible(true);
  };

  if (!isVisible) {
    return (
      <button
        onClick={runDiagnostic}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition-colors"
        title="Diagnosticar configuração de autenticação"
      >
        🔍
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Diagnóstico de Autenticação</h2>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {diagnosticData && (
            <div className="space-y-6">
              <div className="bg-gray-700 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Configuração do Cognito</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">User Pool ID:</span>
                    <span>{diagnosticData.userPoolId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">App Client ID:</span>
                    <span>{diagnosticData.clientId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Domínio:</span>
                    <span className="break-all">{diagnosticData.domain}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Provedores OAuth</h3>
                <div className="text-sm">
                  {diagnosticData.providers?.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {diagnosticData.providers.map((provider: string, index: number) => (
                        <li key={index}>{provider}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-400">Nenhum provedor configurado</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-md">
                <h3 className="font-semibold mb-2">URLs de Redirecionamento</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="text-gray-300 mb-1">SignIn URLs:</h4>
                    {diagnosticData.redirectSignIn?.length > 0 ? (
                      <ul className="list-disc pl-5 break-all">
                        {diagnosticData.redirectSignIn.map((url: string, index: number) => (
                          <li key={index} className={url.includes(diagnosticData.currentOrigin) ? "text-green-400" : ""}>
                            {url}
                            {url.includes(diagnosticData.currentOrigin) && " (URL atual ✓)"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-red-400">Nenhuma URL de SignIn configurada</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-gray-300 mb-1">SignOut URLs:</h4>
                    {diagnosticData.redirectSignOut?.length > 0 ? (
                      <ul className="list-disc pl-5 break-all">
                        {diagnosticData.redirectSignOut.map((url: string, index: number) => (
                          <li key={index} className={url.includes(diagnosticData.currentOrigin) ? "text-green-400" : ""}>
                            {url}
                            {url.includes(diagnosticData.currentOrigin) && " (URL atual ✓)"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-red-400">Nenhuma URL de SignOut configurada</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Verificação de Compatibilidade</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Origem atual:</span>
                    <span>{diagnosticData.currentOrigin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">URL atual em RedirectSignIn:</span>
                    <span className={diagnosticData.hasMatchingRedirect ? "text-green-400" : "text-red-400"}>
                      {diagnosticData.hasMatchingRedirect ? "Sim ✓" : "Não ✗"}
                    </span>
                  </div>
                </div>
              </div>

              {diagnosticData.error && (
                <div className="bg-red-900 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Erro</h3>
                  <p className="text-sm">{diagnosticData.error}</p>
                  {diagnosticData.errorDetails && (
                    <p className="text-xs text-red-300 mt-2">{diagnosticData.errorDetails}</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between pt-4 border-t border-gray-600">
            <button
              onClick={() => setIsVisible(false)}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Fechar
            </button>
            <button
              onClick={runDiagnostic}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Atualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
