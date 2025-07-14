# Guia de Configuração do Cognito Hosted UI

Este guia vai ajudar você a resolver o erro "Login pages unavailable" no Cognito Hosted UI.

## Passo 1: Verificar Domínio do Hosted UI

1. Faça login no [Console da AWS](https://console.aws.amazon.com/).
2. Navegue até **Amazon Cognito**.
3. Selecione **User Pools** e clique no seu User Pool (us-east-2_GIWZQN4d2).
4. No menu lateral, clique em **App integration** (Integração de aplicativos).
5. Role para baixo até **Domain** (Domínio).

Verifique se:
- Um domínio está configurado (deve ser **mtghelper.auth.us-east-2.amazoncognito.com**).
- Se não houver domínio configurado, clique em **Create Cognito domain** (Criar domínio Cognito).
- Insira **mtghelper** como prefixo do domínio.

## Passo 2: Verificar App Client

1. Ainda em **App integration**, role até **App clients and analytics** (Clientes de aplicativo e análises).
2. Clique no App Client com o ID **55j5l3rcp164av86djhf9qpjch**.
3. Verifique as configurações:

### Configurações importantes para verificar:

- **Hosted UI** deve estar habilitado (enabled). Procure a caixa de seleção "Use Cognito Hosted UI".
- **Identity providers** (Provedores de identidade) deve incluir **Google**.
- **Allowed callback URLs** (URLs de retorno permitidas) deve incluir:
  - http://localhost:3000
  - http://localhost:3001
  - https://main.da2h2t88kn6qm.amplifyapp.com
- **Allowed sign-out URLs** (URLs de logout permitidas) deve incluir:
  - http://localhost:3000
  - http://localhost:3001
  - https://main.da2h2t88kn6qm.amplifyapp.com
- **OAuth 2.0 grant types** (Tipos de concessão OAuth 2.0) deve incluir **Authorization code grant** (Concessão de código de autorização).
- **OpenID Connect scopes** (Escopos OpenID Connect) deve incluir **email**, **openid** e **profile**.

Se alguma configuração estiver faltando, adicione-a e clique em **Save changes** (Salvar alterações).

## Passo 3: Verificar Provedor de Identidade Google

1. No menu lateral, clique em **Sign-in experience** (Experiência de login).
2. Role para baixo até **Federated identity provider sign-in** (Login de provedor de identidade federado).
3. Verifique se o **Google** está listado e ativo.
4. Se o Google não estiver configurado:
   - Clique em **Add identity provider** (Adicionar provedor de identidade).
   - Selecione **Google**.
   - Insira seu **Google client ID**: `685564622798-1q3psi7781s8f97ebhm7cs45u49c1ktj.apps.googleusercontent.com`
   - Insira seu **Google client secret**: `yaUyCC7eOalM-aTrC-etaXH_2_5m`
   - Em **Authorized scopes**, insira: `profile email openid`
   - Clique em **Add identity provider** (Adicionar provedor de identidade).

## Passo 4: Verificar e Adicionar URLs de Retorno

Baseado na sua captura de tela, verifique que:

1. Em **Allowed callback URLs** você tenha exatamente:
   ```
   http://localhost:3000/
   ```
   
   Nota: Se necessário, adicione também as URLs abaixo:
   ```
   http://localhost:3000
   ```
   
   E adicione o domínio específico do seu aplicativo AWS Amplify:
   ```
   https://main.SEUDOMINIO.amplifyapp.com/
   https://main.SEUDOMINIO.amplifyapp.com
   ```
   
   Substitua `SEUDOMINIO` pelo identificador único do seu aplicativo Amplify (por exemplo, "da2h2t88kn6qm")

2. Em **Allowed sign-out URLs**, adicione:
   ```
   http://localhost:3000/
   http://localhost:3000
   ```
   
   E adicione o domínio específico do seu aplicativo AWS Amplify:
   ```
   https://main.SEUDOMINIO.amplifyapp.com/
   https://main.SEUDOMINIO.amplifyapp.com
   ```
   
   Substitua `SEUDOMINIO` pelo identificador único do seu aplicativo Amplify (encontrado na URL do seu aplicativo no console Amplify)

## Passo 5: Verificar Tipos de Concessão OAuth

Conforme visto na sua captura de tela, certifique-se que:

1. Em **OAuth 2.0 grant types** a opção **Authorization code grant** (Concessão de código de autorização) está selecionada.
   - Esta opção é essencial para o funcionamento do fluxo de autenticação.
   - O texto na interface deve indicar "Fornece um código de autorização como resposta".

2. Em **OpenID Connect scopes**, certifique-se que os seguintes escopos estão selecionados:
   - Email
   - OpenID
   - Perfil

## Passo 6: Testar Hosted UI Diretamente

Para testar se o Hosted UI está funcionando corretamente, acesse esta URL em seu navegador:

```
https://mtghelper.auth.us-east-2.amazoncognito.com/login?client_id=55j5l3rcp164av86djhf9qpjch&response_type=code&redirect_uri=http://localhost:3000
```

Se esta URL funcionar, significa que o Hosted UI está configurado corretamente no AWS Console.

## Passo 7: Verificar API do Google Cloud

O erro também pode estar relacionado à configuração no Google Cloud Console:

1. Acesse o [Console do Google Cloud](https://console.cloud.google.com/).
2. Selecione o projeto relacionado ao seu client ID.
3. Navegue até **APIs & Services > Credentials** (APIs e Serviços > Credenciais).
4. Encontre o OAuth Client ID usado para o Cognito.
5. Verifique as **Authorized redirect URIs** (URIs de redirecionamento autorizados), que devem incluir:
   - https://mtghelper.auth.us-east-2.amazoncognito.com/oauth2/idpresponse

## Passo 8: Verificar Configuração do NextAuth

O projeto usa NextAuth.js como uma camada de integração para autenticação. Certifique-se de que:

1. O pacote NextAuth está instalado:
   ```
   npm install next-auth
   ```

2. A configuração do NextAuth em `pages/api/auth/[...nextauth].js` ou `app/api/auth/[...nextauth]/route.js` aponta para o provedor Cognito correto.

3. O componente `SessionProvider` está sendo usado no layout da aplicação para gerenciar a sessão de autenticação.

Se você estiver vendo erros relacionados a `next-auth/react` não encontrado, execute o comando acima para instalar o pacote.

## Possíveis Causas do Erro "Login pages unavailable"

1. **Domínio do Hosted UI não está configurado**: Certifique-se de que um domínio válido está configurado para seu User Pool.
   
2. **App Client sem Hosted UI habilitado**: O App Client deve ter a opção "Hosted UI" habilitada.

3. **URLs de redirecionamento não configuradas**: Verifique se as URLs de redirecionamento incluem seus domínios locais e de produção.

4. **Provedor de identidade mal configurado**: O provedor Google pode não estar configurado corretamente ou estar desativado.

5. **Problemas nas permissões da API Google**: Verifique se o projeto Google tem as APIs OAuth necessárias ativadas.

## Após Fazer Alterações

Depois de fazer alterações na configuração do AWS Console, reinicie seu servidor e limpe o cache do navegador antes de testar novamente.

## Solução de Problemas Comuns

### Erro: Module not found: Can't resolve 'next-auth/react'

Este erro indica que o pacote NextAuth não está instalado. Execute:
```
npm install next-auth
```

### Erro: ENOENT: no such file or directory

Este tipo de erro pode ocorrer quando há problemas com o cache do Next.js. Para resolver:

1. Pare o servidor (Ctrl+C)
2. Execute o script de limpeza de cache: 
   ```
   .\clean-cache.bat
   ```
3. Reinicie o servidor:
   ```
   npm run dev
   ```

### Erros de Chunk Loading

Se você encontrar erros do tipo "ChunkLoadError", geralmente isso indica problemas com o cache ou com importações dinâmicas. Limpe o cache e reinicie:

1. Pare o servidor
2. Execute: `Remove-Item -Recurse -Force .next`
3. Execute: `npm cache clean --force`
4. Reinicie: `npm run dev`
