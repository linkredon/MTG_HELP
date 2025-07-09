"use client";

import { useState, useEffect } from 'react';
import { Achievement, AchievementCategory } from '@/types/achievements';
import { User } from '@/types/mtg';
import { achievementCategories, getAchievementsByCategory } from '@/data/achievements';
import { checkAchievements, getAchievementStats } from '@/lib/achievementService';
import AchievementCard from './AchievementCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Award, Trophy, Medal } from 'lucide-react';
import '@/styles/achievements-enhanced.css';

interface AchievementsPanelProps {
  user: User;
  userStats: {
    totalCards: number;
    cardsByColor: Record<string, number>;
    cardsByRarity: Record<string, number>;
    cardsByType: Record<string, number>;
    cardsBySets: Record<string, number>;
    decksCount: number;
    decksByFormat: Record<string, number>;
    decksByColor: Record<string, number>;
  };
}

export default function AchievementsPanel({ user, userStats }: AchievementsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>('collection');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unlocked: 0,
    points: 0,
    percentage: 0
  });
  
  // Carregar conquistas quando a categoria mudar
  useEffect(() => {
    // Obter conquistas da categoria selecionada
    const categoryAchievements = getAchievementsByCategory(activeCategory);
    
    // Verificar quais estão desbloqueadas
    const userAchievements = checkAchievements(user, userStats);
    
    // Filtrar apenas as da categoria atual
    const filteredAchievements = userAchievements.filter(
      a => a.category === activeCategory
    );
    
    setAchievements(filteredAchievements);
    
    // Calcular estatísticas
    const achievementStats = getAchievementStats(user);
    setStats({
      total: achievementStats.total,
      unlocked: achievementStats.unlocked,
      points: achievementStats.points,
      percentage: achievementStats.total > 0 ? Math.round((achievementStats.unlocked / achievementStats.total) * 100) : 0
    });
  }, [activeCategory, user, userStats]);
  
  return (
    <div className="achievements-panel">
      {/* Cabeçalho com estatísticas */}
      <div className="quantum-card-dense p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-medium text-white mb-1">Progresso</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                  {stats.unlocked}/{stats.total} ({stats.percentage}%)
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-cyan-400">{stats.points}</div>
            <div className="text-xs text-gray-400">pontos totais</div>
          </div>
        </div>
      </div>
      
      {/* Tabs para categorias */}
      <div className="quantum-card-dense p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Award className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-medium text-white">Categorias</h3>
        </div>
        
        <Tabs defaultValue="collection" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full mb-3 bg-gray-900/50 border border-gray-700/30">
            {achievementCategories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex-1 py-2 text-sm data-[state=active]:bg-cyan-900/50 data-[state=active]:text-cyan-400"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
      
          {/* Conteúdo das tabs */}
          {achievementCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements
                  .filter(a => a.category === category.id)
                  .sort((a, b) => {
                    // Ordenar por desbloqueadas primeiro, depois por raridade
                    const aUnlocked = user.achievements.includes(a.id);
                    const bUnlocked = user.achievements.includes(b.id);
                    
                    if (aUnlocked && !bUnlocked) return -1;
                    if (!aUnlocked && bUnlocked) return 1;
                    
                    // Ordenar por raridade (comum -> mítica)
                    const rarityOrder = { common: 0, uncommon: 1, rare: 2, mythic: 3, special: 4 };
                    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
                  })
                  .map(achievement => (
                    <AchievementCard 
                      key={achievement.id} 
                      achievement={achievement} 
                      unlocked={user.achievements.includes(achievement.id)} 
                    />
                  ))
                }
              </div>
              
              {/* Mensagem se não houver conquistas */}
              {achievements.filter(a => a.category === category.id).length === 0 && (
                <div className="quantum-card-dense p-4 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/50 mb-2">
                    <Medal size={20} className="text-gray-500" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-300 mb-1">
                    Nenhuma conquista disponível
                  </h3>
                  <p className="text-xs text-gray-500">
                    Novas conquistas em breve!
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}