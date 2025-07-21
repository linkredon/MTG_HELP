"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
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
    <div className="p-4">
      {/* Header Compacto */}
      <div className="quantum-card-dense p-4 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-white">Regras do Magic</h2>
          <span className="quantum-badge primary">
            {rules.length} regras
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Consulte regras e referências do Magic: The Gathering
        </p>
      </div>

      <Tabs defaultValue="regras" className="w-full">
        <div className="quantum-card-dense mb-4 p-1">
          <TabsList className="bg-transparent flex w-full gap-1">
            <TabsTrigger value="regras" className="quantum-tab flex-1">
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">Regras</span>
            </TabsTrigger>
            <TabsTrigger value="rapidas" className="quantum-tab flex-1">
              <Zap className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">Referência</span>
            </TabsTrigger>
            <TabsTrigger value="glossario" className="quantum-tab flex-1">
              <Gem className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">Glossário</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="regras" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sidebar com categorias */}
            <div className="md:col-span-1">
              <div className="quantum-card-dense p-3 mb-3">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    placeholder="Buscar regras..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-sm bg-black/40 border-gray-700"
                  />
                </div>
              </div>

              <div className="quantum-card-dense p-3">
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  Categorias
                </h3>
                <div className="space-y-1">
                  {categories.map(category => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center gap-1.5 text-xs p-1.5 rounded-sm transition-colors
                          ${selectedCategory === category.id
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'hover:bg-gray-800 text-gray-400'
                          }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{category.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Rules Content */}
            <div className="md:col-span-3">
              {selectedRule ? (
                // Detailed Rule View
                <div className="quantum-card-dense">
                  <div className="p-3 border-b border-gray-800">
                    <div className="mb-2">
                      <button
                        onClick={() => setSelectedRule(null)}
                        className="flex items-center text-xs text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        ← Voltar às regras
                      </button>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-medium text-white">{selectedRule.title}</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`h-5 text-[10px] ${
                            selectedRule.difficulty === 'Básico' ? 'bg-green-600/30 text-green-400 hover:bg-green-600/40' :
                            selectedRule.difficulty === 'Intermediário' ? 'bg-yellow-600/30 text-yellow-400 hover:bg-yellow-600/40' : 
                            'bg-red-600/30 text-red-400 hover:bg-red-600/40'
                          }`}>
                            {selectedRule.difficulty}
                          </Badge>
                          
                          {selectedRule.tags.map(tag => (
                            <Badge key={tag} className="bg-gray-800 text-gray-300 hover:bg-gray-700 h-5 text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleFavorite(selectedRule.id)}
                        className="p-1 text-gray-500 hover:text-yellow-400 transition-colors"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="prose prose-invert max-w-none text-sm">
                      <div className="whitespace-pre-wrap">
                        {selectedRule.content}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Rules List
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm text-gray-400">
                      {filteredRules.length} regra{filteredRules.length !== 1 ? 's' : ''} encontrada{filteredRules.length !== 1 ? 's' : ''}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {filteredRules.map(rule => (
                      <div 
                        key={rule.id} 
                        className="quantum-card-dense hover-highlight cursor-pointer"
                        onClick={() => setSelectedRule(rule)}
                      >
                        <div className="p-3 border-b border-gray-800">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-white text-sm">{rule.title}</h3>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(rule.id)
                                }}
                                className="text-gray-500 hover:text-yellow-400 transition-colors"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`h-4 text-[10px] ${
                              rule.difficulty === 'Básico' ? 'bg-green-600/30 text-green-400 hover:bg-green-600/40' :
                              rule.difficulty === 'Intermediário' ? 'bg-yellow-600/30 text-yellow-400 hover:bg-yellow-600/40' : 
                              'bg-red-600/30 text-red-400 hover:bg-red-600/40'
                            }`}>
                              {rule.difficulty}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <p className="text-gray-400 text-xs line-clamp-2">
                            {rule.content.substring(0, 120)}...
                          </p>
                          <div className="flex gap-1 mt-2">
                            {rule.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} className="bg-gray-800 text-gray-300 hover:bg-gray-700 h-4 text-[10px]">
                                {tag}
                              </Badge>
                            ))}
                            {rule.tags.length > 2 && (
                              <span className="text-[10px] text-gray-500 self-center">
                                +{rule.tags.length - 2}
                              </span>
                            )}
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

        <TabsContent value="rapidas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickRules.map((rule, index) => {
              const Icon = rule.icon
              return (
                <div key={index} className="quantum-card-dense p-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white text-sm mb-1">{rule.title}</h3>
                      <p className="text-gray-400 text-xs">{rule.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Color Reference */}
          <div className="quantum-card-dense">
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-white">Cores de Mana</h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">Identidade e características de cada cor</p>
            </div>
            
            <div className="p-3">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { color: 'Branco', symbol: 'W', bg: 'from-yellow-400 to-orange-500', theme: 'Ordem, proteção' },
                  { color: 'Azul', symbol: 'U', bg: 'from-blue-500 to-cyan-600', theme: 'Conhecimento, controle' },
                  { color: 'Preto', symbol: 'B', bg: 'from-gray-700 to-gray-900', theme: 'Poder, sacrifício' },
                  { color: 'Vermelho', symbol: 'R', bg: 'from-red-500 to-orange-600', theme: 'Emoção, caos' },
                  { color: 'Verde', symbol: 'G', bg: 'from-green-500 to-emerald-600', theme: 'Natureza, vida' }
                ].map(color => (
                  <div key={color.symbol} className="text-center">
                    <div className={`w-8 h-8 bg-gradient-to-br ${color.bg} rounded-lg flex items-center justify-center mx-auto mb-2 text-white font-bold text-sm`}>
                      {color.symbol}
                    </div>
                    <h4 className="font-medium text-white text-xs mb-1">{color.color}</h4>
                    <p className="text-gray-400 text-[10px]">{color.theme}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="glossario" className="space-y-4">
          <div className="quantum-card-dense">
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-white">Glossário de Termos</h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">Definições dos termos mais importantes</p>
            </div>
            
            <div className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <div key={index} className="p-2 bg-gray-800/30 rounded-md border border-gray-700/50">
                    <h4 className="font-medium text-white text-xs mb-1">{item.term}</h4>
                    <p className="text-gray-400 text-[11px]">{item.def}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Links externos */}
          <div className="quantum-card-dense p-3">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              Recursos Externos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button className="p-2 bg-gray-800/30 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <div className="text-left">
                  <h4 className="text-xs font-medium text-white">Regras Oficiais</h4>
                  <p className="text-[10px] text-gray-400">Comprehensive Rules</p>
                </div>
              </button>
              
              <button className="p-2 bg-gray-800/30 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <div className="text-left">
                  <h4 className="text-xs font-medium text-white">Judge Chat</h4>
                  <p className="text-[10px] text-gray-400">Tire suas dúvidas</p>
                </div>
              </button>
              
              <button className="p-2 bg-gray-800/30 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <div className="text-left">
                  <h4 className="text-xs font-medium text-white">Gatherer</h4>
                  <p className="text-[10px] text-gray-400">Base de dados oficial</p>
                </div>
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
