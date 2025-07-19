const { DynamoDBClient, UpdateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
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
  USERS: 'mtg_users',
  COLLECTIONS: 'mtg_collections',
  DECKS: 'mtg_decks',
  FAVORITES: 'mtg_favorites'
};

async function createIndexes() {
  try {
    console.log('🔍 Verificando e criando índices nas tabelas DynamoDB...');
    
    // Verificar cada tabela
    for (const [tableKey, tableName] of Object.entries(TABLES)) {
      console.log(`\n📋 Verificando tabela: ${tableName}`);
      
      try {
        // Verificar se a tabela existe e quais índices tem
        const describeResult = await client.send(new DescribeTableCommand({
          TableName: tableName
        }));
        
        const existingIndexes = describeResult.Table.GlobalSecondaryIndexes || [];
        const hasUserIdIndex = existingIndexes.some(index => index.IndexName === 'UserIdIndex');
        
        if (hasUserIdIndex) {
          console.log(`✅ Índice UserIdIndex já existe na tabela ${tableName}`);
        } else {
          console.log(`❌ Índice UserIdIndex não existe na tabela ${tableName}`);
          console.log(`🔧 Criando índice UserIdIndex...`);
          
          // Criar o índice
          await client.send(new UpdateTableCommand({
            TableName: tableName,
            AttributeDefinitions: [
              {
                AttributeName: 'id',
                AttributeType: 'S'
              },
              {
                AttributeName: 'userId',
                AttributeType: 'S'
              }
            ],
            GlobalSecondaryIndexUpdates: [
              {
                Create: {
                  IndexName: 'UserIdIndex',
                  KeySchema: [
                    {
                      AttributeName: 'userId',
                      KeyType: 'HASH'
                    }
                  ],
                  Projection: {
                    ProjectionType: 'ALL'
                  },
                  ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                  }
                }
              }
            ]
          }));
          
          console.log(`✅ Índice UserIdIndex criado com sucesso na tabela ${tableName}`);
        }
        
      } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
          console.log(`❌ Tabela ${tableName} não existe`);
        } else {
          console.error(`❌ Erro ao verificar/criar índice para ${tableName}:`, error.message);
        }
      }
    }
    
    console.log('\n✅ Verificação de índices concluída!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o script
createIndexes(); 