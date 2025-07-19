const { DynamoDBClient, CreateTableCommand, ListTablesCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { Amplify } = require('aws-amplify');

// Configuração do Amplify
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-2_GIWZQN4d2',
      userPoolClientId: '55j5l3rcp164av86djhf9qpjch',
      identityPoolId: 'us-east-2:8681c7d7-6e0e-494f-9f0a-fe9f8d949db5',
      loginWith: {
        email: true,
        username: false,
        phone: false
      }
    }
  }
};

Amplify.configure(amplifyConfig);

// Nomes das tabelas
const TABLES = {
  USERS: 'mtg_users',
  COLLECTIONS: 'mtg_collections',
  DECKS: 'mtg_decks',
  FAVORITES: 'mtg_favorites'
};

// Definições das tabelas
const tableDefinitions = [
  // Tabela de usuários
  {
    TableName: TABLES.USERS,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  
  // Tabela de coleções
  {
    TableName: TABLES.COLLECTIONS,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  
  // Tabela de decks
  {
    TableName: TABLES.DECKS,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  
  // Tabela de favoritos
  {
    TableName: TABLES.FAVORITES,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }
];

// Função para obter credenciais do Amplify
async function getAmplifyCredentials() {
  try {
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    
    if (!session.credentials) {
      throw new Error('Não foi possível obter credenciais do Amplify');
    }
    
    return {
      accessKeyId: session.credentials.accessKeyId,
      secretAccessKey: session.credentials.secretAccessKey,
      sessionToken: session.credentials.sessionToken
    };
  } catch (error) {
    console.error('Erro ao obter credenciais do Amplify:', error);
    throw error;
  }
}

// Função para criar tabelas
async function createTables() {
  try {
    console.log('🔍 Obtendo credenciais do Amplify...');
    const credentials = await getAmplifyCredentials();
    
    // Configurar cliente DynamoDB com credenciais do Amplify
    const client = new DynamoDBClient({
      region: 'us-east-2',
      credentials
    });
    
    console.log('✅ Credenciais obtidas com sucesso');
    
    // Listar tabelas existentes
    console.log('📋 Listando tabelas existentes...');
    const { TableNames } = await client.send(new ListTablesCommand({}));
    console.log('Tabelas existentes:', TableNames);
    
    // Verificar e criar tabelas
    for (const tableDefinition of tableDefinitions) {
      if (!TableNames || !TableNames.includes(tableDefinition.TableName)) {
        console.log(`🔄 Criando tabela ${tableDefinition.TableName}...`);
        await client.send(new CreateTableCommand(tableDefinition));
        console.log(`✅ Tabela ${tableDefinition.TableName} criada com sucesso!`);
      } else {
        console.log(`ℹ️ Tabela ${tableDefinition.TableName} já existe.`);
        
        // Verificar se a tabela tem os índices corretos
        try {
          const { Table } = await client.send(new DescribeTableCommand({
            TableName: tableDefinition.TableName
          }));
          
          const existingIndexes = Table.GlobalSecondaryIndexes?.map(i => i.IndexName) || [];
          const expectedIndexes = tableDefinition.GlobalSecondaryIndexes?.map(i => i.IndexName) || [];
          
          console.log(`  - Índices existentes: ${existingIndexes.join(', ')}`);
          console.log(`  - Índices esperados: ${expectedIndexes.join(', ')}`);
          
          const missingIndexes = expectedIndexes.filter(index => !existingIndexes.includes(index));
          if (missingIndexes.length > 0) {
            console.log(`  ⚠️ Índices faltando: ${missingIndexes.join(', ')}`);
            console.log(`  💡 Para adicionar índices, você precisa recriar a tabela manualmente no console AWS`);
          }
        } catch (error) {
          console.log(`  ❌ Erro ao verificar índices: ${error.message}`);
        }
      }
    }
    
    console.log('🎉 Configuração do DynamoDB concluída!');
  } catch (error) {
    console.error('❌ Erro ao configurar tabelas do DynamoDB:', error);
  }
}

// Executar script
createTables(); 