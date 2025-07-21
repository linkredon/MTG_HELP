"use client"

import { useState, useEffect } from 'react'
import { 
  Menu, 
  X, 
  Grid3X3, 
  Library, 
  Hammer, 
  Heart, 
  Trophy, 
  BookOpen, 
  Sparkles,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Settings
} from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext'

interface MobileNavigationProps {
  user?: any
  activeTab?: string
  onTabChange?: (tab: string) => void
  setActiveTab?: (tab: string) => void
  onLogout?: () => void
  onLogin?: () => void
  tabs?: Array<{
    id: string
    label: string
    icon: any
  }>
}

const MobileNavigation = ({
  user,
  activeTab,
  onTabChange,
  setActiveTab,
  onLogout,
  onLogin,
  tabs
}: MobileNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showFab, setShowFab] = useState(false)
  const { collections, decks, favorites } = useAppContext()
  const { user: authUser } = useAmplifyAuth()
  
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

  // Usar dados locais se disponíveis, senão usar dados do usuário passado como prop
  const displayUser = localUserData ? {
    ...user,
    name: localUserData.name || user?.name,
    email: localUserData.email || user?.email,
    avatar: localUserData.avatar || user?.avatar
  } : user;
  
  // Tabs para navegação - usar a prop tabs se fornecida, caso contrário usar tabs padrão
  const navTabs = tabs || [
    { id: 'painel', label: 'Dashboard', icon: Grid3X3 },
    { id: 'colecao', label: 'Coleção', icon: Library },
    { id: 'decks', label: 'Deck Builder', icon: Hammer },
    { id: 'favoritos', label: 'Favoritos', icon: Heart },
    { id: 'achievements', label: 'Conquistas', icon: Trophy },
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
    // Use setActiveTab se disponível, caso contrário, use onTabChange
    if (setActiveTab) {
      setActiveTab(tabId)
    } else if (onTabChange) {
      onTabChange(tabId)
    }
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
            <div className="mobile-logo-badge" onClick={() => handleTabChange('painel')}>
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
            {displayUser && stats.totalCards > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
            )}
          </button>
        </div>
        
        {/* Subheader para página atual */}
        <div className="mobile-subheader">
          <div className="mobile-subheader-content">
            <div className="mobile-subheader-title">
              {navTabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
            </div>
            <div className="mobile-subheader-actions">
              <button 
                className="mobile-subheader-button"
                onClick={() => setSearchActive(!searchActive)}
                aria-label="Pesquisar"
              >
                <Search size={16} />
              </button>
              <button 
                className="mobile-subheader-button relative"
                aria-label="Notificações"
              >
                <Bell size={16} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-gray-900">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

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
        {displayUser ? (
          <div className="mobile-user-profile">
            <div className="mobile-user-avatar" style={{
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)'
            }}>
              {displayUser.avatar ? (
                <img 
                  src={displayUser.avatar} 
                  alt={`Avatar de ${displayUser.name}`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  {displayUser.name.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div className="mobile-user-info">
              <div className="mobile-user-name flex items-center gap-1">
                {displayUser.name}
                {stats.totalCards > 100 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full text-[8px] text-white" title="Colecionador Experiente">★</span>
                )}
              </div>
              <div className="mobile-user-stats flex items-center gap-2">
                <span className="flex items-center gap-0.5">
                  <Library size={10} className="text-blue-400" /> 
                  {stats.totalCards} cartas
                </span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="flex items-center gap-0.5">
                  <Grid3X3 size={10} className="text-purple-400" /> 
                  {stats.collectionsCount} coleções
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
        <div className="mobile-nav-links">
          {navTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`mobile-nav-link ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mobile-quick-actions">
          <button className="mobile-quick-action">
            <Settings size={16} />
            <span>Configurações</span>
          </button>
          <button className="mobile-quick-action">
            <Trophy size={16} />
            <span>Conquistas</span>
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      {isMenuOpen && (
        <div 
          className="mobile-backdrop"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Floating Action Button */}
      {showFab && (
        <button 
          className="mobile-fab"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
      )}
    </>
  )
}

export default MobileNavigation
