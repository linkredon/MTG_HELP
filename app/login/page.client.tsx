"use client";
import './login-updated.css';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';
import AuthDiagnostic from '@/components/AuthDiagnostic';
import { printAuthDiagnostic } from '@/lib/authDiagnostic';
import AuthDebugger from '@/components/AuthDebugger';
import AuthTroubleshooter from '@/components/AuthTroubleshooter';
import IamPermissionFixer from '@/components/IamPermissionFixer';
import { loginWithAmplify } from '@/lib/auth-amplify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Lock, 
  User, 
  Shield, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Zap,
  Sparkles
} from 'lucide-react';

export default function LoginClientPage() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAmplifyAuth();
  
  // Estado de autenticação
  const [isClient, setIsClient] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationInfo, setVerificationInfo] = useState<{email: string; name: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
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
  }, []);
  
  // Verificar se o usuário já está autenticado
  useEffect(() => {
    console.log('useEffect - isAuthenticated:', isAuthenticated, 'user:', user);
    if (isAuthenticated && user && mode === 'login') {
      console.log('Usuário já autenticado, redirecionando para a página inicial');
      // Redirecionamento único e direto
      setTimeout(() => {
        console.log('Executando redirecionamento para /');
        window.location.href = '/';
      }, 100);
    }
  }, [isAuthenticated, user, mode]);

  // Salvar info de verificação no localStorage ao entrar no modo 'verify'
  useEffect(() => {
    if (mode === 'verify' && verificationInfo) {
      localStorage.setItem('mtg-verification-info', JSON.stringify(verificationInfo));
    }
  }, [mode, verificationInfo]);

  // Ao montar, se estiver no modo 'verify' e não houver info, buscar do localStorage
  useEffect(() => {
    if (mode === 'verify' && !verificationInfo) {
      const saved = localStorage.getItem('mtg-verification-info');
      if (saved) {
        setVerificationInfo(JSON.parse(saved));
      }
    }
  }, [mode, verificationInfo]);
  
  // Função para fazer login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || email.trim() === "") {
      setError("Por favor, preencha o campo de e-mail.");
      return;
    }
    setLoading(true);
    
    try {
      console.log('Tentando login com:', { email, password });
      
      const result = await loginWithAmplify({ email, password });
      
      if (result.success) {
        console.log('Login bem-sucedido:', result.user);
        
        // Setar cookie de autenticação via API para o middleware enxergar
        await fetch('/api/set-auth-cookie', { method: 'POST' });
        setSuccess('Login realizado com sucesso! Redirecionando...');
        await refreshUser();
        // Forçar redirecionamento após login
        setTimeout(() => {
          console.log('Forçando redirecionamento para página inicial...');
          window.location.href = '/';
        }, 500);
      } else {
        setError(result.message || 'Falha na autenticação');
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para registrar um novo usuário
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Tentando registrar:', { name, email, password });
      
      // Remover todas as referências antigas a Auth e signInWithRedirect
      // const signUpResult = await Auth.signUp({
      //   username: email,
      //   password,
      //   attributes: {
      //     email,
      //     name
      //   }
      // });
      
      // console.log('Registro bem-sucedido:', signUpResult);
      
      // setSuccess('Conta criada com sucesso! Verifique seu email para confirmar.');
      // setVerificationInfo({ email, name });
      // setMode('verify');
    } catch (err: any) {
      console.error('Erro no registro:', err);
      setError(err.message || 'Falha no registro');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para confirmar o registro com código de verificação
  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationInfo) {
      setError('Informações de verificação não encontradas');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Tentando confirmar:', { email: verificationInfo.email, code: verificationCode });
      
      // Remover todas as referências antigas a Auth e signInWithRedirect
      // await Auth.confirmSignUp(verificationInfo.email, verificationCode);
      
      console.log('Confirmação bem-sucedida');
      
      setSuccess('Conta verificada com sucesso! Faça login para continuar.');
      setMode('login');
      setEmail(verificationInfo.email);
      setPassword('');
      setVerificationInfo(null);
    } catch (err: any) {
      console.error('Erro na confirmação:', err);
      setError(err.message || 'Falha na confirmação');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para reenviar código de verificação
  const handleResendCode = async () => {
    if (!verificationInfo) {
      setError('Informações de verificação não encontradas');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Remover todas as referências antigas a Auth e signInWithRedirect
      // await Auth.resendSignUp(verificationInfo.email);
      
      setSuccess('Código de verificação reenviado para ' + verificationInfo.email);
    } catch (err: any) {
      console.error('Erro ao reenviar código:', err);
      setError(err.message || 'Falha ao reenviar o código');
    } finally {
      setLoading(false);
    }
  };

  // Função para login com Google
  const handleGoogleLogin = () => {
    // Monta a URL do Hosted UI do Cognito para login com Google
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || process.env.NEXT_PUBLIC_HOSTED_UI_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID;
    const redirectUri = typeof window !== 'undefined' ? window.location.origin : '';
    if (!domain || !clientId || !redirectUri) {
      setError('Configuração de OAuth ausente. Verifique as variáveis de ambiente.');
      return;
    }
    const url = `https://${domain}/oauth2/authorize?identity_provider=Google&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=CODE&client_id=${clientId}&scope=openid+profile+email`;
    window.location.href = url;
  };
  
  // Componente de login
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu email"
            className="pl-10 bg-black/40 border-gray-700 text-white placeholder-gray-400"
            required
          />
        </div>
        
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            className="pl-10 pr-10 bg-black/40 border-gray-700 text-white placeholder-gray-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full quantum-btn primary"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Entrar
          </>
        )}
      </Button>
      
      <div className="flex flex-col gap-2 mt-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="google-button"
          disabled={loading}
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5 inline-block mr-2 align-middle" />
          {loading ? 'Carregando...' : 'Entrar com Google'}
        </button>
      </div>
      
      <div className="text-center">
        <button
          type="button"
          onClick={() => setMode('register')}
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          Não tem uma conta? Criar conta
        </button>
      </div>
      <div className="text-center mt-2">
        <button
          type="button"
          onClick={() => setMode('verify')}
          className="text-blue-400 hover:text-blue-300 text-xs"
        >
          Já tem um código? Inserir código de verificação
        </button>
      </div>
      {/* Botão manual para ir para home após login */}
      {isAuthenticated && user && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Usuário autenticado com sucesso!</span>
          </div>
          <p className="text-sm text-green-700 mb-3">
            ✅ <strong>{user.name}</strong> ({user.email})
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                console.log('Redirecionamento manual para página inicial...');
                window.location.href = '/';
              }}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Ir para página inicial
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('Tentando redirecionamento via router...');
                router.push('/');
              }}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Tentar redirecionamento alternativo
            </button>
          </div>
        </div>
      )}
    </form>
  );
  
  // Componente de registro
  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            className="pl-10 bg-black/40 border-gray-700 text-white placeholder-gray-400"
            required
          />
        </div>
        
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu email"
            className="pl-10 bg-black/40 border-gray-700 text-white placeholder-gray-400"
            required
          />
        </div>
        
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha (mínimo 8 caracteres)"
            className="pl-10 pr-10 bg-black/40 border-gray-700 text-white placeholder-gray-400"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        {showAdminField && (
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="Código de administrador (opcional)"
              className="pl-10 bg-black/40 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
        )}
      </div>
      
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full quantum-btn primary"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Criando conta...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Criar conta
          </>
        )}
      </Button>
      
      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={() => setMode('login')}
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          Já tem uma conta? Fazer login
        </button>
        
        <div>
          <button
            type="button"
            onClick={() => setShowAdminField(!showAdminField)}
            className="text-gray-400 hover:text-gray-300 text-xs"
          >
            {showAdminField ? 'Ocultar' : 'Mostrar'} campo de administrador
          </button>
        </div>
      </div>
    </form>
  );

  // Componente de verificação
  const renderVerificationForm = () => (
    <form onSubmit={handleConfirmSignUp} className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Verificar sua conta</h3>
        <p className="text-gray-300 text-sm">
          Enviamos um código de verificação para <strong>{verificationInfo?.email}</strong>
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Digite o código de verificação"
            className="pl-10 bg-black/40 border-gray-700 text-white placeholder-gray-400 text-center text-lg tracking-widest"
            required
            maxLength={6}
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full quantum-btn primary"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Verificar conta
          </>
        )}
      </Button>
      
      <div className="text-center space-y-4">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={loading}
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          Não recebeu o código? Reenviar
        </button>
        
        <div>
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-gray-400 hover:text-gray-300 text-sm"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    </form>
  );
  
  // Exibir mensagens de erro
  const renderError = () => {
    if (!error) return null;
    return (
      <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      </div>
    );
  };

  // Exibir mensagens de sucesso
  const renderSuccess = () => {
    if (!success) return null;
    return (
      <div className="p-4 mb-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-300 text-sm">{success}</span>
        </div>
      </div>
    );
  };

  // Renderizar o formulário apropriado
  const renderForm = () => {
    switch (mode) {
      case 'register':
        return renderRegisterForm();
      case 'verify':
        return renderVerificationForm();
      default:
        return renderLoginForm();
    }
  };

  // Se não estamos no cliente, mostrar loading
  if (!isClient) {
    return (
      <div className="login-container">
        <div className="login-bg"></div>
        <div className="login-card">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-bg"></div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1>MTG Helper</h1>
          <p>Gerencie sua coleção de Magic: The Gathering</p>
        </div>
        
        {renderError()}
        {renderSuccess()}
        {renderForm()}
        
        {/* Informações de autenticação */}
        {isAuthenticated && user && (
          <div className="auth-info">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Usuário autenticado: {user.name}</span>
            </div>
          </div>
        )}
        
        {/* Ferramentas de diagnóstico (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="auth-diagnostics mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Ferramentas de Diagnóstico</h3>
            <div className="space-y-2">
              <AuthDiagnostic />
              <AuthDebugger />
              <AuthTroubleshooter />
              <IamPermissionFixer />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
