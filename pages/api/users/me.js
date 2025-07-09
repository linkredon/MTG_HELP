import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  await dbConnect();

  try {
    // Obter usuário atual
    const user = await User.findById(session.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Método GET - Retornar dados do usuário
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          joinedAt: user.joinedAt,
          collectionsCount: user.collectionsCount,
          totalCards: user.totalCards,
          achievements: user.achievements
        }
      });
    } 
    // Método PUT - Atualizar dados do usuário
    else if (req.method === 'PUT') {
      const { name, avatar } = req.body;

      // Atualizar campos
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;

      await user.save();

      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          joinedAt: user.joinedAt,
          collectionsCount: user.collectionsCount,
          totalCards: user.totalCards,
          achievements: user.achievements
        }
      });
    } else {
      res.status(405).json({ success: false, message: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao processar requisição do usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar requisição', error: error.message });
  }
}