import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Verificar ambiente
  const isProd = process.env.NODE_ENV === 'production';
  
  // Verificar cookies de autenticação do Amplify
  const amplifyAuth = req.cookies.get('amplify-signin-with-hostedUI')?.value;
  const amplifyTokens = req.cookies.get('amplify.auth.tokens')?.value;
  
  let userEmail = '';
  
  // Verificar autenticação Amplify
  if (amplifyAuth || amplifyTokens) {
    if (!isProd) console.log('API STATS: Autenticação Amplify detectada');
    
    // Extrair email do token
    try {
      if (amplifyTokens) {
        const tokensObj = JSON.parse(amplifyTokens);
        if (tokensObj.idToken?.payload?.email) {
          userEmail = tokensObj.idToken.payload.email;
        }
      }
    } catch (e) {
      console.error('Erro ao analisar token Amplify:', e);
    }
  } else {
    if (!isProd) console.log('API STATS: Autenticação não encontrada');
    
    // Em produção, exigimos autenticação
    if (isProd) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária' }, 
        { status: 401 }
      );
    }
  }

  try {
    let stats = {
      totalCards: 0,
      uniqueCards: 0,
      totalDecks: 0,
      totalFavorites: 0,
      collectionValue: 0,
      collectionsCount: 0,
      recentCards: [],
      colorDistribution: []
    };

    if (userEmail) {
      console.log('API STATS: Buscando dados para usuário:', userEmail);
      
      // Como não conseguimos acessar o DynamoDB diretamente no servidor,
      // vamos retornar dados simulados baseados no que sabemos que funciona
      // na página principal
      
      // Simular dados baseados no padrão que funciona
      const mockCollections = [
        {
          id: '1',
          name: 'Coleção Principal',
          cards: [
            {
              card: {
                name: 'Lightning Bolt',
                set_code: 'M10',
                rarity: 'Common',
                colors: ['R'],
                prices: { usd: '0.50' }
              },
              quantity: 4
            },
            {
              card: {
                name: 'Counterspell',
                set_code: 'M10',
                rarity: 'Uncommon',
                colors: ['U'],
                prices: { usd: '1.20' }
              },
              quantity: 2
            }
          ],
          createdAt: new Date().toISOString()
        }
      ];

      const mockDecks = [
        {
          id: '1',
          name: 'Deck de Teste',
          format: 'Standard',
          cards: []
        }
      ];

      const mockFavorites = [
        {
          id: '1',
          card: {
            name: 'Lightning Bolt',
            set_code: 'M10',
            rarity: 'Common'
          }
        }
      ];

      // Calcular estatísticas dos dados simulados
      let totalCards = 0;
      let uniqueCards = 0;
      let collectionValue = 0;
      const allCards: any[] = [];
      const colorCounts: { [key: string]: number } = {};

      // Processar coleções
      mockCollections.forEach(collection => {
        console.log('API STATS: Processando coleção:', collection.name);
        
        if (collection.cards && Array.isArray(collection.cards)) {
          collection.cards.forEach(card => {
            const quantity = card.quantity || 1;
            totalCards += quantity;
            uniqueCards++;
            
            // Calcular valor
            const price = parseFloat(card.card?.prices?.usd || '0');
            collectionValue += price * quantity;
            
            // Adicionar à lista de cartas recentes
            allCards.push({
              name: card.card.name,
              set: card.card.set_code,
              rarity: card.card.rarity,
              quantity: quantity,
              value: price,
              addedAt: collection.createdAt || new Date().toISOString()
            });

            // Calcular distribuição de cores
            const colors = card.card.colors || [];
            colors.forEach(color => {
              colorCounts[color] = (colorCounts[color] || 0) + quantity;
            });
          });
        }
      });

      // Calcular distribuição de cores
      const colorMap: { [key: string]: { name: string, bgColor: string } } = {
        'W': { name: 'Branco', bgColor: 'from-gray-200 to-gray-400' },
        'U': { name: 'Azul', bgColor: 'from-blue-500 to-blue-600' },
        'B': { name: 'Preto', bgColor: 'from-gray-700 to-gray-900' },
        'R': { name: 'Vermelho', bgColor: 'from-red-500 to-red-600' },
        'G': { name: 'Verde', bgColor: 'from-green-500 to-green-600' }
      };

      const colorDistribution = Object.entries(colorCounts)
        .map(([color, count]) => ({
          color: colorMap[color]?.name || color,
          percentage: totalCards > 0 ? (count / totalCards) * 100 : 0,
          count,
          bgColor: colorMap[color]?.bgColor || 'from-gray-500 to-gray-600'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Ordenar cartas por data de adição (mais recentes primeiro)
      allCards.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

      stats = {
        totalCards,
        uniqueCards,
        totalDecks: mockDecks.length,
        totalFavorites: mockFavorites.length,
        collectionValue,
        collectionsCount: mockCollections.length,
        recentCards: allCards.slice(0, 4),
        colorDistribution
      };

      console.log('API STATS: Estatísticas calculadas (dados simulados):', {
        totalCards,
        uniqueCards,
        totalDecks: mockDecks.length,
        totalFavorites: mockFavorites.length,
        collectionValue,
        collectionsCount: mockCollections.length
      });
    }

    return NextResponse.json({
      success: true,
      stats,
      note: 'Dados simulados - credenciais AWS não configuradas no servidor'
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
} 