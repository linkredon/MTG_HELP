'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export const RedirectLoopDetector: React.FC = () => {
  const router = useRouter();
  const [redirectCount, setRedirectCount] = useState(0);
  const [lastPath, setLastPath] = useState('');
  const maxRedirects = 5;
  const redirectCountRef = useRef(0);

  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // Detectar loops de redirecionamento
    if (currentPath === lastPath && currentPath !== '/') {
      redirectCountRef.current += 1;
      setRedirectCount(redirectCountRef.current);
      
      if (redirectCountRef.current >= maxRedirects) {
        console.warn('🔄 RedirectLoopDetector: Loop detectado, limpando cookies e redirecionando');
        
        // Limpar cookies de autenticação
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Limpar localStorage
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirecionar para login
        router.push('/login');
        return;
      }
    } else {
      redirectCountRef.current = 0;
      setRedirectCount(0);
    }
    
    setLastPath(currentPath);
  }, [router, lastPath]); // Removida dependência redirectCount

  // Monitorar mudanças de URL
  useEffect(() => {
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      console.log('🔄 RedirectLoopDetector: Mudança de rota detectada:', currentPath);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  return null; // Componente invisível
}; 