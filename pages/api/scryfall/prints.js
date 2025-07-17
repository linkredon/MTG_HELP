import * as AmplifyAuth from '@/lib/aws-auth-adapter';
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
    // Extrair parâmetros da consulta
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nome da carta é obrigatório' });
    }

    // Construir URL para a API do Scryfall
    const url = new URL('https://api.scryfall.com/cards/search');
    url.searchParams.append('q', `!"${name}" unique:prints`);
    url.searchParams.append('order', 'released');
    url.searchParams.append('dir', 'desc');
    
    // Adicionar delay para evitar rate limiting
    await delay(parseInt(process.env.SCRYFALL_API_DELAY || '100'));
    
    // Fazer requisição para a API do Scryfall
    const response = await fetch(url.toString());
    const data = await response.json();
    
    // Retornar resposta
    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Erro ao buscar impressões da carta no Scryfall:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar impressões da carta', error: error.message });
  }
  } catch (authError) {
    console.error('Erro de autenticação:', authError);
    res.status(401).json({ success: false, message: 'Erro de autenticação', error: authError.message });
  }
}