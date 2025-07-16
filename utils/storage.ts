// Utilitários para armazenamento de dados

import type { MTGCard } from '@/types/mtg'

// Interface local para cartas de spoiler
interface SpoilerCard extends Partial<MTGCard> {
  id: string;
  name: string;
  set?: string;
  set_name?: string;
  spoilerSource?: string;
  isNew?: boolean;
  releaseDate?: string;
  image_uris?: {
    normal: string;
    small?: string;
    art_crop?: string;
    large?: string;
    png?: string;
  };
}

// Tamanho máximo aproximado para o localStorage (em bytes)
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB

// Função para salvar cartas de spoiler com otimização de armazenamento
export const saveSpoilerCards = (cards: SpoilerCard[]): boolean => {
  try {
    // Separar as imagens das cartas para armazenamento separado
    const cardsWithoutImages = cards.map(card => {
      // Criar uma cópia da carta sem as imagens
      const { image_uris, ...cardWithoutImage } = card
      
      // Manter apenas referências às imagens
      return {
        ...cardWithoutImage,
        image_ref: card.id // Usar o ID da carta como referência para a imagem
      }
    })
    
    // Salvar os dados das cartas sem imagens
    localStorage.setItem('mtg-spoiler-cards-data', JSON.stringify(cardsWithoutImages))
    
    // Salvar as imagens separadamente, uma por uma
    cards.forEach(card => {
      if (card.image_uris?.normal) {
        try {
          localStorage.setItem(`mtg-spoiler-image-${card.id}`, card.image_uris.normal)
        } catch (e) {
          console.warn(`Não foi possível salvar a imagem da carta ${card.name}:`, e)
          // Continuar mesmo se uma imagem falhar
        }
      }
    })
    
    return true
  } catch (error) {
    console.error('Erro ao salvar cartas de spoiler:', error)
    return false
  }
}

// Função para carregar cartas de spoiler com suas imagens
export const loadSpoilerCards = (): SpoilerCard[] => {
  try {
    // Carregar os dados das cartas
    const cardsDataJson = localStorage.getItem('mtg-spoiler-cards-data')
    if (!cardsDataJson) return []
    
    const cardsData = JSON.parse(cardsDataJson)
    
    // Reconstruir as cartas com suas imagens
    return cardsData.map((card: any) => {
      // Tentar carregar a imagem da carta
      let imageUri: string | null = null
      try {
        imageUri = localStorage.getItem(`mtg-spoiler-image-${card.id}`)
      } catch (e) {
        console.warn(`Não foi possível carregar a imagem da carta ${card.name}:`, e)
      }
      
      // Remover a referência à imagem e adicionar a imagem real
      const { image_ref, ...cardWithoutRef } = card
      
      return {
        ...cardWithoutRef,
        image_uris: {
          normal: imageUri || '',
          large: imageUri || '',
          png: imageUri || '',
          art_crop: imageUri || ''
        }
      }
    })
  } catch (error) {
    console.error('Erro ao carregar cartas de spoiler:', error)
    return []
  }
}

// Função para limpar o armazenamento de cartas de spoiler
export const clearSpoilerCards = () => {
  // Obter todas as chaves do localStorage
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key === 'mtg-spoiler-cards-data' || key.startsWith('mtg-spoiler-image-'))) {
      keys.push(key)
    }
  }
  
  // Remover todas as chaves relacionadas a cartas de spoiler
  keys.forEach(key => localStorage.removeItem(key))
}

// Função para adicionar uma nova carta de spoiler
export const addSpoilerCard = (card: SpoilerCard): boolean => {
  try {
    // Carregar as cartas existentes
    const cards = loadSpoilerCards()
    
    // Adicionar a nova carta
    cards.unshift(card)
    
    // Salvar as cartas atualizadas
    return saveSpoilerCards(cards)
  } catch (error) {
    console.error('Erro ao adicionar carta de spoiler:', error)
    return false
  }
}

// Função para adicionar múltiplas cartas de spoiler
export const addSpoilerCards = (newCards: SpoilerCard[]): boolean => {
  try {
    // Carregar as cartas existentes
    const cards = loadSpoilerCards()
    
    // Adicionar as novas cartas
    const updatedCards = [...newCards, ...cards]
    
    // Salvar as cartas atualizadas
    return saveSpoilerCards(updatedCards)
  } catch (error) {
    console.error('Erro ao adicionar cartas de spoiler:', error)
    return false
  }
}

// Função para remover uma carta de spoiler
export const removeSpoilerCard = (cardId: string): boolean => {
  try {
    // Carregar as cartas existentes
    const cards = loadSpoilerCards()
    
    // Remover a carta com o ID especificado
    const updatedCards = cards.filter(card => card.id !== cardId)
    
    // Remover a imagem da carta
    try {
      localStorage.removeItem(`mtg-spoiler-image-${cardId}`)
    } catch (e) {
      console.warn(`Não foi possível remover a imagem da carta ${cardId}:`, e)
    }
    
    // Salvar as cartas atualizadas
    return saveSpoilerCards(updatedCards)
  } catch (error) {
    console.error('Erro ao remover carta de spoiler:', error)
    return false
  }
}