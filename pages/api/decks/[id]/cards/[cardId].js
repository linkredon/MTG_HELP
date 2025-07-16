import * as AmplifyAuth from '@aws-amplify/auth';
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

  const { id, cardId } = req.query;

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

    // Encontrar o índice da carta no deck
    const cardIndex = deck.cards.findIndex(c => c._id.toString() === cardId);

    if (cardIndex === -1) {
      return res.status(404).json({ success: false, message: 'Carta não encontrada no deck' });
    }

    // GET - Obter detalhes da carta
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        data: deck.cards[cardIndex]
      });
    } 
    // PUT - Atualizar carta
    else if (req.method === 'PUT') {
      const { quantity, isSideboard, isCommander, category } = req.body;

      if (quantity !== undefined) deck.cards[cardIndex].quantity = quantity;
      if (isSideboard !== undefined) deck.cards[cardIndex].isSideboard = isSideboard;
      if (isCommander !== undefined) deck.cards[cardIndex].isCommander = isCommander;
      if (category !== undefined) deck.cards[cardIndex].category = category;

      await deck.save();

      res.status(200).json({
        success: true,
        data: deck.cards[cardIndex]
      });
    } 
    // DELETE - Remover carta do deck
    else if (req.method === 'DELETE') {
      deck.cards.splice(cardIndex, 1);
      await deck.save();

      res.status(200).json({
        success: true,
        data: {}
      });
    } else {
      res.status(405).json({ success: false, message: 'Método não permitido' });
    }
  } catch (error) {
    console.error(`Erro ao processar carta ${cardId} do deck ${id}:`, error);
    res.status(500).json({ success: false, message: 'Erro ao processar carta', error: error.message });
  }
  } catch (authError) {
    console.error('Erro de autenticação:', authError);
    res.status(401).json({ success: false, message: 'Erro de autenticação', error: authError.message });
  }
}