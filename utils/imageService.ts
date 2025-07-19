/**
 * Serviço para manipulação e priorização de imagens de cartas de Magic: The Gathering
 * Com foco em priorizar imagens em português do Brasil
 */

/**
 * Verifica se uma carta tem imagens em português do Brasil disponíveis
 * e as retorna prioritariamente
 * 
 * @param card A carta a ser verificada
 * @returns URLs das imagens, priorizando PT-BR
 */
export const getPrioritizedImages = (card: any): any => {
  try {
    // Verificar se card é válido
    if (!card) {
      console.warn('Card é undefined ou null');
      return null;
    }
    
    // Log para debug da estrutura da carta
    console.log('🔍 Estrutura da carta recebida:', {
      name: card.name,
      hasImageUris: !!card.image_uris,
      hasPrintsSearchUri: !!card.prints_search_uri,
      hasCardFaces: !!card.card_faces,
      keys: Object.keys(card)
    });
    
    // Se não tiver versões impressas, retorna as imagens padrão
    if (!card.prints_search_uri && !card.image_uris) {
      // Tentar usar URL direta se disponível
      if (card.image_url) {
        return { normal: card.image_url };
      }
      
      return card.image_uris || (card.card_faces?.[0]?.image_uris ? { 
        isDoubleFaced: true,
        front: card.card_faces[0].image_uris,
        back: card.card_faces[1]?.image_uris
      } : null);
    }
    
    // Se a carta já estiver em português, prioriza ela mesma
    if (card.lang === 'pt' || card.lang === 'pt-br') {
      return card.image_uris || (card.card_faces?.[0]?.image_uris ? { 
        isDoubleFaced: true,
        front: card.card_faces[0].image_uris,
        back: card.card_faces[1]?.image_uris
      } : null);
    }
    
    // Se tiver 'all_parts' e houver alguma parte em português
    if (card.all_parts && Array.isArray(card.all_parts)) {
      const ptPart = card.all_parts.find((part: any) => part.lang === 'pt' || part.lang === 'pt-br');
      if (ptPart && ptPart.image_uris) {
        return ptPart.image_uris;
      }
    }
    
    // Se não encontrar em português, retorna as imagens padrão
    const defaultImages = card.image_uris || (card.card_faces?.[0]?.image_uris ? { 
      isDoubleFaced: true,
      front: card.card_faces[0].image_uris,
      back: card.card_faces[1]?.image_uris
    } : null);
    
    // Se não tiver imagens padrão, tentar usar dados básicos da carta
    if (!defaultImages && card.name) {
      console.warn('Carta sem imagens, usando fallback:', card.name);
      // Tentar gerar URL do Scryfall baseada no nome da carta
      const encodedName = encodeURIComponent(card.name);
      const scryfallUrl = `https://api.scryfall.com/cards/named?exact=${encodedName}`;
      console.log('🔗 URL do Scryfall para busca:', scryfallUrl);
      return null;
    }
    
    return defaultImages;
  } catch (e) {
    console.error('Erro ao processar imagens da carta:', e);
    return null;
  }
};

/**
 * Função de fallback para buscar imagem da carta diretamente da API do Scryfall
 * 
 * @param cardName Nome da carta
 * @param size Tamanho da imagem
 * @returns URL da imagem
 */
const getScryfallImageUrl = (cardName: string, size: 'small' | 'normal' | 'large' = 'normal'): string => {
  try {
    if (!cardName || cardName.trim() === '') {
      return '';
    }
    
    const encodedName = encodeURIComponent(cardName.trim());
    const version = size === 'small' ? 'small' : size === 'large' ? 'large' : 'normal';
    
    // Usar a API de imagens direta do Scryfall
    const url = `https://api.scryfall.com/cards/named?exact=${encodedName}&format=image&version=${version}`;
    
    return url;
  } catch (e) {
    return '';
  }
};

/**
 * Obtém a URL da imagem apropriada para o tamanho requisitado,
 * priorizando imagens em português
 * 
 * @param card A carta para obter a imagem
 * @param size O tamanho da imagem (normal, small, large, etc.)
 * @returns URL da imagem no tamanho especificado
 */
export const getImageUrl = (card: any, size: 'small' | 'normal' | 'large' | 'png' | 'art_crop' | 'border_crop' = 'normal'): string => {
  try {
    // Validação básica
    if (!card) {
      return '';
    }
    
    // Se a carta tem image_uris direto, use
    if (card.image_uris && card.image_uris[size]) {
      return card.image_uris[size];
    }
    
    // Se tem image_uris mas não tem o tamanho específico, use normal
    if (card.image_uris && card.image_uris.normal) {
      return card.image_uris.normal;
    }
    
    // Se tem image_url direto, use
    if (card.image_url) {
      return card.image_url;
    }
    
    // Se tem card_faces (carta dupla face)
    if (card.card_faces && card.card_faces[0] && card.card_faces[0].image_uris) {
      const frontImage = card.card_faces[0].image_uris[size] || card.card_faces[0].image_uris.normal;
      if (frontImage) {
        return frontImage;
      }
    }
    
    // Se tem prints_search_uri, tentar buscar a primeira impressão
    if (card.prints_search_uri && card.name) {
      // Para cartas com prints_search_uri, usar a API do Scryfall
      return getScryfallImageUrl(card.name, size);
    }
    
    // Fallback: gerar URL do Scryfall baseada no nome
    if (card.name) {
      return getScryfallImageUrl(card.name, size);
    }
    
    return '';
  } catch (e) {
    // Fallback em caso de erro
    if (card?.name) {
      const fallbackUrl = getScryfallImageUrl(card.name, size);
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [imageService] Usando fallback URL após erro:', fallbackUrl);
      }
      return fallbackUrl;
    }
    
    return '';
  }
};

/**
 * Obtém o URL de ambas as faces de uma carta dupla face,
 * priorizando imagens em português
 * 
 * @param card A carta dupla face
 * @param size O tamanho da imagem
 * @returns Objeto com URLs das faces frontal e traseira
 */
export const getDoubleFacedImageUrls = (card: any, size: 'small' | 'normal' | 'large' | 'png' | 'art_crop' | 'border_crop' = 'normal'): {front: string, back?: string} => {
  try {
    const images = getPrioritizedImages(card);
    
    // Se for uma carta de face dupla
    if (images?.isDoubleFaced) {
      return {
        front: images.front?.[size] || images.front?.normal || '',
        back: images.back?.[size] || images.back?.normal || ''
      };
    }
    
    // Se não for dupla face ou não tiver imagens
    if (!images) return { front: '' };
    
    // Se for uma carta normal
    return { front: images[size] || images.normal || '' };
  } catch (e) {
    console.error('Erro ao obter URLs das faces da carta:', e);
    return { front: '' };
  }
};
