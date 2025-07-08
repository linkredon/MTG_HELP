"use client"

import '../styles/professional-mtg-interface.css'
import '../styles/mobile-navigation.css'
import '../styles/mobile-navigation-refined.css'
import '../styles/header-enhancements.css'
import '../styles/header-refined.css'
import '../styles/tabs-enhanced.css'
import '../styles/content-refinements.css'
import '../styles/mobile-fixes.css'
import '../styles/dropdown-menu.css'
import '../styles/card-glow-effects-fixed.css'
import '../styles/ambient-glow-enhanced.css'
import '../styles/card-modal-enhanced.css'
import '../styles/deck-selector-compact.css'
import { useState, useEffect } from 'react'
import Script from 'next/script'
import Colecao from './colecao-compact'
import Painel from '@/components/Painel-compact'
import ConstrutorDecks from '@/components/ConstrutorDecks-compact'
import Regras from '@/components/Regras-compact'
import Spoiler from '@/components/Spoiler-compact'
import UserHeader from '@/components/UserHeader'
import MobileNavigation from '@/components/MobileNavigation'
import LoginDialog from '@/components/LoginDialog'
import { useAppContext } from '@/contexts/AppContext'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Grid3X3,
  Library,
  Hammer,
  BookOpen,
  Sparkles,
  User as UserIcon,
  Settings,
  Bell,
  Search,
  TrendingUp,
  Award,
  Zap,
  Target,
  Star
} from "lucide-react"
import type { User, MTGCard, UserCollection } from '@/types/mtg';

