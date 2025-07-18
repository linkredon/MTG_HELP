const { DynamoDBClient, DescribeTableCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

// Configuração do cliente DynamoDB
const client = new DynamoDBClient({
  region: process.env.AMZ_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
    secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela mtg_decks...');
    
    // Descrever a tabela
    const describeResult = await docClient.send(new DescribeTableCommand({
      TableName: 'mtg_decks'
    }));
    
    console.log('📋 Estrutura da tabela:');
    console.log('  - Nome:', describeResult.Table.TableName);
    console.log('  - Status:', describeResult.Table.TableStatus);
    
    console.log('🔑 Chave primária:');
    describeResult.Table.KeySchema.forEach(key => {
      console.log(`    - ${key.AttributeName} (${key.KeyType})`);
    });
    
    console.log('📊 Definições de atributos:');
    describeResult.Table.AttributeDefinitions.forEach(attr => {
      console.log(`    - ${attr.AttributeName}: ${attr.AttributeType}`);
    });
    
    if (describeResult.Table.GlobalSecondaryIndexes) {
      console.log('🔍 Índices secundários globais:');
      describeResult.Table.GlobalSecondaryIndexes.forEach(index => {
        console.log(`    - ${index.IndexName}:`);
        index.KeySchema.forEach(key => {
          console.log(`      ${key.AttributeName} (${key.KeyType})`);
        });
      });
    }
    
    // Fazer um scan para ver os dados
    console.log('\n📊 Dados na tabela:');
    const scanResult = await docClient.send(new ScanCommand({
      TableName: 'mtg_decks',
      Limit: 5
    }));
    
    console.log(`  - Total de itens: ${scanResult.Count}`);
    console.log(`  - Itens escaneados: ${scanResult.ScannedCount}`);
    
    if (scanResult.Items && scanResult.Items.length > 0) {
      console.log('  - Estrutura do primeiro item:');
      const firstItem = scanResult.Items[0];
      Object.keys(firstItem).forEach(key => {
        console.log(`    - ${key}: ${typeof firstItem[key]} = ${JSON.stringify(firstItem[key])}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura da tabela:', error);
  }
}

checkTableStructure(); 