// Tipos para cartas MTG

export interface MTGCard {
  id: string
  name: string
  type_line?: string
  oracle_text?: string
  mana_cost?: string
  cmc?: number
  image_uris?: {
    small?: string
    normal?: string
    large?: string
    png?: string
    art_crop?: string
    border_crop?: string
  }
  rarity?: string
  set?: string
  set_name?: string
  set_code?: string
  collector_number?: string
  released_at?: string
}

export interface CollectionCard {
  card: MTGCard
  quantity: number
  added_at?: string
  foil?: boolean
  condition?: string
}

export interface UserCollection {
  id: string
  name: string
  cards: CollectionCard[]
  created_at: string
  updated_at: string
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

export interface SpoilerCard extends MTGCard {
  isNew?: boolean
  releaseDate?: string
  spoilerSource?: string
}