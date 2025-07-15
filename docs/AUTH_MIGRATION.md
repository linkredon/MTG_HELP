# Documento de Atualização: Migração para AWS Cognito como Solução Única de Autenticação

## Visão Geral da Mudança

O sistema de autenticação do MTG_HELP foi simplificado, migrando de uma implementação híbrida (NextAuth.js + AWS Cognito) para usar exclusivamente o **AWS Cognito** com integração ao Google OAuth. Esta mudança reduz a complexidade do código, elimina problemas de sincronização entre sistemas de autenticação e proporciona uma experiência mais consistente.

## Motivações para a Mudança

1. **Simplificação**: Eliminar a duplicação de funcionalidades de autenticação
2. **Confiabilidade**: Resolver problemas intermitentes de sessão e redirecionamentos
3. **Manutenibilidade**: Reduzir o número de dependências e complexidade do código
4. **Consistência**: Unificar a experiência de autenticação em uma única solução

## Arquitetura de Autenticação Atual

### Componentes Principais

- **AWS Cognito**: Serviço principal de autenticação e gerenciamento de usuários
- **Google OAuth**: Provedor de identidade externo, integrado via Cognito
- **AmplifyAuthContext**: Contexto React que gerencia o estado de autenticação em toda a aplicação
- **AWS Amplify SDK**: Biblioteca cliente para interagir com o Cognito

### Fluxo de Autenticação

1. O usuário acessa a página de login
2. Escolhe entre autenticação direta (email/senha) ou Google OAuth
3. Para Google OAuth, o usuário é redirecionado para a página de autenticação do Google
4. Após autenticação bem-sucedida, o usuário retorna à aplicação com tokens JWT válidos
5. O middleware verifica os tokens em rotas protegidas
6. O AmplifyAuthContext gerencia o estado de autenticação e fornece informações do usuário para componentes

## Configuração do Ambiente

### Variáveis de Ambiente Necessárias

```bash
# AWS Cognito
NEXT_PUBLIC_USER_POOL_ID=us-east-2_XXXXXXXX
NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_REGION=us-east-2
NEXT_PUBLIC_COGNITO_DOMAIN=mtghelper.auth.us-east-2.amazoncognito.com
NEXT_PUBLIC_HOSTED_UI_DOMAIN=mtghelper.auth.us-east-2.amazoncognito.com

# Google OAuth (configurado no Cognito)
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx

# URLs de Redirecionamento
OAUTH_DOMAIN=mtghelper.auth.us-east-2.amazoncognito.com
OAUTH_REDIRECT_SIGNIN=http://localhost:3000/api/auth/callback/google
OAUTH_REDIRECT_SIGNOUT=http://localhost:3000
OAUTH_REDIRECT_SIGNIN_PRODUCTION=https://example.com/api/auth/callback/google
OAUTH_REDIRECT_SIGNOUT_PRODUCTION=https://example.com
```

### Importante: Formato de Domínio do Cognito

O valor das variáveis `NEXT_PUBLIC_COGNITO_DOMAIN`, `NEXT_PUBLIC_HOSTED_UI_DOMAIN` e `OAUTH_DOMAIN` deve ser configurado **sem o prefixo `https://`**, apenas o nome de domínio. A biblioteca AWS Amplify adiciona o protocolo automaticamente.

## Guia de Desenvolvimento

### Como Usar o Contexto de Autenticação

```tsx
// Importar o hook de autenticação
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';

// Dentro do seu componente
const MyComponent = () => {
  const { 
    user,           // Objeto com dados do usuário autenticado
    isAuthenticated, // Boolean indicando se o usuário está autenticado
    isLoading,      // Boolean indicando se a autenticação está sendo verificada
    signOut,        // Função para realizar logout
    refreshUser     // Função para atualizar dados do usuário
  } = useAmplifyAuth();
  
  if (isLoading) return <div>Carregando...</div>;
  
  if (!isAuthenticated) return <div>Faça login para continuar</div>;
  
  return <div>Bem-vindo, {user.name}!</div>;
};
```

### Implementando Login com Google

```tsx
import { signInWithRedirect } from 'aws-amplify/auth';

const handleGoogleLogin = async () => {
  try {
    // Redirecionar para fluxo de login com Google
    await signInWithRedirect({
      provider: 'Google'
    });
  } catch (error) {
    console.error('Erro ao iniciar login com Google:', error);
  }
};
```

### Implementando Logout

