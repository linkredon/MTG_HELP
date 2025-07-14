# Guia de Configuração de Autenticação com Google OAuth

Este documento explica como configurar e solucionar problemas relacionados à autenticação com Google OAuth no projeto MTG Helper.

## Requisitos

1. Uma conta Google Cloud Platform com o OAuth configurado
2. Um pool de usuários do AWS Cognito com o provedor de identidade Google configurado

## Configuração do Ambiente

### 1. Configuração do .env.local

Certifique-se de que seu arquivo `.env.local` contenha as seguintes variáveis:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu_secret_aqui

# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id_do_google
GOOGLE_CLIENT_SECRET=seu_client_secret_do_google

# Cognito/Amplify
NEXT_PUBLIC_USER_POOL_ID=seu_user_pool_id
NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID=seu_client_id
NEXT_PUBLIC_REGION=us-east-2
NEXT_PUBLIC_HOSTED_UI_DOMAIN=seu_dominio_oauth

# URLs de redirecionamento OAuth
OAUTH_REDIRECT_SIGNIN=http://localhost:3000/api/auth/callback/google
OAUTH_REDIRECT_SIGNOUT=http://localhost:3000
```

### 2. Google Cloud Platform

1. Acesse o [Console do Google Cloud](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para "APIs e Serviços" > "Credenciais"
4. Clique em "Criar Credenciais" > "ID do Cliente OAuth"
5. Configure como "Aplicativo da Web"
6. Adicione as URIs de redirecionamento autorizadas:
   - `http://localhost:3000/api/auth/callback/google` (desenvolvimento)
   - `https://seu-dominio.com/api/auth/callback/google` (produção)
7. Copie o Client ID e Client Secret para o arquivo `.env.local`

### 3. AWS Cognito

1. Acesse o [Console da AWS](https://aws.amazon.com/console/)
2. Vá para o serviço Cognito
3. Selecione seu User Pool
4. Em "App integration" > "App client and analytics", configure:
   - Domain name: defina um domínio para seu User Pool
5. Em "Sign-in experience" > "Federated identity provider sign-in":
   - Adicione o Google como provedor
   - Insira o Google Client ID e Client Secret
6. Copie o User Pool ID e o App Client ID para o arquivo `.env.local`

## Monitor de Autenticação

O projeto inclui um monitor de autenticação que ajuda a diagnosticar problemas:

- URL: `http://localhost:3000/auth-monitor`
- Recursos:
  - Verificação automática de configurações
  - Diagnóstico de problemas
  - Ferramenta para corrigir configurações incorretas

## Solucionando Problemas Comuns

### 1. "User Pool ID não encontrado"

- Verifique se `NEXT_PUBLIC_USER_POOL_ID` está definido no arquivo `.env.local`
- Confirme se o ID está correto no console da AWS Cognito

### 2. "Client ID não encontrado"

- Verifique se `NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID` está definido
- Confirme o ID na seção "App clients" do seu User Pool

### 3. "Domínio OAuth não encontrado"

- Verifique se `NEXT_PUBLIC_HOSTED_UI_DOMAIN` está definido
- Confirme se o domínio foi configurado no Cognito (App Integration > Domain name)

### 4. "Google não está listado como provedor"

- Verifique se o provedor Google foi adicionado ao User Pool
- Confirme se as credenciais do Google estão corretas

### 5. "Erro de redirecionamento"

- Verifique se as URLs de redirecionamento estão corretas em ambos:
  - Google Cloud Console
  - AWS Cognito App Client Settings

## Ferramenta de Diagnóstico

Se você estiver enfrentando problemas, use a ferramenta de diagnóstico integrada:

1. Acesse `http://localhost:3000/auth-monitor`
2. Clique na aba "Diagnóstico OAuth"
3. Clique em "Verificar Novamente" para executar um diagnóstico completo
4. Se necessário, use "Tentar Corrigir Automaticamente"

## Referências

- [Documentação AWS Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-social-idp.html)
- [Documentação Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Amplify Authentication](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)
