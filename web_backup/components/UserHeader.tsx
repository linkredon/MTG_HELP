"use client"

import { useState, useEffect } from 'react'
import { 
  Search, 
  Bell, 
  ChevronDown,
  LogOut,
  Settings,
  User,
  Trophy,
  Star
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext'
import { useAppContext } from '@/contexts/AppContext'
import { logoutUser } from '@/lib/auth-amplify'

// Definindo a interface de props para compatibilidade com código existente
interface UserHeaderProps {
  user?: any;
  onLogin?: () => void;
  onLogout?: () => void;
}

const UserHeader = (props: UserHeaderProps) => {
  const router = useRouter()
  const { user: authUser, isAuthenticated, isLoading, signOut } = useAmplifyAuth()
  const { collections, decks, favorites } = useAppContext()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notificationCount] = useState(2)
  
  // Definir status com base no estado do contexto de autenticação
  const authStatus = isLoading ? 'loading' : (isAuthenticated ? 'authenticated' : 'unauthenticated')

  // Calcular estatísticas dos dados reais do contexto
  const calculateStats = () => {
    let totalCards = 0;
    let collectionsCount = 0;

    // Processar coleções
    collections.forEach(collection => {
      collectionsCount++;
      if (collection.cards && Array.isArray(collection.cards)) {
        collection.cards.forEach(card => {
          const quantity = card.quantity || 1;
          totalCards += quantity;
        });
      }
    });

    return {
      totalCards,
      collectionsCount
    };
  };

  const stats = calculateStats();

  const handleLogin = () => {
    if (props.onLogin) {
      props.onLogin();
    } else {
      router.push('/login');
    }
  }

  const handleLogout = async () => {
    try {
      // Usar função de logout do contexto Amplify
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleProfile = () => router.push('/user/profile');
  const handleSettings = () => router.push('/user/settings');

  // Usar o usuário do Amplify Auth ou o usuário passado como prop
  const user = authUser ? {
    name: authUser.name,
    email: authUser.email,
    avatar: authUser.avatar || authUser.image,
    role: 'user', // Valor padrão, já que não existe no tipo AmplifyUser
    totalCards: stats.totalCards,
    collectionsCount: stats.collectionsCount
  } : props.user || { name: 'Usuário' };

  // Carregar dados salvos localmente para sincronizar com a página de perfil
  const [localUserData, setLocalUserData] = useState<any>(null);

  useEffect(() => {
    if (authUser?.id) {
      const savedProfile = localStorage.getItem(`user_profile_${authUser.id}`);
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setLocalUserData(parsedProfile);
        } catch (error) {
          console.error('Erro ao carregar perfil salvo:', error);
        }
      }
    }
  }, [authUser]);

  // Usar dados locais se disponíveis, senão usar dados do Amplify
  const displayUser = localUserData ? {
    ...user,
    name: localUserData.name || user.name,
    email: localUserData.email || user.email,
    avatar: localUserData.avatar || user.avatar
  } : user;
  
  // Move console logs to useEffect to avoid rendering issues
  useEffect(() => {
    console.log('UserHeader montado');
    console.log('Auth user data:', authUser);
  }, [authUser]);
  
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg border border-indigo-400/20">
              <span className="text-white font-bold text-lg">MTG</span>
            </div>
            <div className="hidden md:block">
              <div className="text-white font-bold text-lg leading-tight">MTG Helper</div>
              <div className="text-indigo-300 text-xs">Collection Manager</div>
            </div>
          </div>

          {/* User section */}
          <div className="flex items-center gap-3 lg:gap-6">
            {/* User stats - visible only on larger screens */}
            <div className="hidden lg:flex items-center gap-4">
              {displayUser && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-400" />
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">{stats.collectionsCount}</div>
                      <div className="text-xs text-slate-400">coleções</div>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-700"></div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-400" />
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">{stats.totalCards}</div>
                      <div className="text-xs text-slate-400">cartas</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all flex items-center justify-center">
                <Search className="w-4 h-4 text-slate-400" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all flex items-center justify-center relative">
                <Bell className="w-4 h-4 text-slate-400" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-slate-900">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>

            
            <div className="relative">
              {(authStatus === 'authenticated' || displayUser) ? (
                <div className="cursor-pointer">
                  <button 
                    className="mtg-user-trigger flex items-center gap-3 px-2 py-1 hover:bg-gray-800/50 relative z-10"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <span className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10 ring-2 ring-slate-700">
                      {displayUser?.avatar ? (
                        <img 
                          className="aspect-square h-full w-full object-cover" 
                          alt={displayUser.name} 
                          src={displayUser.avatar}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-medium">
                          {displayUser?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </span>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-white">{displayUser?.name || 'Usuário'}</div>
                      <div className="text-xs text-slate-400">Online</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                  </button>
                  
                  {/* User dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-700">
                        <div className="text-sm font-medium text-white">{displayUser?.name || 'Usuário'}</div>
                        <div className="text-xs text-slate-400">{displayUser?.email || ''}</div>
                      </div>
                      <button 
                        onClick={handleProfile}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Perfil</span>
                      </button>
                      <button 
                        onClick={() => router.push('/user/personalization')}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Personalização</span>
                      </button>
                      <button 
                        onClick={handleSettings}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configurações</span>
                      </button>
                      {displayUser?.role === 'admin' && (
                        <button 
                          onClick={() => router.push('/admin')}
                          className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-slate-700 flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Administração</span>
                        </button>
                      )}
                      <div className="border-t border-slate-700 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Entrar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default UserHeader