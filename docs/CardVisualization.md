# Sistema Global de Modal de Cartas e Opções de Visualização

Este documento descreve como usar o Modal Global de Cartas e as Opções de Visualização implementadas no site.

## Modal Global de Cartas

O Modal Global de Cartas permite exibir informações detalhadas sobre uma carta quando o usuário clica nela, independentemente da página em que esteja navegando. O modal é configurado através de um contexto global.

### Como usar o Modal Global:

1. **Importar o hook `useCardModal`**:
   ```tsx
   import { useCardModal } from '@/contexts/CardModalContext';
   ```

2. **Usar o hook para acessar as funções do modal**:
   ```tsx
   const { openModal } = useCardModal();
   
   // Ao clicar em uma carta
   const handleCardClick = (card) => {
     openModal(card);
   };
   ```

3. **O componente `CardModal` já está incluído no layout global** da aplicação, então não é necessário incluí-lo em cada página.

## Componente CardList com Opções de Visualização

O componente `CardList` permite exibir uma lista de cartas com diferentes opções de visualização:

- **Grid (Grade)**: Exibe as cartas em uma grade com foco nas imagens.
- **List (Lista)**: Exibe as cartas em uma lista compacta com informações básicas.
- **Details (Detalhes)**: Exibe as cartas com informações detalhadas, incluindo o texto do oráculo.

### Como usar o componente CardList:

1. **Importar o componente**:
   ```tsx
   import CardList from '@/components/CardList';
   ```

2. **Usar o componente na página**:
   ```tsx
   <CardList 
     cards={cartasParaExibir} 
     showActionButton={true}
     actionButtonLabel="Adicionar"
     onActionButtonClick={(card) => adicionarCarta(card)}
   />
   ```

3. **O tipo de visualização é controlado pelo contexto global**, não sendo necessário gerenciar isso em cada página.

## Componente CardViewOptions

O componente `CardViewOptions` exibe os botões para alternar entre os diferentes tipos de visualização.

### Como usar o componente CardViewOptions:

1. **Importar o componente**:
   ```tsx
   import CardViewOptions from '@/components/CardViewOptions';
   ```

2. **Adicionar o componente em uma barra de ferramentas ou cabeçalho**:
   ```tsx
   <div className="flex items-center justify-between mb-4">
     <h2 className="text-xl font-bold">Resultados da Busca</h2>
     <CardViewOptions />
   </div>
   ```

## Recomendações de Uso

Dependendo do contexto, algumas visualizações são mais adequadas que outras:

- **Grid (Grade)**
  - Ideal para: Navegação rápida, visão geral de coleções, exibição de resultados de busca.
  - Tamanho recomendado: 5-6 cartas por linha em desktop.
  - Prioriza a imagem da carta.

- **Lista (List)**
  - Ideal para: Listas longas, decks, economizar espaço vertical.
  - Boa para quando o usuário precisa visualizar muitas cartas rapidamente.
  - Prioriza nomes e informações básicas como mana cost.

- **Detalhes (Details)**
  - Ideal para: Análise de cartas, construção de deck, comparação de efeitos.
  - Exibe texto completo do oráculo e mais informações.
  - Melhor quando o usuário precisa ler o texto das cartas sem abrir o modal.

## Implementação nas Páginas

Cada página que exibe cartas deve:

1. Usar o componente `CardList` para exibir as cartas.
2. Incluir o componente `CardViewOptions` para permitir alternar entre visualizações.
3. Usar o hook `useCardModal()` para abrir o modal ao clicar nas cartas.

## Armazenamento de Preferências

O sistema lembra a última visualização escolhida pelo usuário através do localStorage, para proporcionar uma experiência consistente entre páginas e visitas.
