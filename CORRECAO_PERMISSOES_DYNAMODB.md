# 🔧 Correção Manual das Permissões do DynamoDB

## ❌ Problema Identificado

O erro mostra que a role `amplify-mtghelp-main-e1d7b-authRole` não tem permissões para executar operações `Scan` no DynamoDB:

```
AccessDeniedException: User: arn:aws:sts::548334874057:assumed-role/amplify-mtghelp-main-e1d7b-authRole/CognitoIdentityCredentials is not authorized to perform: dynamodb:Scan on resource: arn:aws:dynamodb:us-east-2:548334874057:table/mtg_favorites because no identity-based policy allows the dynamodb:Scan action
```

## ✅ Solução Manual no Console AWS

### 1. Acesse o Console AWS IAM

1. Vá para [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Faça login com suas credenciais de administrador
3. Certifique-se de estar na região **us-east-2**

### 2. Localize a Role Autenticada

1. No menu lateral, clique em **Roles**
2. Procure pela role: `amplify-mtghelp-main-e1d7b-authRole`
3. Clique no nome da role

### 3. Adicione a Política Inline

1. Na página da role, clique na aba **Permissions**
2. Clique em **Add permissions** → **Create inline policy**
3. Clique na aba **JSON**
4. Cole o seguinte JSON:

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

### 4. Salve a Política

1. Clique em **Review policy**
2. Nome: `DynamoDBFullAccess`
3. Descrição: `Permissões completas para DynamoDB`
4. Clique em **Create policy**

### 5. Verifique se a Política foi Aplicada

1. Na página da role, na aba **Permissions**
2. Você deve ver a política `DynamoDBFullAccess` listada
3. A política deve ter o tipo "Inline policy"

## 🔍 Verificação

Após aplicar as permissões:

1. **Reinicie o servidor de desenvolvimento**
2. **Limpe o cache do navegador**
3. **Teste novamente a aplicação**

## 📋 Permissões Incluídas

- ✅ `GetItem` - Ler itens individuais
- ✅ `PutItem` - Criar novos itens
- ✅ `UpdateItem` - Atualizar itens existentes
- ✅ `DeleteItem` - Excluir itens
- ✅ `Query` - Consultar usando índices
- ✅ `Scan` - Escanear toda a tabela
- ✅ `BatchGetItem` - Operações em lote de leitura
- ✅ `BatchWriteItem` - Operações em lote de escrita

## 🎯 Tabelas Cobertas

- ✅ `mtg_users` - Tabela de usuários
- ✅ `mtg_collections` - Tabela de coleções
- ✅ `mtg_decks` - Tabela de decks
- ✅ `mtg_favorites` - Tabela de favoritos

## ⚠️ Importante

- **Região:** Certifique-se de estar na região `us-east-2`
- **Account ID:** O Account ID correto é `548334874057`
- **Role:** A role correta é `amplify-mtghelp-main-e1d7b-authRole`

Após aplicar essas permissões, o erro de `AccessDeniedException` deve ser resolvido. 