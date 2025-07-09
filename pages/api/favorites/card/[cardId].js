import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/dbConnect';
import Favorite from '@/models/Favorite';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  const { cardId } = req.query;

  await dbConnect();

  try {
    // Verificar se a carta está nos favoritos do usuário
    const favorite = await Favorite.findOne({ 
      user: session.user.id,
      'card.id': cardId
    });

    // GET - Verificar se a carta está nos favoritos
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        isFavorite: !!favorite,
        data: favorite || null
      });
    } 
    // DELETE - Remover carta dos favoritos
    else if (req.method === 'DELETE') {
      if (!favorite) {
        return res.status(404).json({ success: false, message: 'Carta não encontrada nos favoritos' });
      }

      await favorite.remove();

      res.status(200).json({
        success: true,
        data: {}
      });
    } else {
      res.status(405).json({ success: false, message: 'Método não permitido' });
    }
  } catch (error) {
    console.error(`Erro ao processar favorito para carta ${cardId}:`, error);
    res.status(500).json({ success: false, message: 'Erro ao processar favorito', error: error.message });
  }
}