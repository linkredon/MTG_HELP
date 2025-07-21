"use client";

import { useState, useEffect } from 'react';
import AchievementsPanel from '@/components/AchievementsPanel';
import { User } from '@/types/mtg';
import '@/styles/achievements-enhanced.css';
import '@/styles/deck-builder-enhanced.css';

export default function AchievementsPage() {
  // Estado para armazenar os dados do usuário
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState({
    totalCards: 0,
    cardsByColor: {} as Record<string, number>,
    cardsByRarity: {} as Record<string, number>,
    cardsByType: {} as Record<string, number>,
    cardsBySets: {} as Record<string, number>,
    decksCount: 0,
    decksByFormat: {} as Record<string, number>,
    decksByColor: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);

  // Carregar dados do usuário
  useEffect(() => {
    // Simulação de carregamento de dados
    // Em um app real, isso viria de uma API
    setTimeout(() => {
      const mockUser: User = {
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
      };

      const mockStats = {
        totalCards: 120,
        cardsByColor: {
          'W': 25,
          'U': 30,
          'B': 20,
          'R': 15,
          'G': 22,
          'C': 8
        },
        cardsByRarity: {
          'common': 60,
          'uncommon': 40,
          'rare': 15,
          'mythic': 5
        },
        cardsByType: {
          'Creature': 50,
          'Instant': 20,
          'Sorcery': 15,
          'Enchantment': 10,
          'Artifact': 15,
          'Land': 10
        },
        cardsBySets: {
          'neo': 30,
          'vow': 25,
          'mid': 20,
          'stx': 15,
          'khm': 30
        },
        decksCount: 3,
        decksByFormat: {
          'standard': 2,
          'commander': 1
        },
        decksByColor: {
          'WU': 1,
          'BR': 1,
          'G': 1
        }
      };

      setUser(mockUser);
      setUserStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mtg-card p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="mtg-card p-6 text-center">
          <h2 className="text-lg font-medium text-red-300 mb-2">Acesso Negado</h2>
          <p className="text-gray-300">
            Você precisa estar logado para acessar suas conquistas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="quantum-card-dense p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="text-cyan-400 text-xl">🏆</div>
          <div>
            <h1 className="text-xl font-medium text-white">Conquistas</h1>
            <p className="text-xs text-gray-400 mt-1">Desbloqueie conquistas para ganhar pontos</p>
          </div>
        </div>
      </div>

      <AchievementsPanel user={user} userStats={userStats} />
    </div>
  );
}