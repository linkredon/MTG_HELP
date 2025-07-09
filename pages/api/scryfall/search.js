import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/dbConnect';

// Função para adicionar delay entre requisições para evitar rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  // Verificar se o usuário está autenticado (opcional para pesquisa pública)
  const session = await getSession({ req });
  
  // Conectar ao banco de dados para possível cache
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    // Extrair parâmetros da consulta
    const { q, order = 'name', dir = 'auto', page = 1 } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Parâmetro de busca (q) é obrigatório' });
    }

    // Construir URL para a API do Scryfall
    const url = new URL('https://api.scryfall.com/cards/search');
    url.searchParams.append('q', q);
    url.searchParams.append('order', order);
    url.searchParams.append('dir', dir);
    url.searchParams.append('page', page);
    
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
    console.error('Erro ao buscar cartas no Scryfall:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar cartas', error: error.message });
  }
}