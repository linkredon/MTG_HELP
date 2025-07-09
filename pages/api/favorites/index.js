import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/dbConnect';
import Favorite from '@/models/Favorite';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  await dbConnect();

  // GET - Listar todos os favoritos do usuário
  if (req.method === 'GET') {
    try {
      const favorites = await Favorite.find({ user: session.user.id });
      
      res.status(200).json({
        success: true,
        count: favorites.length,
        data: favorites
      });
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar favoritos', error: error.message });
    }
  } 
  // POST - Adicionar carta aos favoritos
  else if (req.method === 'POST') {
    try {
      const { card } = req.body;
      
      // Verificar se a carta já está nos favoritos
      const existingFavorite = await Favorite.findOne({
        user: session.user.id,
        'card.id': card.id
      });
      
      if (existingFavorite) {
        return res.status(400).json({
          success: false,
          message: 'Carta já está nos favoritos'
        });
      }
      
      // Adicionar aos favoritos
      const favorite = await Favorite.create({
        user: session.user.id,
        card,
        addedAt: new Date()
      });
      
      res.status(201).json({
        success: true,
        data: favorite
      });
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      res.status(500).json({ success: false, message: 'Erro ao adicionar favorito', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Método não permitido' });
  }
}