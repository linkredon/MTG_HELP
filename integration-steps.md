# Integração do Frontend com o Backend

Este documento descreve os passos necessários para integrar o frontend com o backend do MTG Helper.

## Arquivos Criados

1. **Serviço de API**
   - `utils/apiService.ts` - Serviço para fazer chamadas à API

2. **Contextos Atualizados**
   - `contexts/AppContextAPI.tsx` - Versão do AppContext que usa a API
   - `contexts/FavoritesContextAPI.tsx` - Versão do FavoritesContext que usa a API

3. **Autenticação**
   - `app/api/auth/[...nextauth]/route.ts` - Configuração do NextAuth
   - `types/next-auth.d.ts` - Tipos para o NextAuth
   - `app/login/page.tsx` - Página de login

4. **Componentes Atualizados**
   - `components/UserHeaderAPI.tsx` - Versão do UserHeader que usa o NextAuth
   - `app/page.api.tsx` - Versão da página principal que usa os novos componentes

5. **Layout Atualizado**
   - `app/layout.tsx` - Atualizado para incluir o SessionProvider

## Próximos Passos para Completar a Integração

1. **Renomear os arquivos**
   - Renomear `app/page.api.tsx` para `app/page.tsx`
   - Renomear `components/UserHeaderAPI.tsx` para `components/UserHeader.tsx`
   - Renomear `contexts/AppContextAPI.tsx` para `contexts/AppContext.tsx`
   - Renomear `contexts/FavoritesContextAPI.tsx` para `contexts/FavoritesContext.tsx`

2. **Atualizar os componentes que usam os contextos**
   - Verificar e atualizar todos os componentes que usam o AppContext
   - Verificar e atualizar todos os componentes que usam o FavoritesContext
   - Adicionar tratamento de loading state nos componentes

3. **Configurar variáveis de ambiente**
   - Atualizar o arquivo `.env.local` com as credenciais do MongoDB
   - Configurar o segredo do NextAuth
   - Configurar o segredo do JWT

4. **Testar a autenticação**
   - Testar o registro de usuário
   - Testar o login
   - Testar a persistência da sessão

5. **Testar as operações CRUD**
   - Testar a criação de coleções
   - Testar a adição de cartas
   - Testar a criação de decks
   - Testar a adição de favoritos

6. **Implantar em produção**
   - Configurar o MongoDB Atlas
   - Implantar no Vercel ou outro serviço de hospedagem
   - Configurar variáveis de ambiente de produção