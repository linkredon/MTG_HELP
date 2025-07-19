const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

// Configuração do cliente DynamoDB
const client = new DynamoDBClient({
  region: process.env.AMZ_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
    secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY
  }
});

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela mtg_decks...');
    
    const { Table } = await client.send(new DescribeTableCommand({
      TableName: 'mtg_decks'
    }));
    
    console.log('📋 Estrutura da tabela mtg_decks:');
    console.log('  - Nome:', Table.TableName);
    console.log('  - Status:', Table.TableStatus);
    console.log('  - Chave primária:', Table.KeySchema);
    console.log('  - Atributos:', Table.AttributeDefinitions);
    console.log('  - Índices:', Table.GlobalSecondaryIndexes);
    
    // Verificar se a chave primária é 'id'
    const hashKey = Table.KeySchema.find(key => key.KeyType === 'HASH');
    if (hashKey) {
      console.log('✅ Chave primária encontrada:', hashKey.AttributeName);
      if (hashKey.AttributeName === 'id') {
        console.log('✅ Estrutura correta - chave primária é "id"');
      } else {
        console.log('❌ Estrutura incorreta - chave primária deveria ser "id", mas é:', hashKey.AttributeName);
      }
    } else {
      console.log('❌ Nenhuma chave primária encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura da tabela:', error);
    
    if (error.name === 'ResourceNotFoundException') {
      console.log('❌ Tabela mtg_decks não existe');
      console.log('💡 Execute o script setup-dynamodb.js para criar a tabela');
    }
  }
}

checkTableStructure(); 