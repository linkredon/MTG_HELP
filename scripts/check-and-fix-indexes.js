// Script para verificar e corrigir índices das tabelas DynamoDB
// Este script deve ser executado no navegador

console.log('🔍 Verificando índices das tabelas DynamoDB...');

// Função para verificar se os índices existem
async function checkIndexes() {
  try {
    // Importar o serviço de banco de dados
    const { awsClientDbService } = await import('../lib/awsClientDbService.ts');
    
    // Testar cada tabela
    const tables = ['mtg_collections', 'mtg_decks', 'mtg_favorites'];
    
    for (const tableName of tables) {
      console.log(`\n📋 Verificando tabela: ${tableName}`);
      
      try {
        // Tentar uma consulta que usa o índice
        const result = await awsClientDbService.getByUserId(tableName, 'test-user-id');
        
        if (result.success) {
          console.log(`✅ Tabela ${tableName} está funcionando`);
          console.log(`   - Resultado: ${result.data?.length || 0} itens encontrados`);
        } else {
          console.log(`❌ Erro na tabela ${tableName}:`, result.error);
        }
      } catch (error) {
        console.log(`❌ Erro ao testar tabela ${tableName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar índices:', error);
  }
}

// Função para criar índices (se necessário)
async function createIndexes() {
  try {
    console.log('\n🔧 Criando índices...');
    
    // Nota: Para criar índices, você precisa:
    // 1. Ir ao console AWS
    // 2. Navegar para DynamoDB
    // 3. Selecionar cada tabela
    // 4. Ir para a aba "Indexes"
    // 5. Criar o índice "UserIdIndex" com:
    //    - Partition key: userId (String)
    //    - Projection type: ALL
    
    console.log('📝 Instruções para criar índices manualmente:');
    console.log('1. Acesse o console AWS');
    console.log('2. Vá para DynamoDB > Tables');
    console.log('3. Para cada tabela (mtg_collections, mtg_decks, mtg_favorites):');
    console.log('   - Clique na tabela');
    console.log('   - Vá para a aba "Indexes"');
    console.log('   - Clique "Create index"');
    console.log('   - Partition key: userId (String)');
    console.log('   - Projection type: ALL');
    console.log('   - Index name: UserIdIndex');
    console.log('   - Clique "Create index"');
    
  } catch (error) {
    console.error('❌ Erro ao criar índices:', error);
  }
}

// Executar verificação
checkIndexes().then(() => {
  createIndexes();
}); 