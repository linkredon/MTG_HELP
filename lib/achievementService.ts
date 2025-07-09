import { Achievement, AchievementProgress, AchievementStats } from '@/types/achievements';
import { User } from '@/types/mtg';
import { achievements, getAchievementById } from '@/data/achievements';

/**
 * Verifica as conquistas do usuário e retorna as que foram desbloqueadas
 */
export const checkAchievements = (
  user: User,
  userStats: {
    totalCards: number;
    cardsByColor: Record<string, number>;
    cardsByRarity: Record<string, number>;
    cardsByType: Record<string, number>;
    cardsBySets: Record<string, number>;
    decksCount: number;
    decksByFormat: Record<string, number>;
    decksByColor: Record<string, number>;
  }
): Achievement[] => {
  const unlockedAchievements: Achievement[] = [];
  
  // Verificar cada conquista
  achievements.forEach(achievement => {
    // Pular se já está nos achievements do usuário
    if (user.achievements.includes(achievement.id)) {
      const unlockedAchievement = { ...achievement, unlockedAt: new Date().toISOString() };
      unlockedAchievements.push(unlockedAchievement);
      return;
    }
    
    // Verificar critérios
    let isUnlocked = false;
    let progress = 0;
    
    switch (achievement.criteria.type) {
      case 'cards':
        progress = userStats.totalCards;
        isUnlocked = userStats.totalCards >= achievement.criteria.threshold;
        break;
        
      case 'colors':
        if (achievement.criteria.specific && Array.isArray(achievement.criteria.specific)) {
          const colors = achievement.criteria.specific as string[];
          isUnlocked = colors.every(color => 
            (userStats.cardsByColor[color] || 0) >= achievement.criteria.threshold
          );
          // Calcular progresso como média de progresso em todas as cores
          progress = colors.reduce((sum, color) => 
            sum + Math.min(1, (userStats.cardsByColor[color] || 0) / achievement.criteria.threshold)
          , 0) / colors.length * achievement.criteria.threshold;
        }
        break;
        
      case 'rarities':
        if (achievement.criteria.specific && typeof achievement.criteria.specific === 'string') {
          const rarity = achievement.criteria.specific;
          progress = userStats.cardsByRarity[rarity] || 0;
          isUnlocked = (userStats.cardsByRarity[rarity] || 0) >= achievement.criteria.threshold;
        }
        break;
        
      case 'sets':
        if (achievement.criteria.specific === 'complete') {
          // Verificar se algum set está completo
          isUnlocked = Object.entries(userStats.cardsBySets).some(([_, count]) => count >= 100); // Simplificação
          progress = Math.max(...Object.values(userStats.cardsBySets).map(count => count));
        }
        break;
        
      case 'decks':
        progress = userStats.decksCount;
        isUnlocked = userStats.decksCount >= achievement.criteria.threshold;
        break;
        
      case 'login':
        // Conquista de primeiro login é sempre desbloqueada se chegou aqui
        if (achievement.id === 'first_login') {
          isUnlocked = true;
          progress = 1;
        }
        break;
        
      case 'special':
        // Conquistas especiais são verificadas caso a caso
        if (achievement.criteria.specific === 'profile' && user.avatar) {
          isUnlocked = true;
          progress = 1;
        } else if (achievement.criteria.specific === 'early_adopter') {
          // Verificar se o usuário se registrou no primeiro mês
          const joinedDate = new Date(user.joinedAt);
          const launchDate = new Date('2023-01-01'); // Data fictícia de lançamento
          const oneMonthAfterLaunch = new Date(launchDate);
          oneMonthAfterLaunch.setMonth(oneMonthAfterLaunch.getMonth() + 1);
          
          isUnlocked = joinedDate <= oneMonthAfterLaunch;
          progress = isUnlocked ? 1 : 0;
        }
        break;
    }
    
    // Se desbloqueou, adicionar à lista
    if (isUnlocked) {
      const unlockedAchievement = { 
        ...achievement, 
        unlockedAt: new Date().toISOString(),
        progress: achievement.criteria.threshold // Progresso completo
      };
      unlockedAchievements.push(unlockedAchievement);
    } else {
      // Adicionar progresso parcial
      const progressAchievement = {
        ...achievement,
        progress: Math.min(progress, achievement.criteria.threshold)
      };
      unlockedAchievements.push(progressAchievement);
    }
  });
  
  return unlockedAchievements;
};

/**
 * Calcula estatísticas de conquistas para o usuário
 */
export const getAchievementStats = (user: User): AchievementStats => {
  const unlockedAchievements = user.achievements
    .map(id => getAchievementById(id))
    .filter(a => a !== undefined) as Achievement[];
  
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
  
  return {
    total: achievements.length,
    unlocked: unlockedAchievements.length,
    points: totalPoints,
    recentlyUnlocked: unlockedAchievements
      .slice(0, 3) // Pegar as 3 mais recentes
  };
};

/**
 * Atualiza as conquistas do usuário
 */
export const updateUserAchievements = async (
  userId: string, 
  newAchievements: string[]
): Promise<boolean> => {
  try {
    // Aqui você implementaria a lógica para salvar no banco de dados
    // Por exemplo, usando uma API ou diretamente no MongoDB
    
    // Exemplo fictício:
    // await fetch('/api/users/achievements', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, achievements: newAchievements })
    // });
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar conquistas:', error);
    return false;
  }
};