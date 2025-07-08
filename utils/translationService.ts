/**
 * Serviço para tradução de termos de cartas de Magic: The Gathering
 * do português para o inglês para facilitar as buscas
 */

// Dicionário de traduções comuns para termos de MTG
const commonMTGTranslations: Record<string, string> = {
  // Tipos de carta
  "criatura": "creature",
  "terreno": "land",
  "mágica instantânea": "instant",
  "instantânea": "instant",
  "feitiço": "sorcery",
  "artefato": "artifact",
  "encantamento": "enchantment", 
  "planeswalker": "planeswalker",
  
  // Subtipos comuns
  "elfo": "elf",
  "elfos": "elves",
  "humano": "human",
  "humanos": "humans",
  "zumbi": "zombie",
  "zumbis": "zombies",
  "goblin": "goblin",
  "goblins": "goblins",
  "clérigo": "cleric",
  "clérigos": "clerics",
  "guerreiro": "warrior",
  "guerreiros": "warriors",
  "mago": "wizard", 
  "magos": "wizards",
  "anjo": "angel",
  "anjos": "angels",
  "demônio": "demon",
  "demônios": "demons",
  "dragão": "dragon",
  "dragões": "dragons",
  "besta": "beast",
  "bestas": "beasts",
  "druida": "druid", 
  "druidas": "druids",
  "vampiro": "vampire",
  "vampiros": "vampires",
  
  // Cores
  "branco": "white",
  "azul": "blue",
  "preto": "black",
  "vermelho": "red",
  "verde": "green",
  "incolor": "colorless",
  "multicolorido": "multicolored",
  
  // Habilidades
  "voar": "flying",
  "toque mortífero": "deathtouch",
  "vínculo com a vida": "lifelink",
  "iniciativa": "first strike",
  "alcance": "reach",
  "vigilância": "vigilance",
  "atropelar": "trample",
  "lampejo": "flash",
  "ímpeto": "haste",
  "proteção": "protection",
  "indestrutível": "indestructible",
  
  // Termos de regras
  "exile": "exile",
  "exilar": "exile",
  "compre": "draw",
  "comprar": "draw",
  "contra-magia": "counterspell",
  "anular": "counter",
  "destruir": "destroy",
  "sacrificar": "sacrifice",
  "retornar": "return",
  "mana": "mana",
  
  // Cartas específicas populares - Nomes exatos
  "força do gigante": "giant growth",
  "choque": "shock",
  "llanowar": "llanowar",
  "llanowar elves": "llanowar elves", 
  "elfos llanowar": "llanowar elves",
  "elfo de llanowar": "llanowar elves",
  "elfos de llanowar": "llanowar elves",
  "contramágica": "counterspell",
  "relâmpago": "lightning bolt",
  "terror": "terror",
  "crescimento gigante": "giant growth",
  "serra anjo": "serra angel",
  "urso runha": "runeclaw bear",
  
  // Cartas específicas com variações de nome
  "sol anular": "sol ring",
  "anel solar": "sol ring",
  "voto de druida": "druid's vow",
  "força da natureza": "force of nature",
  "pássaro do paraíso": "birds of paradise",
  "pássaros do paraíso": "birds of paradise",
  "ave do paraíso": "birds of paradise",
  "aves do paraíso": "birds of paradise",
  "demência": "dementia",
  "herdar": "inherit",
  "pantano": "swamp",
  "planície": "plains",
  "floresta": "forest",
  "ilha": "island",
  "montanha": "mountain",
  "planalto": "plateau",
  "tundra": "tundra",
  "bayou": "bayou",
  "taiga": "taiga",
  "savana": "savannah",
  "mar subterrâneo": "underground sea",
  "vulcânica": "volcanic island",
  "mangue": "bayou",
  "bosque tropical": "tropical island",
  "vale sombroso": "badlands",
  "tigela de scryer": "scrying bowl",
  "anjo da vitória": "victory angel",
  "vampiro de malakir": "malakir vampire"
};

/**
 * Traduz uma string do português para o inglês
 * Primeiro verifica no dicionário de traduções comuns
 * Se não encontrar, faz um algoritmo de correspondência parcial
 */
