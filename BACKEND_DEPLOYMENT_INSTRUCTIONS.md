# 🚀 Instruções para Deploy no Backend Online

## 📋 Pré-requisitos

### 1. Dependências Necessárias
Certifique-se de que o backend online tenha as seguintes dependências instaladas:

```bash
# Dependências principais
npm install bcryptjs
npm install @types/bcryptjs

# Dependências do AWS Amplify (se ainda não estiverem instaladas)
npm install aws-amplify
npm install @aws-amplify/ui-react
```

### 2. Variáveis de Ambiente
Configure as seguintes variáveis de ambiente no seu backend:

```env
# AWS Amplify Configuration
AMZ_ACCESS_KEY_ID=sua_access_key
AMZ_SECRET_ACCESS_KEY=sua_secret_key
AMZ_REGION=us-east-2

# Cognito Configuration
COGNITO_USER_POOL_ID=us-east-2_GIWZQN4d2
COGNITO_CLIENT_ID=55j5l3rcp164av86djhf9qpjch
COGNITO_IDENTITY_POOL_ID=us-east-2:8681c7d7-6e0e-494f-9f0a-fe9f8d949db5

# DynamoDB Configuration
DYNAMODB_TABLE_NAME=mtghelp-users
DYNAMODB_REGION=us-east-2

# Environment
NODE_ENV=production
```

## 🔧 Configurações do Backend

### 1. API Routes Necessárias

Certifique-se de que as seguintes rotas API estejam funcionando:

#### `/api/users/me` (GET)
- Retorna dados do usuário autenticado
- Deve verificar cookies do Amplify
- Retorna dados do DynamoDB

#### `/api/users/update` (PUT)
- Atualiza dados do perfil do usuário
- Aceita: name, nickname, avatar, bio, theme
- Salva no DynamoDB

#### `/api/users/change-password` (PUT)
- Altera senha do usuário
- Aceita: currentPassword, newPassword
- Valida senha atual e faz hash da nova senha

#### `/api/auth/logout` (POST)
- Faz logout do usuário
- Limpa cookies do Amplify
- Redireciona para login

### 2. Estrutura do DynamoDB

Certifique-se de que a tabela `mtghelp-users` tenha a seguinte estrutura:

```json
{
  "id": "string (partition key)",
  "email": "string",
  "name": "string",
  "nickname": "string",
  "avatar": "string",
  "bio": "string",
  "theme": "string",
  "password": "string (hashed)",
  "role": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### 3. Permissões IAM

Configure as seguintes permissões para o DynamoDB:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-2:*:table/mtghelp-users"
    }
  ]
}
```

## 🚀 Passos para Deploy

### 1. Verificar Dependências
```bash
# No diretório do projeto
npm install
npm run build
```

### 2. Configurar Variáveis de Ambiente
- Acesse o painel de controle do seu provedor de hosting
- Configure todas as variáveis de ambiente listadas acima
- Certifique-se de que `NODE_ENV=production`

### 3. Deploy da Aplicação
```bash
# Para Vercel
vercel --prod

# Para Netlify
netlify deploy --prod

# Para AWS Amplify
amplify push
```

### 4. Verificar APIs
Após o deploy, teste as seguintes URLs:

```
https://seu-dominio.com/api/users/me
https://seu-dominio.com/api/users/update
https://seu-dominio.com/api/users/change-password
https://seu-dominio.com/api/auth/logout
```

## 🔍 Troubleshooting

### Problema: Erro 500 nas APIs
**Solução:**
1. Verifique se o bcryptjs está instalado
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique os logs do servidor

### Problema: Erro de Autenticação
**Solução:**
1. Verifique se os cookies do Amplify estão sendo enviados
2. Confirme se as configurações do Cognito estão corretas
3. Teste o login manualmente

### Problema: Erro de Permissões DynamoDB
**Solução:**
1. Verifique se a role IAM tem as permissões corretas
2. Confirme se a tabela existe e está acessível
3. Teste a conexão com o DynamoDB

## 📝 Checklist de Deploy

- [ ] Dependências instaladas (bcryptjs, aws-amplify)
- [ ] Variáveis de ambiente configuradas
- [ ] APIs funcionando corretamente
- [ ] DynamoDB configurado e acessível
- [ ] Permissões IAM configuradas
- [ ] Aplicação fazendo build sem erros
- [ ] Deploy realizado com sucesso
- [ ] Testes de funcionalidade realizados

## 🆘 Suporte

Se encontrar problemas durante o deploy:

1. **Logs do Servidor**: Verifique os logs de erro
2. **Console do Navegador**: Abra o DevTools e verifique erros
3. **Network Tab**: Verifique se as requisições estão sendo feitas
4. **Cookies**: Confirme se os cookies de autenticação estão presentes

## 📞 Contato

Para suporte adicional, consulte:
- Documentação do AWS Amplify
- Logs de erro do servidor
- Console do navegador para erros de frontend 