```tsx
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';

const LogoutButton = () => {
  const { signOut } = useAmplifyAuth();
  
  const handleLogout = async () => {
    try {
      await signOut();
      // Redirecionar após logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  
  return <button onClick={handleLogout}>Sair</button>;
};
```

### Protegendo Rotas no Cliente

```tsx
'use client';

import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAmplifyAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) return <div>Verificando autenticação...</div>;
  if (!isAuthenticated) return null; // Será redirecionado pelo useEffect
  
  return <div>Conteúdo protegido</div>;
}
```

### Autenticação em APIs

Para APIs do lado servidor, use os tokens JWT armazenados nos cookies:

```typescript
// Em uma API Route ou Server Action
import { fetchAuthSession } from 'aws-amplify/auth';

export async function getProtectedData() {
  try {
    // Obter a sessão atual com tokens
    const authSession = await fetchAuthSession();
    
    // Usar o token de acesso para autenticação
    const response = await fetch('https://api.exemplo.com/dados', {
      headers: {
        Authorization: `Bearer ${authSession.tokens?.accessToken.toString()}`
      }
    });
    
    return response.json();
  } catch (error) {
    console.error('Erro ao acessar dados protegidos:', error);
    throw new Error('Não autorizado');
  }
}
```

## Integração do AWS Cognito com Google OAuth

### No Console AWS Cognito

1. **Criar ou selecionar um User Pool**
2. **Configurar App Client**:
   - Habilitar Hosted UI
   - Definir URLs de retorno de chamada
   - Configurar escopos (scopes) de OAuth
3. **Configurar provedor de identidade**:
   - Adicionar Google como provedor
   - Inserir Client ID e Client Secret do Google
   - Configurar mapeamento de atributos

### No Google Cloud Console

1. **Configurar credenciais OAuth**:
   - Criar projeto ou usar existente
   - Configurar tela de consentimento OAuth
   - Criar credenciais OAuth 2.0
   - Adicionar URLs autorizados de redirecionamento (para o domínio Cognito)

## Troubleshooting

### Problemas Comuns e Soluções

1. **Erro "No domain found"**
   - Verifique se as variáveis de ambiente COGNITO_DOMAIN estão configuradas corretamente
   - Verifique se o formato está sem o prefixo 'https://'

2. **Redirecionamento não funciona após login**
   - Verifique se os URLs de redirecionamento estão configurados corretamente tanto no AWS Cognito quanto no Google Console

3. **Tokens não são recebidos ou validados**
   - Verifique se o Amplify está configurado corretamente
   - Verifique se o User Pool ID e Client ID estão corretos

4. **Usuário permanece desconectado após login bem-sucedido**
   - Verifique as configurações de domínio e cookies
   - Verifique se o middleware está usando corretamente os tokens

## Comparação com a Implementação Anterior

| Aspecto | Implementação Anterior | Implementação Atual |
|---------|------------------------|---------------------|
| Bibliotecas de Auth | NextAuth.js + AWS Amplify | Apenas AWS Amplify |
| Provedores de Identidade | Google via NextAuth | Google via AWS Cognito |
| Gerenciamento de Sessão | Cookies NextAuth + Tokens Amplify | Apenas Tokens Amplify |
| Complexidade | Alta (dupla integração) | Média (integração única) |
| Manutenibilidade | Difícil (múltiplos sistemas) | Melhor (sistema único) |

## Pacotes npm Utilizados

```
"dependencies": {
  "@aws-amplify/api": "^6.0.12",
  "@aws-amplify/api-graphql": "^4.0.12",
  "@aws-amplify/auth": "^6.0.12",
  "@aws-amplify/core": "^6.0.12",
  "@aws-amplify/ui-react": "^6.1.1",
  "aws-amplify": "^6.0.12",
}
```

## Recomendações para Desenvolvimento Futuro

1. **Implementar Recuperação de Senha**: Utilizar as funcionalidades nativas do Cognito
2. **Adicionar MFA**: Configurar autenticação multifator usando AWS Cognito
3. **Implementar Perfis de Usuário**: Usar o Cognito para gerenciar atributos personalizados
4. **Adicionar mais provedores de identidade**: Expandir para incluir Apple, Facebook, etc.

---

Este documento será mantido atualizado conforme o sistema de autenticação evolui. Para questões não abordadas nesta documentação, consulte a [documentação oficial do AWS Amplify](https://docs.amplify.aws/javascript/build-a-backend/auth/set-up-auth/).
