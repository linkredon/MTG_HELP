import { getSession } from 'next-auth/react';
import { collectionService } from '@/utils/awsApiService';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  const { id } = req.query;

  try {
    // GET - Obter detalhes da coleção
    if (req.method === 'GET') {
      const result = await collectionService.getById(id);
      
      if (!result.success) {
        return res.status(404).json({ success: false, message: 'Coleção não encontrada' });
      }
      
      // Verificar se a coleção pertence ao usuário
      if (result.data.userId !== session.user.id) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }
      
      res.status(200).json({
        success: true,
        data: result.data
      });
    } 
    // PUT - Atualizar coleção
    else if (req.method === 'PUT') {
      const { name, description, backgroundImage } = req.body;
      
      const updates = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (backgroundImage !== undefined) updates.backgroundImage = backgroundImage;
      
      const result = await collectionService.update(id, updates);
      
      if (!result.success) {
        return res.status(404).json({ success: false, message: 'Erro ao atualizar coleção' });
      }
      
      res.status(200).json({
        success: true,
        data: result.data
      });
    } 
    // DELETE - Excluir coleção
    else if (req.method === 'DELETE') {
      const result = await collectionService.delete(id);
      
      if (!result.success) {
        return res.status(404).json({ success: false, message: 'Erro ao excluir coleção' });
      }
      
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