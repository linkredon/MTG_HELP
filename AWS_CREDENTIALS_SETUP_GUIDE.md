# Guia de Configuração das Credenciais AWS

## Problema Atual
O sistema está apresentando erro `UnrecognizedClientException: The security token included in the request is invalid` porque as credenciais AWS não estão configuradas corretamente.

## Solução

### 1. Criar arquivo .env.local

Crie um arquivo chamado `.env.local` na raiz do projeto com o seguinte conteúdo:

```bash
# AWS Credentials (Configure estas variáveis com suas credenciais AWS)
AMZ_ACCESS_KEY_ID=your_aws_access_key_id_here
AMZ_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AMZ_REGION=us-east-2

# DynamoDB Table Names
DYNAMODB_USERS_TABLE=mtg_users
DYNAMODB_COLLECTIONS_TABLE=mtg_collections
DYNAMODB_DECKS_TABLE=mtg_decks
DYNAMODB_FAVORITES_TABLE=mtg_favorites

# Amplify Configuration
NEXT_PUBLIC_USER_POOL_ID=us-east-2_GIWZQN4d2
NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID=55j5l3rcp164av86djhf9qpjch
NEXT_PUBLIC_REGION=us-east-2
NEXT_PUBLIC_COGNITO_DOMAIN=mtghelper.auth.us-east-2.amazoncognito.com
```

### 2. Obter Credenciais AWS

#### Opção A: Usando AWS CLI (Recomendado)

1. **Instalar AWS CLI** (se ainda não tiver):
   ```bash
   # Windows
   winget install -e --id Amazon.AWSCLI
   
   # macOS
   brew install awscli
   
   # Linux
   sudo apt-get install awscli
   ```

2. **Configurar AWS CLI**:
   ```bash
   aws configure
   ```

3. **Inserir suas credenciais**:
   - AWS Access Key ID: `sua_access_key_aqui`
   - AWS Secret Access Key: `sua_secret_key_aqui`
   - Default region name: `us-east-2`
   - Default output format: `json`

#### Opção B: Criar IAM User

1. Acesse o [AWS Console](https://console.aws.amazon.com/)
2. Vá para **IAM** → **Users** → **Create user**
3. Dê um nome ao usuário (ex: `mtg-helper-user`)
4. Anexe a política `AmazonDynamoDBFullAccess`
5. Crie o usuário e copie as credenciais

### 3. Verificar Configuração

Após configurar as credenciais, teste acessando:

**http://localhost:3000/debug-tables**

Você deve ver:
- ✅ Configurações AWS
- ✅ Teste de credenciais
- ✅ Status das tabelas
- ✅ Acesso ao DynamoDB

### 4. Reiniciar o Servidor

Após criar o arquivo `.env.local`, reinicie o servidor:

```bash
npm run dev
```

### 5. Testar Aplicação

Agora você deve conseguir:
- Fazer login normalmente
- Acessar a página de perfil do usuário
- Ver estatísticas reais do DynamoDB

## Troubleshooting

### Se ainda houver problemas:

1. **Verificar se o arquivo .env.local foi criado corretamente**
2. **Verificar se as credenciais estão corretas**
3. **Verificar se o usuário IAM tem permissões para DynamoDB**
4. **Acessar http://localhost:3000/auth-fix para limpar autenticação**

### Permissões IAM Necessárias

O usuário IAM precisa das seguintes permissões:

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
                "dynamodb:Scan",
                "dynamodb:ListTables"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-east-2:*:table/mtg_users",
                "arn:aws:dynamodb:us-east-2:*:table/mtg_collections",
                "arn:aws:dynamodb:us-east-2:*:table/mtg_decks",
                "arn:aws:dynamodb:us-east-2:*:table/mtg_favorites"
            ]
        }
    ]
}
```

## Próximos Passos

Após configurar as credenciais:

1. **Teste o login**: http://localhost:3000/login
2. **Teste a página de perfil**: http://localhost:3000/user/profile
3. **Verifique as estatísticas**: Devem aparecer dados reais do DynamoDB

**Me avise quando tiver configurado as credenciais para continuarmos!** 🔧 