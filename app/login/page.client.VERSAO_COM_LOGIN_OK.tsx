// VERSÃO COM LOGIN OK - backup da página de login funcional

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

        // Setar cookie diretamente via JS para garantir que o middleware reconheça
        document.cookie = "mtg_user_authenticated=true; path=/";

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

  // ... restante do código igual ao original ...

} 