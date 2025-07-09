// Tipos para cartas MTG

export interface MTGCard {
  id: string
  name: string
  set_name?: string
  set_code?: string
  collector_number?: string
  rarity?: string
  mana_cost?: string
  cmc?: number
  type_line?: string
  oracle_text?: string
  power?: string
  toughness?: string
  artist?: string
  lang?: string
  released_at?: string
  color_identity?: string[]
  foil?: boolean
  nonfoil?: boolean
  prints_search_uri?: string
  image_uris?: {
    small?: string
    normal?: string
    large?: string
    png?: string
    art_crop?: string
    border_crop?: string
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
    type_line?: string
    oracle_text?: string
    power?: string
    toughness?: string
    image_uris?: {
      normal?: string
      small?: string
      art_crop?: string
    }
  }>
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