export default function Home() {
  // Estado do usuário
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('painel')
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
 
   // Estado para cartas disponíveis (pesquisa)
  const [allCards, setAllCards] = useState<MTGCard[]>([])

  // Usar o contexto global para coleção
  const { currentCollection, setCurrentCollection, adicionarCarta, removerCarta } = useAppContext()

  // Funções de autenticação
  const handleLogin = (userData: User) => {
    setUser(userData)
    localStorage.setItem('mtg-user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('mtg-user')
  }

  // Carregar usuário do localStorage ao inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem('mtg-user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        const completeUser: User = {
          id: parsedUser.id || '1',
          name: parsedUser.name || 'Usuário',
          email: parsedUser.email || '',
          avatar: parsedUser.avatar,
          joinedAt: parsedUser.joinedAt || new Date().toISOString(),
          collectionsCount: parsedUser.collectionsCount || 0,
          totalCards: parsedUser.totalCards || 0,
          achievements: parsedUser.achievements || []
        }
        setUser(completeUser)
      } catch (error) {
        console.error('Erro ao carregar usuário salvo:', error)
        localStorage.removeItem('mtg-user')
      }
    }
  }, [])

  // Função para exportar coleção para CSV no formato Manabox
  const exportCollectionToCSV = (collection: UserCollection) => {
    // Formato Manabox: Name,Set,Quantity,Foil,Condition,Language
    const csvContent = [
      ['Name', 'Set', 'Quantity', 'Foil', 'Condition', 'Language'],
      ...collection.cards.map(c => [
        c.card.name,
        c.card.set_code,
        c.quantity.toString(),
        'Non-foil', // Padrão para não-foil
        'Near Mint', // Padrão para condição
        'English' // Padrão para idioma
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${collection.name}_manabox.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Configuração das abas com design profissional
  const tabs = [
    {
      id: 'painel',
      label: 'Dashboard',
      icon: Grid3X3,
      component: <Painel onNavigate={setActiveTab} />
    },
    {
      id: 'colecao',
      label: 'Coleção',
      icon: Library,
      component: (
        <Colecao
          allCards={allCards}
          setAllCards={setAllCards}
          exportCollectionToCSV={exportCollectionToCSV}
        />
      )
    },
    {
      id: 'decks',
      label: 'Deck Builder',
      icon: Hammer,
      component: <ConstrutorDecks />
    },
    {
      id: 'spoiler',
      label: 'Spoilers',
      icon: Star,
      component: <Spoiler isAdmin={user?.email === 'admin@example.com'} />
    },
    {
      id: 'regras',
      label: 'Regras',
      icon: BookOpen,
      component: <Regras />
    },
    {
      id: 'extras',
      label: 'Recursos',
      icon: Sparkles,
      component: (
        <div className="p-4">
          {/* Header Compacto */}
          <div className="quantum-card-dense p-4 mb-4 card-purple">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Recursos Avançados</h2>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Ferramentas premium para aprimorar sua experiência MTG
            </p>
          </div>

          {/* Features Grid - Compact Version */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="quantum-card-dense p-3 card-blue">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Search className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Pesquisa Avançada</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    Filtros avançados com sintaxe Scryfall
                  </p>
                  <span className="inline-flex items-center h-5 px-2 rounded-md text-[10px] font-medium bg-blue-900/30 text-blue-400">
                    Em Breve
                  </span>
                </div>
              </div>
            </div>

            <div className="quantum-card-dense p-3 card-purple">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Monitoramento de Preços</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    Alertas sobre preços e tendências
                  </p>
                  <span className="inline-flex items-center h-5 px-2 rounded-md text-[10px] font-medium bg-yellow-900/30 text-yellow-400">
                    Beta
                  </span>
                </div>
              </div>
            </div>

            <div className="quantum-card-dense p-3 card-green">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Analytics Profissional</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    Insights sobre sua coleção
                  </p>
                  <span className="inline-flex items-center h-5 px-2 rounded-md text-[10px] font-medium bg-green-900/30 text-green-400">
                    Ativo
                  </span>
                </div>
              </div>
            </div>

            <div className="quantum-card-dense p-3 card-orange">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Comunidade MTG</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    Conecte-se com colecionadores
                  </p>
                  <span className="inline-flex items-center h-5 px-2 rounded-md text-[10px] font-medium bg-blue-900/30 text-blue-400">
                    Novo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Tools - Compact Version */}
          <div className="quantum-card-dense card-blue">
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-medium text-white">Ferramentas Premium</h3>
              </div>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-md border border-gray-700/50">
                  <div className="w-7 h-7 rounded-md bg-blue-500/20 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">Importação Massiva</h4>
                    <p className="text-[10px] text-gray-400">Importe via CSV/Excel</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-md border border-gray-700/50">
                  <div className="w-7 h-7 rounded-md bg-green-500/20 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">API Avançada</h4>
                    <p className="text-[10px] text-gray-400">Integração com sistemas externos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  // Efeito de brilho que segue o mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.quantum-card-dense, .compact-header .quantum-card-dense');
      cards.forEach(card => {
        const htmlCard = card as HTMLElement;
        const rect = htmlCard.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
          htmlCard.style.setProperty('--x', `${x}%`);
          htmlCard.style.setProperty('--y', `${y}%`);
        }
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="mtg-app quantum-compact">
      {/* Desktop Header - Escondido em telas pequenas */}
      <div className="hidden md:block">
        <header className="compact-header sticky top-0 z-50 backdrop-blur-md shadow-lg">
          <div className="mtg-container py-2">
            <div className="quantum-card-dense p-2 flex items-center justify-between bg-gradient-to-r from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-cyan-900/30 rounded-lg card-glow">
              <a href="#" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 via-cyan-700 to-cyan-800 rounded-md flex items-center justify-center text-white font-bold shadow-md shadow-cyan-700/20 group-hover:shadow-cyan-500/30 transition-all">
                  <span className="text-xs font-black tracking-wider">MTG</span>
                </div>
                <div className="relative">
                  <h1 className="text-base font-bold text-white m-0 tracking-tight flex items-center">
                    MTG Helper
                    <span className="ml-2 px-1.5 py-0.5 bg-cyan-600/20 border border-cyan-500/30 rounded-full text-[9px] font-medium text-cyan-300">v2.5</span>
                  </h1>
                  <p className="text-[10px] text-cyan-300 m-0">Premium Collection Manager</p>
                  <div className="absolute h-0.5 w-0 bg-cyan-400 bottom-0 left-0 group-hover:w-full transition-all duration-300"></div>
                </div>
              </a>
              
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1">
                  <a href="#" className="px-2 py-1 text-xs text-cyan-200 hover:text-white transition-colors rounded-md hover:bg-cyan-800/20">
                    Suporte
                  </a>
                </div>
                <div className="h-5 w-px bg-cyan-800/30 hidden lg:block"></div>
                <UserHeader 
                  user={user}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        </header>
      </div>
      
      {/* Mobile Navigation - Visível apenas em telas pequenas */}
      <div className="block md:hidden">
        <MobileNavigation 
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          onLogin={() => setIsLoginDialogOpen(true)}
        />
      </div>

      <LoginDialog
       isOpen={isLoginDialogOpen}
       setIsOpen={setIsLoginDialogOpen}
       onLogin={handleLogin}
     />

      {/* Main Container */}
      <div className="mtg-container mt-4 relative">
        <div className="ambient-glow-main pointer-events-none"></div>
        {/* Enhanced Navigation Panel */}
        <nav className="mb-3 responsive-nav">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full navigation-tabs"
          >
            <div className="quantum-card-dense p-2 md:p-3 bg-gradient-to-r from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-cyan-900/30 rounded-lg card-glow relative">
              <div className="nav-ambient-glow pointer-events-none"></div>
              <TabsList className="mobile-tabs-grid flex flex-wrap justify-center gap-2 py-2 px-1 bg-transparent border-0 relative z-10 tab-list-container h-auto overflow-visible">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="quantum-tab group relative overflow-hidden z-20 border border-cyan-900/20 hover:border-cyan-600/30 transition-colors rounded-md"
                    >
                      <span className="tab-glow absolute inset-0 opacity-0 group-hover:opacity-30 group-data-[state=active]:opacity-60 transition-opacity pointer-events-none bg-cyan-600/20"></span>
                      <div className="tab-content flex flex-col md:flex-row items-center justify-center relative z-10">
                        <div className="icon-container">
                          <Icon className="w-4 h-4 md:mr-1.5 mb-0 tab-icon text-cyan-400" />
                        </div>
                        <span className="text-xs font-medium tracking-wide tab-label text-gray-300">{tab.label}</span>
                      </div>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              <div className="flex justify-center mt-2 mb-1 relative">
                <div className="tab-indicator-container">
                  <div className="tab-indicator-active" style={{background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.9), rgb(0 0 0 / 80%))'}}></div>
                </div>
                <div className="tab-indicator-glow"></div>
              </div>

            </div>

            {/* Enhanced Content Areas */}
            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="quantum-content-area p-0 mt-3 transition-all duration-300 ease-in-out"
              >
                <div className="content-wrapper">
                  {tab.component}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </nav>
      </div>
    </div>
  )
}
