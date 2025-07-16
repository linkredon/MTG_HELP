import * as AmplifyAuth from '@aws-amplify/auth';
import dbConnect from '@/lib/dbConnect';

// Função para adicionar delay entre requisições para evitar rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  // Verificar se o usuário está autenticado (opcional para pesquisa pública)
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
  
  // Conectar ao banco de dados para possível cache
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID da carta é obrigatório' });
    }

    // Adicionar delay para evitar rate limiting
    await delay(parseInt(process.env.SCRYFALL_API_DELAY || '100'));
    
    // Fazer requisição para a API do Scryfall
    const response = await fetch(`https://api.scryfall.com/cards/${id}`);
    const data = await response.json();
    
    // Retornar resposta
    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Erro ao buscar carta no Scryfall:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar carta', error: error.message });
  }
  } catch (authError) {
    console.error('Erro de autenticação:', authError);
    res.status(401).json({ success: false, message: 'Erro de autenticação', error: authError.message });
  }
}