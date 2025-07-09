# MTG Helper - Backend API

Este documento descreve a API backend do MTG Helper, uma aplicação para gerenciar coleções de cartas Magic: The Gathering.

## Visão Geral

O backend do MTG Helper é construído com Next.js API Routes e MongoDB. Ele fornece endpoints para:

- Autenticação de usuários
- Gerenciamento de coleções
- Gerenciamento de decks
- Gerenciamento de favoritos
- Proxy para a API do Scryfall

## Configuração

1. **Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@cluster0.mongodb.net/mtghelper?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu_segredo_nextauth_muito_seguro
JWT_SECRET=seu_segredo_jwt_muito_seguro
JWT_EXPIRE=30d
SCRYFALL_API_DELAY=100
```

2. **Instalação de Dependências**

```bash
npm install
```

3. **Execução em Desenvolvimento**

```bash
npm run dev
```

## Endpoints da API

### Autenticação

- **POST /api/users/register** - Registrar novo usuário
- **POST /api/users/login** - Login de usuário
- **GET /api/users/me** - Obter dados do usuário atual
- **PUT /api/users/me** - Atualizar dados do usuário atual

### Coleções

- **GET /api/collections** - Listar coleções do usuário
- **POST /api/collections** - Criar nova coleção
- **GET /api/collections/[id]** - Obter detalhes de uma coleção
- **PUT /api/collections/[id]** - Atualizar uma coleção
- **DELETE /api/collections/[id]** - Excluir uma coleção
- **GET /api/collections/[id]/cards** - Listar cartas de uma coleção
- **POST /api/collections/[id]/cards** - Adicionar carta a uma coleção
- **DELETE /api/collections/[id]/cards** - Remover todas as cartas de uma coleção
- **GET /api/collections/[id]/cards/[cardId]** - Obter detalhes de uma carta na coleção
- **PUT /api/collections/[id]/cards/[cardId]** - Atualizar uma carta na coleção
- **DELETE /api/collections/[id]/cards/[cardId]** - Remover uma carta da coleção

### Decks

- **GET /api/decks** - Listar decks do usuário
- **POST /api/decks** - Criar novo deck
- **GET /api/decks/[id]** - Obter detalhes de um deck
- **PUT /api/decks/[id]** - Atualizar um deck
- **DELETE /api/decks/[id]** - Excluir um deck
- **GET /api/decks/[id]/cards** - Listar cartas de um deck
- **POST /api/decks/[id]/cards** - Adicionar carta a um deck
- **DELETE /api/decks/[id]/cards** - Remover todas as cartas de um deck
- **GET /api/decks/[id]/cards/[cardId]** - Obter detalhes de uma carta no deck
- **PUT /api/decks/[id]/cards/[cardId]** - Atualizar uma carta no deck
- **DELETE /api/decks/[id]/cards/[cardId]** - Remover uma carta do deck

### Favoritos

- **GET /api/favorites** - Listar favoritos do usuário
- **POST /api/favorites** - Adicionar carta aos favoritos
- **GET /api/favorites/[id]** - Obter detalhes de um favorito
- **DELETE /api/favorites/[id]** - Remover um favorito
- **GET /api/favorites/card/[cardId]** - Verificar se uma carta está nos favoritos
- **DELETE /api/favorites/card/[cardId]** - Remover uma carta específica dos favoritos

### Proxy Scryfall

- **GET /api/scryfall/search** - Pesquisar cartas no Scryfall
- **GET /api/scryfall/card/[id]** - Obter detalhes de uma carta no Scryfall
- **GET /api/scryfall/prints** - Obter todas as impressões de uma carta

## Modelos de Dados

### Usuário

```javascript
{
  name: String,
  email: String,
  password: String, // Criptografada
  avatar: String,
  joinedAt: Date,
  collectionsCount: Number,
  totalCards: Number,
  achievements: Array,
  role: String // 'user' ou 'admin'
}
```

### Coleção

```javascript
{
  name: String,
  description: String,
  user: ObjectId, // Referência ao usuário
  cards: [
    {
      card: {
        id: String,
        name: String,
        set_code: String,
        // ... outros dados da carta
      },
      quantity: Number,
      condition: String,
      foil: Boolean,
      language: String,
      notes: String,
      addedAt: Date
    }
  ],
  backgroundImage: String,
  createdAt: Date
}
```

### Deck

```javascript
{
  name: String,
  description: String,
  format: String,
  colors: [String],
  user: ObjectId, // Referência ao usuário
  cards: [
    {
      card: {
        id: String,
        name: String,
        // ... outros dados da carta
      },
      quantity: Number,
      isSideboard: Boolean,
      isCommander: Boolean,
      category: String
    }
  ],
  coverImage: String,
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Favorito

```javascript
{
  user: ObjectId, // Referência ao usuário
  card: {
    id: String,
    name: String,
    // ... outros dados da carta
  },
  addedAt: Date
}
```

## Próximos Passos

1. **Integração com o Frontend**
2. **Sistema de Cache**
3. **Melhorias de Segurança**
4. **Implantação em Produção**