/**
 * Serviço para busca de cartas na API do Scryfall
 * com suporte integrado a tradução de termos PT-BR para EN
 */

import { translatePtToEn } from './translationService';

/**
 * Realiza uma busca na API do Scryfall com tradução automática de termos PT-BR para EN
 * 
 * @param query String de busca original
 * @param orderBy Campo de ordenação (name, set, rarity, released)
 * @param direction Direção da ordenação (asc, desc)
 * @returns Resposta da API do Scryfall com os resultados da busca
 */
export const searchCardsWithTranslation = async (
  query: string, 
  orderBy: string = 'name', 
  direction: string = 'asc'
) => {
  try {
    // Traduz a query original se necessário
    const translatedQuery = translatePtToEn(query);
    
    // Se houve tradução, insere uma lógica de OR para buscar tanto em PT quanto em EN
    let searchQuery = translatedQuery !== query 
      ? `${query} OR ${translatedQuery}`  // Busca o termo original OU o termo traduzido
      : query;
      
    console.log(`Termo original: "${query}"`);
    console.log(`Termo traduzido: "${translatedQuery}"`);
    console.log(`Query de busca: "${searchQuery}"`);
    console.log(`Ordenação: ${orderBy} ${direction}`);
    
    // Mapear ordenação para parâmetros do Scryfall
    let scryfallOrder = 'name';
    let scryfallDir = direction;
    
    switch (orderBy) {
      case 'name':
        scryfallOrder = 'name';
        break;
      case 'set':
        scryfallOrder = 'set';
        break;
      case 'rarity':
        scryfallOrder = 'rarity';
        break;
      case 'released':
        scryfallOrder = 'released';
        break;
      default:
        scryfallOrder = 'name';
    }
    
    // Construir parâmetros de ordenação
    const orderParams = `&order=${scryfallOrder}&dir=${scryfallDir}`;
    
    // Função auxiliar para fazer fetch com timeout
    const fetchWithTimeout = async (url: string, timeout = 15000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        try {
          controller.abort();
        } catch (error) {
          console.log('Erro ao abortar requisição:', error);
        }
      }, timeout);
      
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MTG-Helper/1.0'
          }
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        // Se for um AbortError, não relançar - apenas logar
        if (error.name === 'AbortError') {
          console.log(`Timeout na requisição para: ${url}`);
          return {
            ok: false,
            status: 408,
            json: async () => ({ data: [], error: 'Request timeout' })
          } as Response;
        }
        throw error;
      }
    };
      
    // Para termos compostos, tenta diferentes estratégias de busca
    if (query.includes(' ')) {
      console.log(`Buscando termo composto: "${query}"`);
      
      // Primeiro, tentamos com a lógica OR padrão (português OR inglês)
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `https://api.scryfall.com/cards/search?q=${encodedQuery}${orderParams}&unique=prints&page=1`;
      
      console.log(`Tentando busca padrão: ${url}`);
      try {
        const response = await fetchWithTimeout(url);
        
        // Se a busca normal não retornar resultados, tenta estratégias alternativas
        if (!response.ok || response.status === 404) {
          console.log(`Busca padrão falhou para "${query}", tentando estratégias alternativas`);
          
          // Estratégia especial para português: busca com lang:pt usando nome original
          const ptLangQuery = `lang:pt "${query}"`;
          const ptUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(ptLangQuery)}${orderParams}&unique=prints&page=1`;
          
          console.log(`Tentando busca em português: ${ptUrl}`);
          try {
            const ptResponse = await fetchWithTimeout(ptUrl);
            
            if (ptResponse.ok) {
              console.log(`Busca em português bem-sucedida para "${query}"`);
              return ptResponse;
            }
          } catch (error) {
            console.log('Erro na busca em português:', error);
          }
          
          // Estratégia 1: Busca com aspas para nome exato em inglês
          const exactSearchQuery = `"${translatedQuery}"`;
          const exactUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(exactSearchQuery)}${orderParams}&unique=prints&page=1`;
          
          console.log(`Tentando busca exata em inglês: ${exactUrl}`);
          try {
            const exactResponse = await fetchWithTimeout(exactUrl);
            
            if (exactResponse.ok) {
              console.log(`Busca exata em inglês bem-sucedida para "${query}"`);
              return exactResponse;
            }
          } catch (error) {
            console.log('Erro na busca exata em inglês:', error);
          }
          
          // Estratégia 2: Busca com nome em português E lang:pt
          const ptNameQuery = `name:"${query}" lang:pt`;
          const ptNameUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(ptNameQuery)}${orderParams}&unique=prints&page=1`;
          
          console.log(`Tentando busca específica em português: ${ptNameUrl}`);
          try {
            const ptNameResponse = await fetchWithTimeout(ptNameUrl);
            
            if (ptNameResponse.ok) {
              console.log(`Busca específica em português bem-sucedida para "${query}"`);
              return ptNameResponse;
            }
          } catch (error) {
            console.log('Erro na busca específica em português:', error);
          }
          
          // Estratégia 3: Busca com operador de nome para termo traduzido
          const nameSearchQuery = `name:"${translatedQuery}"`;
          const nameUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(nameSearchQuery)}${orderParams}&unique=prints&page=1`;
          
          console.log(`Tentando busca por nome exato em inglês: ${nameUrl}`);
          try {
            const nameResponse = await fetchWithTimeout(nameUrl);
            
            if (nameResponse.ok) {
              console.log(`Busca por nome exato em inglês bem-sucedida para "${query}"`);
              return nameResponse;
            }
          } catch (error) {
            console.log('Erro na busca por nome exato em inglês:', error);
          }
          
          // Estratégia 4: Divide a busca em palavras individuais
          const words = query.split(' ');
          if (words.length > 1) {
            // Procura tanto com termos em português quanto em inglês
            const ptWords = words.filter(word => 
              !['o', 'a', 'os', 'as', 'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'para', 'com', 'por'].includes(word.toLowerCase())
            );
            
            const enWords = translatedQuery.split(' ').filter(word => 
              !['the', 'of', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by'].includes(word.toLowerCase())
            );
            
            // Combina as palavras significativas das duas línguas sem duplicatas
            // Usando Object.keys ao invés de Set para evitar problemas de compatibilidade
            const uniqueWordsObj: Record<string, boolean> = {};
            [...ptWords, ...enWords].forEach(word => {
              uniqueWordsObj[word.toLowerCase()] = true;
            });
            const allSignificantWords = Object.keys(uniqueWordsObj);
            
            if (allSignificantWords.length > 0) {
              // Estratégia 4.1: Busca fuzzy com palavras-chave significativas
              const keywordSearch = allSignificantWords.join(' OR ');
              const keywordUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(keywordSearch)}${orderParams}&unique=prints&page=1`;
              
              console.log(`Tentando busca por palavras-chave: ${keywordUrl}`);
              try {
                const keywordResponse = await fetchWithTimeout(keywordUrl);
                
                if (keywordResponse.ok) {
                  console.log(`Busca por palavras-chave bem-sucedida para "${query}"`);
                  return keywordResponse;
                }
              } catch (error) {
                console.log('Erro na busca por palavras-chave:', error);
              }
              
              // Estratégia 4.2: Foca apenas na palavra mais específica/rara (geralmente mais distintiva)
              if (allSignificantWords.length > 1) {
                // Ordenamos as palavras por tamanho (geralmente palavras mais específicas são mais longas)
                const sortedWords = [...allSignificantWords].sort((a, b) => b.length - a.length);
                const specificWord = sortedWords[0];
                
                const specificWordUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(specificWord)}${orderParams}&unique=prints&page=1`;
                
                console.log(`Tentando busca com palavra específica "${specificWord}": ${specificWordUrl}`);
                try {
                  const specificResponse = await fetchWithTimeout(specificWordUrl);
                  
                  if (specificResponse.ok) {
                    console.log(`Busca por palavra específica bem-sucedida para "${query}"`);
                    return specificResponse;
                  }
                } catch (error) {
                  console.log('Erro na busca com palavra específica:', error);
                }
              }
            }
          }
          
          // Última tentativa: busca fuzzy com a primeira palavra (para casos como "Llanowar Elves")
          const firstWord = query.split(' ')[0];
          if (firstWord && firstWord.length > 3) { // Evita palavras muito curtas
            const fuzzyUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(firstWord)}${orderParams}&unique=prints&page=1`;
            
            console.log(`Tentativa final com busca fuzzy para "${firstWord}": ${fuzzyUrl}`);
            try {
              const fuzzyResponse = await fetchWithTimeout(fuzzyUrl);
              
              if (fuzzyResponse.ok) {
                console.log(`Busca fuzzy bem-sucedida para "${firstWord}"`);
                return fuzzyResponse;
              }
            } catch (error) {
              console.log('Erro na busca fuzzy:', error);
            }
          }
        }
        
        return response;
      } catch (error) {
        console.error('Erro na busca padrão:', error);
        throw new Error('Falha na conexão com a API do Scryfall. Verifique sua conexão de internet.');
      }
    } else {
      // Para termos simples, tentamos várias estratégias em sequência
      // 1. Busca combinada padrão
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `https://api.scryfall.com/cards/search?q=${encodedQuery}${orderParams}&unique=prints&page=1`;
      
      console.log(`Tentando busca padrão para termo simples: ${url}`);
      try {
        const response = await fetchWithTimeout(url);
        
        // Se falhar, tenta outras abordagens
        if (!response.ok || response.status === 404) {
          // 2. Tentar busca em português específica
          const ptQuery = `lang:pt "${query}"`;
          const ptUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(ptQuery)}${orderParams}&unique=prints&page=1`;
          
          console.log(`Tentando busca em português para termo simples: ${ptUrl}`);
          try {
            const ptResponse = await fetchWithTimeout(ptUrl);
            
            if (ptResponse.ok) {
              return ptResponse;
            }
          } catch (error) {
            console.log('Erro na busca em português para termo simples:', error);
          }
          
          // 3. Tentar busca fuzzy para termo simples
          const fuzzyUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}${orderParams}&unique=prints&page=1`;
          
          console.log(`Tentando busca fuzzy para termo simples: ${fuzzyUrl}`);
          try {
            const fuzzyResponse = await fetchWithTimeout(fuzzyUrl);
            
            if (fuzzyResponse.ok) {
              return fuzzyResponse;
            }
          } catch (error) {
            console.log('Erro na busca fuzzy para termo simples:', error);
          }
        }
        
        return response;
      } catch (error) {
        console.error('Erro na busca para termo simples:', error);
        throw new Error('Falha na conexão com a API do Scryfall. Verifique sua conexão de internet.');
      }
    }
  } catch (e) {
    console.error('Erro ao buscar cartas com tradução:', e);
    throw e;
  }
};

