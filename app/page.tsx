"use client"

// Configuração para evitar pré-renderização estática
export const dynamic = 'force-dynamic';

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
import '../styles/mobile-header-web-fix.css'
import '../styles/user-header-enhanced.css'
import '../styles/tabs-dark-theme.css'
import '../styles/favorites.css'
import '../styles/achievements.css'
import '../styles/achievements-enhanced.css'
import '../styles/deck-builder-enhanced.css'
import '../styles/card-search-enhanced.css'
import '../styles/dropdown-fixes-enhanced.css'
import '../styles/modal-fix-enhanced.css'
import '../styles/deck-importer-enhanced.css'
import { useState, Suspense, useEffect } from 'react'
import Script from 'next/script'
import Colecao from './colecao-compact'
import Painel from '@/components/Painel'
import ConstrutorDecks from '@/components/ConstrutorDecks-compact'
import Regras from '@/components/Regras-compact'
import Spoiler from '@/components/Spoiler-compact'
import Favoritos from '@/components/Favoritos-compact'
import AchievementsPage from './achievements/page'
import UserHeader from '@/components/UserHeader'
import MobileNavigation from '@/components/MobileNavigation'
import { useAppContext } from '@/contexts/AppContext'
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext'
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
  Star,
  Heart,
  ExternalLink,
  Trophy,
  Home as HomeIcon,
  Plus,
  Menu,
  X,
  ChevronRight
} from "lucide-react"
import type { MTGCard } from '@/types/mtg';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'

