# Implantação do MTG Helper no AWS Amplify

Este documento explica como implantar o MTG Helper no AWS Amplify com o backend conectado.

## Pré-requisitos

- Conta AWS
- AWS CLI configurado
- Amplify CLI instalado e configurado

## Configuração do Backend

O backend do MTG Helper já está configurado com:

- API GraphQL (AppSync)
- Autenticação (Cognito)
- Armazenamento de dados (DynamoDB)

### Detalhes do Backend

- **GraphQL Endpoint**: https://tgjs5yokcrexbjcijkmpsxpboi.appsync-api.us-east-1.amazonaws.com/graphql
- **API Key**: da2-zkfmwqyrvfa43pono2uqis7hpe
- **User Pool ID**: us-east-1_xp6aEKHJp
- **Web Client ID**: 2kabivqe0q5kvv2e79lhh4eb4c
- **Região**: us-east-1

## Conectando o Backend ao Hosting

Para conectar o backend ao ambiente de hospedagem do Amplify:

1. No console do Amplify, vá para seu aplicativo
2. Vá para "Environment variables" (Variáveis de ambiente)
3. Adicione as seguintes variáveis de ambiente:

```
AMPLIFY_API_ENDPOINT=https://tgjs5yokcrexbjcijkmpsxpboi.appsync-api.us-east-1.amazonaws.com/graphql
AMPLIFY_API_KEY=da2-zkfmwqyrvfa43pono2uqis7hpe
AMPLIFY_AUTH_USER_POOL_ID=us-east-1_xp6aEKHJp
AMPLIFY_AUTH_USER_POOL_WEB_CLIENT_ID=2kabivqe0q5kvv2e79lhh4eb4c
AMPLIFY_REGION=us-east-1
```

4. Reimplante o aplicativo

## Configuração Manual do Backend

Se precisar recriar o backend:

```bash
amplify init
amplify add auth
amplify add api
amplify push
```

## Administração de Usuários

Para criar um usuário administrador:

1. Acesse o AWS Console > Cognito > User Pools
2. Selecione o User Pool `us-east-1_xp6aEKHJp`
3. Vá para "Users" (Usuários)
4. Crie um novo usuário ou selecione um existente
5. Adicione o atributo personalizado `custom:role` com valor `admin`

Ou use o script fornecido:

```bash
node scripts/set-admin.js seu-email@exemplo.com
```

## Solução de Problemas

Se encontrar problemas com a conexão do backend:

1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Certifique-se de que o arquivo `aws-exports.js` está sendo importado corretamente
3. Verifique os logs do console para erros específicos

Para mais informações, consulte a [documentação do Amplify](https://docs.amplify.aws/).