/**
 * Busca uma carta específica na API do Scryfall pelo nome exato, com tradução PT-BR para EN
 * 
 * @param cardName Nome da carta
 * @returns A carta encontrada
 */
export const getCardByNameWithTranslation = async (cardName: string) => {
  try {
    // Traduz o nome da carta se necessário
    const translatedName = translatePtToEn(cardName);
    const encodedName = encodeURIComponent(translatedName);
    
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodedName}`);
    
    // Se a busca com nome traduzido falhar, tenta com o nome original
    if (!response.ok && translatedName !== cardName) {
      const originalNameResponse = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
      if (originalNameResponse.ok) {
        return await originalNameResponse.json();
      }
      throw new Error(`Carta não encontrada: ${cardName}`);
    }
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error(`Carta não encontrada: ${cardName}`);
  } catch (e) {
    console.error('Erro ao buscar carta pelo nome com tradução:', e);
    throw e;
  }
};

/**
 * Busca todas as impressões de uma carta na API do Scryfall usando uma abordagem simples
 * Similar à função que funciona na guia de coleção
 * 
 * @param cardName Nome da carta
 * @returns Lista de todas as impressões da carta
 */
export const getAllPrintsSimple = async (cardName: string) => {
  try {
    console.log(`=== Busca simples de versões para: "${cardName}" ===`);
    
    // Usar a sintaxe exata que funcionou no teste da API
    // Para nomes com espaços, usar aspas ao redor de todo o nome, mas não fazer encoding das aspas nem dos operadores
    const url = `https://api.scryfall.com/cards/search?q="${encodeURIComponent(cardName)}"+unique:prints&order=released`;
    
    console.log(`Tentando busca simples: ${url}`);
    const response = await fetch(url);
    
    console.log(`Resposta da busca simples: status=${response.status}, ok=${response.ok}`);
    
    return response;
  } catch (e) {
    console.error(`Erro na busca simples para "${cardName}":`, e);
    // Retorna uma resposta simulada com erro
    return {
      ok: false,
      status: 500,
      json: async () => ({ data: [] })
    } as Response;
  }
};

