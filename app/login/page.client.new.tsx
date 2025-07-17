"use client";
import './login-updated.css';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, confirmSignUp } from '@/lib/aws-auth-adapter';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';
import AuthDiagnostic from '@/components/AuthDiagnostic';
import { printAuthDiagnostic } from '@/lib/authDiagnostic';
import AuthDebugger from '@/components/AuthDebugger';
import AuthTroubleshooter from '@/components/AuthTroubleshooter';
import { loginWithAmplify } from '@/lib/auth-amplify';

export default function LoginClientPage() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAmplifyAuth();
  
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
    // Remover qualquer lógica de auto-refresh ou redirecionamento forçado
  }, []);
  
  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Usuário já autenticado, redirecionando para a página inicial');
      router.push('/');
    }
  }, [isAuthenticated, user, router]);
  
  // Função para fazer login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Tentando login com:', { email, password });
      
      // Usar nossa função de login do auth-amplify
      const result = await loginWithAmplify({ email, password });
      
      if (result.success) {
        console.log('Login bem-sucedido:', result.user);
        await refreshUser(); // Atualizar o contexto de autenticação
        router.push('/');
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
    
    try {
      console.log('Tentando registrar:', { name, email, password });
      
      // Registrar no AWS Cognito
      const signUpResult = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name
          }
        }
      });
      
      console.log('Registro bem-sucedido:', signUpResult);
      
      // Mostrar tela de verificação
      setVerificationInfo({ email, name });
      setMode('verify');
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

    try {
      const result = await confirmSignUp(
        verificationInfo.email,
        verificationCode
      );
      console.log('Confirmação bem-sucedida:', result);
      
      // Mostrar mensagem de sucesso e voltar para a tela de login
      alert('Conta verificada com sucesso! Faça login para continuar.');
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
      // Na versão atual do Amplify, usamos o signUp novamente para reenviar o código
      await signUp({
        username: verificationInfo.email,
        password: '', // Essa será ignorada se o usuário já existir
        options: { 
          userAttributes: { email: verificationInfo.email }
        }
      });
      
      alert('Código de verificação reenviado para ' + verificationInfo.email);
    } catch (err: any) {
      console.error('Erro ao reenviar código:', err);
      setError(err.message || 'Falha ao reenviar o código');
    } finally {
      setLoading(false);
    }
  };
  
  // Componente de login
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
      
      <div className="text-sm text-center">
        <button
          type="button"
          onClick={() => setMode('register')}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Ainda não tem conta? Registre-se
        </button>
      </div>
    </form>
  );
  
  // Componente de registro
  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      
      {showAdminField && (
        <div>
          <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700">
            Código de Administrador
          </label>
          <input
            type="text"
            id="adminCode"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}
      
      <div className="flex items-center">
        <input
          id="isAdmin"
          type="checkbox"
          checked={showAdminField}
          onChange={() => setShowAdminField(!showAdminField)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
          Sou administrador
        </label>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </div>
      
      <div className="text-sm text-center">
        <button
          type="button"
          onClick={() => setMode('login')}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Já tem uma conta? Faça login
        </button>
      </div>
    </form>
  );
  
  // Componente de verificação
  const renderVerificationForm = () => (
    <form onSubmit={handleConfirmSignUp} className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold">Verifique sua conta</h2>
        <p className="text-sm text-gray-600">
          Enviamos um código de verificação para {verificationInfo?.email}.
          <br />Por favor, verifique sua caixa de entrada e insira o código abaixo.
        </p>
      </div>
      
      <div>
        <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
          Código de verificação
        </label>
        <input
          type="text"
          id="verificationCode"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Verificando...' : 'Verificar'}
        </button>
      </div>
      
      <div className="text-sm text-center">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={loading}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Não recebeu o código? Reenviar
        </button>
      </div>
      
      <div className="text-sm text-center">
        <button
          type="button"
          onClick={() => setMode('login')}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Voltar para login
        </button>
      </div>
    </form>
  );
  
  // Renderizar o formulário correto com base no modo
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
  
  // Exibir mensagens de erro
  const renderError = () => {
    if (!error) return null;
    return (
      <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        {error}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {mode === 'login' ? 'Entre na sua conta' : 
             mode === 'register' ? 'Crie sua conta' : 
             'Verifique sua conta'}
          </h2>
        </div>
        
        {renderError()}
        {renderForm()}
        
        {/* Ferramentas de diagnóstico para desenvolvimento */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <details>
            <summary className="cursor-pointer text-sm text-gray-600 mb-2">
              Ferramentas de Diagnóstico
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded-md">
              <AuthDiagnostic />
              <AuthDebugger />
              <AuthTroubleshooter />
              {/* Botão para ver diagnóstico completo */}
              <button
                type="button"
                onClick={() => {
                  const result = printAuthDiagnostic();
                  console.log('Diagnóstico completo:', result);
                  alert('Diagnóstico completo foi impresso no console do navegador.');
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Ver diagnóstico completo no console
              </button>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
