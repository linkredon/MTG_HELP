import * as AmplifyAuth from '@/lib/aws-auth-adapter';
import dbConnect from '@/lib/dbConnect';
import Deck from '@/models/Deck';

export default async function handler(req, res) {
  try {
    const user = await AmplifyAuth.getCurrentUser();
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Não autorizado' });
    }
    
    // Criar objeto de sessão compatível com o código existente
    const session = {
      user: {
        id: user.userId,
        username: user.username
      }
    };

  if (!session) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  const { id } = req.query;

  await dbConnect();

  try {
    // Verificar se o deck existe e pertence ao usuário
    const deck = await Deck.findOne({ 
      _id: id,
      user: session.user.id
    });

    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck não encontrado' });
    }

    // GET - Listar cartas do deck
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        count: deck.cards.length,
        data: deck.cards
      });
    } 
    // POST - Adicionar carta ao deck
    else if (req.method === 'POST') {
      const { card, quantity = 1, isSideboard = false, isCommander = false, category } = req.body;

      // Verificar se a carta já existe no deck
      const existingCardIndex = deck.cards.findIndex(
        c => c.card.id === card.id && c.isSideboard === isSideboard
      );

      if (existingCardIndex !== -1) {
        // Atualizar quantidade se a carta já existe
        deck.cards[existingCardIndex].quantity += quantity;
      } else {
        // Determinar categoria da carta
        let cardCategory = category;
        if (!cardCategory) {
          if (card.type_line) {
            if (card.type_line.toLowerCase().includes('creature')) {
              cardCategory = 'creature';
            } else if (card.type_line.toLowerCase().includes('instant')) {
              cardCategory = 'instant';
            } else if (card.type_line.toLowerCase().includes('sorcery')) {
              cardCategory = 'sorcery';
            } else if (card.type_line.toLowerCase().includes('artifact')) {
              cardCategory = 'artifact';
            } else if (card.type_line.toLowerCase().includes('enchantment')) {
              cardCategory = 'enchantment';
            } else if (card.type_line.toLowerCase().includes('planeswalker')) {
              cardCategory = 'planeswalker';
            } else if (card.type_line.toLowerCase().includes('land')) {
              cardCategory = 'land';
            } else {
              cardCategory = 'other';
            }
          } else {
            cardCategory = 'other';
          }
        }

        // Adicionar nova carta
        deck.cards.push({
          card,
          quantity,
          isSideboard,
          isCommander,
          category: cardCategory
        });
      }

      await deck.save();

      res.status(200).json({
        success: true,
        data: deck.cards
      });
    } 
    // DELETE - Remover todas as cartas do deck
    else if (req.method === 'DELETE') {
      deck.cards = [];
      await deck.save();

      res.status(200).json({
        success: true,
        data: []
      });
    } else {
      res.status(405).json({ success: false, message: 'Método não permitido' });
    }
  } catch (error) {
    console.error(`Erro ao processar cartas do deck ${id}:`, error);
    res.status(500).json({ success: false, message: 'Erro ao processar cartas', error: error.message });
  }
  } catch (authError) {
    console.error('Erro de autenticação:', authError);
    res.status(401).json({ success: false, message: 'Erro de autenticação', error: authError.message });
  }
}