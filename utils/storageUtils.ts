import type { MTGCard, UserCollection, CollectionCard, Deck } from '@/types/mtg';

/**
 * Função para truncar dados de cartas para economizar espaço no localStorage
 * Remove informações não essenciais das cartas
 */
export const truncateCardData = (card: MTGCard): Partial<MTGCard> => {
  return {
    id: card.id,
    name: card.name,
    set: card.set,
    set_code: card.set_code,
    type_line: card.type_line,
    cmc: card.cmc,
    colors: card.colors,
    rarity: card.rarity
  };
};

/**
 * Função segura para salvar no localStorage com tratamento de quota excedida
 */
export const safeLocalStorageSave = (key: string, data: any): boolean => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error);
    
    // Se for erro de quota, tente limpar dados não essenciais
    if (error instanceof DOMException && 
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn('Quota excedida. Tentando salvar versão reduzida...');
      
      try {
        // Para coleções, remova detalhes das cartas mantendo apenas IDs e quantidades
        if (key === 'mtg-collections') {
          const simplifiedCollections = data.map((collection: UserCollection) => ({
            ...collection,
            cards: collection.cards.map(card => ({
              quantity: card.quantity,
              card: truncateCardData(card.card),
              condition: card.condition,
              foil: card.foil,
              language: card.language
            }))
          }));
          localStorage.setItem(key, JSON.stringify(simplifiedCollections));
          return true;
        }
        
        // Para decks, também simplifique os dados das cartas
        if (key === 'mtg-decks') {
          const simplifiedDecks = data.map((deck: Deck) => ({
            ...deck,
            cards: deck.cards.map(card => ({
              quantity: card.quantity,
              category: card.category,
              card: truncateCardData(card.card)
            }))
          }));
          localStorage.setItem(key, JSON.stringify(simplifiedDecks));
          return true;
        }
        
        // Para favoritos, simplifique os dados das cartas
        if (key === 'mtg-favorites') {
          const simplifiedFavorites = data.map((card: MTGCard) => truncateCardData(card));
          localStorage.setItem(key, JSON.stringify(simplifiedFavorites));
          return true;
        }
      } catch (innerError) {
        console.error('Falha ao salvar versão reduzida:', innerError);
      }
    }
    return false;
  }
};