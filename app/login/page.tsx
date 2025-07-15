"use client";
import '../../lib/amplifyClient';
import '../../styles/login.css';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth-helpers';
// Verificar se está em um ambiente com OAuth completo
import { Amplify } from 'aws-amplify';
import AuthDiagnostic from '@/components/AuthDiagnostic';
import { printAuthDiagnostic } from '@/lib/authDiagnostic';
import AuthDebugger from '@/components/AuthDebugger';
import AuthTroubleshooter from '@/components/AuthTroubleshooter';
import { signInWithRedirect, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user, refreshUser } = useAmplifyAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminField, setShowAdminField] = useState(false);
  
  // Verificar se o usuário está autenticado e redirecionar se estiver
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Usuário já autenticado, redirecionando...');
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Verificar se o usuário acabou de fazer login com OAuth
  useEffect(() => {
    async function checkOAuthResult() {
      try {
        // Importar funções necessárias
        const { getCurrentUser, fetchUserAttributes } = await import('@aws-amplify/auth');
        
        console.log('Verificando status do usuário OAuth...');
        // Executar diagnóstico de autenticação
        printAuthDiagnostic();
        
        // Verificar se há um usuário autenticado
        try {
          const user = await getCurrentUser();
          
          if (user) {
            console.log('Usuário OAuth detectado:', user);
            // Buscar atributos adicionais se necessário
            try {
              const attributes = await fetchUserAttributes();
              console.log('Atributos do usuário:', attributes);
              
              console.log('Usuário autenticado com OAuth, redirecionando...');
              // Redirecionar para a página inicial após login bem-sucedido
              router.push('/');
              router.refresh();
            } catch (attrError) {
              console.error('Erro ao buscar atributos:', attrError);
            }
          } else {
            console.log('Nenhum usuário OAuth detectado');
          }
        } catch (userError) {
          console.log('Não há sessão ativa de usuário:', userError);
        }
      } catch (error) {
        console.error('Erro ao verificar status OAuth:', error);
      }
    }
    
    checkOAuthResult();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        console.log('Tentando login com:', { email, password });
        const result = await signIn(email, password);
        console.log('Login result:', result);
        if (!result.success) {
          setError(result.error || 'Email ou senha inválidos');
        } else {
          console.log('Login bem-sucedido, redirecionando...');
          await refreshUser();
          router.push('/');
        }
      } else {
        // Verificar se é um registro de administrador
        const isAdmin = adminCode === process.env.NEXT_PUBLIC_ADMIN_CODE || adminCode === 'MTG_ADMIN_2024';
        // Registro
        console.log('Tentando registrar:', { email, password, name, isAdmin });
        const result = await signUp(email, password, name, isAdmin);
        console.log('SignUp result:', result);
        if (result.success) {
          setError('Conta criada! Fazendo login automático...');
          // Tentar fazer login automaticamente
          const loginResult = await signIn(email, password);
          console.log('Auto-login result:', loginResult);
          if (loginResult.success) {
            console.log('Auto-login bem-sucedido, redirecionando...');
            await refreshUser();
            router.push('/');
            router.refresh();
          } else {
            setError('Conta criada! Por favor, faça login. Erro: ' + (loginResult.error || 'Erro desconhecido'));
            setIsLogin(true);
          }
        } else {
          // Mostra erro detalhado se o usuário já existe
          if (result.error && result.error.includes('UsernameExistsException')) {
            setError('Já existe uma conta com este e-mail. Faça login ou recupere sua senha.');
          } else {
            setError('Erro ao registrar usuário: ' + (result.error || 'Erro desconhecido'));
          }
        }
      }
    } catch (error: any) {
      console.error('Erro no handleSubmit:', error);
      setError(error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 text-white">
      {loading && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>}
      
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-400">MTG Helper</h1>
        
        <AuthDiagnostic />
        
        <AuthTroubleshooter />
        
        {error && (
          <div className="bg-red-900 text-white p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 text-center transition-colors ${
              isLogin ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400'
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-center transition-colors ${
              !isLogin ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400'
            }`}
            onClick={() => setIsLogin(false)}
          >
            Registro
          </button>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-md mb-2 hover:bg-gray-600 transition"
          onClick={() => {
            router.push('/auth-monitor');
          }}
        >
          <span role="img" aria-label="Monitor" className="w-5 h-5 bg-white rounded-full p-1 text-center text-gray-700">🔍</span>
          Monitor de Autenticação Google
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold py-2 px-4 rounded-md mb-6 hover:bg-gray-200 transition"
          onClick={async () => {
            try {
              setLoading(true);
              
              // Log para debug
              console.log('Iniciando fluxo de autenticação com Google via Amplify');
              
              // Capturar todos os redirecionamentos para diagnóstico
              const originalAssign = window.location.assign;
              window.location.assign = function(url) {
                console.log('🔍 Redirecionamento detectado para:', url);
                // Analisar a URL para melhor diagnóstico
                try {
                  const urlObj = new URL(url);
                  console.log('Domínio:', urlObj.hostname);
                  console.log('Caminho:', urlObj.pathname);
                  console.log('Parâmetros:', Object.fromEntries(urlObj.searchParams.entries()));
                  
                  // Verificar se a URL contém parâmetros relevantes para autenticação
                  if (urlObj.searchParams.has('client_id') || 
                      urlObj.searchParams.has('redirect_uri') || 
                      urlObj.pathname.includes('oauth2')) {
                    console.log('⚠️ Detectada URL de autenticação OAuth');
                  }
                } catch (parseErr) {
                  console.warn('Erro ao analisar URL:', parseErr);
                }
                
                return originalAssign.call(this, url);
              };
              
              // Definir listener para capturar alterações de hash (comum em fluxos OAuth implícitos)
              window.addEventListener('hashchange', () => {
                console.log('Hash da URL alterado:', window.location.hash);
                if (window.location.hash.includes('id_token') || 
                    window.location.hash.includes('access_token')) {
                  console.log('⚠️ Detectados tokens no hash da URL');
                }
              }, { once: true });
              
              // Tenta iniciar o fluxo OAuth com Google
              console.log('Chamando signInWithRedirect...');
              await signInWithRedirect({provider: 'Google'});
              
              // Nota: o código abaixo só executa se o redirecionamento falhar
              console.log('Login com Google iniciado - O redirecionamento deveria ter ocorrido');
            } catch (err) {
              console.error("❌ Erro ao iniciar login com Google:", err);
              setError("Ocorreu um erro ao tentar fazer login com o Google. Por favor, tente novamente usando o método alternativo abaixo.");
              setLoading(false);
              
              // Fallback para o método manual usando URL direta
              try {
                const domain = 'mtghelper.auth.us-east-2.amazoncognito.com';
                const clientId = '55j5l3rcp164av86djhf9qpjch';
                
                // Determinar a URL de redirecionamento baseada no ambiente
                let redirectUri;
                if (window.location.hostname.includes('amplifyapp.com')) {
                  // URL de produção no Amplify
                  redirectUri = encodeURIComponent('https://main.da2h2t88kn6qm.amplifyapp.com/');
                } else {
                  // URL local (desenvolvimento)
                  redirectUri = encodeURIComponent(window.location.origin + '/');
                }
                
                console.log('Redirecionando para:', redirectUri);
                
                // Construir a URL do Hosted UI para o login com Google usando o domínio correto
                // Nota: Garantimos que o domínio está igual ao que está no AWS Console
                // Se o domínio já começar com https://, não adicionar novamente
                const fullDomain = domain.startsWith('https://') ? domain : `https://${domain}`;
                const googleLoginUrl = `${fullDomain}/oauth2/authorize?identity_provider=Google&redirect_uri=${redirectUri}&response_type=CODE&client_id=${clientId}&scope=openid+profile+email`;
                
                console.log('Redirecionando para URL alternativa:', googleLoginUrl);
                window.location.href = googleLoginUrl;
              } catch (fallbackErr) {
                console.error("❌ Erro no fallback:", fallbackErr);
                setError("Falha completa no login com Google. Por favor, faça login com email e senha.");
              }
            }
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Entrar com Google
        </button>          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-md mb-2 hover:bg-blue-600 transition"
            onClick={() => {
              // Link direto para o Hosted UI do Cognito (método alternativo)
              // Usando o domínio correto do Cognito conforme está no console AWS
              console.log("Tentando método alternativo de login com Google");
              
              // Redirecionar para nosso monitor de autenticação
              const redirectUri = encodeURIComponent(window.location.origin + '/auth-monitor');
              
              // Pegando o domínio correto da configuração do Amplify
              try {
                const { Amplify } = require('aws-amplify');
                const config = Amplify.getConfig();
                const domain = config.Auth?.Cognito?.loginWith?.oauth?.domain || 'https://mtghelper.auth.us-east-2.amazoncognito.com';
                const clientId = config.Auth?.Cognito?.userPoolClientId || '55j5l3rcp164av86djhf9qpjch';
                
                console.log("Usando domínio do Amplify:", domain);
                const directUrl = `${domain}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
                console.log("Redirecionando para:", directUrl);
                window.location.href = directUrl;
              } catch (error) {
                console.error("Erro ao obter configuração:", error);
                // Fallback para URL hardcoded
                const directUrl = `https://mtghelper.auth.us-east-2.amazoncognito.com/login?response_type=code&client_id=55j5l3rcp164av86djhf9qpjch&redirect_uri=${redirectUri}`;
                console.log("Redirecionando para fallback:", directUrl);
                window.location.href = directUrl;
              }
            }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-1" />
          Método Login Hosted UI
        </button>
        
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-md mb-2 hover:bg-green-600 transition"
          onClick={() => {
            // Método alternativo 2 - URL direta para autorização OAuth com Google
            console.log("Tentando método alternativo 2");
            const redirectUri = encodeURIComponent(window.location.origin + '/');
            // Pegando o domínio correto da configuração do Amplify
            try {
              const { Amplify } = require('aws-amplify');
              const config = Amplify.getConfig();
              const domain = config.Auth?.Cognito?.loginWith?.oauth?.domain || 'https://mtghelper.auth.us-east-2.amazoncognito.com';
              const clientId = config.Auth?.Cognito?.userPoolClientId || '55j5l3rcp164av86djhf9qpjch';
              
              console.log("Usando domínio do Amplify:", domain);
              const directUrl = `${domain}/oauth2/authorize?identity_provider=Google&redirect_uri=${redirectUri}&response_type=code&client_id=${clientId}&scope=openid+profile+email`;
              console.log("Redirecionando para:", directUrl);
              window.location.href = directUrl;
            } catch (error) {
              console.error("Erro ao obter configuração:", error);
              // Fallback para URL hardcoded
              const directUrl = `https://mtghelper.auth.us-east-2.amazoncognito.com/oauth2/authorize?identity_provider=Google&redirect_uri=${redirectUri}&response_type=code&client_id=55j5l3rcp164av86djhf9qpjch&scope=openid+profile+email`;
              console.log("Redirecionando para fallback:", directUrl);
              window.location.href = directUrl;
            }
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-1" />
          Método Direto Google
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-purple-500 text-white font-semibold py-2 px-4 rounded-md mb-4 hover:bg-purple-600 transition"
          onClick={() => {
            // Usar o modo de demonstração para login
            console.log("Usando modo de demonstração");
            const { initDemoData } = require('@/lib/demoMode');
            initDemoData();
            localStorage.setItem('NEXT_PUBLIC_DEMO_MODE', 'true');
            router.push('/');
            router.refresh();
          }}
        >
          <span role="img" aria-label="Demo" className="w-5 h-5 bg-white rounded-full p-1 text-center text-purple-500">🔍</span>
          Modo de Demonstração
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!isLogin}
                />
              </div>
              
              <div className="flex items-center">
                <button 
                  type="button" 
                  onClick={() => setShowAdminField(!showAdminField)}
                  className="text-xs text-gray-400 hover:text-blue-400 focus:outline-none"
                >
                  {showAdminField ? 'Ocultar opções avançadas' : 'Opções avançadas'}
                </button>
              </div>
              
              {showAdminField && (
                <div>
                  <label htmlFor="adminCode" className="block text-sm font-medium text-gray-300 mb-1">
                    Código de Administrador
                  </label>
                  <input
                    id="adminCode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Registrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? (
            <p>
              Não tem uma conta?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-400 hover:text-blue-300 focus:outline-none"
              >
                Registre-se
              </button>
            </p>
          ) : (
            <p>
              Já tem uma conta?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-400 hover:text-blue-300 focus:outline-none"
              >
                Faça login
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
        <p>MTG Helper - Gerenciador de Coleção para Magic: The Gathering</p>
        <p className="mt-1">© 2023-2024 - Todos os direitos reservados</p>
      </div>
      
      {/* Componente de depuração flutuante */}
      <AuthDebugger />
    </div>
  );
}