import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/dbConnect';
import Collection from '@/models/Collection';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

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

    // GET - Obter detalhes da coleção
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        data: collection
      });
    } 
    // PUT - Atualizar coleção
    else if (req.method === 'PUT') {
      const { name, description, backgroundImage } = req.body;

      if (name) collection.name = name;
      if (description !== undefined) collection.description = description;
      if (backgroundImage !== undefined) collection.backgroundImage = backgroundImage;

      await collection.save();

      res.status(200).json({
        success: true,
        data: collection
      });
    } 
    // DELETE - Excluir coleção
    else if (req.method === 'DELETE') {
      await collection.remove();

      res.status(200).json({
        success: true,
        data: {}
      });
    } else {
      res.status(405).json({ success: false, message: 'Método não permitido' });
    }
  } catch (error) {
    console.error(`Erro ao processar coleção ${id}:`, error);
    res.status(500).json({ success: false, message: 'Erro ao processar coleção', error: error.message });
  }
}