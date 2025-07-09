import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/dbConnect';
import Collection from '@/models/Collection';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  await dbConnect();

  // GET - Listar todas as coleções do usuário
  if (req.method === 'GET') {
    try {
      const collections = await Collection.find({ user: session.user.id });
      
      res.status(200).json({
        success: true,
        count: collections.length,
        data: collections
      });
    } catch (error) {
      console.error('Erro ao buscar coleções:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar coleções', error: error.message });
    }
  } 
  // POST - Criar uma nova coleção
  else if (req.method === 'POST') {
    try {
      const { name, description } = req.body;
      
      const collection = await Collection.create({
        name,
        description,
        user: session.user.id,
        cards: []
      });
      
      res.status(201).json({
        success: true,
        data: collection
      });
    } catch (error) {
      console.error('Erro ao criar coleção:', error);
      res.status(500).json({ success: false, message: 'Erro ao criar coleção', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Método não permitido' });
  }
}