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

    // GET - Obter detalhes do deck
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        data: deck
      });
    } 
    // PUT - Atualizar deck
    else if (req.method === 'PUT') {
      const { name, description, format, colors, coverImage, isPublic } = req.body;

      if (name) deck.name = name;
      if (description !== undefined) deck.description = description;
      if (format) deck.format = format;
      if (colors) deck.colors = colors;
      if (coverImage !== undefined) deck.coverImage = coverImage;
      if (isPublic !== undefined) deck.isPublic = isPublic;

      await deck.save();

      res.status(200).json({
        success: true,
        data: deck
      });
    } 
    // DELETE - Excluir deck
    else if (req.method === 'DELETE') {
      await deck.remove();

      res.status(200).json({
        success: true,
        data: {}
      });
    } else {
      res.status(405).json({ success: false, message: 'Método não permitido' });
    }
  } catch (error) {
    console.error(`Erro ao processar deck ${id}:`, error);
    res.status(500).json({ success: false, message: 'Erro ao processar deck', error: error.message });
  }
  } catch (authError) {
    console.error('Erro de autenticação:', authError);
    res.status(401).json({ success: false, message: 'Erro de autenticação', error: authError.message });
  }
}