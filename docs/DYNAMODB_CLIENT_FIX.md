# Corrigindo o erro UnrecognizedClientException no AWS DynamoDB

## Problema

O erro `UnrecognizedClientException` ocorre quando tentamos acessar o DynamoDB no lado do cliente da aplicação, mas as credenciais não são reconhecidas pela AWS ou estão ausentes.

Trecho do erro:
```
UnrecognizedClientException
    at throwDefaultError (webpack-internal:///(app-pages-browser)/./node_modules/@smithy/smithy-client/dist-es/default-error-handler.js:11:22)
    ...
    at async Object.getByUserId (webpack-internal:///(app-pages-browser)/./lib/awsDbConnect.ts:144:28)
```

## Causa

Este problema acontece por diversos motivos:

1. **Uso direto de credenciais no lado do cliente**: As credenciais estáticas definidas no arquivo `awsConfig.ts` não estão disponíveis no navegador (lado do cliente).

2. **Falta de Credenciais Temporárias**: No lado do cliente, precisamos usar credenciais temporárias obtidas através do AWS Cognito Identity Pool.

3. **Separação Cliente/Servidor**: O Next.js tem componentes que rodam no servidor e outros no cliente, e a configuração do DynamoDB precisa ser diferente em cada ambiente.

## Solução Implementada

Criamos uma solução abrangente para este problema:

### 1. Criação de uma configuração específica para o cliente

Criamos o arquivo `awsClientAuth.ts` que:
- Obtém credenciais temporárias do AWS Cognito Identity Pool
- Armazena essas credenciais em cache para evitar chamadas desnecessárias
- Configura um cliente DynamoDB com essas credenciais temporárias

```typescript
export async function getDynamoDbClientAsync() {
  // Obter credenciais temporárias
  const credentials = await getTemporaryCredentials();
  
  // Configurar cliente DynamoDB
  const client = new DynamoDBClient({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    }
  });
  
  // Retornar cliente documento
  return DynamoDBDocumentClient.from(client);
}
```

### 2. Modificação na configuração do servidor

Atualizamos o arquivo `awsConfig.ts` para:
- Detectar o ambiente (cliente vs servidor)
- Criar um cliente apropriado apenas no lado do servidor
- Usar variáveis de ambiente específicas para o servidor

### 3. Ferramenta de Diagnóstico

Criamos uma ferramenta de diagnóstico em `/aws-diagnostic` que:
- Testa a conexão com o DynamoDB usando credenciais temporárias
- Mostra informações detalhadas sobre erros de conexão
- Fornece orientações sobre como resolver problemas

## Como usar a solução

1. **Nos componentes do servidor**:
   Continue usando a importação normal do `awsConfig.ts`

2. **Nos componentes do cliente**:
   Use a nova função assíncrona:
   ```typescript
   import { getDynamoDbClientAsync, TABLES } from '@/lib/awsClientAuth';
   
   // Dentro de um componente React:
   const handleAction = async () => {
     const dynamoDb = await getDynamoDbClientAsync();
     
     // Usar o cliente normalmente
     const result = await dynamoDb.send(new QueryCommand({
       TableName: TABLES.COLLECTIONS,
       // ...
     }));
   };
   ```

3. **Para diagnosticar problemas**:
   Acesse a rota `/aws-diagnostic` na aplicação para usar a ferramenta de diagnóstico interativa.

## Observações Importantes

- Certifique-se de que o Cognito Identity Pool está configurado para fornecer acesso ao DynamoDB
- As credenciais temporárias têm prazo de validade, por isso implementamos um sistema de cache
- Se ainda enfrentar problemas, verifique as permissões no IAM para o Identity Pool

---

Esta solução garante que as operações do DynamoDB funcionem corretamente tanto no lado do servidor quanto no lado do cliente, enquanto mantém as credenciais AWS seguras.
