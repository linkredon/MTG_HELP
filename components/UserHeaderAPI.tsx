"use client"

import { useState } from 'react'
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
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const UserHeader = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notificationCount] = useState(2)

  const handleLogin = () => {
    router.push('/login')
  }

  const handleLogout = () => {
    signOut({ redirect: false })
    setShowUserMenu(false)
  }

  const user = session?.user

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
              {user && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-400" />
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">{user.collectionsCount || 0}</div>
                      <div className="text-xs text-slate-400">coleções</div>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-700"></div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-400" />
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">{user.totalCards || 0}</div>
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

            {/* User profile */}
            <div className="relative">
              {status === 'authenticated' && user ? (
                <div className="cursor-pointer">
                  <button 
                    className="mtg-user-trigger flex items-center gap-3 px-2 py-1 hover:bg-gray-800/50 relative z-10"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <span className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10 ring-2 ring-slate-700">
                      {user.avatar ? (
                        <img 
                          className="aspect-square h-full w-full" 
                          alt={user.name} 
                          src={user.avatar}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-medium">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </span>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-white">{user.name}</div>
                      <div className="text-xs text-slate-400">Online</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                  </button>
                  
                  {/* User dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-700">
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Perfil</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>Configurações</span>
                      </button>
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