import { Amplify } from 'aws-amplify';
import { configureAmplify } from '@/lib/amplifySetup';

/**
 * Component de teste para verificar as configurações de autenticação
 * Não é necessário adicionar este componente ao seu aplicativo final,
 * apenas use-o para diagnosticar problemas de configuração.
 */
export default function OAuthTest() {
  // Remover a chamada de configureAmplify
  
  // Diagnóstico simples: checar se Amplify está configurado
  const isConfigured = typeof window !== 'undefined' && window.__amplifyConfigured;
  
  return (
    <div className="p-6 max-w-md mx-auto bg-gray-800 rounded-xl shadow-md overflow-hidden mt-10">
      <div className="space-y-4">
        <h1 className="text-xl font-medium text-white">Diagnóstico OAuth</h1>
        
        <div className="bg-gray-700 p-3 rounded">
          <h2 className="text-lg text-white mb-2">Status do Amplify</h2>
          <div className="text-sm text-gray-300 space-y-1">
            <p><span className="font-semibold">Amplify configurado:</span> {isConfigured ? 'Sim' : 'Não'}</p>
          </div>
        </div>
        
        <button
          onClick={() => alert(isConfigured ? 'Amplify configurado.' : 'Amplify não configurado.')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Testar Status do Amplify
        </button>
        
        <div className="text-xs text-gray-400 mt-2">
          Este componente é apenas para diagnóstico. Se o login falhar, verifique se a URL atual está nas URLs de redirecionamento configuradas.
        </div>
      </div>
    </div>
  );
}
