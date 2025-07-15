# Ponto de Restauração da Autenticação

Este diretório contém arquivos de backup do sistema de autenticação antes da migração para utilizar apenas AWS Cognito com Google OAuth.

## Arquivos de Backup

1. **amplifyClient.ts** - Configuração original do AWS Amplify
2. **.env.local.backup** - Variáveis de ambiente originais
3. **auth.ts** - Configuração original do NextAuth
4. **nextauth-route.ts** - Rota de API do NextAuth
5. **auth-config.ts** - Configuração detalhada do NextAuth
6. **auth-helpers-partial.ts** - Parte dos auxiliares de autenticação

## Como Restaurar

Se precisar reverter para a configuração original (usando NextAuth + AWS Cognito), siga estas etapas:

1. Copie os arquivos de backup para suas localizações originais:
   ```
   copy amplifyClient.ts ..\lib\amplifyClient.ts
   copy .env.local.backup ..\.env.local
   copy auth.ts ..\auth.ts
   copy nextauth-route.ts ..\app\api\auth\[...nextauth]\route.ts
   copy auth-config.ts ..\lib\auth-config.ts
   ```

2. Reinstale as dependências do NextAuth se necessário:
   ```
   npm install next-auth@latest
   ```

3. Reinicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```

## Notas Importantes

- A configuração original usa tanto NextAuth.js quanto AWS Amplify para autenticação
- Algumas variáveis de ambiente podem precisar ser atualizadas dependendo do ambiente
- Este backup foi criado em: 15/07/2025
