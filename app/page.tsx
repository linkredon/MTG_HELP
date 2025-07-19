'use client';
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
import { useRouter } from 'next/navigation'
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
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext'
import DataLoadTest from '@/components/DataLoadTest'
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
import nextDynamic from 'next/dynamic';

// Fallback para quando o Suspense estiver carregando
function HomeFallback() {
  // Este componente será renderizado como SSR
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 p-2 mb-4">
          <div className="w-12 h-12 text-white flex items-center justify-center">
            <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" cy="12" r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Carregando MTG Helper</h2>
        <p className="text-blue-300 text-sm">Preparando sua experiência de Magic...</p>
        
        {/* Script inline para redirecionar após um tempo limite */}
        <script dangerouslySetInnerHTML={{ __html: `
          // Remover timeout automático que causa problemas
          // O redirecionamento deve ser feito apenas via router.push()
        `}} />
      </div>
    </div>
  )
}

// Componente interno que usa hooks de React
function HomeContent() {
  const { user: authUser, isAuthenticated, isLoading: authLoading, isInitialized } = useAmplifyAuth()
  const [activeTab, setActiveTab] = useState('painel')
  const [allCards, setAllCards] = useState<MTGCard[]>([])
  const router = useRouter()
  
  // Usar o contexto global para coleção
  const { currentCollection, exportCollectionToCSV } = useAppContext()
  
  // Configuração das abas com design profissional
  const tabs = [
    {
      id: 'painel',
      label: 'Dashboard',
      icon: Grid3X3,
      component: <Painel onNavigate={(tab: string) => setActiveTab(tab)} />
    },
    {
      id: 'colecao',
      label: 'Coleção',
      icon: Library,
      component: <Colecao allCards={allCards} setAllCards={setAllCards} exportCollectionToCSV={exportCollectionToCSV} />
    },
    {
      id: 'decks',
      label: 'Decks',
      icon: Hammer,
      component: <ConstrutorDecks />
    },
    {
      id: 'regras',
      label: 'Regras',
      icon: BookOpen,
      component: <Regras />
    },
    {
      id: 'spoiler',
      label: 'Novidades',
      icon: Sparkles,
      component: <Spoiler />
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
      id: 'configuracoes',
      label: 'Ajustes',
      icon: Settings,
      component: <div>Configurações em breve</div>
    }
  ]

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Script para efeitos visuais */}
      <Script src="/scripts/card-effects.js" strategy="lazyOnload" />

      {/* Header com informações do usuário */}
      <UserHeader user={authUser} />

      {/* Menu de navegação móvel */}
      <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
      
      {/* Conteúdo principal */}
      <div className="flex-grow container mx-auto px-4 py-8">
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
    </main>
  );
}

// Importar o wrapper para fornecer o SessionProvider localmente
import HomeContentWrapper from '@/components/HomeContentWrapper'
import SimpleAuthCheck from '@/components/SimpleAuthCheck'

// Carregamento dinâmico dos componentes
const LoadingScreen = nextDynamic(() => import('@/components/LoadingScreen'), { ssr: false });
const AppInitializer = nextDynamic(() => import('@/components/AppInitializer'), { ssr: false });

// Componente principal para a página
export default function Home() {
  // Usando useState aqui não funcionará corretamente com SSR
  // Em vez disso, vamos usar um componente de cliente que gerencia seu próprio estado
  return (
    <Suspense fallback={<HomeFallback />}>
      {/* Temporariamente desabilitado para evitar loops */}
      {/* <LoadingScreen /> */}
      {/* <AppInitializer /> */}
      <HomeContentWrapper>
        <SimpleAuthCheck>
          <HomeContent />
        </SimpleAuthCheck>
      </HomeContentWrapper>
    </Suspense>
  );
}
