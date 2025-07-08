# Correções das "Outras Versões" - V5

## Problemas Identificados e Corrigidos

### 1. **Grid de "Outras Versões" com 6 Colunas** ✅
- **Problema**: A visualização das outras versões ainda estava com 6 colunas em alguns componentes
- **Solução**:
  - Corrigido `CardListWithVersions.tsx`: `xl:grid-cols-6` → `xl:grid-cols-5`
  - Corrigido `DeckBuilder.tsx`: `lg:grid-cols-6` → `lg:grid-cols-5`
  - Corrigido `DeckViewerComponent.tsx`: `lg:grid-cols-6` → `lg:grid-cols-5`
  - Todos os grids de "outras versões" agora usam máximo de 5 colunas

### 2. **Scroll-to-Top Não Implementado em Todos os Componentes** ✅
- **Problema**: O scroll para o topo ao abrir "outras versões" não estava implementado em todos os componentes
- **Solução**:
  - Adicionado scroll-to-top em `CardListWithVersions.tsx`
  - Adicionado scroll-to-top em `SearchCardList.tsx`
  - Mantido o scroll-to-top existente em `ExpandableCardGrid.tsx`

### 3. **Atributo data-card-name Ausente** ✅
- **Problema**: Alguns componentes não tinham o atributo `data-card-name` necessário para o scroll-to-top
- **Solução**:
  - Adicionado `data-card-name={card.id}` em `CardListWithVersions.tsx`
  - Adicionado `data-card-name={card.id}` em `SearchCardList.tsx` para todas as views (grid, list, details)
  - Mantido o `data-card-name={cardName}` existente em `ExpandableCardGrid.tsx`

## Componentes Modificados

### `CardListWithVersions.tsx`
```tsx
// Grid de versões corrigido
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">

// Scroll-to-top adicionado
const toggleVersoesAlternativas = (cardId: string) => {
  const isCurrentlyExpanded = cartasComVersoesVisiveis[cardId];
  // ... lógica de toggle ...
  
  // Scroll para o topo quando abrir o box de outras versões
  if (!isCurrentlyExpanded) {
    setTimeout(() => {
      const element = document.querySelector(`[data-card-name="${cardId}"]`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  }
};

// data-card-name adicionado
<div key={collectionCard.card.id} data-card-name={collectionCard.card.id} className="...">
```

### `SearchCardList.tsx`
```tsx
// Scroll-to-top adicionado
const toggleVersions = useCallback(async () => {
  const wasHidden = !showVersions;
  // ... lógica de toggle ...
  
  // Scroll para o topo quando abrir o box de outras versões
  if (wasHidden) {
    setTimeout(() => {
      const element = document.querySelector(`[data-card-name="${card.id}"]`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  }
}, [showVersions, versionsData, fetchVersions, card.id]);

// data-card-name adicionado para todas as views
// Grid view
<div className="relative group" data-card-name={card.id}>

// List view
<div data-card-name={card.id}>

// Details view
<div data-card-name={card.id}>
```

### `DeckBuilder.tsx`
```tsx
// Grid corrigido para 5 colunas
? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
```

### `DeckViewerComponent.tsx`
```tsx
// Grid corrigido para 5 colunas
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
```

## Funcionalidade Implementada

### Padrão de 5 Colunas
- **Mobile** (até 640px): 1-2 colunas
- **Tablet** (641-768px): 2-3 colunas  
- **Desktop** (769-1024px): 3-4 colunas
- **Large** (1024px+): **5 colunas máximo**

### Scroll-to-Top Universal
- Implementado em todos os componentes que exibem "outras versões"
- Usa `data-card-name` para identificar o elemento correto
- Scroll suave (`behavior: 'smooth'`) com posicionamento no topo (`block: 'start'`)
- Delay de 100ms para aguardar renderização

### Atributos de Identificação
- `data-card-name` usando o ID da carta para identificação única
- Permite scroll preciso para o elemento correto
- Funciona em todas as visualizações (grid, list, details)

## Verificação

### Build Status ✅
- Build executado com sucesso
- Sem erros de TypeScript
- Sem erros de linting

### Componentes Validados ✅
- `ExpandableCardGrid.tsx`: Já estava correto (5 colunas + scroll-to-top)
- `SearchCardList.tsx`: Corrigido (scroll-to-top + data-card-name)
- `CardListWithVersions.tsx`: Corrigido (5 colunas + scroll-to-top + data-card-name)
- `DeckBuilder.tsx`: Corrigido (5 colunas)
- `DeckViewerComponent.tsx`: Corrigido (5 colunas)

## Resultado Final

Agora todas as visualizações de "outras versões" das cartas:
1. ✅ **Sempre exibem máximo 5 colunas**
2. ✅ **Fazem scroll para o topo quando abertas**
3. ✅ **Têm identificação adequada via data-card-name**
4. ✅ **Mantêm responsividade em todas as telas**
5. ✅ **Comportamento consistente em todos os componentes**

A experiência do usuário agora é uniforme e intuitiva em toda a aplicação.
