"use client";

import { Achievement } from '@/types/achievements';
import { cn } from '@/lib/utils';
import { 
  Award, 
  Trophy, 
  Star, 
  Crown, 
  Plus, 
  Library, 
  Palette, 
  CheckCircle,
  Hammer, 
  Compass, 
  LogIn, 
  User, 
  Rocket, 
  Bug,
  Swords,
  Users,
  Sparkles
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import '@/styles/achievements-enhanced.css';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked?: boolean;
}

// Mapeamento de ícones
const iconMap: Record<string, React.ElementType> = {
  Award,
  Trophy,
  Star,
  Crown,
  Plus,
  Library,
  Palette,
  CheckCircle,
  Hammer,
  Compass,
  LogIn,
  User,
  Rocket,
  Bug,
  Swords,
  Users,
  Sparkles
};

export default function AchievementCard({ achievement, unlocked = false }: AchievementCardProps) {
  const Icon = iconMap[achievement.icon] || Trophy;
  
  // Calcular progresso
  const progress = achievement.progress !== undefined 
    ? Math.min(100, (achievement.progress / achievement.criteria.threshold) * 100)
    : unlocked ? 100 : 0;
  
  return (
    <div 
      className={cn(
        "quantum-card-dense relative flex flex-col transition-all duration-300 p-0 overflow-hidden",
        unlocked 
          ? "border-cyan-500/30 shadow-sm hover:shadow-md" 
          : "border-gray-700/50 opacity-75 hover:opacity-100 grayscale hover:grayscale-0"
      )}
    >
      {/* Cabeçalho com ícone e título */}
      <div className="p-3 border-b border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center",
            unlocked ? "bg-cyan-500/20" : "bg-gray-700/50"
          )}>
            <Icon size={16} className={unlocked ? "text-cyan-400" : "text-gray-400"} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate">
              {achievement.title}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] uppercase",
                unlocked 
                  ? "bg-cyan-500/20 text-cyan-300" 
                  : "bg-gray-700/50 text-gray-400"
              )}>
                {achievement.rarity}
              </span>
              <span className={unlocked ? "text-cyan-400" : "text-gray-500"}>
                {achievement.points} pts
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Corpo com descrição */}
      <div className="p-3 flex-1">
        <p className="text-xs text-gray-300 mb-2 line-clamp-2">
          {achievement.description}
        </p>
        
        {/* Barra de progresso */}
        <div className="mt-2">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-gray-400">Progresso</span>
            <span className={unlocked ? "text-cyan-400" : "text-gray-400"}>
              {Math.round(progress)}%
            </span>
          </div>
          <Progress 
            value={progress} 
            className="h-1.5 bg-gray-800/70"
            indicatorClassName={unlocked ? "bg-cyan-500" : "bg-gray-600"}
          />
        </div>
      </div>
      
      {/* Indicador de desbloqueado */}
      {unlocked && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-transparent border-r-cyan-500/30"></div>
      )}
    </div>
  );
}