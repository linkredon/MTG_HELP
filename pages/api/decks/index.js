import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/dbConnect';
import Deck from '@/models/Deck';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  await dbConnect();

  // GET - Listar todos os decks do usuário
  if (req.method === 'GET') {
    try {
      const decks = await Deck.find({ user: session.user.id });
      
      res.status(200).json({
        success: true,
        count: decks.length,
        data: decks
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
      
      const deck = await Deck.create({
        name,
        description,
        format,
        colors: colors || [],
        user: session.user.id,
        cards: []
      });
      
      res.status(201).json({
        success: true,
        data: deck
      });
    } catch (error) {
      console.error('Erro ao criar deck:', error);
      res.status(500).json({ success: false, message: 'Erro ao criar deck', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Método não permitido' });
  }
}