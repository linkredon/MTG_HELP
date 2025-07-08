# 🎯 MTG Helper - Aplicação Completa para Magic: The Gathering

Uma aplicação moderna e completa para gerenciar sua coleção, construir decks e aprender as regras do Magic: The Gathering, construída com Next.js 15, React 19 e Tailwind CSS.

## ✨ Características Principais

### 👤 **Sistema de Login/Usuário**
- Botão de login integrado no header da aplicação
- Modal de autenticação com opções de login e registro
- Perfil de usuário com avatar e estatísticas
- Menu dropdown com acesso rápido a configurações
- Persistência de login no localStorage
- Sistema de conquistas e estatísticas pessoais

### 🏠 **Painel de Controle**
- Visão geral da sua coleção com estatísticas detalhadas
- Metas semanais e progresso de conquistas
- Atividades recentes e cartas adicionadas
- Distribuição por cores de mana
- Ações rápidas para funcionalidades principais

### 📚 **Gerenciamento de Coleção**
- Pesquisa avançada na API Scryfall
- Filtros por nome, tipo, raridade, CMC, cores e mais
- Adicione/remova cartas facilmente
- Controle de quantidade e organização
- Visualização de cartas em diferentes formatos (grid, lista, detalhes)
- Modal detalhado para cada carta com opções avançadas

### 🔍 **Sistema Global de Modal de Cartas**

- Modal unificado em toda a aplicação
- Exibição de informações detalhadas da carta
- Opções para adicionar à coleção ou ao deck
- Links para Gatherer e LigaMagic
- Exibe quantidade de cartas na coleção

### 👁️ **Opções de Visualização de Cartas**

- Múltiplas visualizações para todas as listas de cartas
- **Grid**: Visualização em grade com foco nas imagens
- **Lista**: Visualização compacta para ver muitas cartas de uma vez
- **Detalhes**: Visualização detalhada com texto do oráculo e estatísticas
- Botões para alternar entre modos de visualização
- Persistência da preferência de visualização

### 🔧 **Como usar as novas funcionalidades**

#### Modal Global de Cartas

```tsx
// Importar o hook
import { useCardModal } from '@/contexts/CardModalContext';

// Usar no componente
const { openModal } = useCardModal();

// Abrir o modal ao clicar em uma carta
const handleCardClick = (card) => {
  openModal(card);
};
```

#### Componente de Lista de Cartas

```tsx
// Importar o componente
import CardList from '@/components/CardList';

// Usar na página
<CardList 
  cards={cartasParaExibir} 
  showActionButton={true}
  actionButtonLabel="Adicionar"
  onActionButtonClick={(card) => adicionarCarta(card)}
/>
```

#### Botões de Opções de Visualização

```tsx
// Importar o componente
import CardViewOptions from '@/components/CardViewOptions';

// Adicionar em um cabeçalho ou barra de ferramentas
<div className="flex items-center justify-between">
  <h2>Resultados da Busca</h2>
  <CardViewOptions />
</div>
```
- Exportação/importação em CSV
- Drag & drop para reorganização

### 🔨 **Construtor de Decks**
- Crie e gerencie múltiplos decks
- Suporte a todos os formatos (Standard, Modern, Legacy, etc.)
- Análise automática de curva de mana
- Estatísticas detalhadas por deck
- Sistema de cores e categorização
- Duplicação e edição de decks existentes

### � **Centro de Regras**
- Regras fundamentais organizadas por categoria
- Sistema de busca avançada
- Diferentes níveis de dificuldade
- Glossário de termos técnicos
- Referência rápida das cores
- Links para recursos oficiais

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ instalado
- NPM ou Yarn

### Instalação e Execução

