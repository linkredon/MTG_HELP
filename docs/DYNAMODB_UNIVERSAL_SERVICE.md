# Solução Universal para DynamoDB em Ambientes Cliente e Servidor

## Problema Original

O projeto estava enfrentando um erro `TypeError: Cannot read properties of null (reading 'send')` quando tentava acessar o cliente DynamoDB no lado do cliente (browser). Isso ocorria porque:

1. O arquivo `awsConfig.ts` foi modificado para retornar `null` quando executado no navegador
2. O serviço `awsDbConnect.ts` continuava tentando acessar métodos do cliente sem verificar se ele era nulo

## Solução Implementada

Foi criada uma arquitetura universal de acesso ao DynamoDB que funciona tanto no lado do servidor quanto no lado do cliente, sem necessidade de modificar os serviços existentes.

### Componentes da Solução

1. **Cliente DynamoDB para o Navegador (`awsClientDbService.ts`)**
   - Implementa todas as operações CRUD usando credenciais temporárias do Cognito Identity Pool
   - Usa o `getDynamoDbClientAsync()` para obter um cliente DynamoDB autenticado no navegador

2. **Comandos Personalizados (`awsDbCommands.ts`)**
   - Implementa classes para os comandos não disponíveis no pacote oficial:
     - `UpdateCommand`
     - `DeleteCommand`
     - `ScanCommand`

3. **Serviço Universal (`universalDbService.ts`)**
   - Detecta automaticamente o ambiente (cliente ou servidor)
   - Encaminha as chamadas para o serviço apropriado:
     - `clientDbService` no navegador
     - `awsDbService` no servidor
   - Mantém a mesma interface, tornando a transição transparente

### Como Funciona

1. O serviço universal é importado pelos arquivos que precisam acessar o DynamoDB
2. Quando chamado no servidor, usa o cliente DynamoDB tradicional com as credenciais do servidor
3. Quando chamado no cliente, usa automaticamente o cliente configurado com credenciais temporárias

## Benefícios

- **Transparência:** Não é necessário modificar o código para verificar se está no cliente ou servidor
- **Código mais limpo:** Elimina verificações condicionais nos serviços de API
- **Segurança:** No cliente, usa apenas credenciais temporárias com permissões limitadas
- **Reutilização de código:** Mantém a mesma interface entre os ambientes

## Utilização

```typescript
// Importar o serviço universal
import { universalDbService } from '@/lib/universalDbService';

// Usar normalmente, sem se preocupar com o ambiente
const result = await universalDbService.getByUserId(TABLES.COLLECTIONS, userId);
```

Este padrão permite que o código funcione consistentemente em:
- Componentes do servidor Next.js
- Componentes do cliente React
- API Routes
- Funções de ação do servidor

## Notas sobre Desempenho

No lado do cliente, o serviço mantém um único cliente DynamoDB em memória para evitar múltiplas inicializações. As credenciais são armazenadas em cache até expirarem, quando são renovadas automaticamente.
