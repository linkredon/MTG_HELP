// Definição de tipos para cartas do Magic: The Gathering

export interface MTGCard {
  id: string
  name: string
  printed_name?: string  // Nome impresso (para cartas em outros idiomas)
  set_name: string
  set_code: string
  set?: string  // Código do set (alias para set_code)
  collector_number: string
  rarity: string
  mana_cost?: string
  cmc: number
  type_line: string
  oracle_text?: string
  power?: string
  toughness?: string
  artist: string
  lang: string
  released_at: string
  color_identity: string[]
  foil: boolean
  nonfoil: boolean
  prints_search_uri: string
  image_uris?: {
    normal: string
    small?: string
    art_crop?: string
  }
  prices?: {
    usd: string | null;
    usd_foil: string | null;
    eur: string | null;
    eur_foil: string | null;
    tix: string | null;
  }
  card_faces?: Array<{
    name: string
    mana_cost?: string
    type_line: string
    oracle_text?: string
    power?: string
    toughness?: string
    image_uris?: {
      normal: string
      small?: string
      art_crop?: string
    }
  }>
}

export interface CollectionCard {
  card: MTGCard
  quantity: number
  condition: string
  foil: boolean
  language?: string
  _id?: string  // ID interno usado pelo sistema
}

export interface UserCollection {
  id: string
  name: string
  description: string
  cards: CollectionCard[]
  createdAt: string
  updatedAt: string
  isPublic: boolean;
  backgroundImage?: string;
}

export interface SavedFilter {
  id: string
  name: string
  filters: {
    busca: string
    raridade: string
    cor: string[]
    cmc: number[]
    tipo: string
    formato: string
  }
}

// Tipos para a busca na API Scryfall
export interface ScryfallResponse {
  object: string
  total_cards: number
  has_more: boolean
  next_page?: string
  data: MTGCard[]
}

export interface ScryfallPrint {
  id: string
  name: string
  set_name: string
  set_code: string
  collector_number: string
  rarity: string
  image_uris?: {
    small: string
    normal: string
  }
  card_faces?: Array<{
    image_uris?: {
      small: string
      normal: string
    }
  }>
}

export interface ScryfallPrintsResponse {
  object: string
  total_cards: number
  has_more: boolean
  data: ScryfallPrint[]
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  joinedAt: string
  collectionsCount: number
  totalCards: number
  achievements: string[]
}

export interface DeckCard {
  card: MTGCard;
  quantity: number;
  category: 'mainboard' | 'sideboard' | 'commander';
  _id?: string;  // ID interno usado pelo sistema
}

export interface Deck {
  id: string;
  name: string;
  format: string;
  colors: string[];
  cards: DeckCard[];
  createdAt: string;
  lastModified: string;
  description?: string;
  isPublic: boolean;
  tags: string[];
}
