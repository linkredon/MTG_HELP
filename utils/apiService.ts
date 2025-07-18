import { fetchAuthSession } from '@/lib/auth-adapter';

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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    try {
      // Tentar obter a sessão do Amplify
      const authSession = await fetchAuthSession();
      if (authSession?.tokens?.idToken) {
        // Usar o token JWT para autenticação (corrigido para usar idToken em vez de accessToken)
        headers['Authorization'] = `Bearer ${authSession.tokens.idToken.jwtToken}`;
      }
    } catch (authError) {
      // Se não conseguir obter a sessão, continuar sem autenticação
      console.log('Não foi possível obter sessão de autenticação:', authError);
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

    // Se a resposta não for ok, mas não for erro de autenticação, retornar erro
    if (!response.ok) {
      // Se for erro 401 (não autorizado), retornar sucesso false mas não lançar erro
      if (response.status === 401) {
        return {
          success: false,
          message: 'Não autorizado',
          error: 'AUTH_ERROR'
        };
      }
      throw new Error(data.message || 'Erro ao processar requisição');
    }

    return data;
  } catch (error: any) {
    console.error(`Erro na API (${endpoint}):`, error);
    
    // Se for erro de rede ou timeout, retornar erro específico
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Erro de conexão',
        error: 'NETWORK_ERROR'
      };
    }
    
    return {
      success: false,
      message: error.message || 'Erro desconhecido',
      error: 'UNKNOWN_ERROR'
    };
  }
}

// Função para fazer requisições autenticadas à API
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    // Tentar obter sessão de autenticação
    const authSession = await fetchAuthSession();
    
    // Preparar headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Adicionar token de autenticação se disponível
    if (authSession?.tokens?.idToken) {
      // Usar o token JWT do idToken 
      headers['Authorization'] = `Bearer ${authSession.tokens.idToken.jwtToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao processar requisição');
    }

    return data;
  } catch (error: any) {
    console.error(`Erro na requisição (${url}):`, error);
    throw error;
  }
}

// Serviços de autenticação
export const authService = {
  register: (userData: any) => fetchApi<any>('/auth/register', 'POST', userData),
  login: (credentials: any) => fetchApi<any>('/auth/login', 'POST', credentials),
  getProfile: () => fetchApi<any>('/auth/me'),
  updateProfile: (userData: any) => fetchApi<any>('/auth/me', 'PUT', userData),
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