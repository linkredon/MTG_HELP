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
    // Se não tiver versões impressas, retorna as imagens padrão
    if (!card.prints_search_uri) {
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
    return card.image_uris || (card.card_faces?.[0]?.image_uris ? { 
      isDoubleFaced: true,
      front: card.card_faces[0].image_uris,
      back: card.card_faces[1]?.image_uris
    } : null);
  } catch (e) {
    console.error('Erro ao processar imagens da carta:', e);
    return null;
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
    const images = getPrioritizedImages(card);
    
    if (!images) return '';
    
    if (images.isDoubleFaced) {
      return images.front?.[size] || images.front?.normal || '';
    }
    
    return images[size] || images.normal || '';
  } catch (e) {
    console.error('Erro ao obter URL da imagem:', e);
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
