"use client"

import { useAppContext } from '@/contexts/AppContext'
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext'
import { Award, Zap, Target, Star, Heart, DollarSign, TrendingUp, User as UserIcon, Clock, Trophy, PieChart, Plus, BarChart3 } from "lucide-react"
import { useMemo } from 'react'
import AchievementCard from './AchievementCard';
import { checkAchievements } from '@/lib/achievementService';
import { achievementCategories } from '@/data/achievements';

export default function Painel({ onNavigate }) {
  const { collections, decks, favorites } = useAppContext();
  const { user: authUser } = useAmplifyAuth();

  // Calcular estatísticas reais
  const stats = useMemo(() => {
    let totalCards = 0;
    let uniqueCardsSet = new Set();
    let collectionValue = 0;
    let recentCards: { name: string; rarity: string; value: number; quantity: number; added_at: string; }[] = [];
    let cardsByDate: { name: string; rarity: string; value: number; quantity: number; added_at: string; }[] = [];
    let decksComp = 0;
    let weeklyProgress = 0;
    const weeklyGoal = 100;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    collections.forEach(collection => {
      if (collection.cards && Array.isArray(collection.cards)) {
        collection.cards.forEach(card => {
          const quantity = card.quantity || 1;
          totalCards += quantity;
          uniqueCardsSet.add(card.card?.id || card.card?.name);
          // Valor
          const price = parseFloat(card.card?.prices?.usd || '0');
          collectionValue += price * quantity;
          // Adições recentes
          const addedAt = (card as any).added_at || (card as any).addedAt || collection.createdAt || now.toISOString();
          cardsByDate.push({
            name: card.card?.name,
            rarity: card.card?.rarity,
            value: price,
            quantity,
            added_at: addedAt,
          });
          // Progresso semanal (cartas adicionadas na semana)
          const addedDate = new Date(addedAt);
          if (addedDate >= weekAgo) {
            weeklyProgress += quantity;
          }
        });
      }
    });
    // Decks completos
    decksComp = decks?.filter(deck => deck.cards && deck.cards.length > 0).length || 0;
    // Recentes: ordenar por data
    cardsByDate.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
    recentCards = cardsByDate.slice(0, 4);
    return {
      totalCards,
      uniqueCards: uniqueCardsSet.size,
      totalDecks: decks?.length || 0,
      collectionValue,
      avgCardValue: totalCards > 0 ? collectionValue / totalCards : 0,
      weeklyGoal,
      weeklyProgress,
      decksComp,
      recentCards,
    };
  }, [collections, decks]);

  // Calcular stats detalhados para conquistas
  const userStats = useMemo(() => {
    // Calcular distribuição de cores, raridades, tipos, sets
    const cardsByColor: Record<string, number> = {};
    const cardsByRarity: Record<string, number> = {};
    const cardsByType: Record<string, number> = {};
    const cardsBySets: Record<string, number> = {};
    collections.forEach(collection => {
      if (collection.cards && Array.isArray(collection.cards)) {
        collection.cards.forEach(card => {
          const quantity = card.quantity || 1;
          // Cores
          if (Array.isArray(card.card?.color_identity)) {
            card.card.color_identity.forEach(color => {
              cardsByColor[color] = (cardsByColor[color] || 0) + quantity;
            });
          }
          // Raridade
          if (card.card?.rarity) {
            cardsByRarity[card.card.rarity] = (cardsByRarity[card.card.rarity] || 0) + quantity;
          }
          // Tipo
          if (card.card?.type_line) {
            cardsByType[card.card.type_line] = (cardsByType[card.card.type_line] || 0) + quantity;
          }
          // Set
          if (card.card?.set_code) {
            cardsBySets[card.card.set_code] = (cardsBySets[card.card.set_code] || 0) + quantity;
          }
        });
      }
    });
    return {
      totalCards: stats.totalCards,
      cardsByColor,
      cardsByRarity,
      cardsByType,
      cardsBySets,
      decksCount: stats.totalDecks,
      decksByFormat: {},
      decksByColor: {},
    };
  }, [collections, stats.totalCards, stats.totalDecks]);

  // Calcular conquistas reais do usuário
  const user = useMemo(() => ({
    id: authUser?.id || 'unknown',
    name: authUser?.name || authUser?.email || 'Usuário',
    email: authUser?.email || '',
    avatar: authUser?.avatar || undefined,
    joinedAt: (authUser as any)?.joinedAt || new Date().toISOString(),
    collectionsCount: collections.length,
    totalCards: stats.totalCards,
    achievements: (authUser as any)?.achievements || [],
  }), [authUser, collections.length, stats.totalCards]);

  const allAchievements = useMemo(() => checkAchievements(user, userStats), [user, userStats]);
  const recentAchievements = allAchievements
    .filter(a => user.achievements.includes(a.id))
    .sort((a, b) => (b.unlockedAt && a.unlockedAt) ? (new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()) : 0)
    .slice(0, 3);
  const inProgressAchievements = allAchievements
    .filter(a => !user.achievements.includes(a.id))
    .sort((a, b) => ((b.progress || 0) - (a.progress || 0)))
    .slice(0, 3);

  return (
    <div className="w-full max-w-7xl mx-auto px-0 py-6">
      {/* Linha 1: Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="quantum-card-dense p-4 card-blue flex flex-col justify-between border border-[#232b3e] rounded-xl bg-[#181f2e] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-base font-semibold text-white">Total de Cartas</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-white">{stats.totalCards}</span>
            <span className="text-xs font-semibold text-green-400 bg-green-900/30 rounded px-2 py-0.5 ml-2">+100%</span>
          </div>
        </div>
        <div className="quantum-card-dense p-4 card-purple flex flex-col justify-between border border-[#232b3e] rounded-xl bg-[#181f2e] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-purple-400" />
            <span className="text-base font-semibold text-white">Cartas Únicas</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-white">{stats.uniqueCards}</span>
            <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/30 rounded px-2 py-0.5 ml-2">{stats.totalCards > 0 ? `${((stats.uniqueCards / stats.totalCards) * 100).toFixed(0)}%` : '0%'}</span>
          </div>
        </div>
        <div className="quantum-card-dense p-4 card-green flex flex-col justify-between border border-[#232b3e] rounded-xl bg-[#181f2e] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-base font-semibold text-white">Decks Ativos</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-white">{stats.totalDecks}</span>
            <span className="text-xs font-semibold text-green-400 bg-green-900/30 rounded px-2 py-0.5 ml-2">{stats.decksComp} comp.</span>
          </div>
        </div>
        <div className="quantum-card-dense p-4 card-yellow flex flex-col justify-between border border-[#232b3e] rounded-xl bg-[#181f2e] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <span className="text-base font-semibold text-white">Valor Estimado</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-white">R$ {stats.collectionValue.toFixed(0)}</span>
            <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/30 rounded px-2 py-0.5 mt-1">~R${stats.avgCardValue.toFixed(2)}/un</span>
          </div>
        </div>
      </div>
      {/* Linha 2: Meta semanal e conquistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="quantum-card-dense p-5 card-blue border border-[#232b3e] rounded-xl bg-[#181f2e] shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-base font-semibold text-white">Meta Semanal</span>
            <span className="ml-auto text-xs text-gray-400">4d restantes</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Progresso</span>
            <span className="font-semibold text-white">{stats.weeklyProgress}/{stats.weeklyGoal} cartas</span>
          </div>
          <div className="w-full h-2 bg-[#232b3e] rounded-full overflow-hidden mb-2">
            <div className="h-2 bg-blue-500 rounded-full" style={{width:`${(stats.weeklyProgress / stats.weeklyGoal) * 100}%`}}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>0</span>
            <span className="font-semibold text-blue-400">{stats.weeklyGoal > 0 ? `${((stats.weeklyProgress / stats.weeklyGoal) * 100).toFixed(0)}%` : '0%'}</span>
            <span>{stats.weeklyGoal}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 bg-[#232b3e] rounded-lg px-4 py-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-medium text-yellow-400">Faltam apenas <b>{stats.weeklyGoal - stats.weeklyProgress} cartas</b></span>
          </div>
        </div>
        <div className="quantum-card-dense p-5 card-purple border border-[#232b3e] rounded-xl bg-[#181f2e] shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-base font-semibold text-white">Conquistas Recentes</span>
            <button className="ml-auto text-xs text-blue-400">Ver todas</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
            {recentAchievements.length === 0 && inProgressAchievements.length === 0 && (
              <div className="col-span-3 text-center text-gray-400 py-6">
                <Trophy className="w-8 h-8 text-[#232b3e] mb-2 mx-auto" />
                Nenhuma conquista desbloqueada ainda<br/>
                <span className="text-xs text-gray-600">Continue usando o app para desbloquear conquistas</span>
              </div>
            )}
            {recentAchievements.map(a => (
              <AchievementCard key={a.id} achievement={a} unlocked={true} />
            ))}
            {inProgressAchievements.map(a => (
              <AchievementCard key={a.id} achievement={a} unlocked={false} />
            ))}
          </div>
        </div>
      </div>
      {/* Linha 3: Adições recentes e distribuição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="quantum-card-dense p-5 card-blue border border-[#232b3e] rounded-xl bg-[#181f2e] shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-base font-semibold text-white">Adições Recentes</span>
            <button className="ml-auto text-xs text-blue-400">Ver todas</button>
          </div>
          <ul className="divide-y divide-[#232b3e]">
            {stats.recentCards.length === 0 ? (
              <li className="py-2 text-sm text-gray-500">Nenhuma adição recente</li>
            ) : (
              stats.recentCards.map((card, idx) => (
                <li key={idx} className="flex items-center justify-between py-2 text-sm">
                  <span className="flex items-center gap-2"><span className="inline-block w-6 h-6 rounded bg-blue-900/30 text-center text-blue-400 font-bold">{card.name?.charAt(0) || '?'}</span> {card.name} <span className="text-yellow-400 text-xs">{card.rarity}</span> <span className="text-gray-400 text-xs">{card.quantity}x</span></span>
                  <span className="text-green-400 font-medium">R$ {card.value?.toFixed(2) || '0,00'}</span>
                  <span className="text-gray-500 text-xs">recent</span>
                </li>
              ))
            )}
          </ul>
        </div>
        {/* Distribuição: manter como estático ou implementar real depois */}
        <div className="quantum-card-dense p-5 card-purple border border-[#232b3e] rounded-xl bg-[#181f2e] shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-purple-400" />
            <span className="text-base font-semibold text-white">Distribuição</span>
          </div>
          <div className="mb-2 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> <span className="text-xs text-white">Vermelho</span> <span className="ml-auto text-xs text-gray-400">59%</span></div>
          <div className="w-full h-2 bg-[#232b3e] rounded-full overflow-hidden mb-1"><div className="h-2 bg-red-500 rounded-full" style={{width:'59%'}}></div></div>
          <div className="text-xs text-gray-400 mb-2">30 cartas</div>
          <div className="mb-2 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span> <span className="text-xs text-white">Verde</span> <span className="ml-auto text-xs text-gray-400">41%</span></div>
          <div className="w-full h-2 bg-[#232b3e] rounded-full overflow-hidden mb-1"><div className="h-2 bg-green-400 rounded-full" style={{width:'41%'}}></div></div>
          <div className="text-xs text-gray-400">21 cartas</div>
        </div>
      </div>
      {/* Linha 4: Ações rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-6">
        <button onClick={() => onNavigate('colecao')} className="quantum-card-dense p-4 card-blue border border-[#232b3e] rounded-xl bg-[#181f2e] flex flex-col items-center py-4 hover:border-blue-400 transition"><Plus className="w-5 h-5 mb-1 text-blue-400"/> <span className="text-sm font-semibold text-white">Add Carta</span></button>
        <button onClick={() => onNavigate('decks')} className="quantum-card-dense p-4 card-purple border border-[#232b3e] rounded-xl bg-[#181f2e] flex flex-col items-center py-4 hover:border-purple-400 transition"><Target className="w-5 h-5 mb-1 text-purple-400"/> <span className="text-sm font-semibold text-white">Meus Decks</span></button>
        <button onClick={() => onNavigate('favoritos')} className="quantum-card-dense p-4 card-pink border border-[#232b3e] rounded-xl bg-[#181f2e] flex flex-col items-center py-4 hover:border-pink-400 transition"><Heart className="w-5 h-5 mb-1 text-pink-400"/> <span className="text-sm font-semibold text-white">Favoritos</span></button>
        <button onClick={() => onNavigate('achievements')} className="quantum-card-dense p-4 card-yellow border border-[#232b3e] rounded-xl bg-[#181f2e] flex flex-col items-center py-4 hover:border-yellow-400 transition"><Trophy className="w-5 h-5 mb-1 text-yellow-400"/> <span className="text-sm font-semibold text-white">Conquistas</span></button>
        <button onClick={() => onNavigate('relatorios')} className="quantum-card-dense p-4 card-green border border-[#232b3e] rounded-xl bg-[#181f2e] flex flex-col items-center py-4 hover:border-green-400 transition"><BarChart3 className="w-5 h-5 mb-1 text-green-400"/> <span className="text-sm font-semibold text-white">Relatórios</span></button>
        <button onClick={() => onNavigate('analises')} className="quantum-card-dense p-4 card-orange border border-[#232b3e] rounded-xl bg-[#181f2e] flex flex-col items-center py-4 hover:border-orange-400 transition"><TrendingUp className="w-5 h-5 mb-1 text-orange-400"/> <span className="text-sm font-semibold text-white">Análises</span></button>
      </div>
    </div>
  );
}
