"use client"

import { useState, useEffect } from 'react'
import { 
  Menu, 
  X, 
  User as UserIcon,
  Grid3X3,
  Library,
  Hammer,
  BookOpen, 
  Sparkles,
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  Home,
  Heart
} from 'lucide-react'

import type { User } from '@/types/mtg';

interface MobileNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  user?: User | null
  onLogout?: () => void
  onLogin?: () => void
}

const MobileNavigation = ({
  user,
  activeTab,
  onTabChange,
  onLogout,
  onLogin
}: MobileNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showFab, setShowFab] = useState(false)
  
  // Tabs para navegação
  const tabs = [
    { id: 'painel', label: 'Dashboard', icon: Grid3X3 },
    { id: 'colecao', label: 'Coleção', icon: Library },
    { id: 'decks', label: 'Deck Builder', icon: Hammer },
    { id: 'favoritos', label: 'Favoritos', icon: Heart },
    { id: 'regras', label: 'Regras', icon: BookOpen },
    { id: 'extras', label: 'Recursos', icon: Sparkles }
  ]

  // Detectar scroll para alterar o estilo do header e mostrar FAB
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      setShowFab(window.scrollY > 300)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Desabilitar o scroll do corpo quando o menu está aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId)
    setIsMenuOpen(false) // Fechar menu ao mudar de aba
  }

  const [notificationCount] = useState(2) // Simulando notificações
  const [searchActive, setSearchActive] = useState(false)
  
  return (
    <>
      {/* Mobile Header */}
      <header className={`mobile-header ${isScrolled ? 'mobile-header-scrolled' : ''} mobile-header-animate-in`}>
        <div className="mobile-header-container mobile-header-content-animate">
          <div className="mobile-logo-container">
            <div className="mobile-logo-badge" onClick={() => onTabChange('painel')}>
              <span className="relative z-10">MTG</span>
            </div>
            <div className="mobile-logo-text">
              <span className="mobile-logo-title">MTG Helper</span>
              <span className="mobile-logo-subtitle">Collection Manager</span>
            </div>
          </div>
          
          <button 
            className="mobile-nav-toggle" 
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir menu de navegação"
          >
            <Menu size={20} />
            {user && user.totalCards > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
            )}
          </button>
        </div>
        
        {/* Subheader para página atual */}
        <div className="mobile-subheader mobile-header-content-animate" style={{animationDelay: '0.1s'}}>
          <div 
            className="mobile-subheader-title"
            onClick={() => {
              // Scroll to top quando clicar no título
              window.scrollTo({top: 0, behavior: 'smooth'})
            }}
          >
            {tabs.find(tab => tab.id === activeTab)?.icon && (
              <div className="mobile-subheader-icon">
                {(() => {
                  const Icon = tabs.find(tab => tab.id === activeTab)?.icon || Home
                  return <Icon size={18} className="text-indigo-400" />
                })()}
              </div>
            )}
            <span>{tabs.find(tab => tab.id === activeTab)?.label || 'Início'}</span>
          </div>
          
          <div className="mobile-subheader-actions">
            <button 
              className={`mobile-subheader-button ${searchActive ? 'bg-blue-900/40 text-blue-400' : ''}`}
              aria-label="Pesquisar"
              onClick={() => setSearchActive(!searchActive)}
            >
              <Search size={16} />
              {searchActive && (
                <span className="absolute inset-0 bg-blue-500/10 animate-pulse rounded-full"></span>
              )}
            </button>
            <button 
              className="mobile-subheader-button relative"
              aria-label="Notificações"
              onClick={() => alert('Notificações em breve!')}
            >
              <Bell size={16} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-indigo-900">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Search Bar - Conditional Render */}
        {searchActive && (
          <div className="p-2 bg-gray-900/70 border-t border-indigo-500/20 animate-fadeIn">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar cartas..."
                className="w-full px-3 py-2 bg-gray-800 border border-indigo-500/30 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={14} />
              </button>
            </div>
          </div>
        )}
      </header>
      
      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-nav-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(false)}
        style={{backdropFilter: 'blur(3px)', zIndex: 9998}}
      />
      
      {/* Mobile Navigation Menu */}
      <nav className={`mobile-nav-menu ${isMenuOpen ? 'open' : ''}`} style={{zIndex: 9999}}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-title">
            Menu Principal
            <div className="text-xs font-normal text-indigo-300 mt-1">Versão 1.2.0</div>
          </div>
          <button 
            className="mobile-menu-close interactive-header-element"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* User Profile Section */}
        {user ? (
          <div className="mobile-user-profile">
            <div className="mobile-user-avatar" style={{
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)'
            }}>
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={`Avatar de ${user.name}`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div className="mobile-user-info">
              <div className="mobile-user-name flex items-center gap-1">
                {user.name}
                {user.totalCards > 100 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full text-[8px] text-white" title="Colecionador Experiente">★</span>
                )}
              </div>
              <div className="mobile-user-stats flex items-center gap-2">
                <span className="flex items-center gap-0.5">
                  <Library size={10} className="text-blue-400" /> 
                  {user.totalCards || 0} cartas
                </span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="flex items-center gap-0.5">
                  <Grid3X3 size={10} className="text-purple-400" /> 
                  {user.collectionsCount || 0} coleções
                </span>
              </div>
            </div>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="mobile-subheader-button hover:bg-red-900/30 hover:text-red-400 transition-colors"
                aria-label="Sair da conta"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="mobile-user-profile">
            <div className="mobile-user-avatar relative">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                <UserIcon size={16} className="text-gray-400" />
              </div>
            </div>
            <div className="mobile-user-info">
              <div className="mobile-user-name">Visitante</div>
              <div className="mobile-user-stats">
                Faça login para salvar sua coleção
              </div>
            </div>
            <button 
              className="mobile-subheader-button hover:bg-blue-900/30 hover:text-blue-400 transition-colors"
              aria-label="Entrar na conta"
              onClick={onLogin}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        
        {/* Navigation Links */}
        <div className="mobile-menu-content">
          <div className="py-2 px-4">
            <div className="text-xs font-medium uppercase text-gray-500 mb-2">Navegação</div>
          </div>
          <div className="mobile-nav-links">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`mobile-nav-link ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <span className={`mobile-nav-link-icon ${activeTab === tab.id ? 'bg-blue-500/10' : ''}`}>
                    <Icon size={18} />
                  </span>
                  {tab.label}
                  <span className={`ml-auto transition-transform duration-200 ${activeTab === tab.id ? 'rotate-90' : ''}`}>
                    <ChevronRight size={16} className={activeTab === tab.id ? 'text-blue-400' : 'text-gray-500'} />
                  </span>
                </button>
              )
            })}
          </div>
          
          <div className="py-2 px-4 mt-4">
            <div className="text-xs font-medium uppercase text-gray-500 mb-2">Configurações</div>
            <button className="mobile-nav-link">
              <span className="mobile-nav-link-icon">
                <Settings size={18} />
              </span>
              Preferências
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mobile-menu-footer">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Heart size={12} className="text-red-500 animate-pulse" />
            <span>Made for MTG Collectors</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="px-1.5 py-0.5 bg-blue-900/30 rounded text-[10px] text-blue-400 font-medium">v1.2.0</span>
            <span>•</span>
            <span>© 2025</span>
          </div>
        </div>
      </nav>
      
      {/* Floating Action Button for quick navigation */}
      {showFab && (
        <button 
          className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg z-40 animate-slideUp border-2 border-indigo-900/30"
          onClick={() => {
            window.scrollTo({top: 0, behavior: 'smooth'})
          }}
          aria-label="Voltar ao topo"
        >
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-pulse"></div>
          <Home className="text-white" size={18} />
        </button>
      )}
    </>
  )
}

export default MobileNavigation
