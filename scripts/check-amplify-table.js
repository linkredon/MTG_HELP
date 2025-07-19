const { DynamoDBClient, DescribeTableCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { Amplify } = require('@aws-amplify/core');
const awsExports = require('../aws-exports.js').default;

// Configurar Amplify
Amplify.configure(awsExports);

async function checkAmplifyTable() {
  try {
    console.log('🔍 Verificando estrutura da tabela mtg_decks usando credenciais do Amplify...');
    
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
    }
    
    // Testar criação de um item de teste
    console.log('\n🧪 Testando criação de item...');
    const testItem = {
      id: 'test-deck-' + Date.now(),
      userID: 'test-user-id',
      name: 'Test Deck',
      format: 'Standard',
      colors: ['Red'],
      description: 'Test deck for validation',
      isPublic: false,
      tags: ['test'],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    console.log('📋 Item de teste:', testItem);
    
    try {
      const putResult = await docClient.send(new (require('@aws-sdk/client-dynamodb').PutCommand)({
        TableName: 'mtg_decks',
        Item: testItem
      }));
      console.log('✅ Item de teste criado com sucesso!');
      
      // Remover o item de teste
      await docClient.send(new (require('@aws-sdk/client-dynamodb').DeleteCommand)({
        TableName: 'mtg_decks',
        Key: { id: testItem.id }
      }));
      console.log('🗑️ Item de teste removido');
      
    } catch (createError) {
      console.error('❌ Erro ao criar item de teste:', createError);
      console.error('📋 Detalhes do erro:', {
        message: createError.message,
        name: createError.name,
        code: createError.code
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura da tabela:', error);
    console.error('📋 Detalhes do erro:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
  }
}

checkAmplifyTable(); 