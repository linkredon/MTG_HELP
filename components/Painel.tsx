"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
  Gem
} from "lucide-react"

export default function Painel() {
  const [stats, setStats] = useState({
    totalCards: 1247,
    uniqueCards: 892,
    totalDecks: 8,
    favoriteColors: ['Azul', 'Preto'],
    recentActivity: 15,
    collectionValue: 1850.75,
    weeklyGoal: 65,
    weeklyProgress: 42,
    monthlyGrowth: 12.5,
    avgCardValue: 2.08
  })

  const [achievements] = useState([
    { 
      name: "Colecionador Iniciante", 
      description: "Possua 100 cartas únicas", 
      progress: 100, 
      icon: Star,
      rarity: "common",
      unlockedAt: "2024-01-15"
    },
    { 
      name: "Construtor de Decks", 
      description: "Crie 5 decks diferentes", 
      progress: 80, 
      icon: Target,
      rarity: "uncommon",
      unlockedAt: null
    },
    { 
      name: "Explorador de Cores", 
      description: "Tenha cartas de todas as 5 cores", 
      progress: 100, 
      icon: Trophy,
      rarity: "rare",
      unlockedAt: "2024-02-03"
    },
    { 
      name: "Veterano MTG", 
      description: "Possua cartas de 10 expansões diferentes", 
      progress: 75, 
      icon: Award,
      rarity: "mythic",
      unlockedAt: null
    }
  ])

  const [recentCards] = useState([
    { 
      name: "Lightning Bolt", 
      set: "2XM", 
      rarity: "common", 
      addedAt: "Há 2 horas",
      value: 0.25,
      quantity: 4
    },
    { 
      name: "Counterspell", 
      set: "TSR", 
      rarity: "common", 
      addedAt: "Há 5 horas",
      value: 0.50,
      quantity: 2
    },
    { 
      name: "Serra Angel", 
      set: "M21", 
      rarity: "uncommon", 
      addedAt: "Ontem",
      value: 1.20,
      quantity: 1
    },
    { 
      name: "Black Lotus", 
      set: "LEA", 
      rarity: "rare", 
      addedAt: "2 dias atrás",
      value: 8500.00,
      quantity: 1
    }
  ])

  const [colorDistribution] = useState([
    { color: 'Azul', percentage: 28, count: 249, bgColor: 'from-blue-500 to-blue-600' },
    { color: 'Preto', percentage: 24, count: 214, bgColor: 'from-gray-700 to-gray-900' },
    { color: 'Vermelho', percentage: 20, count: 178, bgColor: 'from-red-500 to-red-600' },
    { color: 'Verde', percentage: 16, count: 143, bgColor: 'from-green-500 to-green-600' },
    { color: 'Branco', percentage: 12, count: 107, bgColor: 'from-gray-200 to-gray-400' }
  ])

  const [quickActions] = useState([
    { label: "Adicionar Carta", icon: Plus, action: "add-card", color: "blue" },
    { label: "Ver Relatórios", icon: BarChart3, action: "reports", color: "purple" },
    { label: "Comunidade", icon: Users, action: "community", color: "green" },
    { label: "Análises", icon: TrendingUp, action: "analytics", color: "yellow" },
    { label: "Eventos", icon: Calendar, action: "events", color: "red" },
    { label: "Favoritos", icon: Heart, action: "favorites", color: "pink" }
  ])

  return (
    <div className="mtg-section">
      {/* Hero Section */}
      <div className="mtg-card text-center mb-8">
        <div className="mtg-card-header justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center mb-6 mx-auto shadow-xl">
            <Activity className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="mtg-section-title">Dashboard Profissional</h1>
        <p className="mtg-section-subtitle">
          Visão completa da sua coleção MTG com insights avançados e estatísticas em tempo real
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="mtg-status mtg-status-success">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Sistema Online
          </div>
          <div className="mtg-status mtg-status-info">
            <Clock className="w-3 h-3" />
            Sincronizado há 2 min
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="mtg-grid mb-8">
        {/* Total Cards */}
        <div className="mtg-card mtg-card-interactive">
          <div className="mtg-card-header">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="mtg-card-content">
              <div className="flex items-center gap-2 mb-1">
                <span className="mtg-card-label">Total de Cartas</span>
                <ArrowUp className="w-3 h-3 text-green-400" />
              </div>
              <div className="mtg-card-value">
                {stats.totalCards.toLocaleString()}
              </div>
              <div className="mtg-card-metric text-green-400">
                +{stats.monthlyGrowth}% este mês
              </div>
            </div>
          </div>
        </div>

        {/* Unique Cards */}
        <div className="mtg-card mtg-card-interactive">
          <div className="mtg-card-header">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="mtg-card-content">
              <div className="flex items-center gap-2 mb-1">
                <span className="mtg-card-label">Cartas Únicas</span>
                <Sparkles className="w-3 h-3 text-purple-400" />
              </div>
              <div className="mtg-card-value">
                {stats.uniqueCards.toLocaleString()}
              </div>
              <div className="mtg-card-metric">
                {((stats.uniqueCards / stats.totalCards) * 100).toFixed(1)}% do total
              </div>
            </div>
          </div>
        </div>

        {/* Active Decks */}
        <div className="mtg-card mtg-card-interactive">
          <div className="mtg-card-header">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="mtg-card-content">
              <div className="flex items-center gap-2 mb-1">
                <span className="mtg-card-label">Decks Ativos</span>
                <Shield className="w-3 h-3 text-green-400" />
              </div>
              <div className="mtg-card-value">{stats.totalDecks}</div>
              <div className="mtg-card-metric text-green-400">
                2 competitivos
              </div>
            </div>
          </div>
        </div>

        {/* Collection Value */}
        <div className="mtg-card mtg-card-interactive">
          <div className="mtg-card-header">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="mtg-card-content">
              <div className="flex items-center gap-2 mb-1">
                <span className="mtg-card-label">Valor Estimado</span>
                <TrendingUp className="w-3 h-3 text-yellow-400" />
              </div>
              <div className="mtg-card-value">
                R$ {stats.collectionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="mtg-card-metric text-yellow-400">
                Média: R$ {stats.avgCardValue.toFixed(2)}/carta
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Goal & Achievements */}
      <div className="mtg-grid-2 mb-8">
        {/* Weekly Goal */}
        <div className="mtg-card">
          <div className="mtg-card-header">
            <Zap className="mtg-card-icon" />
            <div className="mtg-card-content">
              <h3 className="mtg-card-title">Meta Semanal</h3>
              <div className="mtg-status mtg-status-warning">
                <Clock className="w-3 h-3" />
                4 dias restantes
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="mtg-card-label">Progresso Atual</span>
              <span className="mtg-card-value text-lg">
                {stats.weeklyProgress}/{stats.weeklyGoal} cartas
              </span>
            </div>
            
            <div className="space-y-3">
              <Progress 
                value={(stats.weeklyProgress / stats.weeklyGoal) * 100} 
                className="h-3 bg-slate-800"
              />
              <div className="flex justify-between text-sm text-slate-400">
                <span>0</span>
                <span className="font-semibold text-blue-400">
                  {Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%
                </span>
                <span>{stats.weeklyGoal}</span>
              </div>
            </div>
            
            <div className="mtg-achievement-highlight">
              <div>
                <p className="font-medium text-yellow-400 mb-1">Faltam apenas</p>
                <p className="text-2xl font-bold text-white">
                  {stats.weeklyGoal - stats.weeklyProgress} cartas
                </p>
              </div>
              <Trophy className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="mtg-card">
          <div className="mtg-card-header">
            <Award className="mtg-card-icon" />
            <div className="mtg-card-content">
              <h3 className="mtg-card-title">Conquistas</h3>
              <div className="mtg-badge mtg-badge-success">
                {achievements.filter(a => a.progress === 100).length} desbloqueadas
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {achievements.slice(0, 3).map((achievement, index) => {
              const Icon = achievement.icon
              const isUnlocked = achievement.progress === 100
              
              return (
                <div 
                  key={index} 
                  className={`mtg-achievement ${isUnlocked ? 'mtg-achievement-unlocked' : 'mtg-achievement-locked'}`}
                >
                  <div className={`mtg-achievement-icon ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                      : 'bg-slate-700'
                  }`}>
                    <Icon className={`w-5 h-5 ${isUnlocked ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-semibold text-sm truncate ${
                        isUnlocked ? 'text-white' : 'text-slate-300'
                      }`}>
                        {achievement.name}
                      </h4>
                      <span className={`mtg-badge text-xs ${
                        achievement.rarity === 'mythic' ? 'mtg-badge-mythic' :
                        achievement.rarity === 'rare' ? 'mtg-badge-rare' :
                        achievement.rarity === 'uncommon' ? 'mtg-badge-uncommon' :
                        'mtg-badge-common'
                      }`}>
                        {achievement.rarity}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            isUnlocked 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 font-medium min-w-[3rem] text-right">
                        {achievement.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Cards & Color Distribution */}
      <div className="mtg-grid-3 mb-8">
        {/* Recent Additions */}
        <div className="lg:col-span-2 mtg-card">
          <div className="mtg-card-header">
            <Clock className="mtg-card-icon" />
            <div className="mtg-card-content">
              <h3 className="mtg-card-title">Adições Recentes</h3>
              <p className="mtg-card-description">Últimas cartas adicionadas à sua coleção</p>
            </div>
            <Button variant="ghost" size="sm" className="quantum-btn compact">
              <Eye className="w-4 h-4 mr-2" />
              Ver todas
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentCards.map((card, index) => (
              <div 
                key={index} 
                className="mtg-list-item"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg">
                    {card.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white truncate">
                        {card.name}
                      </h4>
                      <span className="mtg-badge mtg-badge-secondary text-xs">
                        {card.set}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className={`mtg-badge text-xs ${
                        card.rarity === 'rare' ? 'mtg-badge-rare' :
                        card.rarity === 'uncommon' ? 'mtg-badge-uncommon' :
                        'mtg-badge-common'
                      }`}>
                        {card.rarity}
                      </span>
                      <span>{card.quantity}x</span>
                      <span className="text-green-400 font-medium">
                        R$ {card.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-400">{card.addedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color Distribution */}
        <div className="mtg-card">
          <div className="mtg-card-header">
            <PieChart className="mtg-card-icon" />
            <div className="mtg-card-content">
              <h3 className="mtg-card-title">Distribuição</h3>
              <p className="mtg-card-description">Por cores de mana</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {colorDistribution.map((item, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${item.bgColor} shadow-lg`} />
                    <span className="font-medium text-white">{item.color}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">{item.percentage}%</span>
                    <p className="text-xs text-slate-400">{item.count} cartas</p>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full bg-gradient-to-r ${item.bgColor} transition-all duration-700 group-hover:h-3`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mtg-card">
        <div className="mtg-card-header">
          <Zap className="mtg-card-icon" />
          <div className="mtg-card-content">
            <h3 className="mtg-card-title">Ações Rápidas</h3>
            <p className="mtg-card-description">
              Acesso direto às funcionalidades mais utilizadas
            </p>
          </div>
        </div>
        
        <div className="mtg-grid">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            const colorClasses: Record<string, string> = {
              blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
              purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
              green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
              yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
              red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
              pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
            }
            
            return (
              <button
                key={index}
                className={`mtg-quick-action bg-gradient-to-br ${colorClasses[action.color]} text-white border-0 hover:scale-105 transition-all group shadow-lg`}
              >
                <Icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
