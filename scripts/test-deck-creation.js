// Script para testar criação de deck no contexto do navegador
// Execute este script no console do navegador

console.log('🧪 Testando criação de deck...');

// Função para testar criação de deck
async function testDeckCreation() {
  try {
    // Importar o serviço
    const { deckService } = await import('../utils/awsApiService.ts');
    
    // Dados de teste
    const testDeckData = {
      name: 'Deck de Teste',
      format: 'Standard',
      colors: ['W', 'U'],
      description: 'Deck de teste para verificar estrutura'
    };
    
    console.log('📋 Dados de teste:', testDeckData);
    
    // Tentar criar o deck
    const result = await deckService.create(testDeckData);
    
    console.log('📊 Resultado da criação:', result);
    
    if (result.success) {
      console.log('✅ Deck criado com sucesso!');
      console.log('📋 Dados do deck criado:', result.data);
    } else {
      console.log('❌ Erro ao criar deck:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar o teste
testDeckCreation(); 