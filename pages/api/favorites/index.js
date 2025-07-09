import { getSession } from 'next-auth/react';
import { favoriteService } from '@/utils/awsApiService';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  // GET - Listar todos os favoritos do usuário
  if (req.method === 'GET') {
    try {
      const result = await favoriteService.getAll();
      
      if (!result.success) {
        return res.status(500).json({ success: false, message: 'Erro ao buscar favoritos' });
      }
      
      res.status(200).json({
        success: true,
        count: result.data.length,
        data: result.data
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
      
      const result = await favoriteService.add(card);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message || 'Erro ao adicionar favorito'
        });
      }
      
      res.status(201).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      res.status(500).json({ success: false, message: 'Erro ao adicionar favorito', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Método não permitido' });
  }
}