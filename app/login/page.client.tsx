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
import { useAmplifyAuth, AmplifyUser, AmplifyAuthContextType } from '@/contexts/AmplifyAuthContext';

export default function LoginClientPage() {
  const router = useRouter();
  // Use the correct type definition from AmplifyAuthContextType
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: AmplifyUser | null;
    isLoading?: boolean;
    signOut?: () => Promise<void>;
    refreshUser: () => Promise<void>;
  }>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    refreshUser: async () => {}
  });
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminField, setShowAdminField] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Verificar se estamos no lado cliente
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Inicializar contexto de autenticação de forma segura apenas no cliente
  useEffect(() => {
    if (!isClient) return;
    
    try {
      // Só usa o hook quando estamos no cliente
      const authContext = useAmplifyAuth();
      setAuthState(authContext);
      
      // Verificar se o usuário está autenticado e redirecionar
      if (authContext.isAuthenticated && authContext.user) {
        console.log('Usuário já autenticado, redirecionando...');
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao acessar contexto de autenticação:', error);
    }
  }, [isClient, router]);

  // Verificar se o usuário acabou de fazer login com OAuth
  useEffect(() => {
    if (!isClient) return;
    
    async function checkOAuthResult() {
      try {
        // Importar funções necessárias
        const { getCurrentUser, fetchUserAttributes } = await import('aws-amplify/auth');
        
        console.log('Verificando status do usuário OAuth...');
        // Executar diagnóstico de autenticação
        printAuthDiagnostic();
        
        // Verificar se há um usuário autenticado
        try {
          const user = await getCurrentUser();
          console.log('Usuário atual detectado:', user);
          
          // Usuário está autenticado, obter atributos
          try {
            const attributes = await fetchUserAttributes();
            console.log('Atributos do usuário:', attributes);
            
            // Atualizar o estado do usuário no contexto
            if (authState.refreshUser) {
              await authState.refreshUser();
            }
            
            // Redirecionar para a página inicial
            router.push('/');
          } catch (attrError) {
            console.error('Erro ao obter atributos:', attrError);
          }
        } catch (userError) {
          console.log('Nenhum usuário autenticado detectado');
        }
      } catch (error) {
        console.error('Erro ao verificar resultado OAuth:', error);
      }
    }
    
    checkOAuthResult();
  }, [router, authState.refreshUser, isClient]);

  // Alternar entre login e registro
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  // Mostrar/ocultar campo de código de administrador
  const toggleAdminField = () => {
    setShowAdminField(!showAdminField);
  };

  // Autenticar com Google
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Iniciando login com Google...');
      await signInWithRedirect({ provider: 'Google' });
      // A redireção ocorrerá aqui, então não precisamos de código adicional
    } catch (error: any) {
      console.error('Erro ao autenticar com Google:', error);
      setError(`Erro ao autenticar com Google: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Enviar formulário de autenticação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login
        console.log('Tentando fazer login com email:', email);
        await signIn(email, password);
        
        // Atualizar o estado do usuário no contexto
        if (authState.refreshUser) {
          await authState.refreshUser();
        }
        
        router.push('/');
      } else {
        // Registro
        console.log('Tentando registrar novo usuário:', email);
        // Verificar se é um registro de administrador baseado no código
        const isAdmin = showAdminField && (adminCode === process.env.NEXT_PUBLIC_ADMIN_CODE || adminCode === 'MTG_ADMIN_2024');
        await signUp(email, password, name, isAdmin);
        
        // Mostrar mensagem de sucesso e mudar para o modo de login
        setError('');
        setIsLogin(true);
        alert('Registro realizado com sucesso! Verifique seu email para confirmar a conta.');
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      
      // Formatação amigável de mensagens de erro
      let errorMessage = 'Ocorreu um erro durante a autenticação.';
      
      if (error.message) {
        if (error.message.includes('password') || error.message.includes('senha')) {
          errorMessage = 'Senha inválida. Verifique sua senha e tente novamente.';
        } else if (error.message.includes('user') || error.message.includes('usuário')) {
          errorMessage = 'Usuário não encontrado. Verifique seu email ou registre-se.';
        } else if (error.message.includes('confirm')) {
          errorMessage = 'Por favor, confirme seu email antes de fazer login.';
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{isLogin ? 'Login' : 'Cadastro'}</h1>
          <p>{isLogin ? 'Acesse sua conta' : 'Crie uma nova conta'}</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Nome</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
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
          </div>
          
          {!isLogin && showAdminField && (
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
          
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
          
          <button
            type="button"
            className="login-button google-button"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <img src="/google-icon.svg" alt="Google" className="google-icon" />
            Continuar com Google
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button
              type="button"
              className="toggle-auth-button"
              onClick={toggleAuthMode}
              disabled={loading}
            >
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p>
          
          {!isLogin && (
            <p>
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
        </div>
        
        <div className="auth-diagnostics">
          <AuthDiagnostic />
          <AuthDebugger />
          <AuthTroubleshooter />
        </div>
      </div>
    </div>
  );
}