// Componente Mobile App
const MobileApp = () => {
  const router = useRouter()
  const { user: authUser } = useAmplifyAuth()
  const [activeTab, setActiveTab] = useState('painel')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [allCards, setAllCards] = useState<MTGCard[]>([])
  const { currentCollection, exportCollectionToCSV } = useAppContext()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editName, setEditName] = useState(authUser?.name || '')
  const [editAvatar, setEditAvatar] = useState(authUser?.avatarUrl || '')

  const tabs = [
    {
      id: 'painel',
      label: 'Dashboard',
      icon: HomeIcon,
      content: <Painel onNavigate={(tab) => setActiveTab(tab)} />
    },
    {
      id: 'colecao',
      label: 'Coleção',
      icon: Library,
      content: <Colecao allCards={allCards} setAllCards={setAllCards} exportCollectionToCSV={exportCollectionToCSV} />
    },
    {
      id: 'decks',
      label: 'Decks',
      icon: Hammer,
      content: <ConstrutorDecks />
    },
    {
      id: 'favoritos',
      label: 'Favoritos',
      icon: Heart,
      content: <Favoritos />
    },
    {
      id: 'achievements',
      label: 'Conquistas',
      icon: Trophy,
      content: <AchievementsPage />
    },
    {
      id: 'regras',
      label: 'Regras',
      icon: BookOpen,
      content: <Regras />
    },
    {
      id: 'spoiler',
      label: 'Novidades',
      icon: Sparkles,
      content: <Spoiler />
    },
    {
      id: 'configuracoes',
      label: 'Ajustes',
      icon: Settings,
      content: <div>Configurações em breve</div>
    }
  ]

  return (
    <div className="mobile-app">
      {/* Header Mobile */}
      <header className="mobile-app-header">
        <div className="mobile-header-container">
          <div className="mobile-logo-section">
            <div className="mobile-logo-badge">
              <span className="mobile-logo-text">MTG</span>
            </div>
            <div className="mobile-logo-info">
              <h1 className="mobile-app-title">MTG Helper</h1>
              <p className="mobile-app-subtitle">Collection Manager</p>
            </div>
          </div>

          <div className="mobile-header-actions">
            <div className="mobile-action-button">
              <Bell size={18} />
            </div>
            <div className="mobile-action-button">
              <Search size={18} />
            </div>
            <div 
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay active">
          <div className="mobile-menu-container">
            <div className="mobile-menu-header">
              <div className="mobile-menu-title">
                <h2>Menu Principal</h2>
              </div>
              <div 
                className="mobile-menu-close"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={20} />
              </div>
            </div>

            {/* Bloco do usuário mobile (agora dentro do menu) */}
            <div className="mobile-user-block">
              <img className="mobile-user-avatar" src={authUser?.avatarUrl || '/default-avatar.png'} alt="Avatar" />
              <div className="mobile-user-info">
                <span className="mobile-user-name">{authUser?.name || 'Usuário'}</span>
                <button className="mobile-user-edit-btn" onClick={() => router.push('/user/profile')}>Alterar Perfil</button>
              </div>
            </div>

            <nav className="mobile-menu-nav">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <div
                    key={tab.id}
                    className={`mobile-menu-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Icon size={18} className="mobile-menu-icon" />
                    <span className="mobile-menu-text">{tab.label}</span>
                    <ChevronRight size={16} className="mobile-menu-arrow" />
                  </div>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="mobile-app-main">
        <div className="mobile-content-wrapper">
          {/* Tabs de Navegação Mobile */}
          <div className="mobile-tabs-container">
            <div className="mobile-tabs-scroll">
              {tabs.slice(0, 5).map((tab) => {
                const Icon = tab.icon
                return (
                  <div
                    key={tab.id}
                    className={`mobile-tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => {
                      console.log('Tab clicada:', tab.id)
                      setActiveTab(tab.id)
                    }}
                  >
                    <Icon size={18} />
                    <span className="mobile-tab-label">{tab.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="mobile-content-area">
            {/* Renderizar o conteúdo funcional da aba ativa */}
            {(() => {
              const tab = tabs.find(t => t.id === activeTab)
              if (!tab) return null
              return (
                <div className="mobile-tab-content active">
                  {tab.content}
                </div>
              )
            })()}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="mobile-fab">
        <Plus size={24} />
      </div>

      {/* Modal de edição de perfil */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <label className="text-sm font-medium">Nome</label>
            <input
              className="quantum-input"
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Seu nome"
            />
            <label className="text-sm font-medium">Foto</label>
            <input
              className="quantum-input"
              type="url"
              value={editAvatar}
              onChange={e => setEditAvatar(e.target.value)}
              placeholder="URL da foto do perfil"
            />
            <img
              src={editAvatar || '/default-avatar.png'}
              alt="Preview"
              className="mobile-user-avatar mt-2 mx-auto"
              style={{ width: 64, height: 64 }}
            />
          </div>
          <DialogFooter>
            <button className="quantum-btn compact primary" onClick={() => setShowProfileModal(false)}>
              Salvar (exemplo)
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente Desktop (versão original)
const DesktopApp = () => {
  const { user: authUser } = useAmplifyAuth()
  const [activeTab, setActiveTab] = useState('painel')
  const [allCards, setAllCards] = useState<MTGCard[]>([])

  // Usar o contexto global para coleção
  const { currentCollection, exportCollectionToCSV } = useAppContext()
  
  // Configuração das abas com design profissional
  const tabs = [
    {
      id: 'painel',
      label: 'Dashboard',
      icon: Grid3X3,
      content: <Painel onNavigate={(tab) => setActiveTab(tab)} />
    },
    {
      id: 'colecao',
      label: 'Coleção',
      icon: Library,
      content: <Colecao allCards={allCards} setAllCards={setAllCards} exportCollectionToCSV={exportCollectionToCSV} />
    },
    {
      id: 'decks',
      label: 'Decks',
      icon: Hammer,
      content: <ConstrutorDecks />
    },
    {
      id: 'regras',
      label: 'Regras',
      icon: BookOpen,
      content: <Regras />
    },
    {
      id: 'spoilers',
      label: 'Spoilers',
      icon: Sparkles,
      content: <Spoiler />
    },
    {
      id: 'favoritos',
      label: 'Favoritos',
      icon: Heart,
      content: <Favoritos />
    },
    {
      id: 'conquistas',
      label: 'Conquistas',
      icon: Trophy,
      content: <AchievementsPage />
    },
    {
      id: 'configuracoes',
      label: 'Ajustes',
      icon: Settings,
      content: <div>Configurações em breve</div>
    }
  ]
  
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Cabeçalho do usuário */}
      <UserHeader user={authUser} />
      {/* Conteúdo principal */}
      <div className="flex-grow container mx-auto px-4 py-8">
        <Tabs 
          defaultValue="painel" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b border-slate-700 mb-6 hidden md:block">
            <TabsList className="bg-transparent w-full justify-start">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-slate-800 data-[state=active]:text-blue-400 py-3 px-5"
                  >
                    <div className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{tab.label}</span>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
          
          {tabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      {/* Script para efeitos de brilho */}
      <Script src="/glow-script.js" />
    </main>
  )
}

// Componente de fallback para o Suspense
function HomeFallback() {
  return (
    <div className="flex justify-center items-center h-screen bg-slate-900">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-white text-lg">Carregando...</p>
      </div>
    </div>
  );
}

// Componente principal com detecção responsiva
export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Detecção simples sem loops
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      if (mobile !== isMobile) {
        setIsMobile(mobile)
      }
      setIsLoading(false)
    }
    checkMobile()
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      if (mobile !== isMobile) {
        setIsMobile(mobile)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header, navegação, dashboard, tudo dentro deste container */}
        <Suspense fallback={<HomeFallback />}>
          {isMobile ? <MobileApp /> : <DesktopApp />}
        </Suspense>
      </div>
    </div>
  )
}
