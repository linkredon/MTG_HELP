const { DynamoDBClient, DescribeTableCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { Amplify } = require('@aws-amplify/core');
const awsExports = require('../aws-exports.js').default;

// Configurar Amplify
Amplify.configure(awsExports);

async function diagnoseTableStructure() {
  try {
    console.log('🔍 Diagnosticando estrutura da tabela mtg_decks...');
    console.log('📋 Configuração do Amplify:', {
      region: awsExports.aws_project_region,
      identityPoolId: awsExports.aws_cognito_identity_pool_id
    });
    
    // Criar cliente DynamoDB usando credenciais do Amplify
    const client = new DynamoDBClient({
      region: awsExports.aws_project_region
    });
    
    const docClient = DynamoDBDocumentClient.from(client);
    
    // Descrever a tabela
    console.log('📊 Descrevendo tabela...');
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
      
      // Verificar se há um deck específico
      const targetDeckId = '6c5a2e13-6f1d-4cec-b89a-672d1b4a8f13';
      const targetDeck = scanResult.Items.find(item => 
        item.id === targetDeckId || 
        item.deckId === targetDeckId || 
        item._id === targetDeckId
      );
      
      if (targetDeck) {
        console.log(`\n🎯 Deck alvo encontrado:`, targetDeck);
        console.log('🔑 Chaves disponíveis:', Object.keys(targetDeck));
      } else {
        console.log(`\n❌ Deck alvo não encontrado no scan`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao diagnosticar estrutura da tabela:', error);
    console.error('📋 Detalhes do erro:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
  }
}

diagnoseTableStructure(); 