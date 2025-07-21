'use client';

import { useState, useEffect } from 'react';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Settings, 
  Trophy, 
  Activity, 
  ArrowLeft,
  Edit,
  Camera,
  Shield,
  Heart,
  BookOpen,
  Hammer,
  Star,
  TrendingUp,
  Zap,
  Target,
  Award,
  BarChart3,
  DollarSign,
  Sparkles,
  Clock,
  Eye as EyeIcon,
  X,
  Save,
  Upload
} from 'lucide-react';
import Link from 'next/link';

export default function UserProfilePage() {
  const { user, isAuthenticated } = useAmplifyAuth();
  const { collections, decks, favorites } = useAppContext();
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    avatar: ''
  });
  const [uploading, setUploading] = useState(false);

  // Inicializar formulário com dados do usuário
  useEffect(() => {
    if (user) {
      // Tentar carregar dados salvos localmente primeiro
      const savedProfile = localStorage.getItem(`user_profile_${user.id}`);
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setEditForm({
            name: parsedProfile.name || user.name || '',
            email: parsedProfile.email || user.email || '',
            avatar: parsedProfile.avatar || user.avatar || ''
          });
        } catch (error) {
          console.error('Erro ao carregar perfil salvo:', error);
          setEditForm({
            name: user.name || '',
            email: user.email || '',
            avatar: user.avatar || ''
          });
        }
      } else {
        setEditForm({
          name: user.name || '',
          email: user.email || '',
          avatar: user.avatar || ''
        });
      }
    }
  }, [user]);

  // Função para salvar dados localmente
  const saveProfileLocally = (profileData: any) => {
    if (user?.id) {
      try {
        localStorage.setItem(`user_profile_${user.id}`, JSON.stringify(profileData));
        console.log('Perfil salvo localmente:', profileData);
      } catch (error) {
        console.error('Erro ao salvar perfil localmente:', error);
      }
    }
  };

  // Função para atualizar perfil
  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          name: editForm.name,
          email: editForm.email,
          avatar: editForm.avatar
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Salvar dados localmente também
        const profileData = {
          name: editForm.name,
          email: editForm.email,
          avatar: editForm.avatar,
          updatedAt: new Date().toISOString()
        };
        saveProfileLocally(profileData);
        
        // Atualizar o formulário com os dados retornados
        if (result.user) {
          setEditForm(prev => ({
            ...prev,
            name: result.user.name || prev.name,
            email: result.user.email || prev.email,
            avatar: result.user.avatar || prev.avatar
          }));
        }
        
        setShowEditModal(false);
        
        // Mostrar mensagem apropriada
        if (result.warning) {
          alert(`Perfil atualizado! ${result.warning}`);
        } else {
          alert('Perfil atualizado com sucesso!');
        }
      } else {
        throw new Error('Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      
      // Fallback: salvar apenas localmente
      const profileData = {
        name: editForm.name,
        email: editForm.email,
        avatar: editForm.avatar,
        updatedAt: new Date().toISOString()
      };
      saveProfileLocally(profileData);
      
      setShowEditModal(false);
      alert('Perfil atualizado localmente! (Sem persistência no servidor)');
    } finally {
      setLoading(false);
    }
  };

  // Função para upload de avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Aqui você pode implementar o upload para S3 ou outro serviço
      // Por enquanto, vamos simular um upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newForm = { ...editForm, avatar: result };
        setEditForm(newForm);
        
        // Salvar avatar localmente
        if (user?.id) {
          const profileData = {
            name: editForm.name,
            email: editForm.email,
            avatar: result,
            updatedAt: new Date().toISOString()
          };
          saveProfileLocally(profileData);
        }
        
        setShowAvatarModal(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  // Calcular estatísticas dos dados reais do contexto
  const calculateStats = () => {
    let totalCards = 0;
    let uniqueCards = 0;
    let collectionValue = 0;
    const allCards: any[] = [];
    const colorCounts: { [key: string]: number } = {};

    // Processar coleções
    collections.forEach(collection => {
      if (collection.cards && Array.isArray(collection.cards)) {
        collection.cards.forEach(card => {
          const quantity = card.quantity || 1;
          totalCards += quantity;
          uniqueCards++;
          
          // Calcular valor
          const price = parseFloat(card.card?.prices?.usd || '0');
          collectionValue += price * quantity;
          
          // Adicionar à lista de cartas recentes
          allCards.push({
            name: card.card.name,
            set: card.card.set_code,
            rarity: card.card.rarity,
            quantity: quantity,
            value: price,
            addedAt: collection.createdAt || new Date().toISOString()
          });

          // Calcular distribuição de cores
          const colors = card.card.colors || [];
          colors.forEach(color => {
            colorCounts[color] = (colorCounts[color] || 0) + quantity;
          });
        });
      }
    });

    // Calcular distribuição de cores
    const colorMap: { [key: string]: { name: string, bgColor: string } } = {
      'W': { name: 'Branco', bgColor: 'from-gray-200 to-gray-400' },
      'U': { name: 'Azul', bgColor: 'from-blue-500 to-blue-600' },
      'B': { name: 'Preto', bgColor: 'from-gray-700 to-gray-900' },
      'R': { name: 'Vermelho', bgColor: 'from-red-500 to-red-600' },
      'G': { name: 'Verde', bgColor: 'from-green-500 to-green-600' }
    };

    const colorDistribution = Object.entries(colorCounts)
      .map(([color, count]) => ({
        color: colorMap[color]?.name || color,
        percentage: totalCards > 0 ? (count / totalCards) * 100 : 0,
        count,
        bgColor: colorMap[color]?.bgColor || 'from-gray-500 to-gray-600'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Ordenar cartas por data de adição (mais recentes primeiro)
    allCards.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

    return {
      totalCards,
      uniqueCards,
      totalDecks: decks.length,
      totalFavorites: favorites.length,
      collectionValue,
      collectionsCount: collections.length,
      recentCards: allCards.slice(0, 4),
      colorDistribution
    };
  };

  const stats = calculateStats();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-400 mb-6">Você precisa estar logado para acessar esta página.</p>
          <Link href="/login">
            <Button>Fazer Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 },
    { id: 'conquistas', label: 'Conquistas', icon: Trophy },
    { id: 'atividade', label: 'Atividade', icon: Activity },
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ];

  const quickActions = [
    { label: 'Minha Coleção', icon: BookOpen, href: '/colecao' },
    { label: 'Meus Decks', icon: BarChart3, href: '/decks' },
    { label: 'Favoritos', icon: Heart, href: '/favorites' },
    { label: 'Conquistas', icon: Trophy, href: '/achievements' }
  ];

  const securityActions = [
    { label: 'Alterar Senha', icon: Shield, action: () => setActiveTab('configuracoes') },
    { label: 'Notificações', icon: Activity, action: () => setActiveTab('configuracoes') }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return (
          <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Perfil</h2>
            </div>

            <div className="space-y-6">
              {/* Avatar e informações básicas */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full bg-blue-600 border-4 border-slate-600 overflow-hidden flex items-center justify-center mb-4">
                  {editForm.avatar ? (
                    <img src={editForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl text-white font-bold">
                      {(editForm.name || user.name) ? (editForm.name || user.name)[0].toUpperCase() : "U"}
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-1">{editForm.name || user.name || 'Usuário'}</h3>
                <p className="text-slate-400 mb-4">{editForm.email || user.email}</p>
                <p className="text-slate-300 text-center max-w-md mb-6">Gerencie sua coleção de Magic: The Gathering</p>
                
                {/* Botões de ação */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => setShowAvatarModal(true)}
                  >
                    <Camera className="w-4 h-4" />
                    Alterar Foto
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => setShowEditModal(true)}
                  >
                    <Edit className="w-4 h-4" />
                    Editar Perfil
                  </Button>
                </div>
              </div>

              {/* Estatísticas integradas com dados reais */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{stats.collectionsCount}</div>
                  <div className="text-sm text-blue-300">Coleções</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{stats.totalDecks}</div>
                  <div className="text-sm text-blue-300">Decks</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{stats.totalFavorites}</div>
                  <div className="text-sm text-purple-300">Favoritos</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.totalCards}</div>
                  <div className="text-sm text-green-300">Cartas</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'estatisticas':
        return (
          <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
            <div className="flex items-center mb-6">
              <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Estatísticas</h2>
            </div>
            
            {/* Estatísticas principais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.totalCards}</div>
                <div className="text-sm text-blue-300">Total de Cartas</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.uniqueCards}</div>
                <div className="text-sm text-purple-300">Cartas Únicas</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-green-400 mr-2" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.totalDecks}</div>
                <div className="text-sm text-green-300">Decks Ativos</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 text-yellow-400 mr-2" />
                </div>
                <div className="text-2xl font-bold text-white">
                  R$ {stats.collectionValue.toFixed(0)}
                </div>
                <div className="text-sm text-yellow-300">Valor Estimado</div>
              </div>
            </div>
            
            {/* Cartas recentes */}
            {stats.recentCards.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Cartas Recentes</h3>
                <div className="space-y-2">
                  {stats.recentCards.map((card, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-xs">
                          {card.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{card.name}</div>
                          <div className="text-xs text-slate-400">{card.set} • {card.rarity}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-green-400">R$ {card.value.toFixed(2)}</div>
                        <div className="text-xs text-slate-400">{card.quantity}x</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Distribuição de cores */}
            {stats.colorDistribution.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Distribuição por Cor</h3>
                <div className="space-y-3">
                  {stats.colorDistribution.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{item.color}</span>
                        <span className="text-white font-medium">{item.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${item.bgColor}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 text-right">
                        {item.count} cartas
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'conquistas':
        return (
          <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
            <div className="flex items-center mb-6">
              <Trophy className="w-5 h-5 text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Conquistas</h2>
            </div>
            <p className="text-slate-400">Sistema de conquistas em desenvolvimento...</p>
          </div>
        );

      case 'atividade':
        return (
          <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
            <div className="flex items-center mb-6">
              <Activity className="w-5 h-5 text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Atividade</h2>
            </div>
            <p className="text-slate-400">Histórico de atividades em desenvolvimento...</p>
          </div>
        );

      case 'configuracoes':
        return (
          <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
            <div className="flex items-center mb-6">
              <Settings className="w-5 h-5 text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Configurações</h2>
            </div>
            <p className="text-slate-400">Configurações em desenvolvimento...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header com botão de voltar */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={20} />
              <span>Voltar ao Início</span>
            </Button>
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">Área do Usuário</h1>
            <p className="text-blue-300">Gerencie seu perfil, configurações e preferências</p>
          </div>
          
          <div className="w-32"></div> {/* Espaçador para centralizar o título */}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Coluna principal - Conteúdo das abas */}
          <div className="lg:col-span-3">
            {/* Navegação por abas */}
            <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-2 mb-6">
              <div className="flex space-x-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition ${
                        activeTab === tab.id
                          ? "bg-indigo-600 text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-700"
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          
            {/* Conteúdo da aba ativa */}
            {renderTabContent()}
          </div>
          
          {/* Coluna lateral - Ações rápidas e configurações */}
          <div className="space-y-6">
            {/* Ações Rápidas */}
            <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
              <div className="flex items-center mb-4">
                <Zap className="w-5 h-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Ações Rápidas</h3>
              </div>
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} href={action.href}>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition">
                        <div className="flex items-center gap-3">
                          <Icon size={16} />
                          <span className="text-sm">{action.label}</span>
                        </div>
                        <ArrowLeft size={16} className="rotate-180" />
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Segurança */}
            <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Segurança</h3>
              </div>
              <div className="space-y-2">
                {securityActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={action.action}
                      className="w-full flex items-center justify-between p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} />
                        <span className="text-sm">{action.label}</span>
                      </div>
                      <ArrowLeft size={16} className="rotate-180" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Editar Perfil */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Editar Perfil</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Nome</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upload de Avatar */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Alterar Foto</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-blue-600 border-4 border-slate-600 overflow-hidden flex items-center justify-center mx-auto mb-4">
                  {editForm.avatar ? (
                    <img src={editForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-2xl text-white font-bold">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                </div>
                
                <Label htmlFor="avatar" className="text-white cursor-pointer">
                  <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-600 rounded-lg hover:border-slate-500 transition">
                    <Upload className="w-5 h-5" />
                    <span>Selecionar Imagem</span>
                  </div>
                </Label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowAvatarModal(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
