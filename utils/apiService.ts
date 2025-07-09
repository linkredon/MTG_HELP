import { getSession } from 'next-auth/react';

// Tipos básicos para respostas da API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Função base para fazer requisições à API
async function fetchApi<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const session = await getSession();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session) {
      // Se houver sessão, adicionar token de autenticação
      headers['Authorization'] = `Bearer ${session.user.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`/api${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao processar requisição');
    }

    return data;
  } catch (error: any) {
    console.error(`Erro na API (${endpoint}):`, error);
    return {
      success: false,
      message: error.message || 'Erro desconhecido',
    };
  }
}

// Serviços de autenticação
export const authService = {
  register: (userData: any) => fetchApi<any>('/users/register', 'POST', userData),
  login: (credentials: any) => fetchApi<any>('/users/login', 'POST', credentials),
  getProfile: () => fetchApi<any>('/users/me'),
  updateProfile: (userData: any) => fetchApi<any>('/users/me', 'PUT', userData),
};

// Serviços de coleção
export const collectionService = {
  getAll: () => fetchApi<any>('/collections'),
  getById: (id: string) => fetchApi<any>(`/collections/${id}`),
  create: (collection: any) => fetchApi<any>('/collections', 'POST', collection),
  update: (id: string, collection: any) => fetchApi<any>(`/collections/${id}`, 'PUT', collection),
  delete: (id: string) => fetchApi<any>(`/collections/${id}`, 'DELETE'),
  
  // Cartas da coleção
  getCards: (collectionId: string) => fetchApi<any>(`/collections/${collectionId}/cards`),
  addCard: (collectionId: string, cardData: any) => 
    fetchApi<any>(`/collections/${collectionId}/cards`, 'POST', cardData),
  updateCard: (collectionId: string, cardId: string, cardData: any) => 
    fetchApi<any>(`/collections/${collectionId}/cards/${cardId}`, 'PUT', cardData),
  removeCard: (collectionId: string, cardId: string) => 
    fetchApi<any>(`/collections/${collectionId}/cards/${cardId}`, 'DELETE'),
};

// Serviços de deck
export const deckService = {
  getAll: () => fetchApi<any>('/decks'),
  getById: (id: string) => fetchApi<any>(`/decks/${id}`),
  create: (deck: any) => fetchApi<any>('/decks', 'POST', deck),
  update: (id: string, deck: any) => fetchApi<any>(`/decks/${id}`, 'PUT', deck),
  delete: (id: string) => fetchApi<any>(`/decks/${id}`, 'DELETE'),
  
  // Cartas do deck
  getCards: (deckId: string) => fetchApi<any>(`/decks/${deckId}/cards`),
  addCard: (deckId: string, cardData: any) => 
    fetchApi<any>(`/decks/${deckId}/cards`, 'POST', cardData),
  updateCard: (deckId: string, cardId: string, cardData: any) => 
    fetchApi<any>(`/decks/${deckId}/cards/${cardId}`, 'PUT', cardData),
  removeCard: (deckId: string, cardId: string) => 
    fetchApi<any>(`/decks/${deckId}/cards/${cardId}`, 'DELETE'),
};

// Serviços de favoritos
export const favoriteService = {
  getAll: () => fetchApi<any>('/favorites'),
  add: (card: any) => fetchApi<any>('/favorites', 'POST', { card }),
  remove: (id: string) => fetchApi<any>(`/favorites/${id}`, 'DELETE'),
  checkCard: (cardId: string) => fetchApi<any>(`/favorites/card/${cardId}`),
  removeCard: (cardId: string) => fetchApi<any>(`/favorites/card/${cardId}`, 'DELETE'),
};

// Serviços de proxy para Scryfall
export const scryfallService = {
  search: (query: string, order: string = 'name', dir: string = 'auto') => 
    fetchApi<any>(`/scryfall/search?q=${encodeURIComponent(query)}&order=${order}&dir=${dir}`),
  getCard: (id: string) => fetchApi<any>(`/scryfall/card/${id}`),
  getPrints: (name: string) => fetchApi<any>(`/scryfall/prints?name=${encodeURIComponent(name)}`),
};