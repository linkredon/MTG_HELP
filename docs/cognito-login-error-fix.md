# Resolvendo o Erro "Login pages unavailable"

Este documento fornece instruções detalhadas para resolver o erro "Login pages unavailable" que aparece ao tentar usar o Cognito Hosted UI.

## Causas comuns

O erro "Login pages unavailable" geralmente ocorre devido a:

1. **Configuração incorreta do App Client no Cognito**: Faltando habilitar o Hosted UI ou configurar corretamente os provedores de identidade.
2. **URLs de redirecionamento inválidas**: As URLs de redirecionamento configuradas no App Client não correspondem às utilizadas pela aplicação.
3. **Domínio do Cognito mal configurado**: O domínio do Cognito não está configurado corretamente ou está usando um formato inválido.

## Passos para solução

### 1. Verifique a configuração do App Client

1. Acesse o [AWS Console](https://console.aws.amazon.com/) e navegue até o serviço Cognito
2. Selecione "User Pools" e clique no User Pool usado pelo seu aplicativo
3. Na barra lateral, clique em "App integration" e role até "App clients and analytics"
4. Clique no App Client usado pelo seu aplicativo (o ID deve corresponder ao valor de `NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID` no arquivo .env.local)
5. Verifique e corrija as seguintes configurações:

   a. Em "Hosted UI", certifique-se de que "Use Cognito Hosted UI" está **habilitado**
   
   b. Em "Identity providers", certifique-se de que pelo menos um provedor está selecionado:
      - "Cognito user pool" para login com email/senha
      - "Google" se você estiver usando login com Google
   
   c. Em "Allowed callback URLs", verifique se todas as URLs de redirecionamento necessárias estão adicionadas:
      - `http://localhost:3000` para desenvolvimento local
      - `https://seu-dominio.com` para produção
      - Se estiver usando o domínio Amplify: `https://main.xxxxxxxxxx.amplifyapp.com`
   
   d. Em "Allowed sign-out URLs", adicione URLs similares às de callback
   
   e. Em "OAuth 2.0 grant types", certifique-se de que "Authorization code grant" está selecionado
   
   f. Em "OpenID Connect scopes", selecione pelo menos "Email", "OpenID", e "Profile"

### 2. Verifique a configuração de domínio do App

1. Na barra lateral do Cognito User Pool, clique em "App integration" e role até "Domain"
2. Certifique-se de que um domínio está configurado. Pode ser:
   - Um domínio do Cognito (formato: `seunome.auth.us-east-1.amazoncognito.com`)
   - Um domínio personalizado com certificado
3. Anote o domínio completo e certifique-se de que corresponde ao valor de `NEXT_PUBLIC_COGNITO_DOMAIN` no arquivo .env.local
4. **Importante**: No arquivo .env.local, o domínio deve incluir o protocolo `https://`

### 3. Atualize o arquivo .env.local

Certifique-se de que seu arquivo .env.local tem as seguintes variáveis configuradas corretamente:

```
NEXT_PUBLIC_REGION=us-east-1  # Substitua pela sua região AWS
NEXT_PUBLIC_USER_POOL_ID=us-east-1_xxxxxx  # Substitua pelo seu User Pool ID
NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID=yyyyyyyyyyyyyyy  # Substitua pelo seu App Client ID
NEXT_PUBLIC_COGNITO_DOMAIN=https://seunome.auth.us-east-1.amazoncognito.com  # Inclua https://
NEXT_PUBLIC_HOSTED_UI_DOMAIN=https://seunome.auth.us-east-1.amazoncognito.com  # Mesma coisa
OAUTH_DOMAIN=https://seunome.auth.us-east-1.amazoncognito.com  # Para compatibilidade
```

### 4. Teste com o Script de Diagnóstico

Execute o script de diagnóstico para validar suas configurações:

```bash
node scripts/cognito-check.js
```

### 5. Corrija Erros em Amplify

Se você estiver usando AWS Amplify, verifique se a configuração do Cognito no console Amplify está correta e corresponde às suas configurações no Cognito User Pool.

## Teste Final

1. Reinicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```

2. Acesse a página de login e tente fazer login com o Google
   
3. Monitore o console do navegador para erros específicos

## Recursos Adicionais

- [Documentação do Cognito Hosted UI](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html)
- [Configuração do OAuth 2.0 para Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-configuring-app-integration.html)
