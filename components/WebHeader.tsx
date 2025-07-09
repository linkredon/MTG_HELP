"use client"

import { useState } from 'react'
import { 
  Search, 
  Bell, 
  ChevronDown,
  LogOut,
  Settings,
  User,
  Library,
  Grid3X3,
  Hammer,
  BookOpen,
  Sparkles,
  Star
} from 'lucide-react'
import type { User as UserType } from '@/types/mtg'

interface WebHeaderProps {
  user: UserType | null
  activeTab: string
  onTabChange: (tab: string) => void
  onLogin: () => void
  onLogout: () => void
}

const WebHeader = ({ user, activeTab, onTabChange, onLogin, onLogout }: WebHeaderProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notificationCount] = useState(2)

  const tabs = [
    { id: 'painel', label: 'Dashboard', icon: Grid3X3 },
    { id: 'colecao', label: 'Coleção', icon: Library },
    { id: 'decks', label: 'Deck Builder', icon: Hammer },
    { id: 'spoiler', label: 'Spoilers', icon: Star },
    { id: 'regras', label: 'Regras', icon: BookOpen },
    { id: 'extras', label: 'Recursos', icon: Sparkles }
  ]

  return (
    <header className="hidden lg:block sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-indigo-500/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg border border-indigo-400/20">
              <span className="text-white font-bold text-lg">MTG</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">MTG Helper</div>
              <div className="text-indigo-300 text-xs">Collection Manager</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600/20 text-indigo-300 border-b-2 border-indigo-500'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>

          {/* User section */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <button className="p-2 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
              <Search size={18} />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors relative">
              <Bell size={18} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-xs text-white font-bold border border-gray-900">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* User profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-indigo-400/30 shadow-md overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-medium">{user.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-gray-300 font-medium hidden lg:block">{user.name}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-indigo-500/20 rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <div className="text-sm font-medium text-white">{user.name}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2">
                      <User size={14} />
                      <span>Perfil</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2">
                      <Settings size={14} />
                      <span>Configurações</span>
                    </button>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button 
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <LogOut size={14} />
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default WebHeader