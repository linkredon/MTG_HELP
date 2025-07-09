import { Achievement, AchievementCategory } from '@/types/achievements';

// Categorias de conquistas
export const achievementCategories: AchievementCategory[] = [
  {
    id: 'collection',
    name: 'Colecionador',
    description: 'Conquistas relacionadas à sua coleção de cartas',
    icon: 'Library',
    color: 'bg-blue-500'
  },
  {
    id: 'deck',
    name: 'Construtor',
    description: 'Conquistas relacionadas à construção de decks',
    icon: 'Hammer',
    color: 'bg-amber-500'
  },
  {
    id: 'gameplay',
    name: 'Jogador',
    description: 'Conquistas relacionadas às suas partidas',
    icon: 'Swords',
    color: 'bg-red-500'
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Conquistas relacionadas à interação com a comunidade',
    icon: 'Users',
    color: 'bg-green-500'
  },
  {
    id: 'special',
    name: 'Especial',
    description: 'Conquistas especiais e raras',
    icon: 'Sparkles',
    color: 'bg-purple-500'
  }
];

// Lista de todas as conquistas disponíveis
export const achievements: Achievement[] = [
  // Conquistas de Coleção - Comuns
  {
    id: 'first_card',
    title: 'Primeira Carta',
    description: 'Adicione sua primeira carta à coleção',
    icon: 'Plus',
    category: 'collection',
    rarity: 'common',
    points: 5,
    criteria: {
      type: 'cards',
      threshold: 1
    }
  },
  {
    id: 'collector_novice',
    title: 'Colecionador Iniciante',
    description: 'Tenha 10 cartas em sua coleção',
    icon: 'Library',
    category: 'collection',
    rarity: 'common',
    points: 10,
    criteria: {
      type: 'cards',
      threshold: 10
    }
  },
  {
    id: 'collector_apprentice',
    title: 'Colecionador Aprendiz',
    description: 'Tenha 50 cartas em sua coleção',
    icon: 'Library',
    category: 'collection',
    rarity: 'common',
    points: 15,
    criteria: {
      type: 'cards',
      threshold: 50
    }
  },
  
  // Conquistas de Coleção - Incomuns
  {
    id: 'collector_enthusiast',
    title: 'Colecionador Entusiasta',
    description: 'Tenha 100 cartas em sua coleção',
    icon: 'Library',
    category: 'collection',
    rarity: 'uncommon',
    points: 25,
    criteria: {
      type: 'cards',
      threshold: 100
    }
  },
  {
    id: 'collector_dedicated',
    title: 'Colecionador Dedicado',
    description: 'Tenha 250 cartas em sua coleção',
    icon: 'Library',
    category: 'collection',
    rarity: 'uncommon',
    points: 50,
    criteria: {
      type: 'cards',
      threshold: 250
    }
  },
  {
    id: 'rainbow_collector',
    title: 'Colecionador Arco-Íris',
    description: 'Tenha pelo menos 10 cartas de cada cor em sua coleção',
    icon: 'Palette',
    category: 'collection',
    rarity: 'uncommon',
    points: 30,
    criteria: {
      type: 'colors',
      threshold: 10,
      specific: ['W', 'U', 'B', 'R', 'G']
    }
  },
  
  // Conquistas de Coleção - Raras
  {
    id: 'collector_veteran',
    title: 'Colecionador Veterano',
    description: 'Tenha 500 cartas em sua coleção',
    icon: 'Trophy',
    category: 'collection',
    rarity: 'rare',
    points: 75,
    criteria: {
      type: 'cards',
      threshold: 500
    }
  },
  {
    id: 'collector_master',
    title: 'Mestre Colecionador',
    description: 'Tenha 1000 cartas em sua coleção',
    icon: 'Crown',
    category: 'collection',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'cards',
      threshold: 1000
    }
  },
  {
    id: 'mythic_hunter',
    title: 'Caçador de Míticas',
    description: 'Tenha 25 cartas míticas raras em sua coleção',
    icon: 'Star',
    category: 'collection',
    rarity: 'rare',
    points: 75,
    criteria: {
      type: 'rarities',
      threshold: 25,
      specific: 'mythic'
    }
  },
  
  // Conquistas de Coleção - Míticas
  {
    id: 'collector_legend',
    title: 'Colecionador Lendário',
    description: 'Tenha 2500 cartas em sua coleção',
    icon: 'Award',
    category: 'collection',
    rarity: 'mythic',
    points: 200,
    criteria: {
      type: 'cards',
      threshold: 2500
    }
  },
  {
    id: 'set_completionist',
    title: 'Completista',
    description: 'Complete uma coleção inteira de um set',
    icon: 'CheckCircle',
    category: 'collection',
    rarity: 'mythic',
    points: 150,
    criteria: {
      type: 'sets',
      threshold: 1,
      specific: 'complete'
    }
  },
  
  // Conquistas de Deck - Comuns
  {
    id: 'first_deck',
    title: 'Primeiro Deck',
    description: 'Crie seu primeiro deck',
    icon: 'Plus',
    category: 'deck',
    rarity: 'common',
    points: 10,
    criteria: {
      type: 'decks',
      threshold: 1
    }
  },
  {
    id: 'deck_builder_novice',
    title: 'Construtor Iniciante',
    description: 'Crie 3 decks diferentes',
    icon: 'Hammer',
    category: 'deck',
    rarity: 'common',
    points: 15,
    criteria: {
      type: 'decks',
      threshold: 3
    }
  },
  
  // Conquistas de Deck - Incomuns
  {
    id: 'deck_builder_enthusiast',
    title: 'Construtor Entusiasta',
    description: 'Crie 5 decks diferentes',
    icon: 'Hammer',
    category: 'deck',
    rarity: 'uncommon',
    points: 25,
    criteria: {
      type: 'decks',
      threshold: 5
    }
  },
  {
    id: 'format_explorer',
    title: 'Explorador de Formatos',
    description: 'Crie decks para 3 formatos diferentes',
    icon: 'Compass',
    category: 'deck',
    rarity: 'uncommon',
    points: 30,
    criteria: {
      type: 'decks',
      threshold: 3,
      specific: 'formats'
    }
  },
  
  // Conquistas de Deck - Raras
  {
    id: 'deck_builder_master',
    title: 'Mestre Construtor',
    description: 'Crie 10 decks diferentes',
    icon: 'Trophy',
    category: 'deck',
    rarity: 'rare',
    points: 50,
    criteria: {
      type: 'decks',
      threshold: 10
    }
  },
  {
    id: 'color_master',
    title: 'Mestre das Cores',
    description: 'Crie pelo menos um deck para cada combinação de cores',
    icon: 'Palette',
    category: 'deck',
    rarity: 'rare',
    points: 75,
    criteria: {
      type: 'decks',
      threshold: 10,
      specific: 'colors'
    }
  },
  
  // Conquistas de Deck - Míticas
  {
    id: 'deck_builder_legend',
    title: 'Construtor Lendário',
    description: 'Crie 25 decks diferentes',
    icon: 'Award',
    category: 'deck',
    rarity: 'mythic',
    points: 100,
    criteria: {
      type: 'decks',
      threshold: 25
    }
  },
  
  // Conquistas Sociais - Comuns
  {
    id: 'first_login',
    title: 'Bem-vindo!',
    description: 'Faça login pela primeira vez',
    icon: 'LogIn',
    category: 'social',
    rarity: 'common',
    points: 5,
    criteria: {
      type: 'login',
      threshold: 1
    }
  },
  {
    id: 'profile_complete',
    title: 'Perfil Completo',
    description: 'Complete seu perfil com avatar e informações',
    icon: 'User',
    category: 'social',
    rarity: 'common',
    points: 10,
    criteria: {
      type: 'special',
      threshold: 1,
      specific: 'profile'
    }
  },
  
  // Conquistas Especiais
  {
    id: 'early_adopter',
    title: 'Pioneiro',
    description: 'Junte-se ao MTG Helper durante o primeiro mês de lançamento',
    icon: 'Rocket',
    category: 'special',
    rarity: 'special',
    points: 50,
    criteria: {
      type: 'special',
      threshold: 1,
      specific: 'early_adopter'
    }
  },
  {
    id: 'beta_tester',
    title: 'Beta Tester',
    description: 'Participou da fase beta do MTG Helper',
    icon: 'Bug',
    category: 'special',
    rarity: 'special',
    points: 100,
    criteria: {
      type: 'special',
      threshold: 1,
      specific: 'beta_tester'
    }
  }
];

// Função para obter conquistas por categoria
export const getAchievementsByCategory = (categoryId: string): Achievement[] => {
  return achievements.filter(achievement => achievement.category === categoryId);
};

// Função para obter conquista por ID
export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find(achievement => achievement.id === id);
};

// Função para obter categoria por ID
export const getCategoryById = (id: string): AchievementCategory | undefined => {
  return achievementCategories.find(category => category.id === id);
};