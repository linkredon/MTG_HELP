"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Search, 
  Star, 
  Clock, 
  Users, 
  Zap,
  Shield,
  Target,
  Sword,
  Heart,
  Flame,
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  ExternalLink, 
  HelpCircle,
  Sparkles,
  Award,
  Gem
} from 'lucide-react'
import { translatePtToEn } from '@/utils/translationService'

interface Rule {
  id: string
  title: string
  content: string
  category: string
  difficulty: 'Básico' | 'Intermediário' | 'Avançado'
  tags: string[]
  isFavorite?: boolean
}

export default function Regras() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)

  const categories = [
    { id: 'all', name: 'Todas', icon: BookOpen },
    { id: 'basic', name: 'Regras Básicas', icon: Star },
    { id: 'turn', name: 'Estrutura do Turno', icon: Clock },
    { id: 'combat', name: 'Combate', icon: Sword },
    { id: 'spell', name: 'Mágicas e Habilidades', icon: Zap },
    { id: 'permanent', name: 'Permanentes', icon: Shield },
    { id: 'zone', name: 'Zonas do Jogo', icon: Target },
    { id: 'multiplayer', name: 'Multiplayer', icon: Users }
  ]

  const rules: Rule[] = [
    {
      id: '1',
      title: 'Como Jogar Magic',
      content: `Magic: The Gathering é um jogo de cartas estratégico para dois ou mais jogadores. Cada jogador usa um deck personalizado de cartas Magic para derrotar seus oponentes.

**Objetivo do Jogo:**
Reduza os pontos de vida dos seus oponentes de 20 para 0, ou faça com que eles não possam comprar cartas do próprio deck.

**Componentes Básicos:**
- Deck de no mínimo 60 cartas
- Pontos de vida (começam com 20)
- Mana (recurso para jogar cartas)
- Cinco cores de mana: Branco, Azul, Preto, Vermelho e Verde`,
      category: 'basic',
      difficulty: 'Básico',
      tags: ['iniciante', 'conceitos', 'objetivo']
    },
    {
      id: '2',
      title: 'Estrutura do Turno',
      content: `Cada turno é dividido em fases específicas que devem ser seguidas em ordem:

**1. Fase Inicial (Beginning Phase):**
- Desvirar (Untap Step)
- Manutenção (Upkeep Step) 
- Compra (Draw Step)

**2. Fase Principal 1 (First Main Phase):**
- Jogue terrenos, mágicas e ative habilidades

**3. Fase de Combate (Combat Phase):**
- Declarar atacantes
- Declarar bloqueadores
- Resolver dano

**4. Fase Principal 2 (Second Main Phase):**
- Mesmas ações da Fase Principal 1

**5. Fase Final (Ending Phase):**
- Final do turno
- Limpeza`,
      category: 'turn',
      difficulty: 'Básico',
      tags: ['turno', 'fases', 'sequência']
    },
    {
      id: '3',
      title: 'Sistema de Mana',
      content: `Mana é o recurso usado para pagar o custo das mágicas. Existem cinco cores de mana:

**🤍 Branco (W):** 
- Proteção, cura, ordem
- Criaturas pequenas eficientes
- Remoção de ameaças

**🔵 Azul (U):**
- Compra de cartas, contramágicas
- Controle e manipulação
- Criaturas voadoras

**⚫ Preto (B):**
- Destruição, sacrifício
- Poder através de custos
- Criaturas com deathtouch

**🔴 Vermelho (R):**
- Dano direto, velocidade
- Emoção e caos
- Criaturas agressivas

**🟢 Verde (G):**
- Criaturas grandes, mana
- Natureza e crescimento
- Aceleração de mana`,
      category: 'basic',
      difficulty: 'Básico',
      tags: ['mana', 'cores', 'recursos']
    },
    {
      id: '4',
      title: 'Tipos de Cartas',
      content: `Existem vários tipos de cartas em Magic:

**Terrenos (Lands):**
- Produzem mana
- Podem ser jogados uma vez por turno
- Não custam mana para jogar

**Criaturas (Creatures):**
- Podem atacar e bloquear
- Têm poder e resistência
- Permanentes no campo de batalha

**Mágicas Instantâneas (Instants):**
- Podem ser jogadas a qualquer momento
- Vão para o cemitério após resolverem
- Efeitos imediatos

**Feitiços (Sorceries):**
- Só podem ser jogadas na sua fase principal
- Vão para o cemitério após resolverem
- Efeitos únicos

**Encantamentos (Enchantments):**
- Permanentes com efeitos contínuos
- Ficam no campo até serem removidos

**Artefatos (Artifacts):**
- Objetos mágicos
- Geralmente têm custos incolores
- Efeitos variados

**Planeswalkers:**
- Aliados poderosos
- Têm pontos de lealdade
- Habilidades ativáveis`,
      category: 'basic',
      difficulty: 'Intermediário',
      tags: ['tipos', 'cartas', 'permanentes']
    },
    {
      id: '5',
      title: 'Combate Detalhado',
      content: `O combate é dividido em várias etapas:

**1. Início do Combate:**
- Oportunidade para jogar mágicas
- Habilidades que ativam no início do combate

**2. Declarar Atacantes:**
- Escolha quais criaturas atacam
- Vire as criaturas atacantes
- Habilidades que ativam ao atacar

**3. Declarar Bloqueadores:**
- Defensor escolhe como bloquear
- Uma criatura pode bloquear um atacante
- Múltiplas criaturas podem bloquear um atacante

**4. Dano de Combate:**
- Criaturas aplicam dano igual ao poder
- Dano acontece simultaneamente
- Criaturas com deathtouch destroem com qualquer dano

**5. Final do Combate:**
- Últimas oportunidades para mágicas
- Habilidades de final de combate`,
      category: 'combat',
      difficulty: 'Intermediário',
      tags: ['combate', 'atacar', 'bloquear', 'dano']
    },
    {
      id: '6',
      title: 'A Pilha (Stack)',
      content: `A pilha é onde mágicas e habilidades esperam para resolver:

**Como Funciona:**
- Última mágica/habilidade a entrar é a primeira a resolver (LIFO)
- Jogadores podem responder adicionando mais à pilha
- Quando todos passam, o item do topo resolve

**Exemplo:**
1. Jogador A joga Lightning Bolt
2. Jogador B responde com Counterspell
3. Jogador A responde com Red Elemental Blast
4. Resolve: Red Elemental Blast → Counterspell → Lightning Bolt

**Dicas Importantes:**
- Mana permanece no pool durante resolução
- Você pode responder às suas próprias mágicas
- Algumas habilidades não usam a pilha (mana abilities)`,
      category: 'spell',
      difficulty: 'Avançado',
      tags: ['pilha', 'stack', 'resolução', 'resposta']
    }
  ]

  const quickRules = [
    { icon: Heart, title: 'Pontos de Vida', desc: 'Comece com 20, chegue a 0 e perde' },
    { icon: Clock, title: 'Limite de Mão', desc: 'Máximo de 7 cartas na mão' },
    { icon: Target, title: 'Terrenos por Turno', desc: 'Apenas 1 terreno por turno' },
    { icon: Zap, title: 'Velocidade da Mágica', desc: 'Instantâneas podem ser jogadas a qualquer momento' }
  ]

  const filteredRules = rules.filter(rule => {
    // Usar searchTerm e sua tradução para buscar
    const search = searchTerm.toLowerCase();
    const translatedSearch = translatePtToEn(search).toLowerCase();
    
    const matchesSearch = 
      rule.title.toLowerCase().includes(search) ||
      rule.content.toLowerCase().includes(search) ||
      rule.tags.some(tag => tag.toLowerCase().includes(search)) ||
      (translatedSearch !== search && (
        rule.title.toLowerCase().includes(translatedSearch) ||
        rule.content.toLowerCase().includes(translatedSearch) ||
        rule.tags.some(tag => tag.toLowerCase().includes(translatedSearch))
      ))
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFavorite = (ruleId: string) => {
    // Implementar favoritos
    console.log('Toggle favorite for rule:', ruleId)
  }

  return (
    <div className="mtg-section">
      {/* Hero Section */}
      <div className="mtg-card text-center mb-8">
        <div className="mtg-card-header justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center mb-6 mx-auto shadow-xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="mtg-section-title">Regras do Magic</h1>
        <p className="mtg-section-subtitle">
          Domine as regras fundamentais do Magic: The Gathering com guias detalhados e referências rápidas
        </p>
      </div>

      <Tabs defaultValue="regras" className="w-full">
        <div className="mtg-card mb-8">
          <TabsList className="mtg-nav-list w-full max-w-md mx-auto">
            <TabsTrigger value="regras" className="mtg-nav-item">
              <BookOpen className="w-4 h-4" />
              <span>Regras</span>
            </TabsTrigger>
            <TabsTrigger value="rapidas" className="mtg-nav-item">
              <Zap className="w-4 h-4" />
              <span>Referência</span>
            </TabsTrigger>
            <TabsTrigger value="glossario" className="mtg-nav-item">
              <Gem className="w-4 h-4" />
              <span>Glossário</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="regras" className="space-y-8">
          <div className="mtg-grid-4 gap-8">
            {/* Sidebar com categorias */}
            <div className="space-y-6">
              {/* Search */}
              <div className="mtg-card">
                <div className="mtg-card-header">
                  <Search className="mtg-card-icon" />
                  <div className="mtg-card-content">
                    <h3 className="mtg-card-title">Buscar Regras</h3>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <Input
                    placeholder="Digite para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mtg-input"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mtg-card">
                <div className="mtg-card-header">
                  <Target className="mtg-card-icon" />
                  <div className="mtg-card-content">
                    <h3 className="mtg-card-title">Categorias</h3>
                  </div>
                </div>
                <div className="px-6 pb-6 space-y-2">
                  {categories.map(category => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        className={`mtg-nav-category ${
                          selectedCategory === category.id 
                            ? 'mtg-nav-category-active' 
                            : ''
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{category.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Rules Content */}
            <div className="lg:col-span-3 space-y-6">
              {selectedRule ? (
                // Detailed Rule View
                <div className="mtg-card">
                  <div className="mtg-card-header">
                    <div className="w-full">
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedRule(null)}
                        className="quantum-btn quantum-btn-compact mb-4"
                      >
                        ← Voltar às regras
                      </Button>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="mtg-section-title text-left">{selectedRule.title}</h2>
                          <div className="flex items-center gap-3 mt-4">
                            <span className={`mtg-badge ${
                              selectedRule.difficulty === 'Básico' ? 'mtg-badge-success' :
                              selectedRule.difficulty === 'Intermediário' ? 'mtg-badge-warning' : 
                              'mtg-badge-error'
                            }`}>
                              {selectedRule.difficulty}
                            </span>
                            {selectedRule.tags.map(tag => (
                              <span key={tag} className="mtg-badge mtg-badge-secondary text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => toggleFavorite(selectedRule.id)}
                          className="quantum-btn quantum-btn-compact text-slate-400 hover:text-yellow-400"
                        >
                          <Star className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="prose prose-invert max-w-none">
                      <div className="mtg-rule-content whitespace-pre-wrap">
                        {selectedRule.content}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Rules List
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      {filteredRules.length} regra{filteredRules.length !== 1 ? 's' : ''} encontrada{filteredRules.length !== 1 ? 's' : ''}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {filteredRules.map(rule => (
                      <div 
                        key={rule.id} 
                        className="mtg-card mtg-card-interactive cursor-pointer"
                        onClick={() => setSelectedRule(rule)}
                      >
                        <div className="mtg-card-header">
                          <div className="flex-1">
                            <h3 className="mtg-card-title">{rule.title}</h3>
                            <p className="mtg-card-description line-clamp-2">
                              {rule.content.substring(0, 150)}...
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <span className={`mtg-badge ${
                                rule.difficulty === 'Básico' ? 'mtg-badge-success' :
                                rule.difficulty === 'Intermediário' ? 'mtg-badge-warning' : 
                                'mtg-badge-error'
                              }`}>
                                {rule.difficulty}
                              </span>
                              {rule.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="mtg-badge mtg-badge-secondary text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(rule.id)
                              }}
                              className="quantum-btn quantum-btn-compact text-slate-400 hover:text-yellow-400"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rapidas" className="space-y-8">
          <div className="mtg-grid">
            {quickRules.map((rule, index) => {
              const Icon = rule.icon
              return (
                <div key={index} className="mtg-card mtg-card-interactive text-center">
                  <div className="mtg-card-header justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-xl">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="mtg-card-title">{rule.title}</h3>
                  <p className="mtg-card-description">{rule.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Color Reference */}
          <div className="mtg-card">
            <div className="mtg-card-header">
              <Sparkles className="mtg-card-icon" />
              <div className="mtg-card-content">
                <h3 className="mtg-card-title">Cores de Mana</h3>
                <p className="mtg-card-description">Identidade e características de cada cor</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="mtg-grid">
                {[
                  { color: 'Branco', symbol: 'W', bg: 'from-yellow-400 to-orange-500', theme: 'Ordem, proteção, cura' },
                  { color: 'Azul', symbol: 'U', bg: 'from-blue-500 to-cyan-600', theme: 'Conhecimento, controle, magia' },
                  { color: 'Preto', symbol: 'B', bg: 'from-gray-700 to-gray-900', theme: 'Poder, ambição, sacrifício' },
                  { color: 'Vermelho', symbol: 'R', bg: 'from-red-500 to-orange-600', theme: 'Emoção, liberdade, caos' },
                  { color: 'Verde', symbol: 'G', bg: 'from-green-500 to-emerald-600', theme: 'Natureza, crescimento, vida' }
                ].map(color => (
                  <div key={color.symbol} className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${color.bg} rounded-xl flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl shadow-lg`}>
                      {color.symbol}
                    </div>
                    <h4 className="font-semibold text-white mb-1">{color.color}</h4>
                    <p className="text-slate-400 text-sm">{color.theme}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="glossario" className="space-y-8">
          <div className="mtg-card">
            <div className="mtg-card-header">
              <Gem className="mtg-card-icon" />
              <div className="mtg-card-content">
                <h3 className="mtg-card-title">Glossário de Termos</h3>
                <p className="mtg-card-description">Definições dos termos mais importantes do Magic</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="mtg-grid-2 gap-6">
                {[
                  { term: 'CMC (Custo de Mana Convertido)', def: 'O custo total de mana necessário para jogar uma mágica' },
                  { term: 'Deathtouch', def: 'Qualquer quantidade de dano desta criatura destrói uma criatura' },
                  { term: 'Flying (Voar)', def: 'Esta criatura só pode ser bloqueada por criaturas com flying ou reach' },
                  { term: 'Haste (Ímpeto)', def: 'Esta criatura pode atacar no turno que entra em jogo' },
                  { term: 'Lifelink', def: 'O dano causado por esta criatura também ganha pontos de vida' },
                  { term: 'Reach (Alcance)', def: 'Esta criatura pode bloquear criaturas com flying' },
                  { term: 'Trample (Atropelar)', def: 'Dano excessivo no combate pode ser aplicado ao defensor' },
                  { term: 'Vigilance (Vigilância)', def: 'Atacar não faz esta criatura virar' }
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <h4 className="font-semibold text-white mb-2">{item.term}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.def}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Useful Links */}
      <div className="mtg-card">
        <div className="mtg-card-header">
          <Award className="mtg-card-icon" />
          <div className="mtg-card-content">
            <h3 className="mtg-card-title">Recursos Externos</h3>
            <p className="mtg-card-description">Links úteis para aprofundar seus conhecimentos</p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="mtg-grid-3">
            <button className="mtg-card mtg-card-interactive text-left">
              <div className="mtg-card-header">
                <ExternalLink className="mtg-card-icon" />
                <div className="mtg-card-content">
                  <h4 className="mtg-card-title">Regras Oficiais</h4>
                  <p className="mtg-card-description">Comprehensive Rules completas</p>
                </div>
              </div>
            </button>
            <button className="mtg-card mtg-card-interactive text-left">
              <div className="mtg-card-header">
                <HelpCircle className="mtg-card-icon" />
                <div className="mtg-card-content">
                  <h4 className="mtg-card-title">Judge Chat</h4>
                  <p className="mtg-card-description">Tire dúvidas com juízes</p>
                </div>
              </div>
            </button>
            <button className="mtg-card mtg-card-interactive text-left">
              <div className="mtg-card-header">
                <BookOpen className="mtg-card-icon" />
                <div className="mtg-card-content">
                  <h4 className="mtg-card-title">Gatherer</h4>
                  <p className="mtg-card-description">Base de dados oficial</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
