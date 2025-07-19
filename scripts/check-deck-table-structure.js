const { DynamoDBClient, DescribeTableCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

// Configuração do cliente DynamoDB
const client = new DynamoDBClient({
  region: process.env.AMZ_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
    secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY
  }
});

async function checkDeckTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela mtg_decks...');
    
    // 1. Descrever a tabela
    const { Table } = await client.send(new DescribeTableCommand({
      TableName: 'mtg_decks'
    }));
    
    console.log('📋 Estrutura da tabela mtg_decks:');
    console.log('  - Nome:', Table.TableName);
    console.log('  - Status:', Table.TableStatus);
    console.log('  - Chave primária:', Table.KeySchema);
    console.log('  - Atributos:', Table.AttributeDefinitions);
    console.log('  - Índices:', Table.GlobalSecondaryIndexes);
    
    // 2. Fazer um scan para ver alguns itens existentes
    console.log('\n📊 Verificando itens existentes...');
    const scanResult = await client.send(new ScanCommand({
      TableName: 'mtg_decks',
      Limit: 5
    }));
    
    console.log('  - Total de itens:', scanResult.Count);
    console.log('  - Itens escaneados:', scanResult.ScannedCount);
    
    if (scanResult.Items && scanResult.Items.length > 0) {
      console.log('  - Exemplo de item:');
      console.log('    ', JSON.stringify(scanResult.Items[0], null, 2));
    }
    
    // 3. Verificar se há itens com deckId vs id
    console.log('\n🔍 Verificando chaves dos itens...');
    if (scanResult.Items) {
      scanResult.Items.forEach((item, index) => {
        console.log(`  Item ${index + 1}:`);
        console.log('    - Chaves presentes:', Object.keys(item));
        console.log('    - Tem id:', 'id' in item);
        console.log('    - Tem deckId:', 'deckId' in item);
        console.log('    - Tem deckID:', 'deckID' in item);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura da tabela:', error);
    
    if (error.name === 'ResourceNotFoundException') {
      console.error('  - Tabela mtg_decks não existe');
    } else if (error.name === 'AccessDeniedException') {
      console.error('  - Sem permissão para acessar a tabela');
    } else {
      console.error('  - Erro desconhecido:', error.message);
    }
  }
}

checkDeckTableStructure(); 