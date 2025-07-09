# Implantação do MTG Helper na AWS

Este guia fornece instruções para implantar o MTG Helper na Amazon Web Services (AWS).

## Pré-requisitos

1. Conta na AWS
2. AWS CLI instalado e configurado
3. Node.js 18+ instalado

## Configuração do DynamoDB

### 1. Criar tabelas no DynamoDB

Execute o script de configuração:

```bash
npm run setup-db
```

Este script criará as seguintes tabelas:
- `mtg_users` - Armazena informações dos usuários
- `mtg_collections` - Armazena coleções de cartas
- `mtg_decks` - Armazena decks
- `mtg_favorites` - Armazena cartas favoritas

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Preencha as variáveis com suas credenciais da AWS:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
```

## Implantação com AWS Amplify

### 1. Configurar o AWS Amplify

1. Acesse o console do AWS Amplify
2. Clique em "New app" > "Host web app"
3. Escolha seu provedor de repositório (GitHub, GitLab, etc.)
4. Selecione o repositório e a branch
5. Configure as variáveis de ambiente:
   - `NEXTAUTH_URL`: URL do seu site (ex: https://seu-app.amplifyapp.com)
   - `NEXTAUTH_SECRET`: Uma string aleatória para segurança
   - `AWS_REGION`: Região da AWS (ex: us-east-1)
   - `AWS_ACCESS_KEY_ID`: Sua chave de acesso da AWS
   - `AWS_SECRET_ACCESS_KEY`: Sua chave secreta da AWS
   - `AWS_DYNAMODB_USERS_TABLE`: Nome da tabela de usuários (ex: mtg_users)
   - `AWS_DYNAMODB_COLLECTIONS_TABLE`: Nome da tabela de coleções (ex: mtg_collections)
   - `AWS_DYNAMODB_DECKS_TABLE`: Nome da tabela de decks (ex: mtg_decks)
   - `AWS_DYNAMODB_FAVORITES_TABLE`: Nome da tabela de favoritos (ex: mtg_favorites)
   - `SCRYFALL_API_DELAY`: Delay entre requisições à API do Scryfall (ex: 100)

6. Clique em "Save and deploy"

### 2. Configurar domínio personalizado (opcional)

1. No console do Amplify, vá para "App settings" > "Domain management"
2. Clique em "Add domain"
3. Siga as instruções para configurar seu domínio personalizado

## Considerações de segurança

1. **IAM**: Crie um usuário IAM específico para o aplicativo com permissões limitadas ao DynamoDB
2. **Chaves de API**: Não exponha suas chaves de API no código-fonte
3. **CORS**: Configure corretamente as políticas de CORS se necessário

## Monitoramento e logs

1. Configure o CloudWatch para monitorar o aplicativo
2. Verifique os logs do Amplify para solucionar problemas

## Otimização de custos

1. Use o nível gratuito do DynamoDB quando possível
2. Configure o Auto Scaling para o DynamoDB
3. Monitore o uso para evitar cobranças inesperadas