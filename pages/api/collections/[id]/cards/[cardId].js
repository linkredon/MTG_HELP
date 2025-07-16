import * as AmplifyAuth from '@aws-amplify/auth';
import dbConnect from '@/lib/dbConnect';
import Collection from '@/models/Collection';

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

  const { id, cardId } = req.query;

  await dbConnect();

  try {
    // Verificar se a coleção existe e pertence ao usuário
    const collection = await Collection.findOne({ 
      _id: id,
      user: session.user.id
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Coleção não encontrada' });
    }

    // Encontrar o índice da carta na coleção
    const cardIndex = collection.cards.findIndex(c => c._id.toString() === cardId);

    if (cardIndex === -1) {
      return res.status(404).json({ success: false, message: 'Carta não encontrada na coleção' });
    }

    // GET - Obter detalhes da carta
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        data: collection.cards[cardIndex]
      });
    } 
    // PUT - Atualizar carta
    else if (req.method === 'PUT') {
      const { quantity, condition, foil, language, notes } = req.body;

      if (quantity !== undefined) collection.cards[cardIndex].quantity = quantity;
      if (condition !== undefined) collection.cards[cardIndex].condition = condition;
      if (foil !== undefined) collection.cards[cardIndex].foil = foil;
      if (language !== undefined) collection.cards[cardIndex].language = language;
      if (notes !== undefined) collection.cards[cardIndex].notes = notes;

      await collection.save();

      res.status(200).json({
        success: true,
        data: collection.cards[cardIndex]
      });
    } 
    // DELETE - Remover carta da coleção
    else if (req.method === 'DELETE') {
      collection.cards.splice(cardIndex, 1);
      await collection.save();

      res.status(200).json({
        success: true,
        data: {}
      });
    } else {
      res.status(405).json({ success: false, message: 'Método não permitido' });
    }
  } catch (error) {
    console.error(`Erro ao processar carta ${cardId} da coleção ${id}:`, error);
    res.status(500).json({ success: false, message: 'Erro ao processar carta', error: error.message });
  }
  } catch (authError) {
    console.error('Erro de autenticação:', authError);
    res.status(401).json({ success: false, message: 'Erro de autenticação', error: authError.message });
  }
}