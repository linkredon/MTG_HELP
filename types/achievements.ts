// Definição de tipos para o sistema de conquistas

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'collection' | 'deck' | 'gameplay' | 'social' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic' | 'special';
  points: number;
  criteria: {
    type: 'cards' | 'decks' | 'colors' | 'sets' | 'rarities' | 'types' | 'login' | 'special';
    threshold: number;
    specific?: string | string[];
  };
  unlockedAt?: string;
  progress?: number;
}

export interface AchievementProgress {
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  unlockedAt?: string;
}

export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface AchievementStats {
  total: number;
  unlocked: number;
  points: number;
  recentlyUnlocked: Achievement[];
}