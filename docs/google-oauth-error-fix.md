# Guia de Resolução: Google Error - 401 invalid_client Unauthorized

Este guia ajudará você a resolver o erro "Google Error - 401 invalid_client Unauthorized" que pode ocorrer ao tentar fazer login com o Google através do AWS Cognito.

## O que significa este erro?

O erro **401 invalid_client** indica que as credenciais do cliente OAuth (Client ID e Client Secret) não foram reconhecidas pelo Google. Isso pode ocorrer por diversos motivos:

1. As credenciais configuradas no AWS Cognito não correspondem às credenciais geradas no Google Cloud Console
2. O projeto no Google Cloud Console não tem o OAuth ativado ou está em modo de teste
3. Os URIs de redirecionamento não estão configurados corretamente

## Passos para resolver

### 1. Verificar as credenciais no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Vá para "APIs & Services" > "Credentials"
3. Encontre o projeto OAuth configurado para sua aplicação
4. Clique no ID do cliente OAuth para visualizar os detalhes
5. Anote o Client ID e Client Secret (ou crie um novo se necessário)

### 2. Verificar a configuração no AWS Cognito

1. Acesse o [AWS Console](https://console.aws.amazon.com/)
2. Navegue até o serviço Cognito
3. Selecione seu User Pool
4. Vá para "App integration" > "Identity providers"
5. Edite o provedor "Google"
6. Verifique se o Client ID e Client Secret correspondem exatamente aos valores do Google Cloud Console
7. Salve as alterações

### 3. Verificar os URIs de redirecionamento

#### No Google Cloud Console:

1. No seu projeto OAuth, verifique os "Authorized redirect URIs"
2. Certifique-se de que inclua:
   - `https://[seu-dominio-cognito]/oauth2/idpresponse`
   - Quaisquer outros URIs relevantes para sua aplicação

#### No AWS Cognito:

1. No seu User Pool, vá para "App integration" > "App client settings"
2. Verifique se os Callback URLs e Signout URLs estão configurados corretamente
3. Certifique-se de incluir todos os domínios necessários (local, desenvolvimento, produção)

### 4. Atualizar variáveis de ambiente

Verifique se seu arquivo `.env.local` contém as configurações corretas:

```
GOOGLE_CLIENT_ID=seu_client_id_do_google
GOOGLE_CLIENT_SECRET=seu_client_secret_do_google
NEXT_PUBLIC_COGNITO_DOMAIN=https://seu-dominio.auth.sua-regiao.amazoncognito.com
```

### 5. Verificar status do projeto no Google Cloud Console

1. No Google Cloud Console, vá para "APIs & Services" > "OAuth consent screen"
2. Verifique se o aplicativo está publicado (não está em modo de teste)
3. Se estiver em modo de teste, certifique-se de que seus usuários de teste estão incluídos

### 6. Recarregar e testar

Depois de fazer essas alterações:

1. Reinicie seu servidor de desenvolvimento
2. Limpe os cookies e cache do navegador
3. Tente o login novamente

## Ainda com problemas?

Se você ainda encontrar o erro após seguir esses passos:

1. Verifique os logs no AWS CloudWatch para obter mais detalhes
2. Examine a resposta completa do erro no console do navegador
3. Verifique se não há conflitos entre diferentes bibliotecas de autenticação em seu projeto
4. Considere regenerar novas credenciais OAuth no Google Cloud Console

Para assistência adicional, consulte a documentação oficial do [AWS Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-social-idp.html) e [Google OAuth](https://developers.google.com/identity/protocols/oauth2).
