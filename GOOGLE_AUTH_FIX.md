# Correção para o erro "Google Error - 401 invalid_client Unauthorized"

Este guia vai ajudar você a corrigir o erro de autenticação OAuth do Google.

## Problema identificado

O erro "401 invalid_client Unauthorized" indica que o Google não reconhece as credenciais OAuth que estão sendo enviadas, ou que há uma incompatibilidade entre a configuração no Google Cloud Console e nas suas variáveis de ambiente.

## Passos para correção

### 1. Verifique as credenciais do Google OAuth

1. Acesse o [Console do Google Cloud](https://console.cloud.google.com/)
2. Navegue para "APIs & Serviços" > "Credenciais"
3. Verifique se o Client ID e Client Secret no arquivo `.env.local` correspondem aos valores mostrados no console

### 2. Configure corretamente os URIs de redirecionamento no Google Cloud Console

1. No mesmo painel de credenciais, edite sua credencial OAuth
2. Em "URIs de redirecionamento autorizados", certifique-se de adicionar:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
3. Se estiver usando a aplicação em produção, adicione também:
   ```
   https://seu-dominio-de-producao.com/api/auth/callback/google
   ```

### 3. Configure os domínios autorizados

1. Na mesma tela, certifique-se de que seu "Domínio autorizado" inclui:
   ```
   localhost
   ```
2. E para produção:
   ```
   seu-dominio-de-producao.com
   ```

### 4. Atualize seu arquivo .env.local

Use o arquivo `.env.local.corrected` criado como referência. As principais alterações são:

1. URLs de redirecionamento OAuth corrigidas:
   ```
   NEXT_PUBLIC_REDIRECT_SIGN_IN=http://localhost:3000/api/auth/callback/google
   NEXT_PUBLIC_REDIRECT_SIGN_OUT=http://localhost:3000
   ```

2. Adição de URLs específicas para OAuth:
   ```
   OAUTH_REDIRECT_SIGNIN=http://localhost:3000/api/auth/callback/google
   OAUTH_REDIRECT_SIGNOUT=http://localhost:3000
   ```

### 5. Reinicie o servidor de desenvolvimento

Após fazer essas alterações:
1. Pare o servidor de desenvolvimento
2. Execute `npm run dev` novamente

### 6. Use o monitor de autenticação para diagnóstico

Acesse a ferramenta de diagnóstico integrada:
1. Acesse `http://localhost:3000/auth-monitor`
2. Clique na aba "Diagnóstico OAuth" 
3. Verifique se há mais erros relacionados à configuração

## Observações importantes

1. **Restrições de APIs**: Certifique-se de que a API Google+ está habilitada no seu projeto Google Cloud.

2. **Projeto correto**: Verifique se você está configurando as credenciais OAuth no projeto correto no Google Cloud Console.

3. **Tipo de aplicativo**: Confirme se o tipo de aplicativo OAuth está configurado como "Aplicativo da Web" e não outro tipo.

4. **Problema de escopo**: O erro também pode ocorrer se os escopos solicitados não estiverem aprovados para seu projeto. Verifique na seção "OAuth consent screen".

5. **Verificação de projeto**: Se seu projeto estiver em modo de "Verificação do aplicativo", pode haver restrições adicionais. Considere mudar para "Produção" ou adicionar seu email como usuário de teste.

## Referência rápida para os URIs corretos

Para NextAuth.js com Google provider, use:
- Redirect URI: `[sua-url-base]/api/auth/callback/google`
- Sign-out URI: `[sua-url-base]`

Para desenvolvimento local:
- Redirect URI: `http://localhost:3000/api/auth/callback/google`
- Sign-out URI: `http://localhost:3000`
