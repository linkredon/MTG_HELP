// Script para testar a estrutura da tabela no browser
// Este script pode ser executado no console do browser

async function testTableStructure() {
  try {
    console.log('🔍 Testando estrutura da tabela mtg_decks...');
    
    // Importar AWS SDK (se disponível)
    const { DynamoDBClient, DescribeTableCommand, ScanCommand, GetCommand } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');
    
    // Configurar cliente usando credenciais do Amplify
    const client = new DynamoDBClient({
      region: 'us-east-2'
    });
    
    const docClient = DynamoDBDocumentClient.from(client);
    
    // Testar diferentes chaves para um deck específico
    const deckId = '6c5a2e13-6f1d-4cec-b89a-672d1b4a8f13';
    const keyStructures = [
      { deckId },
      { id: deckId },
      { _id: deckId },
      { deck_id: deckId },
      { deckID: deckId }
    ];
    
    console.log('🧪 Testando diferentes estruturas de chave...');
    
    for (const keyStructure of keyStructures) {
      try {
        console.log(`🔄 Tentando:`, keyStructure);
        const params = {
          TableName: 'mtg_decks',
          Key: keyStructure
        };
        
        const result = await docClient.send(new GetCommand(params));
        if (result.Item) {
          console.log(`✅ Sucesso com chave:`, Object.keys(keyStructure)[0]);
          console.log('📋 Item encontrado:', result.Item);
          return result.Item;
        }
      } catch (error) {
        console.log(`❌ Falhou com chave:`, Object.keys(keyStructure)[0], error.message);
      }
    }
    
    // Se nenhuma chave funcionou, tentar scan
    console.log('🔄 Tentando scan...');
    const scanResult = await docClient.send(new ScanCommand({
      TableName: 'mtg_decks',
      Limit: 5
    }));
    
    console.log('📊 Resultado do scan:', scanResult);
    
    if (scanResult.Items && scanResult.Items.length > 0) {
      const targetDeck = scanResult.Items.find(item => 
        item.id === deckId || item.deckId === deckId
      );
      
      if (targetDeck) {
        console.log('🎯 Deck encontrado via scan:', targetDeck);
        console.log('🔑 Chaves disponíveis:', Object.keys(targetDeck));
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar o teste
testTableStructure(); 