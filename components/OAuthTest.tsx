import { Amplify } from 'aws-amplify';
import { configureAmplify } from '@/lib/amplifySetup';

/**
 * Component de teste para verificar as configurações de autenticação
 * Não é necessário adicionar este componente ao seu aplicativo final,
 * apenas use-o para diagnosticar problemas de configuração.
 */
export default function OAuthTest() {
  // Configurar Amplify (só para garantir que está inicializado)
  configureAmplify();
  
  // Obter configuração atual
  const config = Amplify.getConfig();
  const oauthConfig = config.Auth?.Cognito?.loginWith?.oauth;
  
  // Função para tentar login com Google
  const testGoogleLogin = async () => {
    try {
      console.log("🔍 Iniciando diagnóstico OAuth com Google...");
      
      // Imprimir configuração atual
      console.log("📋 Configuração atual:");
      console.log("- Domain:", oauthConfig?.domain);
      console.log("- RedirectSignIn:", oauthConfig?.redirectSignIn);
      console.log("- Providers:", oauthConfig?.providers);
      
      // Verificar se a URL atual está nas URLs de redirecionamento
      const currentOrigin = window.location.origin;
      const hasMatchingRedirect = Array.isArray(oauthConfig?.redirectSignIn) && 
        oauthConfig.redirectSignIn.some((url: string) => url.includes(currentOrigin));
      
      if (!hasMatchingRedirect) {
        console.error(`⚠️ AVISO: A origem atual (${currentOrigin}) não está nas URLs de redirecionamento!`);
        alert(`⚠️ A origem atual (${currentOrigin}) não está nas URLs de redirecionamento! O login provavelmente falhará.`);
      }
      
      // Imprimir URL para onde o usuário será redirecionado
      console.log(`🔄 Redirecionando para: ${oauthConfig?.domain}/oauth2/authorize...`);
      
      // Abrir janela de login
      window.location.href = `${oauthConfig?.domain}/oauth2/authorize?client_id=${config.Auth?.Cognito?.userPoolClientId}&response_type=code&scope=email+profile+openid+aws.cognito.signin.user.admin&redirect_uri=${encodeURIComponent(currentOrigin + '/login')}`;
    } catch (error) {
      console.error("❌ Erro ao iniciar login:", error);
      alert(`Erro ao iniciar login: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <div className="p-6 max-w-md mx-auto bg-gray-800 rounded-xl shadow-md overflow-hidden mt-10">
      <div className="space-y-4">
        <h1 className="text-xl font-medium text-white">Diagnóstico OAuth</h1>
        
        <div className="bg-gray-700 p-3 rounded">
          <h2 className="text-lg text-white mb-2">Configuração Atual</h2>
          <div className="text-sm text-gray-300 space-y-1">
            <p><span className="font-semibold">URL Atual:</span> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            <p><span className="font-semibold">Domínio OAuth:</span> {oauthConfig?.domain || 'Não configurado'}</p>
            <p><span className="font-semibold">Provedores:</span> {oauthConfig?.providers?.join(', ') || 'Nenhum'}</p>
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <h2 className="text-lg text-white mb-2">URLs de Redirecionamento</h2>
          <div className="text-sm text-gray-300 space-y-2 max-h-32 overflow-y-auto">
            <p className="font-semibold">SignIn:</p>
            <ul className="list-disc pl-5">
              {Array.isArray(oauthConfig?.redirectSignIn) ? 
                oauthConfig.redirectSignIn.map((url: string, i: number) => (
                  <li key={i} className={typeof window !== 'undefined' && url.includes(window.location.origin) 
                    ? "text-green-400" 
                    : ""}>
                    {url}
                    {typeof window !== 'undefined' && url.includes(window.location.origin) && " (URL atual ✓)"}
                  </li>
                )) : 
                <li className="text-red-400">Nenhuma URL configurada</li>
              }
            </ul>
          </div>
        </div>
        
        <button
          onClick={testGoogleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Testar Login com Google
        </button>
        
        <div className="text-xs text-gray-400 mt-2">
          Este componente é apenas para diagnóstico. Se o login falhar, verifique se a URL atual está nas URLs de redirecionamento configuradas.
        </div>
      </div>
    </div>
  );
}
