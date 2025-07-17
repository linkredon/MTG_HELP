"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Mail, 
  Settings, 
  Palette, 
  Shield, 
  LogOut, 
  Edit3,
  Save,
  X,
  Camera,
  Bell,
  Lock,
  Heart,
  BookOpen,
  Trophy,
  BarChart3,
  Star,
  Calendar,
  Target,
  TrendingUp,
  Activity,
  Zap,
  Crown,
  Award,
  Bookmark,
  Plus,
  Search,
  Filter
} from 'lucide-react';

// Configuração para evitar pré-renderização estática
export const dynamic = 'force-dynamic';

export default function UserPage() {
  const { user: authUser, isAuthenticated, signOut } = useAmplifyAuth();
  const { collections, decks, favorites } = useAppContext();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Buscar dados do usuário
  async function fetchUser() {
    setLoading(true);
    try {
      const res = await fetch("/api/users/me");
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setEditForm({
          name: data.user.name || '',
          email: data.user.email || '',
          bio: data.user.bio || ''
        });
      } else {
        setError(data.message || "Erro ao buscar usuário");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
    setLoading(false);
  }

  // Buscar ao montar
  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });
      
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, ...editForm });
        setIsEditing(false);
      } else {
        setError(data.message || "Erro ao atualizar perfil");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Estatísticas do usuário
  const stats = {
    collections: collections.length,
    decks: decks.length,
    favorites: favorites.length,
    totalCards: collections.reduce((acc, col) => acc + col.cards.length, 0),
    // Adicionar mais estatísticas
    uniqueCards: new Set(collections.flatMap(col => col.cards.map(card => card.card.id))).size,
    totalValue: collections.reduce((acc, col) => acc + col.cards.reduce((sum, card) => sum + (parseFloat(card.card.prices?.usd || '0') || 0), 0), 0)
  };

  // Calcular conquistas
  const achievements = {
    firstCollection: collections.length > 0,
    firstDeck: decks.length > 0,
    cardCollector: stats.totalCards >= 10,
    deckBuilder: decks.length >= 3,
    favoriteCollector: favorites.length >= 5,
    powerUser: stats.totalCards >= 50
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-400 mb-6">Você precisa estar logado para acessar esta página.</p>
          <Link href="/login">
            <Button className="quantum-btn primary">
              Fazer Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Área do Usuário</h1>
            <p className="text-gray-400">Gerencie seu perfil, configurações e preferências</p>
          </div>

          {/* Tabs de Navegação */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {[
              { id: 'profile', label: 'Perfil', icon: User },
              { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
              { id: 'achievements', label: 'Conquistas', icon: Trophy },
              { id: 'activity', label: 'Atividade', icon: Activity },
              { id: 'settings', label: 'Configurações', icon: Settings }
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? "default" : "outline"}
                className={`quantum-btn ${activeTab === tab.id ? 'bg-cyan-600' : ''}`}
                size="sm"
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Conteúdo das Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conteúdo Principal */}
            <div className="lg:col-span-2">
              {activeTab === 'profile' && (
                <div className="quantum-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Perfil
                    </h2>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant="outline"
                      size="sm"
                      className="quantum-btn"
                    >
                      {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                      {isEditing ? 'Cancelar' : 'Editar'}
                    </Button>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                      <p className="text-gray-400">Carregando perfil...</p>
                    </div>
                  ) : error ? (
                    <div className="text-red-400 text-center py-4">{error}</div>
                  ) : user ? (
                    <div className="space-y-6">
                      {/* Avatar e informações básicas */}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          {isEditing && (
                            <button className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1">
                              <Camera className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="space-y-3">
                              <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                placeholder="Nome completo"
                                className="bg-black/40 border-gray-700 text-white"
                              />
                              <Input
                                value={editForm.email}
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                placeholder="Email"
                                className="bg-black/40 border-gray-700 text-white"
                                disabled
                              />
                              <Input
                                value={editForm.bio}
                                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                placeholder="Biografia (opcional)"
                                className="bg-black/40 border-gray-700 text-white"
                              />
                              <div className="flex gap-2">
                                <Button onClick={handleSaveProfile} className="quantum-btn primary">
                                  <Save className="w-4 h-4 mr-2" />
                                  Salvar
                                </Button>
                                <Button onClick={() => setIsEditing(false)} variant="outline" className="quantum-btn">
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-lg font-semibold text-white">{user.name || 'Usuário'}</h3>
                              <p className="text-gray-400">{user.email}</p>
                              {user.bio && <p className="text-gray-300 mt-2">{user.bio}</p>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Estatísticas */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-700">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cyan-400">{stats.collections}</div>
                          <div className="text-sm text-gray-400">Coleções</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{stats.decks}</div>
                          <div className="text-sm text-gray-400">Decks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{stats.favorites}</div>
                          <div className="text-sm text-gray-400">Favoritos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{stats.totalCards}</div>
                          <div className="text-sm text-gray-400">Cartas</div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-6">
                  {/* Estatísticas Detalhadas */}
                  <div className="quantum-card p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Estatísticas Detalhadas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-black/20 rounded-lg">
                        <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.totalCards}</div>
                        <div className="text-sm text-gray-400">Total de Cartas</div>
                      </div>
                      <div className="text-center p-4 bg-black/20 rounded-lg">
                        <div className="text-3xl font-bold text-blue-400 mb-2">{stats.uniqueCards}</div>
                        <div className="text-sm text-gray-400">Cartas Únicas</div>
                      </div>
                      <div className="text-center p-4 bg-black/20 rounded-lg">
                        <div className="text-3xl font-bold text-green-400 mb-2">${stats.totalValue.toFixed(2)}</div>
                        <div className="text-sm text-gray-400">Valor Estimado</div>
                      </div>
                      <div className="text-center p-4 bg-black/20 rounded-lg">
                        <div className="text-3xl font-bold text-purple-400 mb-2">{stats.collections}</div>
                        <div className="text-sm text-gray-400">Coleções</div>
                      </div>
                      <div className="text-center p-4 bg-black/20 rounded-lg">
                        <div className="text-3xl font-bold text-orange-400 mb-2">{stats.decks}</div>
                        <div className="text-sm text-gray-400">Decks</div>
                      </div>
                      <div className="text-center p-4 bg-black/20 rounded-lg">
                        <div className="text-3xl font-bold text-red-400 mb-2">{stats.favorites}</div>
                        <div className="text-sm text-gray-400">Favoritos</div>
                      </div>
                    </div>
                  </div>

                  {/* Gráficos de Progresso */}
                  <div className="quantum-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Progresso
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Colecionador</span>
                          <span>{Math.min(100, (stats.totalCards / 100) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (stats.totalCards / 100) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Deck Builder</span>
                          <span>{Math.min(100, (stats.decks / 5) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (stats.decks / 5) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="quantum-card p-6">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Conquistas
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { 
                        id: 'firstCollection', 
                        title: 'Primeira Coleção', 
                        description: 'Criou sua primeira coleção',
                        icon: BookOpen,
                        unlocked: achievements.firstCollection
                      },
                      { 
                        id: 'firstDeck', 
                        title: 'Primeiro Deck', 
                        description: 'Construiu seu primeiro deck',
                        icon: BarChart3,
                        unlocked: achievements.firstDeck
                      },
                      { 
                        id: 'cardCollector', 
                        title: 'Colecionador', 
                        description: 'Colecionou 10 ou mais cartas',
                        icon: Star,
                        unlocked: achievements.cardCollector
                      },
                      { 
                        id: 'deckBuilder', 
                        title: 'Deck Builder', 
                        description: 'Construiu 3 ou mais decks',
                        icon: Target,
                        unlocked: achievements.deckBuilder
                      },
                      { 
                        id: 'favoriteCollector', 
                        title: 'Favoritos', 
                        description: 'Adicionou 5 ou mais favoritos',
                        icon: Heart,
                        unlocked: achievements.favoriteCollector
                      },
                      { 
                        id: 'powerUser', 
                        title: 'Power User', 
                        description: 'Colecionou 50 ou mais cartas',
                        icon: Crown,
                        unlocked: achievements.powerUser
                      }
                    ].map((achievement) => (
                      <div 
                        key={achievement.id}
                        className={`p-4 rounded-lg border-2 ${
                          achievement.unlocked 
                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50' 
                            : 'bg-black/20 border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            achievement.unlocked ? 'bg-yellow-500/20' : 'bg-gray-700'
                          }`}>
                            <achievement.icon className={`w-5 h-5 ${
                              achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${
                              achievement.unlocked ? 'text-white' : 'text-gray-400'
                            }`}>
                              {achievement.title}
                            </h4>
                            <p className={`text-sm ${
                              achievement.unlocked ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {achievement.description}
                            </p>
                          </div>
                          {achievement.unlocked && (
                            <Award className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="quantum-card p-6">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Atividade Recente
                  </h2>
                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Nenhuma atividade recente</p>
                        <p className="text-sm text-gray-500 mt-2">Suas ações aparecerão aqui</p>
                      </div>
                    ) : (
                      recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                          <div className="p-2 bg-cyan-500/20 rounded-full">
                            <activity.icon className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{activity.description}</p>
                            <p className="text-gray-400 text-xs">{activity.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="quantum-card p-6">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configurações
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Preferências</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                          <div>
                            <p className="text-white">Notificações por Email</p>
                            <p className="text-sm text-gray-400">Receber atualizações por email</p>
                          </div>
                          <Button variant="outline" size="sm" className="quantum-btn">
                            Ativar
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                          <div>
                            <p className="text-white">Modo Escuro</p>
                            <p className="text-sm text-gray-400">Usar tema escuro</p>
                          </div>
                          <Button variant="outline" size="sm" className="quantum-btn">
                            Ativo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Lateral */}
            <div className="space-y-6">
              {/* Ações Rápidas */}
              <div className="quantum-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Ações Rápidas
                </h3>
                <div className="space-y-3">
                  <Link href="/colecao">
                    <Button variant="outline" className="w-full quantum-btn justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Minha Coleção
                    </Button>
                  </Link>
                  <Link href="/decks">
                    <Button variant="outline" className="w-full quantum-btn justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Meus Decks
                    </Button>
                  </Link>
                  <Link href="/favorites">
                    <Button variant="outline" className="w-full quantum-btn justify-start">
                      <Heart className="w-4 h-4 mr-2" />
                      Favoritos
                    </Button>
                  </Link>
                  <Link href="/achievements">
                    <Button variant="outline" className="w-full quantum-btn justify-start">
                      <Trophy className="w-4 h-4 mr-2" />
                      Conquistas
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Configurações de Segurança */}
              <div className="quantum-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full quantum-btn justify-start">
                    <Lock className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </Button>
                  <Button variant="outline" className="w-full quantum-btn justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Notificações
                  </Button>
                </div>
              </div>

              {/* Logout */}
              <div className="quantum-card p-6">
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="w-full quantum-btn justify-start text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
