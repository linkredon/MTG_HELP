# Configuração de Credenciais AWS

## Problema Identificado
As credenciais AWS não estão configuradas, por isso as APIs não conseguem acessar o DynamoDB.

## Soluções Possíveis

### 1. Configurar Credenciais AWS CLI (Recomendado)

#### Passo 1: Instalar AWS CLI
```bash
# Windows (usando chocolatey)
choco install awscli

# Ou baixar do site oficial
# https://aws.amazon.com/cli/
```

#### Passo 2: Configurar Credenciais
```bash
aws configure
```

Você precisará fornecer:
- **AWS Access Key ID**: Sua chave de acesso
- **AWS Secret Access Key**: Sua chave secreta
- **Default region name**: `us-east-2`
- **Default output format**: `json`

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# AWS Credentials
AMZ_ACCESS_KEY_ID=sua_access_key_aqui
AMZ_SECRET_ACCESS_KEY=sua_secret_key_aqui
AMZ_REGION=us-east-2

# DynamoDB Tables
DYNAMODB_USERS_TABLE=mtg_users
DYNAMODB_COLLECTIONS_TABLE=mtg_collections
DYNAMODB_DECKS_TABLE=mtg_decks
DYNAMODB_FAVORITES_TABLE=mtg_favorites
```

### 3. Obter Credenciais AWS

#### Se você usa AWS Amplify:
1. Acesse o [Console AWS Amplify](https://console.aws.amazon.com/amplify/)
2. Vá para seu projeto
3. Em "App settings" > "General" > "IAM service role"
4. Clique no link da role para acessar o IAM
5. Crie um usuário IAM com permissões para DynamoDB

#### Se você tem acesso direto ao AWS:
1. Acesse o [Console AWS IAM](https://console.aws.amazon.com/iam/)
2. Crie um novo usuário
3. Anexe a política `AmazonDynamoDBFullAccess` (ou uma política mais restrita)
4. Gere as credenciais de acesso

### 4. Política IAM Mínima

Se quiser criar uma política mais restrita, use:

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
                "dynamodb:ListTables",
                "dynamodb:DescribeTable"
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

### 5. Verificar Configuração

Após configurar, acesse:
```
http://localhost:3000/debug-tables
```

Isso deve mostrar:
- ✅ Credenciais configuradas
- ✅ Conexão com DynamoDB funcionando
- ✅ Tabelas listadas

### 6. Alternativa: Usar Credenciais Temporárias

Se você não quiser configurar credenciais permanentes, pode usar credenciais temporárias:

```env
AMZ_ACCESS_KEY_ID=ASIA...
AMZ_SECRET_ACCESS_KEY=...
AMZ_SESSION_TOKEN=...
```

## Próximos Passos

1. Configure as credenciais AWS
2. Teste a conexão em `/debug-tables`
3. Se funcionar, as estatísticas da página de perfil serão sincronizadas
4. Se não funcionar, verifique as permissões IAM

## Suporte

Se precisar de ajuda:
1. Verifique se as credenciais estão corretas
2. Confirme se a região é `us-east-2`
3. Verifique se as tabelas existem no DynamoDB
4. Teste a conexão usando AWS CLI: `aws dynamodb list-tables` 