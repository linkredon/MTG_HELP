"use client"

import { useMemo, useState } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext'
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
  const { currentCollection, decks, collections, favorites } = useAppContext();
  const { user: authUser } = useAmplifyAuth();

  const handleQuickAction = (action: string) => {
    if (action === 'add-card') {
      onNavigate('colecao');
    } else if (action === 'favorites') {
      onNavigate('favoritos');
    } else if (action === 'decks') {
      onNavigate('decks');
    } else if (action === 'achievements') {
      onNavigate('achievements');
    } else {
      alert(`A funcionalidade "${action}" está em desenvolvimento.`);
    }
  };

  const stats = useMemo(() => {
    // Calcular estatísticas reais
    const totalCards = collections.reduce((acc, col) => 
      acc + col.cards.reduce((sum, card) => sum + card.quantity, 0), 0
    );
    
    const uniqueCards = collections.reduce((acc, col) => 
      acc + col.cards.length, 0
    );
    
    const totalDecks = decks?.length || 0;
    const totalFavorites = favorites?.length || 0;
    
    // Calcular valor da coleção (se disponível)
    const collectionValue = collections.reduce((acc, col) => 
      acc + col.cards.reduce((sum, card) => {
        const price = parseFloat(card.card.prices?.usd || '0');
        return sum + (price * card.quantity);
      }, 0), 0
    );
    
    const avgCardValue = totalCards > 0 ? collectionValue / totalCards : 0;

    // Calcular crescimento baseado na data de criação das coleções
    const recentCollections = collections.filter(col => {
      const createdAt = new Date(col.createdAt);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return createdAt > oneMonthAgo;
    });
    
    const monthlyGrowth = collections.length > 0 
      ? (recentCollections.length / collections.length) * 100 
      : 0;

    return {
      totalCards,
      uniqueCards,
      totalDecks,
      totalFavorites,
      collectionValue,
      monthlyGrowth,
      avgCardValue,
      collectionsCount: collections.length,
    };
  }, [collections, decks, favorites]);

  // Usar dados reais do usuário autenticado
  const user = useMemo(() => {
    if (!authUser) return null;
    
    return {
      id: authUser.id || 'unknown',
      name: authUser.name || authUser.email || 'Usuário',
      email: authUser.email || '',
      avatar: authUser.avatar || undefined, // Usar undefined em vez de null
      joinedAt: new Date().toISOString(), // Usar data atual como fallback
      collectionsCount: collections.length,
      totalCards: stats.totalCards,
      achievements: [] // Será preenchido pelo sistema de conquistas
    };
  }, [authUser, collections.length, stats.totalCards]);

  // Cartas recentes baseadas na coleção atual
  const recentCards = useMemo(() => {
    if (!currentCollection?.cards) return [];
    
    return currentCollection.cards
      .slice(0, 4)
      .map(card => ({
        name: card.card.name,
        set: card.card.set_code,
        rarity: card.card.rarity,
        addedAt: "recent",
        value: parseFloat(card.card.prices?.usd || '0'),
        quantity: card.quantity
      }));
  }, [currentCollection]);

  // Distribuição de cores baseada nas cartas reais
  const colorDistribution = useMemo(() => {
    if (!currentCollection?.cards) return [];
    
    const colorCounts: { [key: string]: number } = {};
    let totalCards = 0;
    
    currentCollection.cards.forEach(card => {
      const colors = (card.card as any).colors || [];
      colors.forEach(color => {
        colorCounts[color] = (colorCounts[color] || 0) + card.quantity;
        totalCards += card.quantity;
      });
    });
    
    const colorMap: { [key: string]: { name: string, bgColor: string } } = {
      'W': { name: 'Branco', bgColor: 'from-gray-200 to-gray-400' },
      'U': { name: 'Azul', bgColor: 'from-blue-500 to-blue-600' },
      'B': { name: 'Preto', bgColor: 'from-gray-700 to-gray-900' },
      'R': { name: 'Vermelho', bgColor: 'from-red-500 to-red-600' },
      'G': { name: 'Verde', bgColor: 'from-green-500 to-green-600' }
    };
    
    return Object.entries(colorCounts)
      .map(([color, count]) => ({
        color: colorMap[color]?.name || color,
        percentage: totalCards > 0 ? (count / totalCards) * 100 : 0,
        count,
        bgColor: colorMap[color]?.bgColor || 'from-gray-500 to-gray-600'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [currentCollection]);

  // Adicionar valores padrão para weeklyProgress e weeklyGoal
  const weeklyProgress = 0;
  const weeklyGoal = 100;

  const quickActions = [
    { label: "Add Carta", icon: Plus, action: "add-card", color: "blue" },
    { label: "Meus Decks", icon: Bookmark, action: "decks", color: "purple" },
    { label: "Favoritos", icon: Heart, action: "favorites", color: "pink" },
    { label: "Conquistas", icon: Trophy, action: "achievements", color: "yellow" },
    { label: "Relatórios", icon: BarChart3, action: "reports", color: "green" },
    { label: "Análises", icon: TrendingUp, action: "analytics", color: "red" }
  ];

  if (!user) {
    return (
      <div className="p-4">
        <div className="quantum-card-dense p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando dados do usuário...</p>
        </div>
      </div>
    );
  }

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
                {weeklyProgress}/{weeklyGoal} cartas
              </span>
            </div>
            
            <div className="space-y-1.5">
              <Progress 
                value={(weeklyProgress / weeklyGoal) * 100} 
                className="h-1.5 bg-gray-800"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>0</span>
                <span className="font-medium text-blue-400">
                  {Math.round((weeklyProgress / weeklyGoal) * 100)}%
                </span>
                <span>{weeklyGoal}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-blue-900/20 p-2 rounded-md border border-blue-900/30">
              <div>
                <p className="text-[10px] text-blue-400">Faltam apenas</p>
                <p className="text-sm font-bold text-white">
                  {weeklyGoal - weeklyProgress} cartas
                </p>
              </div>
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Conquistas */}
        <RecentAchievements 
          user={user} 
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
