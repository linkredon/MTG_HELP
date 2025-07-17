# Implementação da Autenticação com AWS Amplify

Este documento descreve a implementação de autenticação atualizada que utiliza **exclusivamente** AWS Amplify/Cognito, substituindo a implementação anterior baseada em Next Auth.

## Estrutura do Sistema de Autenticação

### Componentes Principais

1. **Context API para Autenticação**
   - Localização: `contexts/AmplifyAuthContext.tsx`
   - Responsabilidades:
     - Gerenciar o estado do usuário autenticado
     - Fornecer métodos para login/logout
     - Verificar status de autenticação

2. **Funções de Autenticação**
   - Localização: `lib/auth-amplify.ts`
   - Responsabilidades:
     - Implementar registro de usuários
     - Autenticação com AWS Cognito
     - Gerenciamento de perfis de usuário
     - Sincronização com DynamoDB

3. **Setup do Amplify**
   - Localização: `lib/amplifySetup.ts`
   - Responsabilidades:
     - Configurar o cliente Amplify
     - Gerenciar URLs de redirecionamento
     - Inicializar a conexão com AWS

### Interfaces de Login

- **Página Principal**: `app/login/page.tsx` 
- **Componente Client-Side**: `app/login/page.client.tsx`
- **Versão Atualizada**: `app/login/page.client.new.tsx`

## Fluxo de Autenticação

1. **Registro de Usuário**
   - Fluxo implementado com `signUp` do AWS Amplify Auth
   - Armazenamento paralelo no DynamoDB para dados adicionais

2. **Login**
   - Autenticação via Cognito User Pool
   - Obtenção de tokens JWT
   - Atualização do contexto de autenticação

3. **Verificação de Sessão**
   - Verificação automática ao carregar o aplicativo
   - Refresh de tokens quando necessário

## Armazenamento de Dados

- **AWS Cognito**: Autenticação principal e dados básicos do usuário
- **DynamoDB**: Dados estendidos do perfil, coleções, e preferências

## Como Usar

### Autenticação em Componentes React

```tsx
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';

function MinhaComponente() {
  const { user, isAuthenticated, isLoading, signOut } = useAmplifyAuth();
  
  if (isLoading) return <p>Carregando...</p>;
  if (!isAuthenticated) return <p>Faça login para continuar</p>;
  
  return (
    <div>
      <h1>Olá, {user.name}!</h1>
      <button onClick={signOut}>Sair</button>
    </div>
  );
}
```

### Funções de Autenticação (Servidor/API)

```tsx
import { registerUser, loginWithAmplify, getUserById } from '@/lib/auth-amplify';

// Registro de usuário
const result = await registerUser({
  name: "Nome do Usuário",
  email: "usuario@exemplo.com",
  password: "Senha123!"
});

// Login
const loginResult = await loginWithAmplify({
  email: "usuario@exemplo.com",
  password: "Senha123!"
});

// Obter usuário por ID
const userResult = await getUserById("123456");
```

## Configuração

As credenciais e configurações do Amplify são gerenciadas através de variáveis de ambiente:

- `NEXT_PUBLIC_USER_POOL_ID`: ID do User Pool do Cognito
- `NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID`: ID do cliente de aplicação
- `NEXT_PUBLIC_REGION`: Região AWS
- `NEXT_PUBLIC_COGNITO_DOMAIN`: Domínio do Cognito
- `NEXT_PUBLIC_PRODUCTION_URL`: URL de produção para redirecionamentos

## Migração do Next Auth

A implementação anterior baseada em Next Auth foi completamente removida. Quaisquer componentes ou funções que ainda utilizavam o Next Auth foram atualizados para usar o AWS Amplify diretamente.
