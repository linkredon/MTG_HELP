# Guia de Configuração do DynamoDB

## Problema
As tabelas DynamoDB necessárias não existem, causando o erro `ResourceNotFoundException: Requested resource not found`.

## Solução
Execute os seguintes comandos AWS CLI para criar as tabelas necessárias:

###1la mtg_collections
```bash
aws dynamodb create-table \
  --table-name mtg_collections \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput=[object Object]ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-2
```

### 2. Tabela mtg_decks
```bash
aws dynamodb create-table \
  --table-name mtg_decks \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput=[object Object]ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-2
```

### 3. Tabela mtg_favorites
```bash
aws dynamodb create-table \
  --table-name mtg_favorites \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput=[object Object]ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-2
```

### 4. Tabela mtg_users
```bash
aws dynamodb create-table \
  --table-name mtg_users \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=email,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput=[object Object]ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-2
```

## Verificação
Após criar as tabelas, você pode verificar se foram criadas corretamente:

```bash
aws dynamodb list-tables --region us-east-2
```

## Alternativa via Console AWS
Se preferir usar o console AWS:

1. Acesse o Console AWS DynamoDB](https://console.aws.amazon.com/dynamodb/)
2. Clique emCreate table"
3. Para cada tabela:
   - **Table name**: mtg_collections, mtg_decks, mtg_favorites, mtg_users
   - **Partition key**: id (String)
   - **Sort key**: (deixe vazio)
   - **Indexes**: Adicione o índice UserIdIndex (ou EmailIndex para users)
   - **Capacity**: Provisioned (5read,5te)

## Após criar as tabelas
1einicie o servidor de desenvolvimento: `npm run dev`
2. Teste o login novamente
3. As tabelas agora devem ser encontradas e a aplicação funcionará normalmente 