"use client";
import '../../lib/amplifyClient';
import './login-updated.css';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth-helpers';
import AuthDiagnostic from '@/components/AuthDiagnostic';
import { printAuthDiagnostic } from '@/lib/authDiagnostic';
import AuthDebugger from '@/components/AuthDebugger';
import AuthTroubleshooter from '@/components/AuthTroubleshooter';
import { useAmplifyAuth, AmplifyUser } from '@/contexts/AmplifyAuthContext';

// Componente Login
export default function Login() {
  const router = useRouter();
  const { user, isLoading } = useAmplifyAuth(); // Corrigido: isLoading do contexto
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // Remover duplicidade de isLoading
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [authDebugInfo, setAuthDebugInfo] = useState({});
  const [showAuthDebugger, setShowAuthDebugger] = useState(false);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [showAmplifyDiagnostic, setShowAmplifyDiagnostic] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/colecao');
    }
  }, [user, isLoading, router]);

  // Handler para login com Google
  const handleGoogleLogin = useCallback(async () => {
    setErrorMessage('');
    try {
      // Fallback: mostrar erro se googleSignIn não existir
      setErrorMessage('Login com Google não está disponível no momento.');
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao fazer login com Google');
      setAuthDebugInfo({ error });
    }
  }, []);

  // Handler para login com email/senha
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await signIn(email, password);
      router.push('/colecao');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao fazer login');
      setAuthDebugInfo({ error });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Login</h1>
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
            <button 
              onClick={() => setShowDiagnostic(prev => !prev)}
              className="diagnostic-toggle"
            >
              {showDiagnostic ? 'Ocultar diagnóstico' : 'Mostrar diagnóstico'}
            </button>
          </div>
        )}
        {showDiagnostic && <AuthDiagnostic />}
        <form onSubmit={handleEmailLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>
        <div className="social-login">
          <button 
            onClick={handleGoogleLogin} 
            className="google-button"
            disabled={isLoading}
          >
            <span className="google-icon">G</span>
            {isLoading ? 'Carregando...' : 'Entrar com Google'}
          </button>
        </div>
        <div className="debug-tools">
          <button 
            onClick={() => setShowAuthDebugger(!showAuthDebugger)}
            className="debug-button"
          >
            {showAuthDebugger ? 'Ocultar Debugger' : 'Auth Debugger'}
          </button>
          <button 
            onClick={() => setShowTroubleshooter(!showTroubleshooter)}
            className="debug-button"
          >
            {showTroubleshooter ? 'Ocultar' : 'Troubleshooter'}
          </button>
          <button 
            onClick={() => setShowAmplifyDiagnostic(!showAmplifyDiagnostic)}
            className="debug-button"
          >
            {showAmplifyDiagnostic ? 'Ocultar' : 'Amplify Diagnostic'}
          </button>
        </div>
        {showAuthDebugger && <AuthDebugger debugInfo={authDebugInfo} />}
        {showTroubleshooter && <AuthTroubleshooter />}
        {/* AmplifyDiagnostic removido pois não existe exportação válida */}
      </div>
    </div>
  );
}
