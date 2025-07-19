# 🔧 Correção de Permissões do DynamoDB

## ❌ Problema Identificado

O erro mostra que a role `amplify-mtghelp-main-e1d7b-authRole` não tem permissões para executar operações `Scan` no DynamoDB:

```
AccessDeniedException: User: arn:aws:sts::548334874057:assumed-role/amplify-mtghelp-main-e1d7b-authRole/CognitoIdentityCredentials is not authorized to perform: dynamodb:Scan on resource: arn:aws:dynamodb:us-east-2:548334874057:table/mtg_collections
```

## ✅ Solução Manual

### 1. Acesse o Console AWS IAM

1. Vá para [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Faça login com suas credenciais de administrador

### 2. Localize a Role

1. No menu lateral, clique em **Roles**
2. Procure pela role: `amplify-mtghelp-main-e1d7b-authRole`
3. Clique no nome da role

### 3. Adicione a Política

1. Na página da role, clique na aba **Permissions**
2. Clique em **Add permissions** > **Create inline policy**
3. Clique na aba **JSON**
4. Cole o seguinte conteúdo:

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
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_users",
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_collections",
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_decks",
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_favorites",
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_users/index/*",
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_collections/index/*",
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_decks/index/*",
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_favorites/index/*"
      ]
    }
  ]
}
```

5. Clique em **Review policy**
6. Nome da política: `DynamoDBFullAccess`
7. Descrição: `Permissões completas para tabelas MTG no DynamoDB`
8. Clique em **Create policy**

### 4. Verificação

Após adicionar a política, a aplicação deve funcionar corretamente. As permissões incluem:

- ✅ **GetItem, PutItem, UpdateItem, DeleteItem** - Operações básicas
- ✅ **Query, Scan** - Consultas e buscas
- ✅ **BatchGetItem, BatchWriteItem** - Operações em lote
- ✅ **Acesso a todas as tabelas MTG e seus índices**

## 🔍 Teste

Após aplicar as permissões:

1. Recarregue a página da aplicação
2. Verifique se os dados são carregados corretamente
3. Teste a criação de decks e coleções

## 📋 Permissões Adicionadas

A política permite acesso completo às seguintes tabelas:
- `mtg_users` - Usuários
- `mtg_collections` - Coleções
- `mtg_decks` - Decks
- `mtg_favorites` - Favoritos

E todos os seus índices secundários. 