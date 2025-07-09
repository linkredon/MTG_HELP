# Backend Setup para MTG Helper

Este documento descreve o processo de configuração do backend para o MTG Helper.

## Estrutura de Diretórios

```
MTG_HELP/
├── app/                # Frontend Next.js
├── pages/              # Páginas Next.js
│   └── api/            # API Routes do Next.js
│       ├── auth/       # Autenticação
│       ├── users/      # Gerenciamento de usuários
│       ├── collections/ # Gerenciamento de coleções
│       ├── decks/      # Gerenciamento de decks
│       ├── favorites/  # Gerenciamento de favoritos
│       └── scryfall/   # Proxy para API do Scryfall
├── lib/                # Bibliotecas compartilhadas
├── models/             # Modelos de dados
├── utils/              # Utilitários
└── config/             # Configurações
```

## Tecnologias Utilizadas

- **Framework**: Next.js (API Routes)
- **Banco de Dados**: MongoDB
- **Autenticação**: NextAuth.js
- **Validação**: Zod
- **Integração Externa**: Scryfall API

## Progresso de Implementação

- [x] Estrutura básica do projeto
- [x] Configuração do banco de dados
- [x] Modelos de dados
  - [x] Usuário
  - [x] Coleção
  - [x] Deck
  - [x] Favorito
- [x] Sistema de autenticação
  - [x] Login
  - [x] Registro
  - [x] Perfil do usuário
- [x] API de usuários
  - [x] Registro
  - [x] Login
  - [x] Perfil
- [x] API de coleções
  - [x] Listar coleções
  - [x] Criar coleção
  - [x] Atualizar coleção
  - [x] Excluir coleção
  - [x] Gerenciar cartas da coleção
- [x] API de decks
  - [x] Listar decks
  - [x] Criar deck
  - [x] Atualizar deck
  - [x] Excluir deck
  - [x] Gerenciar cartas do deck
- [x] API de favoritos
  - [x] Listar favoritos
  - [x] Adicionar favorito
  - [x] Remover favorito
  - [x] Verificar se carta está nos favoritos
- [x] Proxy para Scryfall
  - [x] Pesquisa de cartas
  - [x] Busca de carta específica
  - [x] Busca de impressões de uma carta

## Próximos Passos

1. **Integração com o Frontend**:
   - Atualizar os contextos para usar a API em vez de localStorage
   - Implementar tratamento de erros e loading states

2. **Melhorias de Performance**:
   - Implementar sistema de cache para requisições à API do Scryfall
   - Otimizar consultas ao banco de dados

3. **Segurança**:
   - Implementar rate limiting
   - Adicionar validação de entrada com Zod
   - Configurar CORS

4. **Implantação**:
   - Configurar variáveis de ambiente para produção
   - Implantar em serviço de hospedagem (Vercel, Netlify, etc.)
   - Configurar banco de dados MongoDB Atlas

## Instruções para Execução

1. **Configurar Variáveis de Ambiente**:
   - Copie o arquivo `.env.local` e preencha com suas credenciais

2. **Instalar Dependências**:
   ```bash
   npm install
   ```

3. **Executar em Desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Construir para Produção**:
   ```bash
   npm run build
   npm start
   ```