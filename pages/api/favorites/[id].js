import * as AmplifyAuth from '@aws-amplify/auth';
import dbConnect from '@/lib/dbConnect';
import Favorite from '@/models/Favorite';

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
    // Verificar se o favorito existe e pertence ao usuário
    const favorite = await Favorite.findOne({ 
      _id: id,
      user: session.user.id
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorito não encontrado' });
    }

    // GET - Obter detalhes do favorito
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        data: favorite
      });
    } 
    // DELETE - Remover dos favoritos
    else if (req.method === 'DELETE') {
      await favorite.remove();

      res.status(200).json({
        success: true,
        data: {}
      });
    } else {
      res.status(405).json({ success: false, message: 'Método não permitido' });
    }
  } catch (error) {
    console.error(`Erro ao processar favorito ${id}:`, error);
    res.status(500).json({ success: false, message: 'Erro ao processar favorito', error: error.message });
  }
  } catch (authError) {
    console.error('Erro de autenticação:', authError);
    res.status(401).json({ success: false, message: 'Erro de autenticação', error: authError.message });
  }
}