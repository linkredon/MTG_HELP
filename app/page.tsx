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
import { useState } from 'react'
import Script from 'next/script'
import Colecao from './colecao-compact'
import Painel from '@/components/Painel-compact'
import ConstrutorDecks from '@/components/ConstrutorDecks-compact'
import Regras from '@/components/Regras-compact'
import Spoiler from '@/components/Spoiler-compact'
import Favoritos from '@/components/Favoritos-compact'
import AchievementsPage from './achievements/page'
import UserHeader from '@/components/UserHeader'
import MobileNavigation from '@/components/MobileNavigation'
import { useAppContext } from '@/contexts/AppContext'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useSession } from 'next-auth/react'
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
  Trophy
} from "lucide-react"
import type { MTGCard } from '@/types/mtg';

export default function Home() {
  const { data: session } = useSession()
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
      id: 'favoritos',
      label: 'Favoritos',
      icon: Heart,
      component: <Favoritos />
    },
    {
      id: 'achievements',
      label: 'Conquistas',
      icon: Trophy,
      component: <AchievementsPage />
    },
    {
      id: 'spoiler',
      label: 'Spoilers',
      icon: Star,
      component: <Spoiler isAdmin={session?.user?.role === 'admin'} />
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
            <div className="quantum-card-dense p-3 card-red cursor-pointer" onClick={() => setActiveTab('favoritos')}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Cartas Favoritas</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    Acesse suas cartas favoritas
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-red-400">
                    <span>Acessar</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
            
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

          {/* Recursos Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="quantum-card-dense p-4 card-blue">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-medium text-white">Conquistas</h3>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Desbloqueie conquistas ao expandir sua coleção e construir decks
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full aspect-square rounded-md bg-blue-900/30 flex items-center justify-center">
                    <Zap className={`w-5 h-5 ${i <= 2 ? 'text-blue-400' : 'text-gray-600'}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="quantum-card-dense p-4 card-purple">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-medium text-white">Metas de Coleção</h3>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Defina e acompanhe metas para sua coleção
              </p>
              <div className="space-y-2">
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-purple-400">65% completo</span>
                  <span className="text-gray-400">Meta: 1000 cartas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Script para efeitos visuais */}
      <Script src="/scripts/card-effects.js" strategy="lazyOnload" />

      {/* Header com informações do usuário */}
      <UserHeader />

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-6">
        <Tabs 
          defaultValue={activeTab} 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mtg-tabs-list grid grid-cols-4 md:grid-cols-8 gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  className="mtg-tab-trigger"
                >
                  <Icon className="mtg-tab-icon w-4 h-4" />
                  <span className="mtg-tab-text">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="focus:outline-none">
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Navegação mobile */}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}