export const translatePtToEn = (text: string): string => {
  if (!text) return text;
  
  const lowerText = text.toLowerCase().trim();
  
  // Verifica se o texto exato está no dicionário
  if (commonMTGTranslations[lowerText]) {
    console.log(`Tradução exata: "${lowerText}" -> "${commonMTGTranslations[lowerText]}"`);
    return commonMTGTranslations[lowerText];
  }
  
  // Verifica variações comuns (com/sem plural, ordem das palavras)
  // Especialmente útil para nomes de cartas específicas como "Llanowar Elves"/"Elfos de Llanowar"
  for (const [key, value] of Object.entries(commonMTGTranslations)) {
    // Verifica se o termo em português está contido no texto de busca
    // ou se o termo em inglês está contido (busca inversa)
    if ((key.includes(' ') && lowerText.includes(key)) || 
        (value.includes(' ') && lowerText.includes(value))) {
      console.log(`Correspondência parcial: "${lowerText}" -> "${value}"`);
      return value;
    }
  }
  
  // Verifica palavras individuais para tradução termo a termo
  const words = lowerText.split(/\s+/);
  if (words.length > 1) {
    const translatedWords = words.map(word => {
      const translation = commonMTGTranslations[word];
      if (translation) {
        console.log(`Tradução parcial: "${word}" -> "${translation}"`);
        return translation;
      }
      return word;
    });
    const result = translatedWords.join(' ');
    
    // Se alguma palavra foi traduzida, loga o resultado completo
    if (result !== lowerText) {
      console.log(`Tradução composta: "${lowerText}" -> "${result}"`);
      return result;
    }
  }
  
  // Último recurso: verifica se alguma parte do nome pode ser traduzida
  // Útil para versões de cartas como "Llanowar Elves (Dominaria)"
  for (const [key, value] of Object.entries(commonMTGTranslations)) {
    // Busca por palavras-chave importantes no texto
    if ((key.length > 3 && lowerText.includes(key)) || 
        (value.length > 3 && lowerText.includes(value))) {
      console.log(`Correspondência parcial (último recurso): "${lowerText}" -> contém "${key}" ou "${value}"`);
      // Mantém o texto original, mas anota a correspondência para debugging
      return text;
    }
  }
  
  // Se não encontrou tradução, retorna o texto original
  console.log(`Sem tradução para: "${text}"`);
  return text;
};

/**
 * Verifica se uma carta corresponde a um termo de busca,
 * considerando tanto o termo original quanto sua tradução
 */
export const cardMatchesSearchTerm = (card: any, searchTerm: string): boolean => {
  if (!searchTerm.trim()) return true;
  
  const search = searchTerm.toLowerCase();
  const translated = translatePtToEn(search);
  
  // Obter nome e tipo da carta em minúsculas para comparações
  const cardNameLower = (card.name || '').toLowerCase();
  const cardTypeLower = (card.type_line || '').toLowerCase();
  const cardOracleLower = (card.oracle_text || '').toLowerCase();
  const cardNamePtLower = (card.printed_name || '').toLowerCase(); // Nome em português se disponível
  
  // Verificar nome exato ou início de palavra para busca mais precisa
  const exactMatch = cardNameLower === search || cardNameLower === translated;
  if (exactMatch) return true;
  
  // Para lidar com variações como "Llanowar Elves" vs "Elfos de Llanowar"
  // dividimos os termos de busca em palavras individuais e verificamos se todas estão presentes
  const searchWords = search.split(/\s+/).filter(w => w.length > 2); // Ignorar palavras muito curtas
  const translatedWords = translated.split(/\s+/).filter(w => w.length > 2);
  
  // Verificar se todas as palavras significativas da busca estão no nome da carta
  const allSearchWordsMatch = searchWords.length > 0 && 
    searchWords.every(word => cardNameLower.includes(word) || cardTypeLower.includes(word) || cardOracleLower.includes(word));
    
  const allTranslatedWordsMatch = translatedWords.length > 0 && 
    translatedWords.every(word => cardNameLower.includes(word) || cardTypeLower.includes(word) || cardOracleLower.includes(word));
  
  // Verificar correspondências em português se disponível
  const ptNameMatch = cardNamePtLower && (
    cardNamePtLower.includes(search) || 
    searchWords.every(word => cardNamePtLower.includes(word))
  );
  
  // Verificação padrão incluindo correspondências parciais
  const partialMatch = 
    cardNameLower.includes(search) ||
    cardTypeLower.includes(search) ||
    cardOracleLower.includes(search) ||
    (translated !== search && (
      cardNameLower.includes(translated) ||
      cardTypeLower.includes(translated) ||
      cardOracleLower.includes(translated)
    ));
  
  return exactMatch || allSearchWordsMatch || allTranslatedWordsMatch || ptNameMatch || partialMatch;
};