/**
 * Busca todas as impressões de uma carta na API do Scryfall, considerando traduções
 * 
 * @param cardName Nome da carta
 * @returns Lista de todas as impressões da carta
 */
export const getAllPrintsByNameWithTranslation = async (cardName: string) => {
  try {
    console.log(`=== Iniciando busca de versões para: "${cardName}" ===`);
    
    // Construir a URL exatamente como funcionou no teste
    const url = `https://api.scryfall.com/cards/search?q="${encodeURIComponent(cardName)}"+unique:prints&order=released`;
    
    console.log(`URL construída: ${url}`);
    
    const response = await fetch(url);
    console.log(`Resposta: status=${response.status}, ok=${response.ok}`);
    
    if (response.ok) {
      console.log(`Sucesso na busca de versões para "${cardName}"`);
      return response;
    }
    
    // Se não funcionou, tenta com tradução
    const translatedName = translatePtToEn(cardName);
    if (translatedName !== cardName) {
      console.log(`Tentando com nome traduzido: "${translatedName}"`);
      const translatedUrl = `https://api.scryfall.com/cards/search?q="${encodeURIComponent(translatedName)}"+unique:prints&order=released`;
      
      console.log(`URL traduzida: ${translatedUrl}`);
      
      const translatedResponse = await fetch(translatedUrl);
      console.log(`Resposta traduzida: status=${translatedResponse.status}, ok=${translatedResponse.ok}`);
      
      if (translatedResponse.ok) {
        return translatedResponse;
      }
    }
    
    // Se nenhuma tentativa funcionou, retorna erro 404
    console.log("Nenhuma busca funcionou");
    return {
      ok: false,
      status: 404,
      json: async () => ({ data: [] })
    } as Response;
  } catch (e) {
    console.error(`Erro ao buscar impressões da carta "${cardName}":`, e);
    return {
      ok: false,
      status: 500,
      json: async () => ({ data: [] })
    } as Response;
  }
};
