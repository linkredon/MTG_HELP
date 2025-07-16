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

  const { id } = req.query;

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

    // GET - Listar cartas da coleção
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        count: collection.cards.length,
        data: collection.cards
      });
    } 
    // POST - Adicionar carta à coleção
    else if (req.method === 'POST') {
      const { card, quantity = 1, condition = 'Near Mint', foil = false, language = 'English', notes = '' } = req.body;

      // Verificar se a carta já existe na coleção
      const existingCardIndex = collection.cards.findIndex(
        c => c.card.id === card.id && c.foil === foil && c.condition === condition && c.language === language
      );

      if (existingCardIndex !== -1) {
        // Atualizar quantidade se a carta já existe
        collection.cards[existingCardIndex].quantity += quantity;
      } else {
        // Adicionar nova carta
        collection.cards.push({
          card,
          quantity,
          condition,
          foil,
          language,
          notes,
          addedAt: new Date()
        });
      }

      await collection.save();

      res.status(200).json({
        success: true,
        data: collection.cards
      });
    } 
    // DELETE - Remover todas as cartas da coleção
    else if (req.method === 'DELETE') {
      collection.cards = [];
      await collection.save();

      res.status(200).json({
        success: true,
        data: []
      });
    } else {
      res.status(405).json({ success: false, message: 'Método não permitido' });
    }
  } catch (error) {
    console.error(`Erro ao processar cartas da coleção ${id}:`, error);
    res.status(500).json({ success: false, message: 'Erro ao processar cartas', error: error.message });
  }
  } catch (authError) {
    console.error('Erro de autenticação:', authError);
    res.status(401).json({ success: false, message: 'Erro de autenticação', error: authError.message });
  }
}