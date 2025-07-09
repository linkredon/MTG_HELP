import { getSession } from 'next-auth/react';
import { deckService } from '@/utils/awsApiService';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  // GET - Listar todos os decks do usuário
  if (req.method === 'GET') {
    try {
      const result = await deckService.getAll();
      
      if (!result.success) {
        return res.status(500).json({ success: false, message: 'Erro ao buscar decks' });
      }
      
      res.status(200).json({
        success: true,
        count: result.data.length,
        data: result.data
      });
    } catch (error) {
      console.error('Erro ao buscar decks:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar decks', error: error.message });
    }
  } 
  // POST - Criar um novo deck
  else if (req.method === 'POST') {
    try {
      const { name, description, format, colors } = req.body;
      
      const deckData = {
        name,
        description,
        format,
        colors: colors || [],
        cards: []
      };
      
      const result = await deckService.create(deckData);
      
      if (!result.success) {
        return res.status(500).json({ success: false, message: 'Erro ao criar deck' });
      }
      
      res.status(201).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Erro ao criar deck:', error);
      res.status(500).json({ success: false, message: 'Erro ao criar deck', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Método não permitido' });
  }
}