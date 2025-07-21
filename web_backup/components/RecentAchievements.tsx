"use client";

import { useState, useEffect } from 'react';
import { Achievement } from '@/types/achievements';
import { User } from '@/types/mtg';
import { getAchievementById } from '@/data/achievements';
import { Trophy, Award, ChevronRight, Star, Plus, Library, Palette, CheckCircle, Hammer, Compass, LogIn, User as UserIcon, Rocket, Bug, Swords, Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentAchievementsProps {
  user: User;
  onViewAll?: () => void;
}

// Mapeamento de ícones
const iconMap: Record<string, React.ElementType> = {
  Award,
  Trophy,
  Star,
  Plus,
  Library,
  Palette,
  CheckCircle,
  Hammer,
  Compass,
  LogIn,
  User: UserIcon,
  Rocket,
  Bug,
  Swords,
  Users,
  Sparkles
};

// Mapeamento de cores por raridade
const rarityColors: Record<string, string> = {
  common: 'bg-gray-500',
  uncommon: 'bg-blue-500',
  rare: 'bg-amber-500',
  mythic: 'bg-orange-500',
  special: 'bg-purple-500'
};

export default function RecentAchievements({ user, onViewAll }: RecentAchievementsProps) {
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  
  useEffect(() => {
    console.log('RecentAchievements: user.achievements', user.achievements);
    
    // Obter as 3 conquistas mais recentes
    const achievements = user.achievements
      .slice(-3)
      .map(id => {
        const achievement = getAchievementById(id);
        console.log('RecentAchievements: checking achievement', id, achievement);
        return achievement;
      })
      .filter(a => a !== undefined) as Achievement[];
    
    console.log('RecentAchievements: filtered achievements', achievements);
    setRecentAchievements(achievements);
  }, [user]);
  
  if (recentAchievements.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            Conquistas Recentes
          </h3>
          <button 
            onClick={onViewAll}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
          >
            Ver todas
            <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 mb-3">
            <Trophy size={20} className="text-gray-600" />
          </div>
          <p className="text-sm text-gray-400">
            Nenhuma conquista desbloqueada ainda
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Continue usando o app para desbloquear conquistas
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" />
          Conquistas Recentes
        </h3>
        <button 
          onClick={onViewAll}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
        >
          Ver todas
          <ChevronRight size={14} />
        </button>
      </div>
      
      <div className="space-y-2">
        {recentAchievements.map(achievement => {
          const Icon = iconMap[achievement.icon] || Trophy;
          const rarityColor = rarityColors[achievement.rarity] || rarityColors.common;
          
          return (
            <div 
              key={achievement.id}
              className="flex items-center gap-3 p-2 rounded-md bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                rarityColor
              )}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-200 truncate">
                  {achievement.title}
                </h4>
                <p className="text-xs text-gray-400 truncate">
                  {achievement.description}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-amber-400">
                  +{achievement.points}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}