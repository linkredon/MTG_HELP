"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as AmplifyAuth from '@/lib/aws-auth-adapter';

/**
 * Hook personalizado para proteger rotas que precisam de autenticação.
 * Gerencia cookies temporários para evitar loops de redirecionamento
 * @param redirectPath Caminho para redirecionar caso não esteja autenticado
 */
export function useAuthGuard(redirectPath: string = '/login') {
  // const { data: session, status } = useSession(); - Removido temporariamente
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Verificar autenticação usando API users/me
    async function checkAuthWithUserAPI() {
      try {
        console.log("Verificando autenticação com API do usuário");
        const res = await fetch('/api/users/me');
        const data = await res.json();
        
        if (data.success && data.user) {
          console.log("Usuário autenticado via API:", data.user);
          setUser(data.user);
          setIsAuthChecked(true);
          setIsLoading(false);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Erro ao verificar usuário via API:", error);
        return false;
      }
    }
    
    // Verificar autenticação via AWS Amplify
    async function checkAuthWithAmplify() {
      try {
        console.log("Verificando autenticação com AWS Amplify");
        const currentUser = await AmplifyAuth.getCurrentUser();
        
        if (currentUser) {
          console.log("Usuário autenticado via Amplify:", currentUser);
          const userData = {
            name: currentUser.username || currentUser.signInDetails?.loginId,
            email: currentUser.signInDetails?.loginId,
            role: 'user',
            avatar: '/default-avatar.png'
          };
          
          try {
            // Tentar obter atributos do usuário
            const attributes = await AmplifyAuth.fetchUserAttributes();
            if (attributes) {
              userData.name = attributes.name || userData.name;
              userData.email = attributes.email || userData.email;
              userData.role = attributes['custom:role'] || userData.role;
              userData.avatar = attributes.picture || userData.avatar;
            }
          } catch (attrError) {
            console.error("Erro ao buscar atributos do usuário:", attrError);
          }
          
          setUser(userData);
          setIsAuthChecked(true);
          setIsLoading(false);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Erro ao verificar autenticação Amplify:", error);
        return false;
      }
    }
    
    // Checar no localStorage para modo de demonstração
    function checkDemoMode() {
      try {
        const demoMode = localStorage.getItem('NEXT_PUBLIC_DEMO_MODE');
        return demoMode === 'true';
      } catch (error) {
        return false;
      }
    }
    
    // Função principal de verificação
    async function verifyAuth() {
      // Verificar modo de demonstração
      if (checkDemoMode()) {
        console.log("Modo de demonstração ativo");
        setUser({ name: "Usuário Demo", email: "demo@example.com", role: "user" });
        setIsAuthChecked(true);
        setIsLoading(false);
        return;
      }
      
      // Verificações sequenciais
      const amplifyAuth = await checkAuthWithAmplify();
      if (amplifyAuth) return;
      
      const userAPIAuth = await checkAuthWithUserAPI();
      if (userAPIAuth) return;
      
      // Se chegou aqui, não está autenticado - mas não vamos redirecionar
      // por enquanto para evitar loops
      console.log("Usuário não autenticado, mas não redirecionando para evitar loops");
      setIsAuthChecked(true);
      setIsLoading(false);
      
      // Descomente para habilitar o redirecionamento quando o problema estiver resolvido
      /*
      const currentPath = window.location.pathname;
      const loginUrl = `${redirectPath}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
      */
    }
    
    // Iniciar verificação
    verifyAuth();
    
  }, [router, redirectPath]);

  return { 
    isAuthChecked, 
    isAuthenticated: !!user, 
    isLoading,
    user
  };
}

export default useAuthGuard;
