"use client";
import '../../lib/amplifyClient';
import './login-updated.css';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth-helpers';
import { confirmSignUp as amplifyConfirmSignUp, fetchAuthSession } from '@aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import AuthDiagnostic from '@/components/AuthDiagnostic';
import { printAuthDiagnostic } from '@/lib/authDiagnostic';
import AuthDebugger from '@/components/AuthDebugger';
import AuthTroubleshooter from '@/components/AuthTroubleshooter';
import { useAmplifyAuth, AmplifyUser } from '@/contexts/AmplifyAuthContext';

export default function LoginClientPage() {
  const router = useRouter();
  
  // Estado de autenticação
  const [isClient, setIsClient] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationInfo, setVerificationInfo] = useState<{email: string; name: string} | null>(null);
  
  // Campos do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showAdminField, setShowAdminField] = useState(false);
  
  // Verificar se estamos no lado cliente
  useEffect(() => {
    setIsClient(true);
    
    // Verificar se existe um flag de redirecionamento pendente (após recarregar a página)
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('redirectToHome') === 'true') {
        console.log('Encontrado flag de redirecionamento após recarregamento');
        sessionStorage.removeItem('redirectToHome');
        // Dar um tempo para a página carregar completamente
        setTimeout(() => {
          console.log('Executando redirecionamento atrasado após recarregamento');
          window.location.href = '/';
        }, 100);
      }
    }
  }, []);
  
  // Setup a default fallback context
  const defaultAuthContext = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    isInitialized: false,
    refreshUser: async () => {},
    signOut: async () => {}
  };
  
  // Always call useAmplifyAuth to maintain consistent hook order
  // Use try-catch to handle potential errors
  let authContext;
  try {
    authContext = useAmplifyAuth();
  } catch (error) {
    console.error("Erro ao acessar contexto de autenticação:", error);
    authContext = defaultAuthContext;
  }
  
  // Create a safe version that we'll actually use
  const safeAuthContext = isClient ? authContext : defaultAuthContext;

  // Função para checar se o usuário tem uma sessão válida
  const checkSession = useCallback(async () => {
    try {
      // Tentar obter sessão diretamente
      const session = await fetchAuthSession();
      
      // Se temos tokens, significa que estamos autenticados
      if (session?.tokens?.idToken) {
        console.log('Sessão válida detectada', session.tokens.idToken.toString().substring(0, 15) + '...');
        return true;
      } else {
        console.log('Sessão existe mas sem token válido:', session);
      }
    } catch (error) {
      console.log('Erro ao verificar sessão:', error);
    }
    
    return false;
  }, []);
  
  // Função para redirecionar para a página principal com múltiplas abordagens
  const redirectToHome = useCallback(() => {
    console.log('Redirecionando para página principal...');
    
    // Função para forçar redirecionamento usando location
    const forceRedirect = () => {
      console.log('Forçando redirecionamento com location.href');
      window.location.href = '/';
    };
    
    try {
      // Primeiro tentar usar router do Next.js (mais suave)
      router.push('/');
      
      // Adicionar um fallback com window.location como backup após um breve intervalo
      setTimeout(() => {
        // Se ainda estamos na página de login, usar redirecionamento forçado
        if (window.location.pathname.includes('login')) {
          console.log('Ainda na página de login, usando redirecionamento forçado');
          forceRedirect();
        }
      }, 500);
      
      // Garantia final para redirecionamento após um tempo maior
      setTimeout(() => {
        // Se ainda estamos na página de login após um tempo maior, recarregar e redirecionar
        if (window.location.pathname.includes('login')) {
          console.log('Redirecionamento falhou, tentando abordagem alternativa');
          // Armazenar um flag em sessionStorage para redirecionamento após recarregar
          sessionStorage.setItem('redirectToHome', 'true');
          window.location.reload();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao redirecionar:', error);
      // Em caso de erro, usar o método direto
      forceRedirect();
    }
  }, [router]);

  // Update auth state when changes
  useEffect(() => {
    if (!isClient) return;
    
    try {
      // Verificar se o usuário está autenticado e redirecionar
      if (safeAuthContext.isAuthenticated && safeAuthContext.user) {
        console.log('Usuário já autenticado via contexto, redirecionando...');
        
        // Usar TODAS as estratégias de redirecionamento de uma vez
        // 1. Redirecionamento direto imediato
        console.log('Usando redirecionamento direto imediato');
        window.location.href = '/';
        
        // 2. Tentar usar router como backup (é improvável que chegue aqui)
        try {
          router.push('/');
        } catch (err) {
          console.log('Erro ao usar router (ignorável):', err);
        }
        
        // 3. Como último recurso, recarregar a página com um flag
        const timeoutId = setTimeout(() => {
          console.log('Tentando última estratégia de redirecionamento');
          sessionStorage.setItem('redirectToHome', 'true');
          window.location.reload();
        }, 800);
        
        return () => clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Erro ao acessar contexto de autenticação:', error);
    }
  }, [isClient, safeAuthContext, router]);

  // Estado para controlar as verificações de OAuth
  const [oauthChecked, setOauthChecked] = useState(false);
  const [lastOauthCheck, setLastOauthCheck] = useState(0);
  
  // Verificar se o usuário acabou de fazer login com OAuth
  useEffect(() => {
    if (!isClient) return;
    
    // Evitar verificações excessivas
    const now = Date.now();
    if (oauthChecked && (now - lastOauthCheck) < 3000) {
      // Só verificar uma vez a cada 3 segundos
      return;
    }
    
    let isMounted = true;
    setLastOauthCheck(now);
    
    async function checkOAuthResult() {
      try {
        console.log('Verificando resultado de autenticação OAuth...');
        // Verificar sessão diretamente primeiro
        const hasValidSession = await checkSession();
        
        if (hasValidSession && isMounted) {
          console.log('Sessão válida encontrada após OAuth, iniciando redirecionamento...');
          
          // Atualizar contexto em segundo plano
          if (safeAuthContext.refreshUser) {
            safeAuthContext.refreshUser().catch(e => 
              console.log('Erro não crítico ao atualizar contexto:', e)
            );
          }
          
          // Aplicar múltiplas estratégias de redirecionamento
          
          // Estratégia 1: Redirecionamento direto e imediato
          if (isMounted) {
            console.log('Estratégia 1: Redirecionamento imediato com window.location...');
            window.location.href = '/';
          }
          
          // Estratégia 2: Como backup, usar o router após um pequeno delay
          setTimeout(() => {
            if (isMounted && window.location.pathname.includes('login')) {
              console.log('Estratégia 2: Redirecionamento com router após delay...');
              router.push('/');
            }
          }, 300);
          
          // Estratégia 3: Como garantia final, armazenar flag e recarregar
          setTimeout(() => {
            if (isMounted && window.location.pathname.includes('login')) {
              console.log('Estratégia 3: Ainda na página de login, configurando flag e recarregando...');
              sessionStorage.setItem('redirectToHome', 'true');
              window.location.reload();
            }
          }, 1000);
          
          return;
        }
        
        console.log('Nenhuma sessão válida encontrada via OAuth');
      } catch (error) {
        console.error('Erro ao verificar sessão OAuth:', error);
      } finally {
        if (isMounted) {
          setOauthChecked(true);
        }
      }
    }
    
    // Executar verificação
    checkOAuthResult();
    
    return () => {
      isMounted = false;
    };
  }, [isClient, checkSession, redirectToHome, safeAuthContext.refreshUser, router, oauthChecked, lastOauthCheck]);

  // Alternar entre login e registro
  const toggleAuthMode = () => {
    if (mode === 'login') {
      setMode('register');
    } else {
      setMode('login');
    }
    setError('');
  };

  // Mostrar/ocultar campo de código de administrador
  const toggleAdminField = () => {
    setShowAdminField(!showAdminField);
  };
  
  // Função para fazer logout de forma segura
  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (safeAuthContext.isAuthenticated) {
        console.log('Realizando logout...');
        await safeAuthContext.signOut();
        console.log('Logout realizado com sucesso');
      } else {
        // Tentar fazer logout diretamente via AWS Amplify
        console.log('Tentando logout alternativo...');
        const auth = await import('@aws-amplify/auth');
        await auth.signOut({ global: true });
      }
      
      // Limpar qualquer erro
      setError('');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      setError(`Erro ao fazer logout: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Autenticar com Google
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Verificando estado de autenticação antes de login com Google...');
      
      // Verificar se já existe um usuário autenticado
      if (safeAuthContext.isAuthenticated) {
        console.log('Usuário já autenticado, fazendo logout primeiro...');
        
        // Usar nossa função de logout
        await handleSignOut();
        
        // Pequena pausa para garantir que o logout foi processado
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Verificar novamente se o logout funcionou
      try {
        const auth = await import('@aws-amplify/auth');
        try {
          // Tentar obter o usuário atual para verificar se ainda está autenticado
          await auth.getCurrentUser();
          
          // Se não lançou erro, ainda há um usuário autenticado - forçar logout
          console.log('Usuário ainda autenticado, forçando logout...');
          await auth.signOut({ global: true });
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (userError) {
          // Se lançou erro, não há usuário autenticado, o que é bom
          console.log('Nenhum usuário autenticado detectado, pronto para login');
        }
      } catch (checkError) {
        console.warn('Erro ao verificar estado de autenticação:', checkError);
        // Continuar mesmo com erro
      }
      
      console.log('Iniciando login com Google...');
      // Importar dinamicamente para garantir que estamos no cliente
      const { signInWithRedirect } = await import('@aws-amplify/auth');
      await signInWithRedirect({ provider: 'Google' });
      // A redireção ocorrerá aqui, então não precisamos de código adicional
    } catch (error: any) {
      console.error('Erro ao autenticar com Google:', error);
      
      // Tratamento de erros específicos
      if (error.name === 'UserAlreadyAuthenticatedException' || 
          error.message?.includes('already a signed in user')) {
        setError(`Há um usuário já autenticado. Por favor, faça logout antes de tentar novamente. Use o botão "Sair da conta atual" abaixo.`);
      } else {
        setError(`Erro ao autenticar com Google: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Rastreamento de tentativas de autenticação para evitar rate limiting
  const [authAttempts, setAuthAttempts] = useState(0);
  const [lastAuthAttempt, setLastAuthAttempt] = useState(0);
  
  // Enviar formulário de autenticação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Verificar se não estamos fazendo muitas requisições
    const now = Date.now();
    if (authAttempts > 3 && (now - lastAuthAttempt) < 2000) {
      setError('Muitas tentativas em um curto período. Aguarde alguns segundos antes de tentar novamente.');
      return;
    }
    
    setLoading(true);
    setAuthAttempts(prev => prev + 1);
    setLastAuthAttempt(now);
    
    try {
      // Verificar se já está autenticado para evitar chamadas desnecessárias
      const isAlreadyAuthenticated = await checkSession();
      if (isAlreadyAuthenticated) {
        console.log('Usuário já autenticado, redirecionando...');
        redirectToHome();
        return;
      }
      
      if (mode === 'login') {
        // Login
        console.log('Tentando fazer login com email:', email);
        const result = await signIn(email, password);
        
        if (result.success) {
          // Atualizar o contexto de autenticação
          if (safeAuthContext.refreshUser) {
            try {
              await safeAuthContext.refreshUser();
              console.log('Contexto de autenticação atualizado com sucesso');
            } catch (refreshError) {
              console.warn('Erro não crítico ao atualizar contexto:', refreshError);
              // Continuar mesmo com erro
            }
          }
          
          // Pequeno delay para garantir que tudo foi atualizado
          setTimeout(() => {
            router.push('/');
          }, 100);
        } else {
          setError(result.error || 'Erro ao fazer login');
        }
      } else if (mode === 'register') {
        // Registro
        console.log('Tentando registrar novo usuário:', email);
        
        // Verificar se é um registro de administrador baseado no código
        const isAdmin = showAdminField && (adminCode === process.env.NEXT_PUBLIC_ADMIN_CODE || adminCode === 'MTG_ADMIN_2024');
        const result = await signUp(email, password, name, isAdmin);
        
        if (result.success) {
          // Se o registro foi bem-sucedido, mudar para o modo de verificação
          setVerificationInfo({ email, name });
          setMode('verify');
          setError('');
        } else {
          setError(result.error || 'Erro ao registrar usuário');
        }
      } else if (mode === 'verify') {
        // Confirmar registro
        if (!verificationInfo) {
          setError('Informações de verificação não encontradas');
          return;
        }
        
        console.log('Tentando confirmar registro para:', verificationInfo.email);
        try {
          // Usar a função de confirmação do Amplify diretamente
          const { isSignUpComplete } = await amplifyConfirmSignUp({
            username: verificationInfo.email,
            confirmationCode: verificationCode
          });
          
          if (isSignUpComplete) {
            // Após confirmação bem-sucedida, redirecionar para o login
            setError('');
            setMode('login');
            setEmail(verificationInfo.email);
            alert('Conta confirmada com sucesso! Agora você pode fazer login.');
          } else {
            setError('A confirmação não foi concluída. Tente novamente.');
          }
        } catch (error: any) {
          console.error('Erro ao confirmar registro:', error);
          
          if (error.name === 'TooManyRequestsException') {
            setError('Muitas tentativas em um curto período. Aguarde alguns minutos antes de tentar novamente.');
          } else {
            setError(error.message || 'Erro ao confirmar conta');
          }
        }
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      
      // Formatação amigável de mensagens de erro
      let errorMessage = 'Ocorreu um erro durante a autenticação.';
      
      if (error.name === 'TooManyRequestsException' || error.message?.includes('Rate exceeded')) {
        errorMessage = 'Muitas tentativas em um curto período. Aguarde alguns minutos antes de tentar novamente.';
      } else if (error.message) {
        if (error.message.includes('password') || error.message.includes('senha')) {
          errorMessage = 'Senha inválida. Verifique sua senha e tente novamente.';
        } else if (error.message.includes('user') || error.message.includes('usuário')) {
          errorMessage = 'Usuário não encontrado. Verifique seu email ou registre-se.';
        } else if (error.message.includes('confirm')) {
          errorMessage = 'Por favor, confirme seu email antes de fazer login.';
          
          // Se o erro for sobre confirmação, mudar para o modo de verificação
          if (email) {
            setVerificationInfo({ email, name });
            setMode('verify');
          }
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Voltar do modo de verificação para o registro
  const handleBackToRegister = () => {
    setMode('register');
    setVerificationInfo(null);
    setVerificationCode('');
    setError('');
  };

  return (
    <div className="login-container">
      {/* Background com imagem embaçada */}
      <div className="login-bg"></div>
      
      <div className="login-card">
        {/* Cabeçalho de acordo com o modo */}
        {mode === 'verify' ? (
          <div className="login-header">
            <h1>Verificar Conta</h1>
            <p>Digite o código enviado para {verificationInfo?.email}</p>
          </div>
        ) : (
          <div className="login-header">
            <h1>{mode === 'login' ? 'Login' : 'Cadastro'}</h1>
            <p>{mode === 'login' ? 'Acesse sua conta' : 'Crie uma nova conta'}</p>
            
            {/* Mostrar mensagem se o usuário já estiver autenticado */}
            {safeAuthContext.isAuthenticated && safeAuthContext.user && (
              <div className="auth-info">
                <p>Você já está autenticado como {safeAuthContext.user.name || safeAuthContext.user.email}</p>
                <div className="auth-actions">
                  <button 
                    className="redirect-button" 
                    onClick={() => router.push('/')}
                  >
                    Ir para a página inicial
                  </button>
                  <button 
                    className="redirect-button secondary" 
                    onClick={async () => {
                      try {
                        // Verificar sessão novamente antes de redirecionar
                        const hasValidSession = await checkSession();
                        if (hasValidSession) {
                          console.log('Sessão verificada manualmente, redirecionando...');
                          // Usar método direto para maior garantia
                          window.location.href = '/';
                        } else {
                          setError("Falha na validação da sessão. Tente fazer logout e login novamente.");
                        }
                      } catch (error) {
                        console.error('Erro ao verificar sessão manualmente:', error);
                        setError("Erro ao verificar sessão. Tente novamente.");
                      }
                    }}
                  >
                    Verificar e redirecionar
                  </button>
                </div>
              </div>
            )}
            
            {/* Mostrar indicador de carregamento do contexto de autenticação */}
            {safeAuthContext.isLoading && (
              <p className="auth-loading">Verificando estado de autenticação...</p>
            )}
          </div>
        )}
        
        {/* Mostrar mensagem de erro */}
        {error && <div className="error-message">{error}</div>}
        
        {/* Formulário de acordo com o modo */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Modo de verificação de código */}
          {mode === 'verify' && (
            <div className="form-group">
              <label htmlFor="verificationCode">Código de Verificação</label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                disabled={loading}
                placeholder="Digite o código recebido por email"
                maxLength={6}
                className="verification-code-input"
                autoComplete="one-time-code"
              />
              <p className="text-xs text-gray-400 mt-1">
                Verifique sua caixa de entrada e spam para o código de verificação
              </p>
            </div>
          )}
          
          {/* Modo de login ou registro */}
          {mode !== 'verify' && (
            <>
              {/* Campo de nome apenas para registro */}
              {mode === 'register' && (
                <div className="form-group">
                  <label htmlFor="name">Nome</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Seu nome completo"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="seu@email.com"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Sua senha"
                  minLength={8}
                />
                {mode === 'register' && (
                  <p className="text-xs text-gray-400 mt-1">
                    A senha deve ter pelo menos 8 caracteres
                  </p>
                )}
              </div>
              
              {/* Campo de código de administrador */}
              {mode === 'register' && showAdminField && (
                <div className="form-group">
                  <label htmlFor="adminCode">Código de Administrador</label>
                  <input
                    type="password"
                    id="adminCode"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    disabled={loading}
                    placeholder="Código de administrador (opcional)"
                  />
                </div>
              )}
            </>
          )}
          
          {/* Botão de ação principal */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Cadastrar' : 'Verificar'}
          </button>
          
          {/* Botão de login com Google - apenas nos modos login e registro */}
          {mode !== 'verify' && (
            <button
              type="button"
              className="google-button"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <img src="/google-icon.svg" alt="Google" />
              Continuar com Google
            </button>
          )}
        </form>
        
        {/* Footer com opções de acordo com o modo */}
        <div className="login-footer">
          {mode === 'verify' ? (
            <p>
              <button
                type="button"
                className="toggle-auth-button"
                onClick={handleBackToRegister}
                disabled={loading}
              >
                Voltar para o cadastro
              </button>
            </p>
          ) : (
            <>
              <p>
                {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                <button
                  type="button"
                  className="toggle-auth-button"
                  onClick={toggleAuthMode}
                  disabled={loading}
                >
                  {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
                </button>
              </p>
              
              {/* Opção de administrador apenas no modo registro */}
              {mode === 'register' && (
                <p className="mt-2">
                  <button
                    type="button"
                    className="toggle-admin-button"
                    onClick={toggleAdminField}
                    disabled={loading}
                  >
                    {showAdminField ? 'Ocultar código de administrador' : 'Sou administrador'}
                  </button>
                </p>
              )}
              
              {/* Botão de logout se estiver autenticado */}
              {safeAuthContext.isAuthenticated && (
                <button
                  type="button"
                  className="logout-button"
                  onClick={handleSignOut}
                  disabled={loading}
                >
                  Sair da conta atual
                </button>
              )}
            </>
          )}
        </div>
        
        {/* Ferramentas de diagnóstico - escondidas no CSS mas mantidas para debug */}
        <div className="auth-diagnostics">
          <AuthDiagnostic />
          <AuthDebugger />
          <AuthTroubleshooter />
        </div>
      </div>
    </div>
  );
}
