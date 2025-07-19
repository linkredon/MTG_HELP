const { DynamoDBClient, ListTablesCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

async function testPermissions() {
  try {
    console.log('🔍 Testando permissões do DynamoDB...');
    
    // Configurar cliente com credenciais do ambiente
    const client = new DynamoDBClient({
      region: process.env.AMZ_REGION || 'us-east-2',
      credentials: {
        accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
        secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY
      }
    });
    
    // Teste 1: Listar tabelas
    console.log('📋 Testando ListTables...');
    try {
      const listResult = await client.send(new ListTablesCommand({}));
      console.log('✅ ListTables funcionou:', listResult.TableNames);
    } catch (error) {
      console.error('❌ Erro em ListTables:', error.message);
    }
    
    // Teste 2: Descrever tabela de coleções
    console.log('📋 Testando DescribeTable para mtg_collections...');
    try {
      const describeResult = await client.send(new DescribeTableCommand({
        TableName: 'mtg_collections'
      }));
      console.log('✅ DescribeTable funcionou para mtg_collections');
      console.log('  - Status:', describeResult.Table.TableStatus);
      console.log('  - Chave primária:', describeResult.Table.KeySchema);
      console.log('  - Índices:', describeResult.Table.GlobalSecondaryIndexes?.map(i => i.IndexName) || []);
    } catch (error) {
      console.error('❌ Erro em DescribeTable para mtg_collections:', error.message);
    }
    
    // Teste 3: Descrever tabela de decks
    console.log('📋 Testando DescribeTable para mtg_decks...');
    try {
      const describeResult = await client.send(new DescribeTableCommand({
        TableName: 'mtg_decks'
      }));
      console.log('✅ DescribeTable funcionou para mtg_decks');
      console.log('  - Status:', describeResult.Table.TableStatus);
      console.log('  - Chave primária:', describeResult.Table.KeySchema);
      console.log('  - Índices:', describeResult.Table.GlobalSecondaryIndexes?.map(i => i.IndexName) || []);
    } catch (error) {
      console.error('❌ Erro em DescribeTable para mtg_decks:', error.message);
    }
    
    // Teste 4: Descrever tabela de favoritos
    console.log('📋 Testando DescribeTable para mtg_favorites...');
    try {
      const describeResult = await client.send(new DescribeTableCommand({
        TableName: 'mtg_favorites'
      }));
      console.log('✅ DescribeTable funcionou para mtg_favorites');
      console.log('  - Status:', describeResult.Table.TableStatus);
      console.log('  - Chave primária:', describeResult.Table.KeySchema);
      console.log('  - Índices:', describeResult.Table.GlobalSecondaryIndexes?.map(i => i.IndexName) || []);
    } catch (error) {
      console.error('❌ Erro em DescribeTable para mtg_favorites:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testPermissions(); 