1. **Clone/Baixe o projeto:**
   ```bash
   # Se baixou como ZIP, extraia para uma pasta
   cd caminho/para/colecao-page
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Execute o projeto:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

## 📁 Estrutura do Projeto

```
colecao-page/
├── app/                    # Diretório principal do Next.js 15
│   ├── layout.tsx         # Layout global da aplicação
│   ├── page.tsx           # Página principal
│   ├── colecao.tsx        # Componente principal da coleção
│   └── globals.css        # Estilos globais e Tailwind
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes UI base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   └── QuadroFiltros.tsx # Componente de filtros
├── lib/                  # Bibliotecas e utilitários
│   ├── utils.ts         # Funções utilitárias
│   └── googleTranslate.ts # Serviços de tradução
├── styles/              # Estilos adicionais
│   └── palette.css      # Paleta de cores MTG
├── package.json         # Dependências e scripts
├── tailwind.config.ts   # Configuração do Tailwind
├── tsconfig.json        # Configuração TypeScript
└── next.config.js       # Configuração do Next.js
```

## 🎮 Como Usar

### 1. **Painel de Controle**
- Visualize estatísticas gerais da sua coleção
- Acompanhe metas semanais e conquistas
- Veja atividades recentes e cartas adicionadas
- Analise a distribuição por cores da sua coleção

### 2. **Gerenciar Coleção**
- Use a aba "Pesquisar Cartas" para encontrar cartas
- Aplique filtros para refinar sua busca
- Clique em uma carta para ver detalhes
- Use os botões "+" e "-" para gerenciar quantidades
- Exporte/importe sua coleção em CSV

### 3. **Construir Decks**
- Crie novos decks escolhendo formato e cores
- Adicione cartas do seu acervo aos decks
- Analise estatísticas como curva de mana
- Duplique decks existentes para variações
- Teste e compartilhe suas criações

### 4. **Aprender Regras**
- Navegue por categorias de regras
- Use a busca para encontrar tópicos específicos
- Consulte a referência rápida para conceitos básicos
- Explore o glossário de termos técnicos

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **UI:** React 19 + Radix UI primitives
- **Styling:** Tailwind CSS
- **Componentes:** shadcn/ui
- **Ícones:** Lucide React
- **Drag & Drop:** @dnd-kit
- **API:** Scryfall (dados das cartas MTG)
- **Forms:** React Hook Form + Zod

## 🎨 Personalização

### Cores e Temas
O projeto usa uma paleta de cores inspirada no Magic: The Gathering:
- **Primária:** Azul (#0070F3) - Representando ilhas
- **Secundária:** Roxo (#9353D3) - Representando pântanos
- **Sucesso:** Verde (#17C964) - Representando florestas
- **Alerta:** Laranja (#F5A524) - Representando montanhas
- **Erro:** Vermelho (#F31260) - Representando planícies

### Adicionando Novas Funcionalidades
1. Componentes UI estão em `components/ui/`
2. Lógica principal em `app/colecao.tsx`
3. Estilos customizados em `styles/palette.css`
4. Configurações em `tailwind.config.ts`

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Executa em modo desenvolvimento
npm run build        # Constrói para produção
npm start           # Executa versão de produção
npm run lint        # Executa linting do código
```

## 📝 Notas de Desenvolvimento

- O projeto está configurado para usar a API Scryfall para dados das cartas
- Todas as imagens de cartas são carregadas diretamente da Scryfall
- O estado da coleção é mantido localmente (localStorage)
- Interface otimizada para desktop e mobile
- Suporte completo a TypeScript para desenvolvimento

## 🎯 Próximas Funcionalidades

- [ ] **Melhorias no Construtor de Decks:**
  - [ ] Teste de mão inicial
  - [ ] Simulador de jogadas
  - [ ] Sugestões automáticas de cartas
  - [ ] Análise de sinergia entre cartas

- [ ] **Recursos Sociais:**
  - [ ] Compartilhamento de decks e coleções
  - [ ] Sistema de comentários e avaliações
  - [ ] Comunidade de jogadores
  - [ ] Torneios online

- [ ] **Funcionalidades Avançadas:**
  - [ ] Múltiplas coleções por usuário
  - [ ] Sincronização com nuvem
  - [ ] Preços de cartas em tempo real
  - [ ] Sistema de wishlist
  - [ ] Alertas de lançamentos

- [ ] **Melhorias na Interface:**
  - [ ] Modo claro/escuro
  - [ ] Customização de layout
  - [ ] Atalhos de teclado
  - [ ] Melhor suporte mobile

---

**Desenvolvido com ❤️ para a comunidade Magic: The Gathering**

*Este projeto usa a API Scryfall para dados das cartas. Scryfall não é afiliado com a Wizards of the Coast.*
