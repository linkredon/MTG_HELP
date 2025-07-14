'use client';

import { useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userInfo = await getCurrentUser();
        const session = await fetchAuthSession();
        
        // Extrair grupos do token de acesso
        const groups = session.tokens?.accessToken?.payload['cognito:groups'] || [];
        
        // Verificar se o usuário está no grupo de administradores
        if (Array.isArray(groups) && groups.includes('Admins')) {
          setIsAdmin(true);
        } else {
          // Redirecionar se não for administrador
          router.push('/');
        }
      } catch (error) {
        console.error('Erro ao verificar permissões de administrador:', error);
        // Redirecionar se houver erro na autenticação
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white text-xl">Verificando permissões...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Não renderiza nada enquanto redireciona
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold">Admin</span>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-slate-900 hover:bg-slate-700">
                    Dashboard
                  </Link>
                  <Link href="/admin/google-oauth-setup" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white">
                    Google OAuth
                  </Link>
                  <Link href="/admin/docs/google-oauth" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white">
                    Documentação OAuth
                  </Link>
                  <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white">
                    Voltar ao Site
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Menu para mobile */}
        <div className="md:hidden border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-slate-900 hover:bg-slate-700">
              Dashboard
            </Link>
            <Link href="/admin/google-oauth-setup" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white">
              Google OAuth
            </Link>
            <Link href="/admin/docs/google-oauth" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white">
              Documentação OAuth
            </Link>
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white">
              Voltar ao Site
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
