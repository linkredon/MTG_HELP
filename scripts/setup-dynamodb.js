const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

// Configuração do cliente DynamoDB
const client = new DynamoDBClient({
  region: process.env.AMZ_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
    secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY
  }
});

// Nomes das tabelas
const TABLES = {
  USERS: process.env.DYNAMO_USERS_TABLE || 'mtg_users',
  COLLECTIONS: process.env.DYNAMO_COLLECTIONS_TABLE || 'mtg_collections',
  DECKS: process.env.DYNAMO_DECKS_TABLE || 'mtg_decks',
  FAVORITES: process.env.DYNAMO_FAVORITES_TABLE || 'mtg_favorites'
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

// Função para criar tabelas
async function createTables() {
  try {
    // Listar tabelas existentes
    const { TableNames } = await client.send(new ListTablesCommand({}));
    
    // Criar tabelas que não existem
    for (const tableDefinition of tableDefinitions) {
      if (!TableNames || !TableNames.includes(tableDefinition.TableName)) {
        console.log(`Criando tabela ${tableDefinition.TableName}...`);
        await client.send(new CreateTableCommand(tableDefinition));
        console.log(`Tabela ${tableDefinition.TableName} criada com sucesso!`);
      } else {
        console.log(`Tabela ${tableDefinition.TableName} já existe.`);
      }
    }
    
    console.log('Configuração do DynamoDB concluída!');
  } catch (error) {
    console.error('Erro ao configurar tabelas do DynamoDB:', error);
  }
}

// Executar script
createTables();