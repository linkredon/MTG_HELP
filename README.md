# 🎯 MTG Helper - Aplicação Completa para Magic: The Gathering

Uma aplicação moderna e completa para gerenciar sua coleção, construir decks e aprender as regras do Magic: The Gathering, construída com Next.js 15, React 19 e Tailwind CSS.

## ✨ Características Principais

### 👤 **Sistema de Login/Usuário**
- Autenticação completa com NextAuth.js
- Perfil de usuário com avatar e estatísticas
- Persistência de dados no banco de dados MongoDB
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

### 🔨 **Construtor de Decks**
- Crie e gerencie múltiplos decks
- Suporte a todos os formatos (Standard, Modern, Legacy, etc.)
- Análise automática de curva de mana
- Estatísticas detalhadas por deck
- Sistema de cores e categorização
- Duplicação e edição de decks existentes

### ❤️ **Sistema de Favoritos**
- Marque cartas como favoritas
- Acesse rapidamente suas cartas favoritas
- Sincronização entre dispositivos quando logado
- Persistência local quando offline

### 📖 **Centro de Regras**
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
- MongoDB (para desenvolvimento local)

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

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto com:
   ```
   MONGODB_URI=mongodb://localhost:27017/mtghelper
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=seu_segredo_nextauth_muito_seguro
   JWT_SECRET=seu_segredo_jwt_muito_seguro
   JWT_EXPIRE=30d
   SCRYFALL_API_DELAY=100
   ```

4. **Execute o projeto:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

## 📁 Estrutura do Projeto

```
MTG_HELPER/
├── app/                # Diretório principal do Next.js 15
│   ├── api/            # API Routes do Next.js
│   ├── layout.tsx      # Layout global da aplicação
│   ├── page.tsx        # Página principal
│   └── globals.css     # Estilos globais e Tailwind
├── components/         # Componentes reutilizáveis
├── contexts/           # Contextos React
├── lib/                # Bibliotecas compartilhadas
├── models/             # Modelos de dados MongoDB
├── styles/             # Estilos adicionais
├── types/              # Definições de tipos TypeScript
└── utils/              # Utilitários
```

## 🌐 Backend e API

O MTG Helper possui um backend completo construído com Next.js API Routes e MongoDB:

- **Autenticação**: Sistema completo com NextAuth.js
- **API RESTful**: Endpoints para gerenciar coleções, decks e favoritos
- **Proxy para Scryfall**: Intermediação para a API do Scryfall
- **Persistência**: Armazenamento de dados no MongoDB
- **Fallback Offline**: Funcionamento offline com localStorage

## 📱 Responsividade

A aplicação é totalmente responsiva, funcionando bem em:
- Desktops e laptops
- Tablets
- Smartphones

## 🔒 Segurança

- Autenticação segura com JWT
- Proteção de rotas
- Validação de dados
- Sanitização de entradas

## 🚀 Implantação

Para implantar o projeto em produção, consulte o [Guia de Implantação](./deployment-guide.md).

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Next.js API Routes, MongoDB
- **Autenticação:** NextAuth.js
- **API Externa:** Scryfall API

## 📄 Licença

Este projeto é licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido com ❤️ para a comunidade Magic: The Gathering**

*Este projeto usa a API Scryfall para dados das cartas. Scryfall não é afiliado com a Wizards of the Coast.*