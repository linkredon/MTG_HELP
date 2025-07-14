"use client";
import '../../lib/amplifyClient';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth-helpers';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminField, setShowAdminField] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const result = await signIn(email, password);
        console.log('Login result:', result);
        if (!result.success) {
          setError(result.error || 'Email ou senha inválidos');
        } else {
          router.push('/');
          router.refresh();
        }
      } else {
        // Verificar se é um registro de administrador
        const isAdmin = adminCode === process.env.NEXT_PUBLIC_ADMIN_CODE || adminCode === 'MTG_ADMIN_2024';
        // Registro
        const result = await signUp(email, password, name, isAdmin);
        console.log('SignUp result:', result);
        if (result.success) {
          setError('Conta criada! Fazendo login automático...');
          // Tentar fazer login automaticamente
          const loginResult = await signIn(email, password);
          console.log('Auto-login result:', loginResult);
          if (loginResult.success) {
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

  // Adicionar botão de login do NextAuth (Google)
  const handleGoogleLogin = async () => {
    const { signIn } = await import('next-auth/react');
    signIn('google');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-4 text-center">{isLogin ? 'Login' : 'Criar Conta'}</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <button
            type="button"
            className="mt-4 w-full bg-white text-indigo-700 font-bold py-2 px-4 rounded shadow hover:bg-indigo-50 transition-all"
            onClick={handleGoogleLogin}
          >
            Entrar com Google
          </button>
          <div className="mt-4 text-center">
            <button className="text-indigo-400 hover:underline" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Criar uma conta' : 'Já tem conta? Entrar'}
            </button>
          </div>
          {error && <div className="text-red-400 text-center mt-4">{error}</div>}
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>MTG Helper - Gerenciador de Coleção para Magic: The Gathering</p>
          <p className="mt-1">© 2023-2024 - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}