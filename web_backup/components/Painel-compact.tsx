"use client"

import { useMemo, useState, useEffect } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import RecentAchievements from "@/components/RecentAchievements"
import { checkAchievements, getAchievementStats } from '@/lib/achievementService'
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
  ChevronRight,
  Library,
  Grid3X3,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon,
  Activity as ActivityIcon
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
    }
  };

  // Calcular estatísticas dos dados reais do contexto
  const stats = useMemo(() => {
    let totalCards = 0;
    let totalFavorites = 0;
    let collectionValue = 0;
    let recentCollections = 0;

    // Processar coleções
    collections.forEach(collection => {
      if (collection.cards && Array.isArray(collection.cards)) {
        collection.cards.forEach(card => {
          const quantity = card.quantity || 1;
          totalCards += quantity;
          
          // Calcular valor
          const price = parseFloat(card.card?.prices?.usd || '0');
          collectionValue += price * quantity;
        });
      }
    });

    // Processar favoritos
    if (favorites && Array.isArray(favorites)) {
      totalFavorites = favorites.length;
    }

    // Calcular crescimento mensal (simulado)
    const monthlyGrowth = collections.length > 0 
      ? (recentCollections / collections.length) * 100 
      : 0;

    return {
      totalCards,
      uniqueCards: totalCards, // Simplificado para mobile
      totalDecks: decks?.length || 0,
      totalFavorites,
      collectionValue,
      monthlyGrowth,
      avgCardValue: totalCards > 0 ? collectionValue / totalCards : 0,
      collectionsCount: collections.length,
    };
  }, [collections, decks, favorites]);

  // Usar dados reais do usuário autenticado
  const user = useMemo(() => {
    if (!authUser) return null;
    
    // Calcular estatísticas do usuário para verificar conquistas
    const userStats = {
      totalCards: stats.totalCards,
      cardsByColor: {} as Record<string, number>,
      cardsByRarity: {} as Record<string, number>,
      cardsByType: {} as Record<string, number>,
      cardsBySets: {} as Record<string, number>,
      decksCount: stats.totalDecks,
      decksByFormat: {} as Record<string, number>,
      decksByColor: {} as Record<string, number>,
    };
    
    // Calcular distribuição de cores
    if (collections && Array.isArray(collections)) {
      collections.forEach(collection => {
        if (collection.cards && Array.isArray(collection.cards)) {
          collection.cards.forEach(card => {
            const colors = (card.card as any).colors || [];
            colors.forEach(color => {
              userStats.cardsByColor[color] = (userStats.cardsByColor[color] || 0) + (card.quantity || 0);
            });
            
            // Calcular raridades
            const rarity = (card.card as any).rarity || 'common';
            userStats.cardsByRarity[rarity] = (userStats.cardsByRarity[rarity] || 0) + (card.quantity || 0);
            
            // Calcular tipos
            const type = (card.card as any).type_line || 'Unknown';
            userStats.cardsByType[type] = (userStats.cardsByType[type] || 0) + (card.quantity || 0);
            
            // Calcular sets
            const set = (card.card as any).set_code || 'Unknown';
            userStats.cardsBySets[set] = (userStats.cardsBySets[set] || 0) + (card.quantity || 0);
          });
        }
      });
    }
    
    // Verificar conquistas baseado nos dados do usuário
    const unlockedAchievements = checkAchievements({ 
      id: authUser.id || 'unknown',
      name: authUser.name || authUser.email || 'Usuário',
      email: authUser.email || '',
      avatar: authUser.avatar || undefined,
      joinedAt: new Date().toISOString(),
      collectionsCount: collections?.length || 0,
      totalCards: stats.totalCards,
      achievements: [] // Começar vazio e preencher com as verificadas
    }, userStats);
    
    // Adicionar conquistas padrão que devem ser desbloqueadas automaticamente
    const defaultAchievements = ['first_login'];
    if (stats.totalCards > 0) {
      defaultAchievements.push('first_card');
    }
    if (stats.totalCards >= 10) {
      defaultAchievements.push('collector_novice');
    }
    if (stats.totalCards >= 50) {
      defaultAchievements.push('collector_apprentice');
    }
    if (stats.totalDecks > 0) {
      defaultAchievements.push('first_deck');
    }
    
    // Combinar conquistas verificadas com as padrão
    const allAchievements = [
      ...unlockedAchievements.map(a => a.id),
      ...defaultAchievements
    ];
    
    // Remover duplicatas
    const uniqueAchievements = [...new Set(allAchievements)];
    
    return {
      id: authUser.id || 'unknown',
      name: authUser.name || authUser.email || 'Usuário',
      email: authUser.email || '',
      avatar: authUser.avatar || undefined, // Usar undefined em vez de null
      joinedAt: new Date().toISOString(), // Usar data atual como fallback
      collectionsCount: collections?.length || 0,
      totalCards: stats.totalCards,
      achievements: uniqueAchievements // IDs das conquistas desbloqueadas
    };
  }, [authUser, collections, stats.totalCards, stats.totalDecks]);

  // Cartas recentes baseadas em todas as coleções
  const recentCards = useMemo(() => {
    if (!collections || !Array.isArray(collections)) return [];
    
    // Coletar todas as cartas de todas as coleções
    const allCards: any[] = [];
    collections.forEach(collection => {
      if (collection.cards && Array.isArray(collection.cards)) {
        collection.cards.forEach(card => {
          allCards.push({
            ...card,
            collectionName: collection.name || 'Coleção'
          });
        });
      }
    });
    
    // Ordenar por data de criação da coleção (mais recentes primeiro)
    allCards.sort((a, b) => {
      const dateA = new Date(a.collectionName === 'Coleção' ? Date.now() : 0);
      const dateB = new Date(b.collectionName === 'Coleção' ? Date.now() : 0);
      return dateB.getTime() - dateA.getTime();
    });
    
    return allCards
      .slice(0, 4)
      .map(card => ({
        name: card.card.name,
        set: card.card.set_code,
        rarity: card.card.rarity,
        addedAt: "recent",
        value: parseFloat(card.card.prices?.usd || '0'),
        quantity: card.quantity,
        collectionName: card.collectionName
      }));
  }, [collections]);

  // Distribuição de cores baseada em todas as coleções
  const colorDistribution = useMemo(() => {
    if (!collections || !Array.isArray(collections)) return [];
    
    const colorCounts: { [key: string]: number } = {};
    let totalCards = 0;
    
    // Calcular cores de todas as coleções
    collections.forEach(collection => {
      if (collection.cards && Array.isArray(collection.cards)) {
        collection.cards.forEach(card => {
          const colors = (card.card as any).colors || [];
          colors.forEach(color => {
            colorCounts[color] = (colorCounts[color] || 0) + (card.quantity || 0);
            totalCards += (card.quantity || 0);
          });
        });
      }
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
  }, [collections]);

  // Adicionar valores padrão para weeklyProgress e weeklyGoal
  const weeklyProgress = 0;
  const weeklyGoal = 100;

  return (
    <div className="mobile-dashboard">
      {/* Status de Sincronização */}
      <div className="mobile-sync-status">
        <div className="mobile-sync-indicator">
          <div className="mobile-sync-dot"></div>
          <span className="mobile-sync-text">Sincronizado 2min</span>
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="mobile-stats-grid">
        {/* Total de Cartas */}
        <div className="mobile-stat-card primary">
          <div className="mobile-stat-header">
            <div className="mobile-stat-icon-wrapper green">
              <Library size={16} />
            </div>
            <div className="mobile-stat-trend">
              <ArrowUp size={12} />
              <span>+100%</span>
            </div>
          </div>
          <div className="mobile-stat-content">
            <div className="mobile-stat-value">{stats.totalCards}</div>
            <div className="mobile-stat-label">Total de Cartas</div>
          </div>
        </div>

        {/* Cartas Únicas */}
        <div className="mobile-stat-card">
          <div className="mobile-stat-header">
            <div className="mobile-stat-icon-wrapper blue">
              <Star size={16} />
            </div>
          </div>
          <div className="mobile-stat-content">
            <div className="mobile-stat-value">{stats.uniqueCards}</div>
            <div className="mobile-stat-label">Cartas Únicas</div>
            <div className="mobile-stat-percentage">100%</div>
          </div>
        </div>

        {/* Decks Ativos */}
        <div className="mobile-stat-card">
          <div className="mobile-stat-header">
            <div className="mobile-stat-icon-wrapper green">
              <TargetIcon size={16} />
            </div>
          </div>
          <div className="mobile-stat-content">
            <div className="mobile-stat-value">{stats.totalDecks}</div>
            <div className="mobile-stat-label">Decks Ativos</div>
            <div className="mobile-stat-subtitle">2 comp.</div>
          </div>
        </div>

        {/* Valor Estimado */}
        <div className="mobile-stat-card">
          <div className="mobile-stat-header">
            <div className="mobile-stat-icon-wrapper yellow">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mobile-stat-content">
            <div className="mobile-stat-value">R$ {stats.collectionValue.toFixed(0)}</div>
            <div className="mobile-stat-label">Valor Estimado</div>
            <div className="mobile-stat-subtitle">~R${stats.avgCardValue.toFixed(2)}/un</div>
          </div>
        </div>
      </div>

      {/* Meta Semanal */}
      <div className="mobile-weekly-goal">
        <div className="mobile-goal-header">
          <div className="mobile-goal-icon">
            <Trophy size={16} />
          </div>
          <div className="mobile-goal-info">
            <h3 className="mobile-goal-title">Meta Semanal</h3>
            <div className="mobile-goal-progress">
              <Progress value={(weeklyProgress / weeklyGoal) * 100} className="mobile-progress-bar" />
              <span className="mobile-goal-text">{weeklyProgress}/{weeklyGoal} cartas</span>
            </div>
          </div>
        </div>
        <div className="mobile-goal-message">
          <span>Faltam apenas {weeklyGoal - weeklyProgress} cartas</span>
        </div>
      </div>

      {/* Conquistas Recentes */}
      <div className="mobile-achievements-section">
        <RecentAchievements 
          user={user} 
          onViewAll={() => onNavigate('achievements')} 
        />
      </div>

      {/* Adições Recentes */}
      <div className="mobile-recent-section">
        <div className="mobile-section-header">
          <div className="mobile-section-icon">
            <Clock size={16} />
          </div>
          <h3 className="mobile-section-title">Adições Recentes</h3>
          <button className="mobile-section-action">
            <Eye size={14} />
            <span>Ver todas</span>
          </button>
        </div>
        
        <div className="mobile-recent-list">
          {recentCards.map((card, index) => (
            <div key={index} className="mobile-recent-item">
              <div className="mobile-recent-icon">
                {card.name.charAt(0)}
              </div>
              <div className="mobile-recent-content">
                <div className="mobile-recent-name">{card.name}</div>
                <div className="mobile-recent-details">
                  <Badge className="mobile-recent-badge">{card.set}</Badge>
                  <span className="mobile-recent-rarity">{card.rarity}</span>
                  <span className="mobile-recent-quantity">{card.quantity}x</span>
                </div>
              </div>
              <div className="mobile-recent-value">
                R$ {card.value.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribuição por Cor */}
      <div className="mobile-distribution-section">
        <div className="mobile-section-header">
          <div className="mobile-section-icon">
            <PieChart size={16} />
          </div>
          <h3 className="mobile-section-title">Distribuição</h3>
          <button className="mobile-section-action">
            <span>Ver todas</span>
            <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="mobile-distribution-list">
          {colorDistribution.map((item, index) => (
            <div key={index} className="mobile-distribution-item">
              <div className="mobile-distribution-info">
                <div className={`mobile-distribution-color ${item.bgColor}`}></div>
                <span className="mobile-distribution-name">{item.color}</span>
              </div>
              <div className="mobile-distribution-stats">
                <span className="mobile-distribution-percentage">{item.percentage.toFixed(0)}%</span>
                <span className="mobile-distribution-count">({item.count} cartas)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="mobile-quick-actions-section">
        <div className="mobile-quick-grid">
          <button 
            className="mobile-quick-card blue"
            onClick={() => handleQuickAction('add-card')}
          >
            <Plus size={20} />
            <span>Add Carta</span>
          </button>
          
          <button 
            className="mobile-quick-card purple"
            onClick={() => handleQuickAction('decks')}
          >
            <TargetIcon size={20} />
            <span>Meus Decks</span>
          </button>
          
          <button 
            className="mobile-quick-card pink"
            onClick={() => handleQuickAction('favorites')}
          >
            <Heart size={20} />
            <span>Favoritos</span>
          </button>
          
          <button 
            className="mobile-quick-card yellow"
            onClick={() => handleQuickAction('achievements')}
          >
            <Trophy size={20} />
            <span>Conquistas</span>
          </button>
          
          <button className="mobile-quick-card green">
            <BarChart3 size={20} />
            <span>Relatórios</span>
          </button>
          
          <button className="mobile-quick-card red">
            <TrendingUpIcon size={20} />
            <span>Análises</span>
          </button>
        </div>
      </div>
    </div>
  );
}
