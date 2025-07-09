"use client"

import { useMemo, useState } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import RecentAchievements from "@/components/RecentAchievements"
import type { User } from '@/types/mtg'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Star, 
  Target,
  Trophy,
  Zap,
  Users,
  Award,
  Clock,
  DollarSign,
  PieChart,
  Activity,
  Eye,
  Heart,
  Bookmark,
  ArrowUp,
  ArrowDown,
  Plus,
  Sparkles,
  Shield,
  Flame,
  Gem,
  ChevronRight
} from "lucide-react"

export default function Painel({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { currentCollection, decks } = useAppContext();

  const handleQuickAction = (action: string) => {
    if (action === 'add-card') {
      onNavigate('colecao');
    } else if (action === 'favorites') {
      onNavigate('favoritos');
    } else {
      alert(`A funcionalidade "${action}" está em desenvolvimento.`);
    }
  };

  const stats = useMemo(() => {
    if (!currentCollection || !currentCollection.cards) {
      return {
        totalCards: 0,
        uniqueCards: 0,
        totalDecks: decks?.length || 0,
        collectionValue: 0,
        weeklyGoal: 65,
        weeklyProgress: 0,
        monthlyGrowth: 0,
        avgCardValue: 0,
      };
    }

    const totalCards = currentCollection.cards.reduce((acc, c) => acc + c.quantity, 0);
    const uniqueCards = currentCollection.cards.length;
    const collectionValue = currentCollection.cards.reduce((acc, c) => {
      const price = parseFloat(c.card.prices?.usd || '0');
      return acc + (price * c.quantity);
    }, 0);
    const avgCardValue = totalCards > 0 ? collectionValue / totalCards : 0;

    // Mock data for values not in context
    const weeklyProgress = 42;
    const weeklyGoal = 65;
    const monthlyGrowth = 12.5;

    return {
      totalCards,
      uniqueCards,
      totalDecks: decks?.length || 0,
      collectionValue,
      weeklyGoal,
      weeklyProgress,
      monthlyGrowth,
      avgCardValue,
    };
  }, [currentCollection, decks]);

  // Mock do usuário para demonstração
  const [mockUser] = useState<User>({
    id: '1',
    name: 'Usuário Teste',
    email: 'usuario@teste.com',
    avatar: '/avatar.jpg',
    joinedAt: '2023-01-15T12:00:00Z',
    collectionsCount: 3,
    totalCards: 120,
    achievements: [
      'first_login',
      'first_card',
      'collector_novice',
      'collector_apprentice',
      'first_deck'
    ]
  });

  const [recentCards] = useState<any[]>([
    { 
      name: "Lightning Bolt", 
      set: "2XM", 
      rarity: "common", 
      addedAt: "2h",
      value: 0.25,
      quantity: 4
    },
    { 
      name: "Counterspell", 
      set: "TSR", 
      rarity: "common", 
      addedAt: "5h",
      value: 0.50,
      quantity: 2
    },
    { 
      name: "Serra Angel", 
      set: "M21", 
      rarity: "uncommon", 
      addedAt: "1d",
      value: 1.20,
      quantity: 1
    },
    { 
      name: "Black Lotus", 
      set: "LEA", 
      rarity: "rare", 
      addedAt: "2d",
      value: 8500.00,
      quantity: 1
    }
  ])

  const [colorDistribution] = useState<any[]>([
    { color: 'Azul', percentage: 28, count: 249, bgColor: 'from-blue-500 to-blue-600' },
    { color: 'Preto', percentage: 24, count: 214, bgColor: 'from-gray-700 to-gray-900' },
    { color: 'Vermelho', percentage: 20, count: 178, bgColor: 'from-red-500 to-red-600' },
    { color: 'Verde', percentage: 16, count: 143, bgColor: 'from-green-500 to-green-600' },
    { color: 'Branco', percentage: 12, count: 107, bgColor: 'from-gray-200 to-gray-400' }
  ])

  const [quickActions] = useState<any[]>([
    { label: "Add Carta", icon: Plus, action: "add-card", color: "blue" },
    { label: "Relatórios", icon: BarChart3, action: "reports", color: "purple" },
    { label: "Comunidade", icon: Users, action: "community", color: "green" },
    { label: "Análises", icon: TrendingUp, action: "analytics", color: "yellow" },
    { label: "Eventos", icon: Calendar, action: "events", color: "red" },
    { label: "Favoritos", icon: Heart, action: "favorites", color: "pink" }
  ])

  return (
    <div className="p-4">
      {/* Header Compacto */}
      <div className="quantum-card-dense p-4 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Dashboard</h2>
          <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span>Sincronizado</span>
            <Clock className="w-3 h-3 ml-2" />
            <span>2min</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Total Cards */}
        <div className="quantum-card-dense p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-xs text-gray-400">Total de Cartas</span>
            </div>
            <ArrowUp className="w-3 h-3 text-green-400" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-lg font-bold text-white">{stats.totalCards.toLocaleString()}</span>
            <span className="text-xs text-green-400">+{stats.monthlyGrowth}%</span>
          </div>
        </div>

        {/* Unique Cards */}
        <div className="quantum-card-dense p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="text-xs text-gray-400">Cartas Únicas</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-lg font-bold text-white">{stats.uniqueCards.toLocaleString()}</span>
            <span className="text-xs text-gray-400">
              {((stats.uniqueCards / stats.totalCards) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Active Decks */}
        <div className="quantum-card-dense p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-green-500/20 flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-green-400" />
              </div>
              <span className="text-xs text-gray-400">Decks Ativos</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-lg font-bold text-white">{stats.totalDecks}</span>
            <span className="text-xs text-green-400">2 comp.</span>
          </div>
        </div>

        {/* Collection Value */}
        <div className="quantum-card-dense p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-yellow-500/20 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <span className="text-xs text-gray-400">Valor Estimado</span>
            </div>
            <TrendingUp className="w-3 h-3 text-yellow-400" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-lg font-bold text-white">
              R$ {stats.collectionValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-yellow-400">
              ~R${stats.avgCardValue.toFixed(2)}/un
            </span>
          </div>
        </div>
      </div>

      {/* Meta Semanal & Conquistas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {/* Meta Semanal */}
        <div className="quantum-card-dense">
          <div className="p-3 border-b border-gray-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-medium text-white">Meta Semanal</h3>
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                4d restantes
              </span>
            </div>
          </div>
          
          <div className="p-3 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Progresso</span>
              <span className="text-white font-medium">
                {stats.weeklyProgress}/{stats.weeklyGoal} cartas
              </span>
            </div>
            
            <div className="space-y-1.5">
              <Progress 
                value={(stats.weeklyProgress / stats.weeklyGoal) * 100} 
                className="h-1.5 bg-gray-800"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>0</span>
                <span className="font-medium text-blue-400">
                  {Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%
                </span>
                <span>{stats.weeklyGoal}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-blue-900/20 p-2 rounded-md border border-blue-900/30">
              <div>
                <p className="text-[10px] text-blue-400">Faltam apenas</p>
                <p className="text-sm font-bold text-white">
                  {stats.weeklyGoal - stats.weeklyProgress} cartas
                </p>
              </div>
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Conquistas */}
        <RecentAchievements 
          user={mockUser} 
          onViewAll={() => onNavigate('achievements')} 
        />
      </div>

      {/* Cartas Recentes e Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        {/* Cartas Recentes */}
        <div className="lg:col-span-2 quantum-card-dense">
          <div className="p-3 border-b border-gray-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-medium text-white">Adições Recentes</h3>
              </div>
              <button className="text-xs text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition-colors">
                <Eye className="w-3 h-3" />
                <span>Ver todas</span>
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-800/50">
            {recentCards.map((card, index) => (
              <div 
                key={index} 
                className="p-2 hover:bg-gray-800/30 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-xs flex-shrink-0">
                    {card.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-medium text-white truncate">
                        {card.name}
                      </h4>
                      <Badge className="h-4 text-[8px] px-1 bg-gray-700 text-gray-300 hover:bg-gray-600">
                        {card.set}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px]">
                      <Badge className={`h-3.5 text-[8px] px-1
                        ${card.rarity === 'rare' ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/40' :
                        card.rarity === 'uncommon' ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/40' :
                        'bg-green-900/30 text-green-400 hover:bg-green-900/40'}`
                      }>
                        {card.rarity}
                      </Badge>
                      <span className="text-gray-500">{card.quantity}x</span>
                      <span className="text-green-400">
                        R$ {card.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-500">{card.addedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição por Cor */}
        <div className="quantum-card-dense">
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-medium text-white">Distribuição</h3>
            </div>
          </div>
          
          <div className="p-3 space-y-2">
            {colorDistribution.map((item, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${item.bgColor}`} />
                    <span className="text-gray-300">{item.color}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-white">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-800/70 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full bg-gradient-to-r ${item.bgColor} transition-all duration-300`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-500 text-right mt-0.5">
                  {item.count} cartas
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="quantum-card-dense">
        <div className="p-3 border-b border-gray-800">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-medium text-white">Ações Rápidas</h3>
          </div>
        </div>
        
        <div className="p-3">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              const colorClasses: Record<string, string> = {
                blue: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
                purple: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
                green: 'bg-green-500/20 text-green-400 hover:bg-green-500/30',
                yellow: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30',
                red: 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
                pink: 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30'
              }
              
              return (
                <button
                  key={action.action}
                  className={`p-2 rounded-md transition-all flex flex-col items-center ${colorClasses[action.color]}`}
                  onClick={() => handleQuickAction(action.action)}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-medium">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
